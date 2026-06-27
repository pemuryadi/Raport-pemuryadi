import React, { useState, useEffect } from 'react';
import { Save, Loader2, LogOut, ArrowLeft } from 'lucide-react';

interface CmsData {
  app_title: string;
  app_subtitle: string;
}

export function AdminDashboard() {
  const [data, setData] = useState<CmsData>({
    app_title: 'Raport Digital Builder',
    app_subtitle: 'Sistem pembuatan raport digital modern, cepat, dan mudah untuk semua jenjang pendidikan di Indonesia.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const result = await response.json();
          setData({
            app_title: result.app_title || data.app_title,
            app_subtitle: result.app_subtitle || data.app_subtitle,
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

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
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

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-[#1a1a2e] p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.hash = ''} className="p-2 hover:bg-white/10 rounded-lg text-cyan-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CMS Dashboard
            </h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('Gagal') || message.includes('kesalahan') ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}>
            {message}
          </div>
        )}

        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
          <h2 className="text-xl font-semibold text-cyan-300 mb-4 border-b border-white/10 pb-2">Konten Teks Beranda</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-200 mb-1">Judul Aplikasi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.app_title}
                  onChange={(e) => setData({ ...data, app_title: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSave('app_title', data.app_title)}
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-cyan-200 mb-1">Sub-judul / Deskripsi</label>
              <div className="flex gap-2">
                <textarea
                  value={data.app_subtitle}
                  onChange={(e) => setData({ ...data, app_subtitle: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-cyan-400 focus:outline-none min-h-[100px]"
                />
                <button
                  onClick={() => handleSave('app_subtitle', data.app_subtitle)}
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 h-fit"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
