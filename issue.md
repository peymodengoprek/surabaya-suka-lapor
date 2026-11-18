# Lapor Jalan Surabaya

> Aplikasi web untuk melaporkan jalan rusak di Surabaya secara faktual dan transparan, dengan dukungan banyak warga agar laporan sulit diabaikan.

**Status:** Perencanaan
**Stack:** Astro.js · Tailwind CSS · Firebase · PostgreSQL

---

## 1. Latar Belakang

Warga Surabaya yang lelah dengan diamnya pemerintah dalam menangani kerusakan jalan belum punya cara yang jelas untuk menyampaikan aspirasi. Keluhan tersebar di media sosial, tanpa lokasi pasti, tanpa bukti yang rapi, dan tanpa status tindak lanjut yang bisa dilihat publik.

Aplikasi ini memberi warga wadah untuk menyampaikan aspirasi **secara lebih faktual** (pin lokasi + foto bukti) dan **transparan** (status laporan terbuka, dukungan warga terlihat).

## 2. Siapa Penggunanya

**Warga Surabaya yang sehari-hari melewati jalan rusak.**
Hari ini mereka hanya bisa mengeluh di grup WhatsApp atau media sosial, atau melapor lewat kanal resmi tanpa kejelasan kelanjutannya. Mereka tidak tahu apakah laporannya dibaca, dan tidak tahu apakah orang lain mengalami hal yang sama.

## 3. Tujuan

- Warga bisa melihat kondisi jalan rusak di seluruh kota dalam satu peta.
- Warga bisa melapor dengan pin lokasi dan foto bukti.
- Laporan yang didukung banyak orang naik ke atas sehingga lebih sulit diabaikan.
- Status setiap laporan dapat dipantau secara terbuka.

**Bukan tujuan (di luar cakupan awal):** integrasi resmi dengan sistem pemerintah, aplikasi native mobile, moderasi otomatis berbasis AI.

## 4. Nilai Pembeda

Dibanding cara melapor yang ada sekarang, nilai utama aplikasi ini adalah **banyak orang ikut membantu**: warga bisa mendukung laporan orang lain, berdiskusi, dan melihat laporan mana yang paling banyak disuarakan. Satu keluhan menjadi suara bersama.

## 5. Pengalaman Kunjungan Pertama

Sebelum menutup aplikasi, pengguna baru harus sudah **melihat peta jalan Surabaya**, yaitu kondisi jalan rusak di sekitar mereka. Ini harus bisa dilakukan **tanpa login**, supaya nilai aplikasi terasa sebelum diminta mendaftar.

## 6. Alasan Pengguna Kembali

**Melapor jalan dekat rumah.** Pengguna kembali karena ada jalan rusak di sekitar mereka yang ingin dilaporkan, dipantau, atau didukung. Fase 4 (Laporan Saya dan Kabar untuk Warga) memperkuat alasan ini lewat notifikasi progres.

---

## 7. Fitur Wajib (MVP)

Tiga fitur yang membuat aplikasi berguna:

| # | Fitur | Alasan |
|---|-------|--------|
| 1 | **Peta Kota Surabaya** | Nilai pertama yang dilihat pengguna |
| 2 | **Taruh Pin Lokasi + Unggah Foto Bukti** | Inti dari pelaporan yang faktual |
| 3 | **Masuk pakai Gmail** | Identitas pelapor dan pencegahan spam |

> ⚠️ **Catatan urutan fase:** Di peta pikiran, "Masuk pakai Gmail" ada di Fase 3, padahal wajib untuk MVP dan dibutuhkan oleh Fase 2 (melapor, mendukung, berkomentar). Disarankan **memajukan login Gmail ke sebelum/bersamaan dengan Fase 2**. Fitur "Pakai Tanpa Masuk" tetap menjaga peta bisa dilihat tanpa login.

---

## 8. Rincian Fitur per Fase

### Fase 1: Peta Jalan Interaktif
- [ ] Peta Kota Surabaya
- [ ] Cari Lokasi
- [ ] Filter Kategori
- [ ] _(Sub-fitur ke-4: belum terlihat di peta pikiran, lihat Pertanyaan Terbuka)_

**Kriteria selesai:** Pengguna tanpa login dapat membuka peta, mencari alamat/lokasi, dan menyaring titik laporan berdasarkan kategori.

### Fase 2: Pelaporan dan Interaksi Warga

**Lapor Jalan Rusak**
- [ ] Taruh Pin Lokasi
- [ ] Unggah Foto Bukti
- [ ] Pilih Kategori Kerusakan
- [ ] _(Sub-fitur ke-4: belum terlihat)_

