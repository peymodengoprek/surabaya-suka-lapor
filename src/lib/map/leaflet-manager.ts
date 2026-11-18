import L from 'leaflet';
import { SURABAYA_CENTER } from '../constants/map';
import type { ReportData } from '../reports/api';
import { createReportPopupHtml } from '../../components/map/ReportPopup';

// Custom HTML DivIcon untuk penanda kerusakan jalan
function createMarkerIcon(kategori: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-report-marker',
    html: `
      <div class="relative flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

// Marker penanda lokasi hasil pencarian
function createSearchPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-search-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export class LeafletMapManager {
  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private searchMarker: L.Marker | null = null;

  init(containerId: string): L.Map {
    if (this.map) {
      return this.map;
    }

    this.map = L.map(containerId, {
      center: [SURABAYA_CENTER.lat, SURABAYA_CENTER.lng],
      zoom: SURABAYA_CENTER.defaultZoom,
      minZoom: SURABAYA_CENTER.minZoom,
      maxZoom: SURABAYA_CENTER.maxZoom,
    });

    // Tile layer OpenStreetMap standar
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> kontributor',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    return this.map;
  }

  getMap(): L.Map | null {
    return this.map;
  }

  updateMarkers(reports: ReportData[]): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();

    reports.forEach((report) => {
      if (typeof report.latitude !== 'number' || typeof report.longitude !== 'number') {
        return;
      }

      const icon = createMarkerIcon(report.kategori);
      const marker = L.marker([report.latitude, report.longitude], { icon });

      const popupHtml = createReportPopupHtml(report);
      marker.bindPopup(popupHtml);

      this.markersLayer.addLayer(marker);
    });
  }

  moveTo(lat: number, lng: number, zoom = 16, label?: string): void {
    if (!this.map) return;

    this.map.flyTo([lat, lng], zoom, {
      duration: 1.5,
    });

    // Pasang penanda sementara untuk hasil pencarian
    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
    }

    this.searchMarker = L.marker([lat, lng], {
      icon: createSearchPinIcon(),
    }).addTo(this.map);

    if (label) {
      this.searchMarker.bindPopup(`<strong>Lokasi Dicari:</strong><br>${label}`).openPopup();
    }
  }

  resetView(): void {
    if (!this.map) return;
    this.map.flyTo([SURABAYA_CENTER.lat, SURABAYA_CENTER.lng], SURABAYA_CENTER.defaultZoom);
    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
      this.searchMarker = null;
    }
  }
}
