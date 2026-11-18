import type { APIRoute } from 'astro';
import { checkDatabaseConnection } from '../../lib/db';
import { getFirebaseAdminStatus } from '../../lib/firebase/admin';
import { firebaseConfig, isFirebaseConfigured } from '../../lib/firebase/client';

export const prerender = false;

export const GET: APIRoute = async () => {
  const dbStatus = await checkDatabaseConnection();
  const firebaseAdminStatus = getFirebaseAdminStatus();
  const firebaseClientConfigured = isFirebaseConfigured();

  return new Response(
    JSON.stringify(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        firebase: {
          client: {
            configured: firebaseClientConfigured,
            projectId: firebaseConfig.projectId || null,
            authDomain: firebaseConfig.authDomain || null,
          },
          admin: firebaseAdminStatus,
        },
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
