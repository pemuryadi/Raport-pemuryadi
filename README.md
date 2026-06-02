# Raport SKS Pemuryadi

Aplikasi Raport SKS Digital untuk mempermudah guru dalam mengisi, mengelola, dan mencetak raport siswa sesuai dengan Kurikulum Merdeka.

## Fitur
- Pengisian Data Siswa (Termasuk Keterangan Naik Kelas/Lulus di Semester Genap)
- Pengisian Nilai Mata Pelajaran
- Konfigurasi Ekstrakurikuler dan Muatan Lokal
- Pengaturan Logo Sekolah (Watermark Transparan di Lembar Cetak)
- Pencetakan Raport Digital dalam bentuk PDF
- Export/Import Data menggunakan Excel (.xlsx)

## Cara Menjalankan Secara Lokal

**Prasyarat:** Node.js

1. Instalasi dependensi:
   `npm install`
2. Jalankan aplikasi:
   `npm run dev`

## Panduan Fitur Tambahan
- **Watermark Logo**: Buka tab **Beranda**, pada bagian *Pengaturan Logo Sekolah*, unggah file gambar (Maks. 1.5MB). Logo akan muncul sebagai watermark pada hasil cetak PDF.
- **Kenaikan Kelas/Kelulusan**: Fitur ini aktif otomatis saat memilih *Semester Genap*. Keterangan naik kelas/kelulusan dapat diedit di tab **Data Siswa** dan diekspor/diimpor via Excel.
