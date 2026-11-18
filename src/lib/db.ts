import pg from 'pg';
import dotenv from 'dotenv';

// Pastikan dotenv terbaca baik di runtime SSR maupun standalone
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || '';
const isSsl =
  process.env.DATABASE_SSL === 'true' ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('supabase.co') ||
  connectionString.includes('neon.tech');

// Singleton pool untuk Astro SSR
let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return poolInstance;
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const pool = getDbPool();
  return pool.query<T>(text, params);
}

export interface DbStatus {
  ok: boolean;
  message: string;
  configured: boolean;
  version?: string;
  tables?: string[];
  hasPostgis?: boolean;
}

export async function checkDatabaseConnection(): Promise<DbStatus> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost:5432') && !process.env.PGHOST) {
    // Jika masih default localhost atau kosong dan belum disetup
  }

  if (!dbUrl) {
    return {
      ok: false,
      configured: false,
      message: 'DATABASE_URL belum diatur di file .env',
    };
  }

  try {
    const pool = getDbPool();
    const versionRes = await pool.query('SELECT version();');
    const version = versionRes.rows[0]?.version || 'Unknown version';

    // Cek ekstensi postgis
    const extRes = await pool.query(
      "SELECT extname FROM pg_extension WHERE extname = 'postgis';"
    );
    const hasPostgis = extRes.rowCount ? extRes.rowCount > 0 : false;

    // Cek tabel yang ada di skema public
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map((r: { table_name: string }) => r.table_name);

    return {
      ok: true,
      configured: true,
      message: 'Koneksi ke PostgreSQL berhasil!',
      version,
      tables,
      hasPostgis,
    };
  } catch (error: any) {
    let errorMsg = error?.message || error?.code || String(error);
    if (error?.errors && Array.isArray(error.errors)) {
      errorMsg = error.errors.map((e: any) => e.message || e.code || String(e)).join('; ');
    }
    return {
      ok: false,
      configured: true,
      message: `Gagal terhubung ke PostgreSQL: ${errorMsg}`,
    };
  }
}

export interface DbUser {
  id: number;
  firebase_uid: string;
  nama: string | null;
  email: string;
  dibuat_pada: Date;
}

/**
 * Membuat atau memperbarui data pengguna di tabel users berdasarkan firebase_uid (UPSERT).
 */
export async function syncUser(
  firebaseUid: string,
  email: string,
  nama?: string | null
): Promise<DbUser> {
  const sql = `
    INSERT INTO users (firebase_uid, nama, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
      nama = COALESCE(EXCLUDED.nama, users.nama),
      email = EXCLUDED.email
    RETURNING id, firebase_uid, nama, email, dibuat_pada;
  `;
  const result = await query<DbUser>(sql, [firebaseUid, nama || null, email]);
  return result.rows[0]!;
}

/**
 * Mengambil data pengguna dari tabel users berdasarkan firebase_uid.
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<DbUser | null> {
  const sql = `
    SELECT id, firebase_uid, nama, email, dibuat_pada
    FROM users
    WHERE firebase_uid = $1
    LIMIT 1;
  `;
  const result = await query<DbUser>(sql, [firebaseUid]);
  return result.rows[0] || null;
}

