import React, { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        onLoginSuccess();
      } else {
        setError(data.error || 'Login gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] p-8 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_-10px_rgba(34,211,238,0.3)] max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-900/40 p-4 rounded-full border border-cyan-500/50">
            <Settings className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Dashboard</h2>
        <p className="text-cyan-200 text-center text-sm mb-8">Masuk untuk mengelola konten website</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-cyan-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-cyan-200 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="#" onClick={() => window.location.hash = ''} className="text-sm text-cyan-400 hover:underline">
            Kembali ke Aplikasi Utama
          </a>
        </div>
      </div>
    </div>
  );
}
