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
('2', 'app_subtitle', 'Sistem pembuatan raport digital modern, cepat, dan mudah untuk semua jenjang pendidikan di Indonesia.');
