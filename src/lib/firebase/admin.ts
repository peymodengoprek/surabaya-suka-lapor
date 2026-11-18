import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import dotenv from 'dotenv';

// Pastikan file .env dimuat jika belum dimuat oleh runtime Node
dotenv.config();

/**
 * Mengambil nilai konfigurasi Firebase Admin dari import.meta.env (Astro SSR)
 * dengan fallback ke process.env.
 */
export function getFirebaseAdminConfig() {
  const projectId =
    (import.meta.env?.FIREBASE_PROJECT_ID as string | undefined) ||
    process.env.FIREBASE_PROJECT_ID ||
    (import.meta.env?.PUBLIC_FIREBASE_PROJECT_ID as string | undefined) ||
    process.env.PUBLIC_FIREBASE_PROJECT_ID ||
    '';

  const clientEmail =
    (import.meta.env?.FIREBASE_CLIENT_EMAIL as string | undefined) ||
    process.env.FIREBASE_CLIENT_EMAIL ||
    '';

  let privateKey =
    (import.meta.env?.FIREBASE_PRIVATE_KEY as string | undefined) ||
    process.env.FIREBASE_PRIVATE_KEY ||
    '';

  if (privateKey) {
    // Tangani escape newline jika diset dalam format \n di satu baris di .env
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return { projectId, clientEmail, privateKey };
}

/**
 * Memeriksa apakah ada variabel lingkungan Firebase Admin yang belum diisi.
 * Mengembalikan daftar NAMA variabel yang kurang (tanpa pernah mencetak nilainya).
 */
export function getMissingAdminEnvVars(): string[] {
  const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();
  const missing: string[] = [];

  if (!projectId || projectId === 'your_project_id') {
    missing.push('FIREBASE_PROJECT_ID (atau PUBLIC_FIREBASE_PROJECT_ID)');
  }
  if (!clientEmail || clientEmail === 'firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com') {
    missing.push('FIREBASE_CLIENT_EMAIL');
  }
  if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
    missing.push('FIREBASE_PRIVATE_KEY');
  }

  return missing;
}

export function isFirebaseAdminConfigured(): boolean {
  return getMissingAdminEnvVars().length === 0;
}

const ADMIN_APP_NAME = 'surabaya-suka-lapor-admin';

export function getFirebaseAdminApp(): App {
  const missing = getMissingAdminEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Variabel lingkungan Firebase Admin belum lengkap di .env: [${missing.join(', ')}]. Pastikan variabel tersebut telah diisi.`
    );
  }

  const existingApps = getApps();
  const existingApp = existingApps.find((a) => a.name === ADMIN_APP_NAME) || (existingApps.length > 0 ? existingApps[0] : null);
  if (existingApp) {
    return existingApp;
  }

  const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();

  try {
    return initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      },
      ADMIN_APP_NAME
    );
  } catch (error: any) {
    throw new Error(`Gagal menginisialisasi Firebase Admin SDK: ${error.message || String(error)}`);
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID Token tidak boleh kosong.');
  }

  const adminApp = getFirebaseAdminApp();
  const auth = getAuth(adminApp);
  return auth.verifyIdToken(idToken);
}

export function getFirebaseAdminStatus() {
  const missing = getMissingAdminEnvVars();
  const configured = missing.length === 0;
  const { projectId, clientEmail } = getFirebaseAdminConfig();

  return {
    configured,
    missingVars: missing,
    projectId: projectId || null,
    clientEmail: clientEmail ? `${clientEmail.slice(0, 5)}...${clientEmail.slice(-15)}` : null,
  };
}
