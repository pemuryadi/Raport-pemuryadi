DROP TABLE IF EXISTS site_content;
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  content_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default CMS content
INSERT INTO site_content (id, content_key, content_value) VALUES 
('1', 'app_title', 'Raport Digital Builder'),
('2', 'app_subtitle', 'Sistem pembuatan raport digital modern, cepat, dan mudah untuk semua jenjang pendidikan di Indonesia.'),
('3', 'logo_url', '/logo raport.png'),
('4', 'footer_text', '© 2026 Pemuryadi. All rights reserved.'),
('5', 'announcement_text', ''),
('6', 'modul_pdf_url', '/Modul Panduan Penggunaan Website raportsks.pdf'),
('7', 'guide_data_siswa', 'Isi data siswa di bawah ini. ID akan otomatis terhubung ke tab Nilai dan Raport. (Maksimal 35 Siswa)'),
('8', 'guide_daftar_nilai', 'Isi nilai untuk setiap mata pelajaran. Nama siswa otomatis diambil dari tab Data Siswa.'),
('9', 'guide_konversi', 'Sesuaikan parameter konversi secara spesifik untuk masing-masing mata pelajaran. Mesin akan menggunakan formula yang diberikan untuk setiap mata pelajaran secara otomatis.'),
('10', 'tahun_ajaran_options', '["2023/2024", "2024/2025", "2025/2026"]'),
('11', 'semester_options', '["Ganjil", "Genap"]'),
('12', 'smk_program_options', '["Bisnis dan Manajemen", "Pariwisata", "Seni dan Ekonomi Kreatif", "Teknologi Informasi", "Kesehatan dan Pekerjaan Sosial", "Agribisnis dan Agroteknologi", "Kemaritiman", "Teknologi Konstruksi dan Properti", "Teknologi Manufaktur dan Rekayasa", "Energi dan Pertambangan"]');
