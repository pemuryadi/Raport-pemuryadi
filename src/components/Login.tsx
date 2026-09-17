import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'motion/react';
import { Lock, AlertCircle, Loader2, X, Eye } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  cmsData: any;
  onClose?: () => void;
  reason?: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, cmsData, onClose, reason }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const user = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        token: credentialResponse.credential
      };

      // Record visitor to the backend
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, name: user.name })
        });
      } catch (err) {
        console.error("Failed to record visitor", err);
      }

      // Save user session
      localStorage.setItem('user_session', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError("Gagal memproses login Google. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Login gagal atau dibatalkan oleh pengguna.");
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="w-full max-w-md bg-[#16152b] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
          title="Tutup & Lanjut Melihat"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-cyan-900/50 to-blue-900/50 rounded-2xl border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          {cmsData?.logo_url ? (
            <img src={cmsData.logo_url} alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          ) : (
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 text-center">
          {cmsData?.app_title || 'Raport Digital Builder'}
        </h2>
        <p className="text-cyan-200/80 text-center text-sm px-2">
          {reason || "Masuk dengan Akun Google untuk mulai mengelola data siswa, mengisi nilai, dan mencetak raport."}
        </p>
      </div>

      <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3.5 mb-6 text-xs text-cyan-200/90 flex items-start gap-2.5">
        <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">Mode Tamu:</span> Anda tetap bebas melihat-lihat tampilan, membaca modul panduan, dan mengecek rumus konversi tanpa login. Login hanya diperlukan untuk aksi interaktif (mengedit/mencetak).
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl mb-6 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
            <p className="text-sm text-cyan-200">Memproses autentikasi...</p>
          </div>
        ) : (
          <div className="w-full flex justify-center py-2">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
        )}
      </div>

      {onClose && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-cyan-300 transition-colors underline py-1"
          >
            Lanjut Melihat Saja (Mode Tamu)
          </button>
        </div>
      )}

      <div className="mt-6 text-center border-t border-cyan-500/20 pt-4">
        <p className="text-[11px] text-gray-500">
          {cmsData?.footer_text || '© 2026 pemuryadi. all rights reserved.'}
        </p>
      </div>
    </motion.div>
  );

  // If onClose is provided, render as modal overlay
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        {content}
      </div>
    );
  }

  // Full page view
  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex items-center justify-center p-6 relative font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-[#302b63]/40 via-[#24243e]/40 to-[#0f0c29]/40 -z-10" />
      {content}
    </div>
  );
};
