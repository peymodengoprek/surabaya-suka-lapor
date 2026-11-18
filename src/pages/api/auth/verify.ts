import type { APIRoute } from 'astro';
import { verifyFirebaseToken } from '../../../lib/firebase/admin';

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
    const decodedToken = await verifyFirebaseToken(token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token berhasil diverifikasi oleh server (Firebase Admin SDK)!',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isConfigError = errorMsg.includes('Variabel lingkungan Firebase Admin belum lengkap');

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      { status: isConfigError ? 500 : 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
