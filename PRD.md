# Product Requirements Document (PRD)
## Raport Digital Builder (raportsks.my.id)

---

## 1. Pendahuluan & Latar Belakang

**Raport Digital Builder** adalah platform aplikasi berbasis web modern dan responsif yang dirancang untuk mempermudah guru dan satuan pendidikan di Indonesia dalam mengelola data siswa, menghitung nilai akhir, melakukan konversi nilai otomatis, menyusun deskripsi capaian kompetensi berbantuan AI, serta mencetak lembar raport sesuai standar Kurikulum Merdeka (SK BSKAP No. 046/H/KR/2025 & BKPDM No. 020 Tahun 2026).

Aplikasi ini bertujuan memberikan akses gratis, cepat, dan praktis tanpa memerlukan instalasi software berat, serta dapat diakses baik dari laptop maupun smartphone.

---

## 2. Sasaran Pengguna (User Personas)

1. **Guru Kelas & Guru Mata Pelajaran (K-12):**
   - Ingin memasukkan nilai harian/sumatif, melihat rata-rata kelas, dan menghasilkan catatan capaian kompetensi secara otomatis tanpa pusing menghitung manual.
2. **Wali Kelas & Operator Sekolah:**
   - Membutuhkan format raport standar siap cetak (PDF/Printer), ekspor-impor data dengan Excel, dan pengelolaan data presensi siswa.
3. **Pengunjung Umum / Calon Pengguna:**
   - Ingin mengeksplorasi antarmuka, melihat fitur konversi nilai, dan mempelajari struktur kurikulum sebelum memutuskan menggunakan platform.
4. **Administrator Platform (Owner):**
   - Mengontrol konfigurasi aplikasi, memperbarui pengumuman/panduan lewat CMS, memantau trafik pengunjung secara realtime, dan memonetisasi website melalui Google AdSense secara sehat.

---

## 3. Spesifikasi Fungsional

### 3.1. Pengelolaan Data & Nilai
- **Data Siswa:** Input nama, NISN, NIS, agama, presensi (sakit, izin, alpha), catatan wali kelas, kegiatan kokurikuler, dan ekstrakurikuler (maksimal 35 siswa per rombel).
- **Pengaturan Kurikulum:** Pilihan fleksibel untuk semua jenjang (PAUD, SD, MI, SMP, MTs, SMA, MA, SMK, MAK, Paket A/B/C), penyesuaian otomatis daftar mata pelajaran & muatan lokal.
- **Konversi Nilai Fleksibel:** Pengaturan batas interval nilai kustom (A, B, C, D) per mata pelajaran dengan formula otomatis.
- **AI Competency Generator:** Pembuatan deskripsi capaian kompetensi otomatis berbasis AI (Pollinations / OpenAI proxy) dengan prompt terarah.
- **Ekspor & Impor Excel:** Integrasi format template spreadsheet `.xlsx` untuk backup dan migrasi data cepat.
- **Cetak Raport Siap Edar:** Output cetak presisi standar A4 / F4 dengan preview instan dan proteksi styling (`print:hidden` pada elemen non-raport).

### 3.2. Akses Pengunjung (Guest vs Gated Usage)
- **Mode Tamu (Guest / Read-Only):**
  - Pengunjung bebas melihat demo antarmuka, melihat sampel siswa & nilai, membaca panduan penggunaan, serta menavigasi seluruh tab.
- **Aksi Terbatas (Gated Actions):**
  - Aksi penulisan/pengubahan data (mengedit input data, menambah/menghapus siswa, generate AI, import/export Excel, dan cetak raport) dilindungi oleh gerbang login Google.
  - Saat aksi dipicu oleh tamu, muncul dialog pop-up: *"Silakan Masuk dengan Google untuk Menggunakan Fitur Ini"*.
- **Pencatatan Otomatis Pengguna:**
  - Sesi login Google menyimpan profil pengguna dan secara asinkron mencatat email, nama, dan waktu ke database D1 (`visitors`).

### 3.3. Pelacakan Pengunjung & Dashboard Admin
- **Tracking Pageviews Realtime:** Pencatatan hit kunjungan anonim ke tabel `page_stats` di Cloudflare D1.
- **Tracking Pengguna Login:** Pencatatan frekuensi login dan waktu login terakhir per akun Google.
- **CMS Dashboard Admin (`#/admin`):**
  - Tab Branding & Teks Umum (Judul, Subjudul, URL Logo, Teks Pengumuman, Teks Footer).
  - Tab Instruksi UI (Panduan masing-masing tab).
  - Tab Master Data (Dropdown Tahun Ajaran, Semester, Jurusan SMK).
  - Tab Analisis Pengunjung (Kartu Total Kunjungan, Kartu Total Pengguna Terdaftar, Tabel Log Pengguna).
  - Tab Google AdSense (Pengaturan Publisher ID & Status Iklan).

---

## 4. Keamanan & Proteksi Bot (Anti-Scraper & Rate Limiting)

1. **AI Scraper Blocking:**
   - File `robots.txt` memblokir secara eksplisit bot LLM crawler (GPTBot, ClaudeBot, Google-Extended, CCBot, ByteSpider, PerplexityBot, dll.) untuk melindungi hak cipta konten dan mencegah beban komputasi liar.
2. **Cloudflare WAF Bot Fight Mode:**
   - Pemanfaatan proteksi bawaan Cloudflare Pages untuk menghentikan bot otomatis di tingkat edge server.
3. **API Rate Limiting:**
   - Pembatasan frekuensi request pada endpoint backend `/api/generate` dan `/api/visitors` guna mencegah spamming dan pemborosan kuota AI API.
4. **Keamanan Kredensial:**
   - Seluruh secret key (OAuth secret, API key, admin credentials) tersimpan di Cloudflare Environment Variables dan `.env` yang tidak di-commit ke repositori publik.

---

## 5. Monetisasi & Integrasi Google AdSense

1. **File Validasi `public/ads.txt`:**
   - Menyediakan format resmi `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`.
2. **Penempatan Iklan (Ad Placements):**
   - Banner iklan responsif ditempatkan di posisi strategis yang tidak mengganggu alur kerja guru (misal di bawah panel kontrol header).
3. **Print-Safe Isolation:**
   - Seluruh slot iklan diproteksi dengan utility class `print:hidden` sehingga dijamin 100% tidak pernah muncul di cetakan fisik raport siswa.

---

## 6. SEO & Performa

- **Meta Tags Lengkap:** Title, description, keywords, OpenGraph, dan Twitter Card terpasang pada `index.html`.
- **Sitemap Dinamis:** Didukung oleh `functions/sitemap.xml.ts` mencakup homepage dan sub-halaman SEO wilayah 38 provinsi di Indonesia (`functions/wilayah/[region].ts`).
- **Structured Data:** JSON-LD bertipe `WebApplication` untuk visibilitas maksimal di Google Search Console.
