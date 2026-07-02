import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfUseProps {
  onBack: () => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-6 sm:p-12 font-sans selection:bg-cyan-500/30 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#302b63]/40 via-[#24243e]/40 to-[#0f0c29]/40 -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 sm:p-12 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <FileText className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Syarat dan Ketentuan
            </h1>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">1. Penerimaan Syarat</h2>
              <p>
                Dengan mengakses dan menggunakan sistem Raport Digital Builder ini, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak diizinkan menggunakan sistem ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">2. Lisensi Penggunaan</h2>
              <p>
                Anda diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan sistem ini guna keperluan institusi pendidikan yang Anda wakili. Anda tidak diperkenankan menjual ulang atau mendistribusikan kode sumber aplikasi ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">3. Tanggung Jawab Pengguna</h2>
              <p>
                Pengguna bertanggung jawab penuh atas keakuratan data siswa, nilai, dan informasi lain yang dimasukkan ke dalam sistem. Kami tidak bertanggung jawab atas kesalahan cetak atau kehilangan data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">4. Pembatasan Tanggung Jawab</h2>
              <p>
                Sistem ini disediakan "sebagaimana adanya". Kami tidak menjamin bahwa sistem akan selalu bebas dari kesalahan (error) atau gangguan operasional. Pengguna disarankan untuk selalu mencadangkan (backup) data (ekspor ke Excel) secara berkala.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">5. Hak Kekayaan Intelektual</h2>
              <p>
                Desain, fungsionalitas, dan kode sistem ini merupakan hak kekayaan intelektual Pemilik Website. Penggunaan nama, logo, atau merek tanpa izin tertulis dilarang keras.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