**Detail Laporan**
- [ ] Foto dan Keterangan
- [ ] Lokasi di Peta
- [ ] Status Laporan

**Dukungan Warga**
- [ ] Dukung Laporan
- [ ] Batalkan Dukungan
- [ ] Urutan Terpopuler

**Diskusi Warga**
- [ ] Tulis Komentar
- [ ] Balas Komentar
- [ ] Hapus Komentar Sendiri

**Kriteria selesai:** Pengguna yang login dapat membuat laporan lengkap (pin, foto, kategori), melihat detailnya, mendukung laporan, dan berdiskusi. Daftar laporan dapat diurutkan berdasarkan dukungan terbanyak.

### Fase 3: Akun
**Masuk pakai Gmail**
- [x] Daftar dengan Gmail
- [x] Masuk dan Keluar
- [x] Pakai Tanpa Masuk

**Kriteria selesai:** Pengguna dapat masuk dan keluar dengan akun Google; pengguna tanpa akun tetap dapat melihat peta dan detail laporan, tetapi tidak dapat melapor, mendukung, atau berkomentar.

### Fase 4: Retensi
**Laporan Saya**
- [ ] Riwayat Laporan
- [ ] Status Terkini
- [ ] Ubah atau Hapus Laporan

**Kabar untuk Warga**
- [ ] Kabar Komentar Baru
- [ ] Kabar Laporan Sekitar

**Kriteria selesai:** Pengguna dapat mengelola laporannya sendiri dan menerima kabar tentang komentar baru serta laporan baru di sekitar mereka.

---

## 9. User Story Utama

1. Sebagai **warga**, saya ingin **melihat peta jalan rusak di Surabaya** agar tahu kondisi jalan di sekitar saya tanpa perlu mendaftar.
2. Sebagai **warga**, saya ingin **menaruh pin dan foto** pada jalan rusak agar laporan saya punya bukti dan lokasi yang jelas.
3. Sebagai **warga**, saya ingin **masuk dengan Gmail** agar bisa melapor tanpa membuat akun baru.
4. Sebagai **warga**, saya ingin **mendukung laporan orang lain** agar suara bersama lebih kuat.
5. Sebagai **warga**, saya ingin **tahu ada laporan baru di dekat rumah** agar bisa ikut membantu atau memantau.

## 10. Rencana Teknis

| Lapisan | Teknologi | Peran |
|---------|-----------|-------|
| Frontend | **Astro.js** + **Tailwind CSS** | Halaman cepat, island interaktif untuk peta dan form |
| Autentikasi | **Firebase Authentication** | Login Google/Gmail |
| Penyimpanan foto | **Firebase Storage** | Foto bukti laporan |
| Notifikasi | **Firebase Cloud Messaging** | Kabar komentar dan laporan sekitar (Fase 4) |
| Database | **PostgreSQL** | Laporan, dukungan, komentar, status |

**Saran arsitektur:**
- Gunakan **PostGIS** pada PostgreSQL untuk query lokasi ("laporan dalam radius X dari titik ini"), penting untuk peta dan "Kabar Laporan Sekitar".
- Verifikasi Firebase ID token di server sebelum menulis ke PostgreSQL; simpan `firebase_uid` sebagai kunci pengguna.
- Astro dengan SSR (adapter Node) agar endpoint API dan akses database berada di satu proyek.
- Library peta: Leaflet + OpenStreetMap (gratis) atau MapLibre GL.

**Sketsa skema data:**

```
users(id, firebase_uid, nama, email, dibuat_pada)
reports(id, user_id, kategori, keterangan, lokasi GEOGRAPHY(Point), status, dibuat_pada)
report_photos(id, report_id, url, dibuat_pada)
supports(user_id, report_id, dibuat_pada)          -- unik per (user_id, report_id)
comments(id, report_id, user_id, parent_id, isi, dibuat_pada)
```

## 11. Risiko

- **Spam dan laporan palsu:** mitigasi lewat login wajib untuk melapor dan batas laporan per pengguna.
- **Duplikasi laporan:** satu jalan rusak dilaporkan berkali-kali. Tampilkan laporan terdekat saat pin ditaruh dan arahkan pengguna untuk mendukung laporan yang sudah ada. Ini juga selaras dengan nilai "banyak orang ikut bantu".
- **Siapa yang mengubah status laporan?** Tanpa kerja sama pemerintah, status perlu ditentukan (lihat Pertanyaan Terbuka).
- **Moderasi komentar:** perlu mekanisme lapor/hapus konten kasar.
- **Privasi foto:** foto dapat memuat wajah atau plat nomor; pertimbangkan peringatan saat unggah.

## 12. Pertanyaan Terbuka

