-- =======================================================
-- Surabaya Suka Lapor - Skema Database PostgreSQL
-- Sesuai Rencana Teknis Bagian 10 di issue.md
-- =======================================================

-- Aktifkan ekstensi PostGIS jika didukung database
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabel users
-- users(id, firebase_uid, nama, email, dibuat_pada)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    nama VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel reports
-- reports(id, user_id, kategori, keterangan, lokasi GEOGRAPHY(Point), status, dibuat_pada)
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kategori VARCHAR(100) NOT NULL,
    keterangan TEXT,
    lokasi GEOGRAPHY(Point, 4326),
    status VARCHAR(50) NOT NULL DEFAULT 'menunggu',
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel report_photos
-- report_photos(id, report_id, url, dibuat_pada)
CREATE TABLE IF NOT EXISTS report_photos (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel supports
-- supports(user_id, report_id, dibuat_pada) -- unik per (user_id, report_id)
CREATE TABLE IF NOT EXISTS supports (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, report_id)
);

-- 5. Tabel comments
-- comments(id, report_id, user_id, parent_id, isi, dibuat_pada)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    isi TEXT NOT NULL,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk optimasi query relasional
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON report_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_supports_report_id ON supports(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Indeks spasial untuk query radius (hanya jika PostGIS tersedia)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_reports_lokasi ON reports USING GIST (lokasi);
    END IF;
END $$;
