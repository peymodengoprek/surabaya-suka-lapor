import type { ReportData } from '../../lib/reports/api';

/**
 * Membuat markup HTML string untuk popup penanda laporan di peta Leaflet.
 */
export function createReportPopupHtml(report: ReportData): string {
  const tanggal = new Date(report.dibuat_pada).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const keterangan = report.keterangan ? report.keterangan : 'Tidak ada keterangan tambahan.';
  const statusLabel = report.status || 'menunggu';

  return `
    <div class="text-gray-900 font-sans p-1 max-w-xs space-y-2">
      <div class="flex items-center justify-between gap-2 border-b border-gray-200 pb-1.5">
        <span class="font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
          ${escapeHtml(report.kategori)}
        </span>
        <span class="text-[10px] text-gray-500 uppercase font-mono">
          #${report.id}
        </span>
      </div>

      <div class="text-xs text-gray-700 leading-relaxed">
        ${escapeHtml(keterangan)}
      </div>

      <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
        <span>Status: <strong class="capitalize">${escapeHtml(statusLabel)}</strong></span>
        <span>${tanggal}</span>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
