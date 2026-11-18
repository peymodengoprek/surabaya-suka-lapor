import type { APIRoute } from 'astro';

export const prerender = false;

// Cache sederhana in-memory untuk menghemat request ke OpenStreetMap Nominatim
const searchCache = new Map<string, { timestamp: number; data: any[] }>();
const CACHE_TTL_MS = 60 * 1000; // 1 menit

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (!query || query.length < 3) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Kata kunci pencarian minimal 3 karakter.',
        results: [],
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Cek cache
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return new Response(
      JSON.stringify({ success: true, source: 'cache', results: cached.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Bounding box sekitar Kota Surabaya
    // minLng: 112.55, maxLat: -7.15, maxLng: 112.90, minLat: -7.40
    const viewbox = '112.55,-7.15,112.90,-7.40';
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', `${query}, Surabaya`);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('addressdetails', '1');
    nominatimUrl.searchParams.set('limit', '5');
    nominatimUrl.searchParams.set('countrycodes', 'id');
    nominatimUrl.searchParams.set('viewbox', viewbox);
    nominatimUrl.searchParams.set('bounded', '0');

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'SurabayaSukaLapor/1.0 (Aplikasi Laporan Warga Surabaya; non-commercial)',
        'Accept-Language': 'id,en',
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.statusText}`);
    }

    const rawData = await res.json();
    const results = rawData.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      importance: item.importance,
    }));

    // Simpan ke cache
    searchCache.set(query.toLowerCase(), {
      timestamp: Date.now(),
      data: results,
    });

    return new Response(
      JSON.stringify({
        success: true,
        source: 'nominatim',
        service_notice: 'Pencarian menggunakan OpenStreetMap Nominatim (gratis, batas wajar 1 req/dtk).',
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Gagal mencari lokasi.',
        results: [],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
