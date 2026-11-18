export interface LocationSearchResult {
  name: string;
  lat: number;
  lng: number;
  type?: string;
}

/**
 * Mencari alamat atau tempat di area Surabaya melalui endpoint internal proxy Nominatim.
 */
export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const url = new URL('/api/locations/search', window.location.origin);
  url.searchParams.set('q', trimmed);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal mencari lokasi (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.results || [];
}
