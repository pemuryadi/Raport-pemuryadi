# Panduan Penggunaan CMS Dashboard & Cloudflare D1

Dokumen ini adalah panduan lengkap untuk menggunakan sistem CMS (Content Management System) baru yang didukung oleh Cloudflare D1. Sistem ini memungkinkan Anda mengubah teks dan elemen UI secara real-time tanpa harus melakukan deployment ulang (re-deploy).

## 1. Mengakses Dashboard Admin

Tautan Admin **sengaja disembunyikan** dari antarmuka publik agar lebih aman.
Untuk mengaksesnya, ikuti langkah berikut:

1. Buka website Raport Anda (misalnya `https://raportsks.my.id/`).
2. Tambahkan `#/admin` di akhir URL.
   Contoh: **`https://raportsks.my.id/#/admin`**
3. Anda akan melihat halaman Login. Masukkan kredensial berikut:
   - **Email:** `p.e.muryadi@gmail.com`
   - **Password:** `raportskspemuryadi60`
4. Klik **Masuk**. Jika berhasil, Anda akan diarahkan ke CMS Dashboard.

> [!IMPORTANT]
> **PENTING UNTUK DEPLOYMENT CLOUDFLARE:** 
> File `.env` yang ada di repository ini hanya berfungsi untuk pengembangan lokal (di komputer). Saat website Anda di-deploy ke Cloudflare Pages, Anda **wajib** memasukkan kredensial admin tersebut secara manual di Dashboard Cloudflare.
> 
> **Cara Menambahkan Environment Variable di Cloudflare Pages:**
> 1. Buka dashboard Cloudflare Anda.
> 2. Buka tab **Settings** -> **Environment variables** di halaman project Cloudflare Pages Anda.
> 3. Tambahkan dua variabel (Production & Preview):
>    - Variable name: `VITE_ADMIN_EMAIL` | Value: `p.e.muryadi@gmail.com`
>    - Variable name: `VITE_ADMIN_PASSWORD` | Value: `raportskspemuryadi60`
> 4. Jika Anda pernah mengubah API Key Gemini, Anda juga bisa menambahkan `VITE_GEMINI_API_KEY` di sana.
> 5. **Simpan** dan **Lakukan Deployment Ulang (Re-deploy)** agar variabel ini terbaca oleh sistem.

## 2. Mengubah Teks secara Real-time

Di dalam CMS Dashboard, Anda akan melihat pengaturan untuk:
- **Judul Aplikasi**
- **Sub-judul / Deskripsi**

1. Ubah teks sesuai keinginan Anda.
2. Klik tombol **Simpan**.
3. Sistem akan menyimpannya ke database Cloudflare D1 secara langsung.
4. Jika Anda kembali ke Halaman Utama, teks tersebut akan langsung berubah secara real-time!

## 3. Skema Database D1 (Backend)

Sistem ini menggunakan Cloudflare D1, yaitu database SQL serverless dari Cloudflare.
Struktur tabel yang dibuat adalah sebagai berikut:

```sql
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  content_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cara Setup D1 di Cloudflare (Jika Belum Terhubung)
1. Buka dashboard Cloudflare Anda.
2. Buka menu **Workers & Pages** -> **D1 SQL Database**.
3. Buat database baru dengan nama `raport-cms-db`.
4. Salin `database_id` yang diberikan (meskipun nanti kita akan menautkannya langsung lewat Dashboard).
5. Buka tab **Settings** -> **Functions** di halaman project Cloudflare Pages Anda.
6. Scroll ke bagian **D1 database bindings**, tambahkan binding baru dengan:
   - **Variable name:** `DB`
   - **D1 database:** Pilih database `raport-cms-db` yang baru saja Anda buat.
7. Untuk menjalankan migrasi tabel (`schema.sql`), Anda bisa mengeksekusi perintah ini di terminal lokal Anda (pastikan Anda sudah login ke wrangler):
   ```bash
   npx wrangler d1 execute raport-cms-db --file=./schema.sql --remote
   ```
   *Atau*, Anda bisa masuk ke halaman D1 Database di dashboard Cloudflare, buka tab **Console**, dan salin-tempel (copy-paste) isi dari file `schema.sql` lalu jalankan secara manual.

## 4. Cara Memerintahkan AI untuk Menambah Komponen yang Bisa Diedit

Jika di kemudian hari Anda ingin membuat elemen lain (seperti warna tombol, logo, atau teks di bagian lain) agar bisa diedit lewat Dashboard, cukup berikan perintah (prompt) ini ke Asisten AI (Gemini/ChatGPT):

> *"Tolong tambahkan elemen [Nama Elemen, misal: Teks Footer] agar bisa diedit lewat CMS Dashboard yang sudah ada. Key database barunya adalah 'footer_text'. Tolong update komponen `AdminDashboard.tsx` untuk menampilkan input pengaturannya, dan update `App.tsx` agar menggunakan data `cmsData.footer_text` di bagian footer."*

AI akan langsung paham dan menambahkan kolom input baru di Dashboard Anda!
