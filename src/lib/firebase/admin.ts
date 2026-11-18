import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  // Tangani escape newline jika diset dalam format \n di satu baris
  privateKey = privateKey.replace(/\\n/g, '\n');
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    projectId &&
    projectId !== 'your_project_id' &&
    clientEmail &&
    clientEmail !== 'firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com' &&
    privateKey &&
    privateKey.includes('BEGIN PRIVATE KEY')
  );
}

export function getFirebaseAdminApp(): admin.app.App | null {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey: privateKey!,
      }),
    });
  } catch (error) {
    console.error('Gagal menginisialisasi Firebase Admin SDK:', error);
    return null;
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    throw new Error('Firebase Admin SDK belum dikonfigurasi di file .env.');
  }

  return adminApp.auth().verifyIdToken(idToken);
}

export function getFirebaseAdminStatus() {
  const configured = isFirebaseAdminConfigured();
  return {
    configured,
    projectId: projectId || null,
    clientEmail: clientEmail ? `${clientEmail.slice(0, 5)}...${clientEmail.slice(-15)}` : null,
  };
}
