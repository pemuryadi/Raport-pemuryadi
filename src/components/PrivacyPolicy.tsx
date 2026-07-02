import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Kebijakan Privasi
            </h1>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">1. Pengumpulan Informasi</h2>
              <p>
                Kami mengumpulkan informasi yang Anda berikan saat menggunakan aplikasi ini, termasuk namun tidak terbatas pada alamat email Anda (melalui login Google) dan data terkait profil pendidikan yang Anda masukkan ke dalam sistem raport.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">2. Penggunaan Informasi</h2>
              <p>
                Informasi yang dikumpulkan digunakan semata-mata untuk:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Memverifikasi identitas dan memberikan akses ke sistem.</li>
                <li>Menyediakan layanan pembuatan raport secara digital.</li>
                <li>Meningkatkan pengalaman pengguna berdasarkan analitik penggunaan.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">3. Keamanan Data</h2>
              <p>
                Kami menerapkan langkah-langkah keamanan untuk melindungi data Anda. Data siswa yang Anda kelola sebagian besar disimpan secara lokal di peramban (browser) Anda, memastikan privasi siswa tetap terjaga kecuali Anda mengekspornya.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">4. Perubahan Kebijakan</h2>
              <p>
                Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu. Setiap perubahan akan diberitahukan melalui halaman ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-cyan-300">5. Kontak</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui kontak yang tersedia di website.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
