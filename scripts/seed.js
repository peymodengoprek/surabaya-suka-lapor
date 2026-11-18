import pg from 'pg';
import dotenv from 'dotenv';
import { REPORT_CATEGORIES } from '../src/lib/constants/categories.ts';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL belum diatur di file .env.');
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

// 10 Laporan Contoh di Surabaya dengan Koordinat Nyata & Kategori Beragam
const SAMPLE_REPORTS = [
  {
    kategori: 'Lubang',
    keterangan: '[DATA UJI] Lubang jalan sedalam ~10cm di lajur kiri dekat lampu merah Wonokromo.',
    lat: -7.2995,
    lng: 112.7380,
    status: 'menunggu',
    lokasi_nama: 'Jl. Raya Wonokromo',
  },
  {
    kategori: 'Retak',
    keterangan: '[DATA UJI] Retak buaya memanjang di aspal jalur lambat depan deretan pertokoan.',
    lat: -7.2764,
    lng: 112.7592,
    status: 'diverifikasi',
    lokasi_nama: 'Jl. Kertajaya, Gubeng',
  },
  {
    kategori: 'Aspal terkelupas',
    keterangan: '[DATA UJI] Lapisan aspal terkelupas dan permukaan bergelombang di jalur cepat.',
    lat: -7.2655,
    lng: 112.7420,
    status: 'menunggu',
    lokasi_nama: 'Jl. Basuki Rahmat, Tegalsari',
  },
  {
    kategori: 'Genangan/Drainase buruk',
    keterangan: '[DATA UJI] Air menggenang saat hujan sedang karena drainase sisi barat tersumbat.',
    lat: -7.2842,
    lng: 112.7935,
    status: 'menunggu',
    lokasi_nama: 'Jl. Raya Mulyosari, Sukolilo',
  },
  {
    kategori: 'Amblas',
    keterangan: '[DATA UJI] Permukaan jalan amblas sedalam 15cm di dekat jembatan saluran air.',
    lat: -7.3245,
    lng: 112.7621,
    status: 'menunggu',
    lokasi_nama: 'Jl. Rungkut Industri Raya',
  },
  {
    kategori: 'Lubang',
    keterangan: '[DATA UJI] Dua lubang berdekatan yang berbahaya bagi pengendara sepeda motor.',
    lat: -7.2910,
    lng: 112.7155,
    status: 'diverifikasi',
    lokasi_nama: 'Jl. Mayjen Sungkono, Sawahan',
  },
  {
    kategori: 'Aspal terkelupas',
    keterangan: '[DATA UJI] Jalur truk industri: aspal aus, kerikil tajam berhamburan di tepi jalan.',
    lat: -7.2520,
    lng: 112.6710,
    status: 'menunggu',
    lokasi_nama: 'Jl. Margomulyo, Tandes',
  },
  {
    kategori: 'Genangan/Drainase buruk',
    keterangan: '[DATA UJI] Genangan air rob dan saluran meluap menutupi separuh badan jalan.',
    lat: -7.2415,
    lng: 112.7820,
    status: 'menunggu',
    lokasi_nama: 'Jl. Kenjeran, Pantai Ria',
  },
  {
    kategori: 'Amblas',
    keterangan: '[DATA UJI] Jalan amblas sepanjang 3 meter dekat SPBU, rawan patah as roda.',
    lat: -7.3105,
    lng: 112.6950,
    status: 'menunggu',
    lokasi_nama: 'Jl. Raya Menganti, Wiyung',
  },
  {
    kategori: 'Lainnya',
    keterangan: '[DATA UJI] Penutup gorong-gorong utilitas ambles dan tidak rata dengan permukaan aspal.',
    lat: -7.2510,
    lng: 112.7610,
    status: 'menunggu',
    lokasi_nama: 'Jl. Kapas Krampung, Tambaksari',
  },
];

async function runSeed() {
  const isCleanOnly = process.argv.includes('--clean');
  console.log('🔄 Menghubungkan ke PostgreSQL...');

  try {
    const client = await pool.connect();

    // Pastikan constraint kategori ada
    const allowedCategoriesSql = REPORT_CATEGORIES.map((c) => `'${c}'`).join(', ');
    await client.query(`
      ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_reports_kategori;
      ALTER TABLE reports ADD CONSTRAINT chk_reports_kategori CHECK (kategori IN (${allowedCategoriesSql}));
    `);

    // 1. Bersihkan data uji yang sudah ada (idempoten)
    console.log('🧹 Membersihkan data uji sebelumnya...');
    const deleteRes = await client.query(`
      DELETE FROM reports 
      WHERE keterangan LIKE '[DATA UJI]%'
         OR user_id IN (SELECT id FROM users WHERE firebase_uid = 'seed_tester_surabaya');
    `);
    console.log(`   Berhasil menghapus ${deleteRes.rowCount} laporan uji coba.`);

    if (isCleanOnly) {
      console.log('✅ Mode --clean selesai. Data uji telah dibersihkan.');
      client.release();
      await pool.end();
      return;
    }

    // 2. Buat akun dummy seed user di tabel users
    console.log('👤 Menyiapkan user penguji (seed user)...');
    const userRes = await client.query(`
      INSERT INTO users (firebase_uid, nama, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid)
      DO UPDATE SET nama = EXCLUDED.nama, email = EXCLUDED.email
      RETURNING id;
    `, [
      'seed_tester_surabaya',
      'Warga Tester Surabaya (Data Uji)',
      'tester.surabaya@example.com',
    ]);
    const userId = userRes.rows[0].id;

    // 3. Masukkan 10 laporan contoh
    console.log('📍 Memasukkan 10 laporan contoh tersebar di Surabaya...');
    for (const report of SAMPLE_REPORTS) {
      await client.query(`
        INSERT INTO reports (user_id, kategori, keterangan, lokasi, status)
        VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6);
      `, [
        userId,
        report.kategori,
        report.keterangan,
        report.lng, // ST_MakePoint(lng, lat)
        report.lat,
        report.status,
      ]);
      console.log(`   [✓] [${report.kategori}] ${report.lokasi_nama} (${report.lat}, ${report.lng})`);
    }

    console.log('\n🎉 Seed data berhasil dimasukkan!');
    console.log('💡 Catatan: Semua data bertanda "[DATA UJI]". Untuk menghapusnya kapan saja, jalankan:');
    console.log('   npm run db:seed -- --clean');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Gagal menjalankan seed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

runSeed();
