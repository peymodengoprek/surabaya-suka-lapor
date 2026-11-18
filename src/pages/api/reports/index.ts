import type { APIRoute } from 'astro';
import { getReports } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const kategoriParam = url.searchParams.get('kategori') || null;
    const reports = await getReports(kategoriParam);

    return new Response(
      JSON.stringify({
        success: true,
        count: reports.length,
        filter: kategoriParam || 'Semua',
        reports: reports.map((r) => ({
          id: r.id,
          kategori: r.kategori,
          keterangan: r.keterangan,
          status: r.status,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          dibuat_pada: r.dibuat_pada,
        })),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Gagal mengambil data laporan.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
