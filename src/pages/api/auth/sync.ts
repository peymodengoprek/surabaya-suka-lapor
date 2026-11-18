import type { APIRoute } from 'astro';
import { verifyFirebaseToken } from '../../../lib/firebase/admin';
import { syncUser } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Body request tidak valid (harus JSON format).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = body?.token;

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Token ID Firebase wajib disertakan dalam request body (parameter: "token").',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Verifikasi ID token via Firebase Admin SDK
    const decodedToken = await verifyFirebaseToken(token);

    // 2. Buat atau perbarui baris di tabel users PostgreSQL
    const email = decodedToken.email || '';
    const nama = decodedToken.name || null;
    const dbUser = await syncUser(decodedToken.uid, email, nama);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pengguna berhasil diverifikasi dan disinkronkan ke tabel users.',
        user: {
          id: dbUser.id,
          firebase_uid: dbUser.firebase_uid,
          nama: dbUser.nama,
          email: dbUser.email,
          dibuat_pada: dbUser.dibuat_pada,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isAuthError =
      errorMsg.includes('auth/') ||
      errorMsg.includes('ID token') ||
      errorMsg.includes('Token');

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      { status: isAuthError ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
