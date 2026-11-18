import { LeafletMapManager } from './leaflet-manager';
import { fetchReports, type ReportData } from '../reports/api';
import { searchLocation, type LocationSearchResult } from './geocoding';
import {
  isFirebaseConfigured,
  loginWithGoogle,
  logoutUser,
  subscribeAuth,
} from '../firebase/client';

export class MapPageController {
  private mapManager = new LeafletMapManager();
  private reports: ReportData[] = [];
  private activeCategory = 'Semua';

  init(): void {
    // 1. Inisialisasi Peta Leaflet di wadah #map-view
    const mapEl = document.getElementById('map-view');
    if (!mapEl) return;

    this.mapManager.init('map-view');

    // 2. Pasang event listener komponen
    this.setupCategoryFilter();
    this.setupSearchBar();
    this.setupRecenterButton();
    this.setupAuthSync();

    // 3. Muat laporan awal
    this.loadReports();
  }

  private async loadReports(): Promise<void> {
    const loadingEl = document.getElementById('map-loading');
    const countBadge = document.getElementById('report-count-badge');

    if (loadingEl) loadingEl.classList.remove('hidden');

    try {
      this.reports = await fetchReports();
      this.applyFilterAndRender();
    } catch (err: any) {
      console.error('Gagal memuat laporan:', err);
      if (countBadge) {
        countBadge.textContent = 'Gagal memuat data laporan';
      }
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  private applyFilterAndRender(): void {
    const countBadge = document.getElementById('report-count-badge');
    const filtered =
      this.activeCategory === 'Semua'
        ? this.reports
        : this.reports.filter((r) => r.kategori === this.activeCategory);

    this.mapManager.updateMarkers(filtered);

    if (countBadge) {
      const label =
        this.activeCategory === 'Semua'
          ? `${filtered.length} laporan di Surabaya`
          : `${filtered.length} laporan (${this.activeCategory})`;
      countBadge.textContent = label;
    }
  }

  private setupCategoryFilter(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.category-filter-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') || 'Semua';
        this.activeCategory = cat;

        // Perbarui gaya tombol aktif
        buttons.forEach((b) => {
          if (b.getAttribute('data-category') === cat) {
            b.className =
              'category-filter-btn px-2.5 py-1 rounded border text-xs font-medium cursor-pointer transition whitespace-nowrap bg-blue-600 text-white border-blue-600 shadow-sm';
          } else {
            b.className =
              'category-filter-btn px-2.5 py-1 rounded border text-xs font-medium cursor-pointer transition whitespace-nowrap bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
          }
        });

        this.applyFilterAndRender();
      });
    });
  }

  private setupSearchBar(): void {
    const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
    const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
    const clearBtn = document.getElementById('search-clear-btn');
    const dropdown = document.getElementById('search-results-dropdown');
    const list = document.getElementById('search-results-list');

    if (!searchForm || !searchInput || !dropdown || !list) return;

    // Toggle tombol clear
    searchInput.addEventListener('input', () => {
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', searchInput.value.trim().length === 0);
      }
    });

    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      dropdown.classList.add('hidden');
      searchInput.focus();
    });

    // Submit pencarian
    const executeSearch = async () => {
      const q = searchInput.value.trim();
      if (q.length < 3) {
        alert('Masukkan minimal 3 karakter untuk mencari lokasi.');
        return;
      }

      list.innerHTML = '<li class="p-3 text-gray-500 text-center">Mencari lokasi di Surabaya...</li>';
      dropdown.classList.remove('hidden');

      try {
        const results = await searchLocation(q);

        if (results.length === 0) {
          list.innerHTML =
            '<li class="p-3 text-gray-500 text-center">Lokasi tidak ditemukan di Surabaya.</li>';
          return;
        }

        list.innerHTML = '';
        results.forEach((item) => {
          const li = document.createElement('li');
          li.className =
            'p-2.5 hover:bg-blue-50 cursor-pointer text-gray-800 transition flex flex-col gap-0.5';
          li.innerHTML = `
            <span class="font-medium text-xs text-blue-900">${this.truncate(item.name, 75)}</span>
            <span class="text-[10px] text-gray-500 font-mono">${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</span>
          `;

          li.addEventListener('click', () => {
            this.mapManager.moveTo(item.lat, item.lng, 16, item.name);
            dropdown.classList.add('hidden');
            searchInput.value = item.name.split(',')[0] || item.name;
          });

          list.appendChild(li);
        });
      } catch (err: any) {
        list.innerHTML = `<li class="p-3 text-red-600 text-center">${err.message || 'Gagal mencari'}</li>`;
      }
    };

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch();
    });

    // Tutup dropdown saat klik di luar
    document.addEventListener('click', (e) => {
      if (!searchForm.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  private setupRecenterButton(): void {
    const btn = document.getElementById('btn-recenter');
    btn?.addEventListener('click', () => {
      this.mapManager.resetView();
    });
  }

  private setupAuthSync(): void {
    const navGuest = document.getElementById('nav-guest');
    const navUser = document.getElementById('nav-user');
    const navUserName = document.getElementById('nav-user-name');
    const navBtnLogin = document.getElementById('nav-btn-login');
    const navBtnLogout = document.getElementById('nav-btn-logout');

    if (!isFirebaseConfigured()) return;

    subscribeAuth(async (user) => {
      if (user) {
        if (navGuest) navGuest.classList.add('hidden');
        if (navUser) {
          navUser.classList.remove('hidden');
          navUser.classList.add('flex');
        }
        if (navUserName) navUserName.textContent = user.displayName || user.email || 'Pengguna';

        // Sinkronisasi background ke server
        try {
          const token = await user.getIdToken();
          if (token) {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
          }
        } catch (e) {
          console.warn('Gagal sinkron auth background:', e);
        }
      } else {
        if (navGuest) navGuest.classList.remove('hidden');
        if (navUser) {
          navUser.classList.add('hidden');
          navUser.classList.remove('flex');
        }
      }
    });

    navBtnLogin?.addEventListener('click', async () => {
      try {
        await loginWithGoogle();
      } catch (err: any) {
        alert(err.message || 'Gagal masuk');
      }
    });

    navBtnLogout?.addEventListener('click', async () => {
      try {
        await logoutUser();
      } catch (err: any) {
        alert(err.message || 'Gagal keluar');
      }
    });
  }

  private truncate(str: string, len: number): string {
    return str.length > len ? str.substring(0, len) + '...' : str;
  }
}
