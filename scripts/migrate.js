import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

// Muat variabel lingkungan dari .env
dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ ERROR: Variabel lingkungan DATABASE_URL belum diatur di file .env.');
    console.error('Silakan isi DATABASE_URL di file .env terlebih dahulu.');
    process.exit(1);
  }

  const isSsl =
    process.env.DATABASE_SSL === 'true' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('supabase.co') ||
    connectionString.includes('neon.tech');

  const pool = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  });

  console.log('🔄 Menghubungkan ke PostgreSQL...');

  try {
    const client = await pool.connect();
    console.log('✅ Berhasil terhubung ke database.');

    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Menjalankan skema database dari db/schema.sql...');
    await client.query(sql);

    // Ambil daftar tabel yang berhasil dibuat
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = res.rows.map((r) => r.table_name);
    console.log('✅ Migrasi skema selesai! Tabel yang tersedia:');
    for (const table of tableNames) {
      console.log(`   - ${table}`);
    }

    client.release();
    await pool.end();
    console.log('🎉 Selesai tanpa error.');
  } catch (err) {
    let errMsg = err.message || err.code || String(err);
    if (err.errors && Array.isArray(err.errors)) {
      errMsg = err.errors.map((e) => e.message || e.code || String(e)).join('; ');
    }
    console.error('❌ Gagal menjalankan migrasi:', errMsg);
    if (errMsg.includes('postgis')) {
      console.error('💡 Catatan: Jika error terkait PostGIS, pastikan ekstensi PostGIS didukung di database PostgreSQL Anda.');
    }
    await pool.end();
    process.exit(1);
  }
}

runMigration();
