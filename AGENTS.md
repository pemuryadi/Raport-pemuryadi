# AGENTS.md — Petunjuk & Standar Proyek Raport Digital Builder

Dokumen ini adalah panduan teknis dan operasional untuk setiap AI Coding Agent atau developer yang bekerja pada repositori **Raport Digital Builder (`Raport-pemuryadi`)**.

---

## 1. Ikhtisar Proyek & Arsitektur

- **Nama Aplikasi:** Raport Digital Builder (Aplikasi Raport Kurikulum Merdeka)
- **Domain Produksi:** `https://raportsks.my.id/`
- **Tech Stack:**
  - **Frontend:** React 19, TypeScript (~5.8), Vite 6, Tailwind CSS v4, Motion (Framer Motion), Lucide React, XLSX.
  - **Autentikasi Pengguna:** Google OAuth 2.0 (`@react-oauth/google`).
  - **Autentikasi Admin:** Form login terenkripsi berbasis environment variable Cloudflare (`VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`).
  - **Backend / Serverless:** Cloudflare Pages Functions (`functions/api/`).
  - **Database:** Cloudflare D1 SQL Serverless (`raport-cms-db` dengan binding `DB`).
  - **AI Integration:** Server-side proxy (`functions/api/generate.ts`) menggunakan Pollinations / OpenAI / Gemini API untuk deskripsi capaian kompetensi.

---

## 2. Struktur Direktori Utama

```
├── functions/               # Cloudflare Pages Functions (Backend API & Edge Routing)
│   ├── api/
│   │   ├── auth.ts          # Validasi kredensial login Admin
│   │   ├── content.ts       # CRUD konten CMS dari Cloudflare D1
│   │   ├── generate.ts      # Proxy AI deskripsi capaian nilai
│   │   └── visitors.ts      # Pencatatan analitik pengunjung & pageviews
│   ├── sitemap.xml.ts       # Dinamis sitemap generator untuk SEO
│   └── wilayah/
│       └── [region].ts      # Edge SSR meta tag generator per wilayah/kabupaten
├── public/                  # Static assets publik
│   ├── ads.txt              # File verifikasi Google AdSense
│   ├── robots.txt           # Kebijakan bot (Allow search engines, Block AI scrapers)
│   ├── logo raport.png
│   └── *.pdf                # Modul panduan & regulasi BSKAP
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx  # Panel kontrol CMS & Analisis Pengunjung
│   │   ├── AdminLogin.tsx      # Halaman login admin (#/admin)
│   │   ├── Login.tsx           # Modal/Popup Google OAuth untuk pengguna
│   │   ├── PrivacyPolicy.tsx   # Kebijakan Privasi
│   │   └── TermsOfUse.tsx      # Syarat & Ketentuan Layanan
│   ├── data/
│   │   └── wilayah.ts       # Master data wilayah Indonesia untuk SEO regional
│   ├── App.tsx              # Core aplikasi raport (Data Siswa, Nilai, Cetak, Konversi)
│   └── main.tsx             # Entry point dengan GoogleOAuthProvider
├── schema.sql               # Skema database D1 (site_content, visitors, page_stats)
└── TUTORIAL_CMS_D1.md       # Panduan operasional CMS & D1
```

---

## 3. Kebijakan Keamanan & Kredensial (KRITIKAL)

1. **JANGAN PERNAH MENYIMPAN / MENG-COMMIT KREDENSIAL:**
   - File `.env` sudah masuk dalam `.gitignore` dan **TIDAK BOLEH** di-track oleh git.
   - API Keys (Pollinations, Gemini), OAuth Client Secret, dan Sandi Admin harus selalu dibaca melalui `import.meta.env` (frontend) atau `context.env` (Cloudflare Functions).
2. **Kredensial Produksi di Cloudflare:**
   - Variabel rahasia diatur di Dashboard Cloudflare Pages (`Settings` -> `Environment variables`).
   - Jangan pernah melakukan *hardcode* token ke dalam file source code `.ts` atau `.tsx`.

---

## 4. Pola Akses Pengguna (Guest vs Logged-In)

- **Mode Tamu (Guest - Read Only):**
  - Pengunjung bebas melihat tampilan antarmuka, preview raport sampel, berganti tab (Data Siswa, Nilai, Konversi, Cetak), dan membaca panduan.
- **Aksi Terbatas (Gated Actions):**
  - Setiap aksi pengubahan data (tambah/hapus siswa, edit nilai, cetak raport/PDF, import/export Excel, generate AI) wajib meminta pengguna masuk dengan Akun Google.
  - Saat login berhasil, identitas pengguna dicatat ke D1 melalui endpoint `/api/visitors`.

---

## 5. Standar Kode & Kualitas

- **TypeScript:** Selalu jalankan `npm run lint` (`tsc --noEmit`) untuk memastikan nol error tipe data.
- **Styling Cetak (Print Styles):** Seluruh elemen navigasi, kontrol, modal, dan banner iklan wajib memiliki class `print:hidden` agar hasil cetak lembar raport tetap bersih dan presisi.
- **Micro-Animations & UI Polish:** Manfaatkan Tailwind CSS dan Lucide icons dengan estetika modern bergaya cyber-clean / glassmorphism.

---

## 6. Prosedur Deployment

- Setiap perubahan yang siap di-deploy ke produksi harus dipush ke branch `main`:
  ```bash
  git status
  git add .
  git commit -m "feat/fix: deskripsi perubahan"
  git push origin main
  ```
- Cloudflare Pages secara otomatis akan mendeteksi commit baru di `main` dan menjalankan build command `npm run build`.
