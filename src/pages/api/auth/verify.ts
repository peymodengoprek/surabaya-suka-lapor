import type { APIRoute } from 'astro';
import { verifyFirebaseToken } from '../../../lib/firebase/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token ID Firebase wajib disertakan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Gagal memverifikasi token.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