1. Sub-fitur ke-4 di **Peta Jalan Interaktif** dan **Lapor Jalan Rusak** tidak terlihat di peta pikiran ("Lihat semua (4)"). Apa saja isinya?
2. Siapa yang memperbarui **Status Laporan** (admin, moderator, atau komunitas)? Apa saja nilai statusnya (misalnya: Baru, Diverifikasi, Diteruskan, Selesai)?
3. Apa daftar **Kategori Kerusakan** (lubang, retak, amblas, genangan, dan lainnya)?
4. Apakah **Fase 3 (login)** dimajukan sebelum Fase 2, seperti disarankan di atas?
5. Apakah laporan akan diteruskan ke kanal resmi pemerintah, atau aplikasi ini murni platform suara warga?

---

## 13. Daftar Tugas

- [x] Setup proyek Astro + Tailwind
- [x] Setup Firebase (Auth) dan PostgreSQL (+ PostGIS) (Fase 0 - Fondasi)
- [ ] Fase 1: Peta, pencarian lokasi, filter kategori
- [x] Login Gmail (dimajukan)
- [ ] Fase 2: Lapor, detail laporan, dukungan, diskusi
- [ ] Fase 4: Laporan Saya, notifikasi
- [ ] Uji coba dengan warga di satu kecamatan sebelum peluncuran kota

---

## Status Terakhir

**Sesi: Fase 0 (Fondasi)** — Selesai dikerjakan:
- **Astro SSR & Tailwind CSS:**
  - Proyek Astro disiapkan dalam mode SSR (`output: 'server'`) menggunakan `@astrojs/node` adapter (mode standalone).
  - Integrasi Tailwind CSS v4 via `@tailwindcss/vite` terpasang dan berfungsi.
- **PostgreSQL & Skema Tabel:**
  - Konfigurasi koneksi menggunakan `pg` (node-postgres) di [src/lib/db.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/lib/db.ts).
  - Skema DDL lengkap sesuai Bagian 10 di [db/schema.sql](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/db/schema.sql) mencakup 5 tabel: `users`, `reports` (dengan kolom PostGIS `GEOGRAPHY(Point)` & indeks GIST), `report_photos`, `supports`, dan `comments`.
  - Script migrasi otomatis tersedia via `npm run db:migrate` ([scripts/migrate.js](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/scripts/migrate.js)).
- **Firebase Auth (Client & Admin SDK):**
  - Firebase Client SDK dikonfigurasi di [src/lib/firebase/client.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/lib/firebase/client.ts) untuk login Google via popup di browser.
  - Firebase Admin SDK disiapkan di [src/lib/firebase/admin.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/lib/firebase/admin.ts) dan endpoint [src/pages/api/auth/verify.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/pages/api/auth/verify.ts) untuk verifikasi server-side token SSR.
  - Template konfigurasi variabel lingkungan disediakan di [.env.example](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/.env.example) dan [.env](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/.env).
- **Halaman Beranda Pengujian Fondasi:**
  - Halaman SSR [src/pages/index.astro](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/pages/index.astro) dan API [src/pages/api/health.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/pages/api/health.ts) menampilkan indikator status real-time untuk Astro, Tailwind, PostgreSQL, dan Firebase Auth secara fungsional.

**Sesi: Sinkronisasi Login ke Database (Fase 3 Dimajukan)** — Selesai dikerjakan:
- **Sinkronisasi Baris Pengguna PostgreSQL (UPSERT):**
  - Fungsi `syncUser(firebaseUid, email, nama)` dan `getUserByFirebaseUid(firebaseUid)` ditambahkan di [src/lib/db.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/lib/db.ts).
  - Menyimpan atau memperbarui data akun ke tabel `users` secara atomik berdasarkan `firebase_uid`.
- **Endpoint Sinkronisasi Server SSR:**
  - Endpoint [src/pages/api/auth/sync.ts](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/pages/api/auth/sync.ts) dibuat untuk memverifikasi ID token Firebase dan langsung menyinkronkan user ke PostgreSQL, mengembalikan data record database (`id`, `firebase_uid`, `nama`, `email`, `dibuat_pada`).
- **UI Akses Publik & Kontrol Masuk/Keluar:**
  - Pengunjung tanpa login dapat mengakses seluruh halaman publik tanpa hambatan.
  - Tombol Masuk (Google Auth) dan Keluar berfungsi pada header serta panel konten di [src/pages/index.astro](file:///C:/Users/Pey/hobi/surabaya-suka-lapor/src/pages/index.astro).
  - Nama pengguna ditampilkan secara jelas saat login (`Masuk sebagai: [Nama Pengguna]`), disertai detail ID pengguna di database PostgreSQL.
