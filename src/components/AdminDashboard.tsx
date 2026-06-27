import React, { useState, useEffect } from 'react';
import { Save, Loader2, LogOut, ArrowLeft, Image as ImageIcon, FileText, Database, Layout } from 'lucide-react';

interface CmsData {
  app_title: string;
  app_subtitle: string;
  logo_url: string;
  footer_text: string;
  announcement_text: string;
  modul_pdf_url: string;
  guide_data_siswa: string;
  guide_daftar_nilai: string;
  guide_konversi: string;
  tahun_ajaran_options: string;
  semester_options: string;
  smk_program_options: string;
}

export function AdminDashboard() {
  const [data, setData] = useState<CmsData>({
    app_title: 'Raport Digital Builder',
    app_subtitle: 'Sistem pembuatan raport digital modern, cepat, dan mudah untuk semua jenjang pendidikan di Indonesia.',
    logo_url: '/logo raport.png',
    footer_text: '© 2026 Pemuryadi. All rights reserved.',
    announcement_text: '',
    modul_pdf_url: '/Modul Panduan Penggunaan Website raportsks.pdf',
    guide_data_siswa: 'Isi data siswa di bawah ini. ID akan otomatis terhubung ke tab Nilai dan Raport. (Maksimal 35 Siswa)',
    guide_daftar_nilai: 'Isi nilai untuk setiap mata pelajaran. Nama siswa otomatis diambil dari tab Data Siswa.',
    guide_konversi: 'Sesuaikan parameter konversi secara spesifik untuk masing-masing mata pelajaran. Mesin akan menggunakan formula yang diberikan untuk setiap mata pelajaran secara otomatis.',
    tahun_ajaran_options: '2023/2024, 2024/2025, 2025/2026',
    semester_options: 'Ganjil, Genap',
    smk_program_options: 'Bisnis dan Manajemen, Pariwisata, Seni dan Ekonomi Kreatif, Teknologi Informasi, Kesehatan dan Pekerjaan Sosial, Agribisnis dan Agroteknologi, Kemaritiman, Teknologi Konstruksi dan Properti, Teknologi Manufaktur dan Rekayasa, Energi dan Pertambangan',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'branding' | 'panduan' | 'master'>('branding');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const result = await response.json();
          
          // Helper to safely parse JSON array to comma separated string
          const parseOptions = (jsonStr: string, fallback: string) => {
            if (!jsonStr) return fallback;
            try {
              const arr = JSON.parse(jsonStr);
              return Array.isArray(arr) ? arr.join(', ') : fallback;
            } catch (e) {
              return fallback;
            }
          };

          setData({
            app_title: result.app_title || data.app_title,
            app_subtitle: result.app_subtitle || data.app_subtitle,
            logo_url: result.logo_url || data.logo_url,
            footer_text: result.footer_text || data.footer_text,
            announcement_text: result.announcement_text || data.announcement_text,
            modul_pdf_url: result.modul_pdf_url || data.modul_pdf_url,
            guide_data_siswa: result.guide_data_siswa || data.guide_data_siswa,
            guide_daftar_nilai: result.guide_daftar_nilai || data.guide_daftar_nilai,
            guide_konversi: result.guide_konversi || data.guide_konversi,
            tahun_ajaran_options: parseOptions(result.tahun_ajaran_options, data.tahun_ajaran_options),
            semester_options: parseOptions(result.semester_options, data.semester_options),
            smk_program_options: parseOptions(result.smk_program_options, data.smk_program_options),
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data CMS", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (key: keyof CmsData, value: string, isArray: boolean = false) => {
    setSaving(true);
    setMessage('');
    try {
      let finalValue = value;
      if (isArray) {
        // Convert comma separated string to JSON array string
        const arr = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        finalValue = JSON.stringify(arr);
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: finalValue }),
      });
      
      if (response.ok) {
        setMessage('Data berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal menyimpan data.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.hash = ''; // Redirect to home
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const InputRow = ({ label, objKey, isTextArea = false, isArray = false, placeholder = '' }: { label: string, objKey: keyof CmsData, isTextArea?: boolean, isArray?: boolean, placeholder?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-cyan-200 mb-2">{label}</label>
      <div className="flex gap-3 items-start">
        {isTextArea ? (
          <textarea
            value={data[objKey]}
            onChange={(e) => setData({ ...data, [objKey]: e.target.value })}
            placeholder={placeholder}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[100px] resize-y transition-all"
          />
        ) : (
          <input
            type="text"
            value={data[objKey]}
            onChange={(e) => setData({ ...data, [objKey]: e.target.value })}
            placeholder={placeholder}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        )}
        <button
          onClick={() => handleSave(objKey, data[objKey], isArray)}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all font-medium whitespace-nowrap shadow-lg shadow-cyan-900/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
        </button>
      </div>
      {isArray && <p className="text-xs text-cyan-400/60 mt-1.5 ml-1">Pisahkan item dengan koma (contoh: Pilihan 1, Pilihan 2, Pilihan 3)</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1a1a2e] p-5 rounded-2xl border border-white/10 shadow-[0_0_30px_-10px_rgba(34,211,238,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.hash = ''} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-cyan-300 transition-all" title="Kembali ke Aplikasi">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                CMS Dashboard
              </h1>
              <p className="text-sm text-cyan-200/60 mt-0.5">Kelola konten aplikasi Raport Digital secara Real-time</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 px-5 py-2.5 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.includes('Gagal') || message.includes('kesalahan') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            <CheckCircle className={`w-5 h-5 ${message.includes('Gagal') ? 'hidden' : 'block'}`} />
            {message}
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'branding' ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border border-cyan-500/30 text-cyan-300 shadow-[inset_2px_0_0_0_#22d3ee]' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
            >
              <Layout className="w-5 h-5" />
              <span className="font-medium">Branding & Teks</span>
            </button>
            <button 
              onClick={() => setActiveTab('panduan')}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'panduan' ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border border-cyan-500/30 text-cyan-300 shadow-[inset_2px_0_0_0_#22d3ee]' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Instruksi UI</span>
            </button>
            <button 
              onClick={() => setActiveTab('master')}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'master' ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border border-cyan-500/30 text-cyan-300 shadow-[inset_2px_0_0_0_#22d3ee]' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Master Data</span>
            </button>
          </div>

          {/* Editor Area */}
          <div className="md:col-span-3 bg-[#1a1a2e] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl">
            
            {activeTab === 'branding' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-cyan-400" /> Branding & Pengaturan Umum
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Atur identitas visual dan teks utama aplikasi.</p>
                </div>
                
                <div className="space-y-6">
                  <InputRow label="Judul Aplikasi" objKey="app_title" />
                  <InputRow label="Sub-judul / Deskripsi" objKey="app_subtitle" isTextArea />
                  <InputRow label="URL Logo (Path / URL Lengkap)" objKey="logo_url" placeholder="/logo raport.png" />
                  <InputRow label="Teks Pengumuman Banner (Kosongkan jika tidak ada)" objKey="announcement_text" placeholder="Pengumuman penting..." />
                  <InputRow label="Teks Footer / Hak Cipta" objKey="footer_text" />
                </div>
              </div>
            )}

            {activeTab === 'panduan' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" /> Teks Instruksi Antarmuka
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Ubah teks petunjuk yang muncul di masing-masing tab untuk memandu pengguna.</p>
                </div>
                
                <div className="space-y-6">
                  <InputRow label="Panduan Tab: Data Siswa" objKey="guide_data_siswa" isTextArea />
                  <InputRow label="Panduan Tab: Daftar Nilai" objKey="guide_daftar_nilai" isTextArea />
                  <InputRow label="Panduan Tab: Konversi Nilai" objKey="guide_konversi" isTextArea />
                  <InputRow label="Link/URL Download Modul Panduan (PDF)" objKey="modul_pdf_url" />
                </div>
              </div>
            )}

            {activeTab === 'master' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" /> Master Data (Dropdown)
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Kelola daftar pilihan untuk pengaturan global raport. <strong>Pisahkan dengan tanda koma.</strong></p>
                </div>
                
                <div className="space-y-6">
                  <InputRow label="Opsi Tahun Ajaran" objKey="tahun_ajaran_options" isArray isTextArea />
                  <InputRow label="Opsi Semester" objKey="semester_options" isArray />
                  <InputRow label="Opsi Program Keahlian SMK" objKey="smk_program_options" isArray isTextArea />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// Dummy icon for CheckCircle since it wasn't imported at top
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
