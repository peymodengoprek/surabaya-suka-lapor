export interface ReportData {
  id: number;
  kategori: string;
  keterangan: string | null;
  status: string;
  latitude: number;
  longitude: number;
  dibuat_pada: string;
}

/**
 * Mengambil daftar laporan dari endpoint /api/reports.
 * Menerima opsi kategori untuk pemfilteran.
 */
export async function fetchReports(kategori?: string | null): Promise<ReportData[]> {
  const url = new URL('/api/reports', window.location.origin);
  if (kategori && kategori !== 'Semua') {
    url.searchParams.set('kategori', kategori);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat laporan (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.reports || [];
}
