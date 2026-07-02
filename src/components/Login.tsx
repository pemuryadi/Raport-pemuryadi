import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'motion/react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  cmsData: any;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, cmsData }) => {
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
        // Continue login even if analytics fails
      }

      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError("Gagal memproses login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Login gagal atau dibatalkan.");
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex items-center justify-center p-6 relative font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-[#302b63]/40 via-[#24243e]/40 to-[#0f0c29]/40 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-900/50 to-blue-900/50 rounded-2xl border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
             {cmsData?.logo_url ? (
               <img src={cmsData.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
             ) : (
               <Lock className="w-10 h-10 text-cyan-400" />
             )}
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 text-center">
            {cmsData?.app_title || 'Raport Digital Builder'}
          </h1>
          <p className="text-cyan-200/60 text-center text-sm">
            Silakan login untuk mengakses sistem
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <p className="text-sm text-cyan-200">Memproses login...</p>
             </div>
           ) : (
             <GoogleLogin
               onSuccess={handleSuccess}
               onError={handleError}
               theme="filled_black"
               shape="pill"
               size="large"
               text="continue_with"
               width="300"
             />
           )}
        </div>

        <div className="mt-8 text-center border-t border-cyan-500/20 pt-6">
           <p className="text-xs text-gray-500">
             {cmsData?.footer_text || '© 2026 pemuryadi. all rights reserved.'}
           </p>
        </div>
      </motion.div>
    </div>
  );
};
