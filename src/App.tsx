import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Printer, FileText, Users, BookOpen, Home, Settings, CheckCircle, AlertCircle, Info, Save, Download, Upload, Trash2, Heart, Coffee, Facebook, Instagram } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Types ---
interface Student {
  id: string;
  nama: string;
  nisn: string;
  nis: string;
  sakit: string;
  izin: string;
  alpha: string;
  catatanWali: string;
  kokurikuler: string;
  ekstra: Record<string, string>;
  nilai: Record<string, string>;
  keputusan?: string;
}

// --- Constants ---
const JENJANG_OPTIONS = ['PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'MAK', 'Paket A', 'Paket B', 'Paket C'];
const KELAS_OPTIONS: Record<string, string[]> = {
  'PAUD': ['PAUD/TK/RA/Kelompok Bermain'],
  'SD': ['I', 'II', 'III', 'IV', 'V', 'VI'],
  'MI': ['I', 'II', 'III', 'IV', 'V', 'VI'],
  'Paket A': ['I', 'II', 'III', 'IV', 'V', 'VI'],
  'SMP': ['VII', 'VIII', 'IX'],
  'MTs': ['VII', 'VIII', 'IX'],
  'Paket B': ['VII', 'VIII', 'IX'],
  'SMA': ['X', 'XI', 'XII'],
  'MA': ['X', 'XI', 'XII'],
  'SMK': ['X', 'XI', 'XII'],
  'MAK': ['X', 'XI', 'XII'],
  'Paket C': ['X', 'XI', 'XII']
};

const SMK_PROGRAM = [
  'Bisnis dan Manajemen', 'Pariwisata', 'Seni dan Ekonomi Kreatif',
  'Teknologi Informasi', 'Kesehatan dan Pekerjaan Sosial', 'Agribisnis dan Agroteknologi', 
  'Kemaritiman', 'Teknologi Konstruksi dan Properti', 'Teknologi Manufaktur dan Rekayasa', 'Energi dan Pertambangan'
];

const SEMESTER_OPTIONS = ['Ganjil', 'Genap'];
const TAHUN_AJARAN_OPTIONS = ['2023/2024', '2024/2025', '2025/2026'];

// --- Helper Functions ---
function generateSubjects(jenjang: string, kelas: string, kejuruan: string, muatanLokalList: string[] = ['Muatan Lokal']) {
  let subs: string[] = [];
  
  if (['MI', 'MTs', 'MA', 'MAK'].includes(jenjang)) {
    subs.push("Al-Qur'an Hadis", 'Akidah Akhlak', 'Fikih', 'Sejarah Kebudayaan Islam', 'Bahasa Arab');
  } else {
    subs.push('Pendidikan Agama dan Budi Pekerti');
  }
  
  subs.push('Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika');

  if (['SD', 'MI', 'Paket A'].includes(jenjang)) {
    if (['IV', 'V', 'VI'].includes(kelas)) subs.push('Ilmu Pengetahuan Alam dan Sosial (IPAS)');
  } else if (['SMP', 'MTs', 'Paket B'].includes(jenjang)) {
    subs.push('Ilmu Pengetahuan Alam', 'Ilmu Pengetahuan Sosial', 'Informatika');
  } else if (['SMA', 'MA', 'SMK', 'MAK', 'Paket C'].includes(jenjang)) {
    if (kelas === 'X') {
      if (['SMK', 'MAK'].includes(jenjang)) {
        subs.push('Ilmu Pengetahuan Alam dan Sosial (IPAS)', 'Informatika', 'Dasar-dasar Program Keahlian');
      } else {
        subs.push('Biologi', 'Kimia', 'Fisika', 'Sosiologi', 'Ekonomi', 'Sejarah', 'Geografi', 'Informatika');
      }
    } else {
      if (['SMK', 'MAK'].includes(jenjang)) {
        subs.push('Sejarah', `Konsentrasi Keahlian: ${kejuruan}`, 'Projek Kreatif dan Kewirausahaan', 'Praktik Kerja Lapangan');
      } else {
        subs.push('Sejarah', 'Mata Pelajaran Pilihan 1', 'Mata Pelajaran Pilihan 2', 'Mata Pelajaran Pilihan 3', 'Mata Pelajaran Pilihan 4');
      }
    }
  }

  subs.push('Pendidikan Jasmani, Olahraga, dan Kesehatan', 'Seni dan Budaya', 'Bahasa Inggris', ...muatanLokalList);
  return [...new Set(subs)];
}

const DEFAULT_SUBJECTS = generateSubjects('SD', 'I', SMK_PROGRAM[0], ['Muatan Lokal']);

function isFinalKelas(jenjang: string, kelas: string): boolean {
  const classes = KELAS_OPTIONS[jenjang];
  if (!classes || classes.length === 0) return false;
  return classes[classes.length - 1] === kelas;
}

function getNextKelas(jenjang: string, kelas: string): string {
  const classes = KELAS_OPTIONS[jenjang];
  if (!classes) return '';
  const idx = classes.indexOf(kelas);
  if (idx !== -1 && idx < classes.length - 1) {
    return classes[idx + 1];
  }
  return '';
}

function getKelasTerbilang(kelas: string): string {
  const mapping: Record<string, string> = {
    'I': 'Satu',
    'II': 'Dua',
    'III': 'Tiga',
    'IV': 'Empat',
    'V': 'Lima',
    'VI': 'Enam',
    'VII': 'Tujuh',
    'VIII': 'Delapan',
    'IX': 'Sembilan',
    'X': 'Sepuluh',
    'XI': 'Sebelas',
    'XII': 'Dua Belas'
  };
  return mapping[kelas] || kelas;
}

function getFase(jenjang: string, kelas: string) {
  if (jenjang === 'PAUD') return 'Fase Fondasi';
  if (['SD', 'MI', 'Paket A'].includes(jenjang)) {
    if (['I', 'II'].includes(kelas)) return 'Fase A';
    if (['III', 'IV'].includes(kelas)) return 'Fase B';
    if (['V', 'VI'].includes(kelas)) return 'Fase C';
  }
  if (['SMP', 'MTs', 'Paket B'].includes(jenjang)) return 'Fase D';
  if (['SMA', 'MA', 'SMK', 'MAK', 'Paket C'].includes(jenjang)) {
    if (kelas === 'X') return 'Fase E';
    if (['XI', 'XII'].includes(kelas)) return 'Fase F';
  }
  return '';
}

function generateDeskripsi(mapel: string, skor: string | number) {
  if (!mapel || skor === '') return '';
  const nilai = Number(skor);
  const m = mapel.toLowerCase();
  
  let capaianTertinggi = "memahami berbagai capaian pembelajaran secara menyeluruh";
  let capaianTerendah = "penguasaan materi yang lebih kompleks";

  if (m.includes("matematika")) {
    capaianTertinggi = "memahami operasi hitung dasar, pengenalan bentuk geometri, dan penalaran logika matematika";
    capaianTerendah = "ketelitian pemecahan masalah (problem solving) pada penerapan soal cerita terapan";
  } else if (m.includes("indonesia")) {
    capaianTertinggi = "menyampaikan gagasan secara komunikatif dan memahami isi utama dari teks bacaan";
    capaianTerendah = "keterampilan menyusun teks tertulis secara sistematis dengan ejaan dan tanda baca yang baku";
  } else if (m.includes("pancasila") || m.includes("kewarganegaraan") || m.includes("pkn")) {
    capaianTertinggi = "memahami nilai-nilai luhur Pancasila, menghargai kebhinekaan, dan mentaati norma yang berlaku";
    capaianTerendah = "penerapan penalaran analisis kritis pada studi kasus hak dan kewajiban warga negara";
  } else if (m.includes("agama") || m.includes("budi pekerti") || m.includes("akhlak") || m.includes("qur'an") || m.includes("fikih")) {
    capaianTertinggi = "memahami pilar keimanan, tata cara ibadah sesuai syariat, dan mengamalkan sikap religius";
    capaianTerendah = "kedisiplinan implementasi ibadah mandiri dan telaah mendalam pada teks keagamaan";
  } else if (m.includes("ipas") || m.includes("alam") || m.includes("biologi") || m.includes("fisika") || m.includes("kimia")) {
    capaianTertinggi = "memahami konsep ilmu pengetahuan atau sains yang dipelajari dan menunjukkan kepedulian pada alam";
    capaianTerendah = "keterampilan melakukan observasi ilmiah dan akurasi menyajikan laporan hasil eksperimen";
  } else if (m.includes("sosial") || m.includes("sejarah") || m.includes("sosiologi") || m.includes("ekonomi") || m.includes("geografi")) {
    capaianTertinggi = "memahami fenomena keruangan, interaksi sosial kemasyarakatan, serta alur kesejarahan di sekitarnya";
    capaianTerendah = "penalaran tingkat lanjut tentang dampak peristiwa sejarah atau ekonomi terhadap masa kini";
  } else if (m.includes("inggris") || m.includes("arab") || m.includes("bahasa")) {
    capaianTertinggi = "memahami instruksi sederhana, ragam kosakata umum, dan mampu merespon dasar interaksi tutur kata";
    capaianTerendah = "kepercayaan diri dalam percakapan lisan (speaking) dan keluwesan struktur tata bahasa";
  } else if (m.includes("jasmani") || m.includes("olahraga") || m.includes("pjok")) {
    capaianTertinggi = "berprestasi dalam koordinasi gerak dasar dan kemampuan bekerja tim saat berolahraga kelompok";
    capaianTerendah = "pemahaman mendalam terkait taktik cabang olahraga spesifik dan pemeliharaan kebugaran rutin mandiri";
  } else if (m.includes("seni") || m.includes("budaya") || m.includes("prakarya") || m.includes("kreatif")) {
    capaianTertinggi = "mengekspresikan daya imajinasi melalui karya original yang memiliki nilai estetika dan apresiatif";
    capaianTerendah = "kerapian dalam tahap pengerjaan penyelesaian akhir (finishing) serta keunikan detail pada karya seni";
  } else if (m.includes("informatika") || m.includes("komputer") || m.includes("tik")) {
    capaianTertinggi = "mengoperasikan perangkat lunak dasar dengan presisi serta menunjukkan etika literasi digital yang cakap";
    capaianTerendah = "pemahaman penerapan bahasa algoritma terstruktur dan perancangan dasar arsitektur pemrograman";
  } else if (m.includes("kejuruan") || m.includes("praktik") || m.includes("dasar-dasar") || m.includes("konsentrasi") || m.includes("pilihan") || m.includes("lokal")) {
    capaianTertinggi = "menerapkan kompetensi sasaran keahlian dan menjalankan penerapan Prosedur Operasional Standar (SOP)";
    capaianTerendah = "kecepatan taktis serta tingkat kemandirian penuh dalam eksekusi proyek skala level industri";
  }

  // Kurikulum Merdeka Standard Formatting strings
  if (nilai >= 90) {
    return `Ananda menunjukkan penguasaan yang sangat baik dalam ${capaianTertinggi}.`;
  } else if (nilai >= 80) {
    return `Ananda menunjukkan penguasaan yang baik dalam ${capaianTertinggi}. Perlu bimbingan lebih pada bagian ${capaianTerendah}.`;
  } else if (nilai >= 70) {
    return `Ananda menunjukkan penguasaan yang cukup dalam ${capaianTertinggi}. Masih cukup memerlukan pendampingan berkelanjutan dalam ${capaianTerendah}.`;
  } else {
    return `Ananda memerlukan bimbingan intensif dan khusus agar mampu ${capaianTertinggi}, khususnya mendalami terkait ${capaianTerendah}.`;
  }
}

function generateKokurikulerDescription(input: string): string {
  const t = input.trim().toLowerCase();
  
  if (!t) return "Siswa menunjukkan perkembangan karakter yang positif dengan mulai berpartisipasi aktif dalam kegiatan projek P5 bersama teman sebaya.";

  if (t.length > 50) return input.charAt(0).toUpperCase() + input.slice(1);

  const themes = [
    { key: 'berkelanjutan', desc: 'Ananda sangat sadar dalam projek "Gaya Hidup Berkelanjutan", mampu menjaga lingkungan secara aktif serta mengaplikasikan hidup ramah lingkungan di kehidupan sehari-hari.' },
    { key: 'kearifan', desc: 'Ananda berpartisipasi proaktif pada projek "Kearifan Lokal", menunjukkan sikap adaptif terhadap tradisi serta antusias menjaga kelestarian budaya daerah.' },
    { key: 'bhinneka', desc: 'Ananda memiliki empati tinggi pada projek "Bhinneka Tunggal Ika", mengutamakan toleransi positif dan sangat menghargai keberagaman dalam pergaulan.' },
    { key: 'bangun', desc: 'Ananda senantiasa energik dalam projek "Bangunlah Jiwa dan Raganya", mampu memelihara wawasan kesehatan fisik-mental serta berpartisipasi suportif dan positif.' },
    { key: 'jiwa', desc: 'Ananda menunjukkan antusiasme yang luar biasa pada projek "Bangunlah Jiwa dan Raganya", menjaga kesehatan serta interaksi teman sebaya dengan baik.' },
    { key: 'demokrasi', desc: 'Ananda mampu mengartikulasikan pemikiran logis pada projek "Suara Demokrasi", tanggap dalam musyawarah serta santun menghargai opini sesama rekan.' },
    { key: 'rekayasa', desc: 'Ananda berdaya inovasi tinggi dalam projek "Rekayasa dan Teknologi", adaptif merancang ide solusi serta sangat jeli pada detail teknis saat praktik.' },
    { key: 'teknologi', desc: 'Ananda berdaya inovasi tinggi dalam projek "Rekayasa dan Teknologi", adaptif merancang ide solusi serta sangat jeli pada detail teknis saat praktik.' },
    { key: 'kewirausahaan', desc: 'Ananda berpikiran maju pada projek "Kewirausahaan", sangat kreatif menciptakan gagasan rintisan serta unggul merencanakan strategi kelompok secara teliti.' },
    { key: 'wirausaha', desc: 'Ananda berpikiran maju pada projek "Kewirausahaan", sangat kreatif menciptakan gagasan rintisan serta unggul merencanakan strategi kelompok secara teliti.' },
    { key: 'bekerja', desc: 'Ananda mengembangkan disiplin etos kerja gigih dalam projek "Kebekerjaan", senantiasa berpedoman kuat pada budaya produktif dan integritas profesional di setiap kesempatan.' },
    { key: 'pancasila', desc: 'Ananda menginternalisasikan nilai-nilai Profil Pelajar Pancasila secara nyata, membiasakan adab kesantunan dan tanggung jawab moral di setiap aktivitas projek.' }
  ];

  for (const theme of themes) {
    if (t.includes(theme.key)) {
      return theme.desc;
    }
  }

  return `Ananda menunjukkan proses perkembangan yang sangat berkesan dan tanggap mengenai "${input}". Ananda sanggup membangun interaksi kolaboratif secara komunikatif.`;
}

// --- Reusable Components ---
const FormInput = ({ label, value, onChange, placeholder = '', type = 'text', className = '', readOnly = false }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-cyan-200 font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`bg-black/40 border border-cyan-400/30 rounded-lg py-2 px-3 text-white placeholder:text-cyan-400/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, className = '' }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-cyan-200 font-medium">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="bg-black/40 border border-cyan-400/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="bg-[#1a1a2e] text-white">{opt}</option>
      ))}
    </select>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Global Settings
  const [settings, setSettings] = useState({
    jenjang: 'SD',
    kelas: 'I',
    kejuruan: SMK_PROGRAM[0],
    semester: 'Ganjil',
    tahunAjaran: '2023/2024',
    namaSekolah: '',
    alamatSekolah: '',
    namaKepsek: '',
    nipKepsek: '',
    namaWali: '',
    nipWali: '',
    tempatTanggal: '',
    ekskulList: ['Pramuka'] as string[],
    muatanLokalList: ['Muatan Lokal'] as string[]
  });

  // Students Data (35 rows)
  const [students, setStudents] = useState<Student[]>(
    Array.from({ length: 35 }, (_, i) => ({
      id: (i + 1).toString(),
      nama: '', nisn: '', nis: '',
      sakit: '', izin: '', alpha: '',
      catatanWali: '', keputusan: '',
      kokurikuler: '',
      ekstra: {},
      nilai: {}
    }))
  );

  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [selectedPrintId, setSelectedPrintId] = useState('1');

  // --- Persistence ---
  useEffect(() => {
    const savedSettings = localStorage.getItem('raport_settings');
    const savedStudents = localStorage.getItem('raport_students');
    const savedSubjects = localStorage.getItem('raport_subjects');

    if (savedSettings) {
      const p = JSON.parse(savedSettings);
      if (!p.ekskulList) p.ekskulList = ['Pramuka'];
      if (!p.muatanLokalList) p.muatanLokalList = ['Muatan Lokal'];
      setSettings(p);
    }
    if (savedStudents) {
      let p = JSON.parse(savedStudents);
      p = p.map((s: any) => {
        if (!s.ekstra) {
          s.ekstra = {};
          if (s.ekstra1) s.ekstra[s.ekstra1] = s.ketEkstra1 || '';
          if (s.ekstra2) s.ekstra[s.ekstra2] = s.ketEkstra2 || '';
        }
        return s;
      });
      setStudents(p);
    }
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
  }, []);

  const handleSave = () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('raport_settings', JSON.stringify(settings));
      localStorage.setItem('raport_students', JSON.stringify(students));
      localStorage.setItem('raport_subjects', JSON.stringify(subjects));
      
      setTimeout(() => {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      localStorage.removeItem('raport_settings');
      localStorage.removeItem('raport_students');
      localStorage.removeItem('raport_subjects');
      
      setSettings({
        jenjang: 'SD',
        kelas: 'I',
        kejuruan: SMK_PROGRAM[0],
        semester: 'Ganjil',
        tahunAjaran: '2023/2024',
        namaSekolah: '',
        alamatSekolah: '',
        namaKepsek: '',
        nipKepsek: '',
        namaWali: '',
        nipWali: '',
        tempatTanggal: '',
        ekskulList: ['Pramuka'],
        muatanLokalList: ['Muatan Lokal']
      });
      setStudents(Array.from({ length: 35 }, (_, i) => ({
        id: (i + 1).toString(),
        nama: '', nisn: '', nis: '',
        sakit: '', izin: '', alpha: '',
        catatanWali: '', keputusan: '', kokurikuler: '',
        ekstra: {}, nilai: {}
      })));
      setSubjects(generateSubjects('SD', 'I', SMK_PROGRAM[0], ['Muatan Lokal']));
      
      setActiveTab('beranda');
      alert("Data berhasil direset.");
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Settings
    const exportSettings = { ...settings };
    if (!['SMK', 'MAK'].includes(settings.jenjang)) {
      delete (exportSettings as any).kejuruan;
    }
    const settingsData = [
      ['Kunci', 'Nilai'],
      ...Object.entries(exportSettings).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : v])
    ];
    const wsSettings = XLSX.utils.aoa_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(wb, wsSettings, "Pengaturan");

    // Sheet 2: Data Siswa & Nilai (Combined for easier editing)
    const studentHeaders = ['ID', 'Nama', 'NISN', 'NIS', 'Sakit', 'Izin', 'Alpha', 'Catatan Wali Kelas', 'Keputusan', 'Kokurikuler', ...settings.ekskulList.map(e => `Ekstra: ${e}`), ...subjects];
    const studentData = students.map(s => [
      s.id, s.nama, s.nisn, s.nis, s.sakit, s.izin, s.alpha, s.catatanWali, s.keputusan || '', s.kokurikuler, 
      ...settings.ekskulList.map(e => s.ekstra?.[e] || ''),
      ...subjects.map(sub => s.nilai[sub] || '')
    ]);
    const wsStudents = XLSX.utils.aoa_to_sheet([studentHeaders, ...studentData]);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Data Siswa dan Nilai");

    XLSX.writeFile(wb, `Raport_Digital_${settings.namaSekolah || 'Data'}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Import Settings
        const wsSettings = wb.Sheets["Pengaturan"];
        let updatedSettings = { ...settings };
        if (wsSettings) {
          const settingsJson = XLSX.utils.sheet_to_json(wsSettings) as any[];
          settingsJson.forEach((row: any) => {
            if (row.Kunci && row.Nilai !== undefined) {
              if (row.Kunci === 'ekskulList' || row.Kunci === 'muatanLokalList') {
                try { (updatedSettings as any)[row.Kunci] = JSON.parse(row.Nilai); } catch (e) {}
              } else {
                (updatedSettings as any)[row.Kunci] = row.Nilai.toString();
              }
            }
          });
          setSettings(updatedSettings);
        }

        // Import Students & Nilai
        const wsStudents = wb.Sheets["Data Siswa dan Nilai"];
        const importedEkskulList = updatedSettings.ekskulList || settings.ekskulList;
        const importedMuatanLokalList = updatedSettings.muatanLokalList || settings.muatanLokalList;
        
        let newSubjects = generateSubjects(updatedSettings.jenjang, updatedSettings.kelas, updatedSettings.kejuruan, importedMuatanLokalList);
        
        if (wsStudents) {
          const studentsJson = XLSX.utils.sheet_to_json(wsStudents) as any[];
          const newStudents = [...students];
          
          const normalize = (k: string) => k.replace(/\s+/g, '').toLowerCase();

          studentsJson.forEach((row: any, index: number) => {
            if (index < 35) {
              const s = newStudents[index];
              
              const rowNorm: any = {};
              for(let key in row) rowNorm[normalize(key)] = row[key];

              s.nama = rowNorm['nama']?.toString() || '';
              s.nisn = rowNorm['nisn']?.toString() || '';
              s.nis = rowNorm['nis']?.toString() || '';
              s.sakit = rowNorm['sakit']?.toString() || '';
              s.izin = rowNorm['izin']?.toString() || '';
              s.alpha = rowNorm['alpha']?.toString() || '';
              s.catatanWali = rowNorm['catatanwalikelas']?.toString() || rowNorm['catatanwali']?.toString() || '';
              s.keputusan = rowNorm['keputusan']?.toString() || '';
              s.kokurikuler = rowNorm['kokurikuler']?.toString() || '';
              s.ekstra = {};
              
              importedEkskulList.forEach((eks: string) => {
                const colHeader = `Ekstra: ${eks}`;
                const normCol = normalize(colHeader);
                if (rowNorm[normCol] !== undefined) {
                  s.ekstra[eks] = rowNorm[normCol].toString();
                } else if (row[colHeader] !== undefined) {
                  s.ekstra[eks] = row[colHeader].toString();
                }
              });
              
              // Nilai
              newSubjects.forEach(sub => {
                const normSub = normalize(sub);
                if (rowNorm[normSub] !== undefined) {
                  s.nilai[sub] = rowNorm[normSub].toString();
                } else if (row[sub] !== undefined) {
                  s.nilai[sub] = row[sub].toString();
                }
              });
            }
          });
          setStudents(newStudents);
          setSubjects(newSubjects);
        }

        alert('Data berhasil diimpor!');
      } catch (err) {
        console.error('Import error:', err);
        alert('Gagal mengimpor data. Pastikan format file benar.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Handlers ---
  const handleJenjangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newJenjang = e.target.value;
    const newKelas = KELAS_OPTIONS[newJenjang][0];
    setSettings({ ...settings, jenjang: newJenjang, kelas: newKelas });
    setSubjects(generateSubjects(newJenjang, newKelas, settings.kejuruan, settings.muatanLokalList));
  };

  const handleKelasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKelas = e.target.value;
    setSettings({...settings, kelas: newKelas});
    setSubjects(generateSubjects(settings.jenjang, newKelas, settings.kejuruan, settings.muatanLokalList));
  };

  const handleKejuruanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKejuruan = e.target.value;
    setSettings({...settings, kejuruan: newKejuruan});
    setSubjects(generateSubjects(settings.jenjang, settings.kelas, newKejuruan, settings.muatanLokalList));
  };

  const updateStudent = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setStudents(newStudents);
  };

  const updateStudentEkstra = (index: number, eks: string, value: string) => {
    const newStudents = [...students];
    newStudents[index].ekstra = { ...newStudents[index].ekstra, [eks]: value };
    setStudents(newStudents);
  };

  const handleAddEkskul = () => {
    setSettings({...settings, ekskulList: [...settings.ekskulList, `Ekskul ${settings.ekskulList.length + 1}`]});
  };

  const handleEkskulChange = (index: number, newName: string) => {
    const oldName = settings.ekskulList[index];
    const newList = [...settings.ekskulList];
    newList[index] = newName;
    
    const newStudents = students.map(s => {
      const newEkstra = {...s.ekstra};
      if (newEkstra[oldName] !== undefined) {
        newEkstra[newName] = newEkstra[oldName];
        delete newEkstra[oldName];
      }
      return {...s, ekstra: newEkstra};
    });
    
    setSettings({...settings, ekskulList: newList});
    setStudents(newStudents);
  };

  const handleRemoveEkskul = (index: number) => {
    const nameToRemove = settings.ekskulList[index];
    const newList = settings.ekskulList.filter((_, i) => i !== index);
    const newStudents = students.map(s => {
      const newEkstra = {...s.ekstra};
      delete newEkstra[nameToRemove];
      return {...s, ekstra: newEkstra};
    });
    setSettings({...settings, ekskulList: newList});
    setStudents(newStudents);
  };

  const handleAddMuatanLokal = () => {
    const newList = [...settings.muatanLokalList, `Muatan Lokal ${settings.muatanLokalList.length + 1}`];
    setSettings({...settings, muatanLokalList: newList});
    setSubjects(generateSubjects(settings.jenjang, settings.kelas, settings.kejuruan, newList));
  };

  const handleMuatanLokalChange = (index: number, newName: string) => {
    const oldName = settings.muatanLokalList[index];
    const newList = [...settings.muatanLokalList];
    newList[index] = newName;
    
    const newStudents = students.map(s => {
      const newNilai = {...s.nilai};
      if (newNilai[oldName] !== undefined) {
        newNilai[newName] = newNilai[oldName];
        delete newNilai[oldName];
      }
      return {...s, nilai: newNilai};
    });
    
    setSettings({...settings, muatanLokalList: newList});
    setStudents(newStudents);
    setSubjects(generateSubjects(settings.jenjang, settings.kelas, settings.kejuruan, newList));
  };

  const handleRemoveMuatanLokal = (index: number) => {
    const nameToRemove = settings.muatanLokalList[index];
    const newList = settings.muatanLokalList.filter((_, i) => i !== index);
    const newStudents = students.map(s => {
      const newNilai = {...s.nilai};
      delete newNilai[nameToRemove];
      return {...s, nilai: newNilai};
    });
    setSettings({...settings, muatanLokalList: newList});
    setStudents(newStudents);
    setSubjects(generateSubjects(settings.jenjang, settings.kelas, settings.kejuruan, newList));
  };

  const updateStudentNilai = (index: number, subject: string, value: string) => {
    const newStudents = [...students];
    newStudents[index].nilai = { ...newStudents[index].nilai, [subject]: value };
    setStudents(newStudents);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  // --- Calculations ---
  const activeStudents = students.filter(s => s.nama.trim() !== '');
  const totalActive = activeStudents.length || 1; // Prevent div by zero

  const dataSiswaFilled = activeStudents.reduce((acc, s) => {
    let score = 0;
    if (s.nisn) score++;
    if (s.nis) score++;
    return acc + (score / 2);
  }, 0);
  const dataSiswaCompletion = activeStudents.length === 0 ? 0 : Math.round((dataSiswaFilled / totalActive) * 100);

  const nilaiFilled = activeStudents.reduce((acc, s) => {
    const filledSubjects = subjects.filter(sub => s.nilai[sub] && s.nilai[sub] !== '').length;
    return acc + (filledSubjects / subjects.length);
  }, 0);
  const nilaiCompletion = activeStudents.length === 0 ? 0 : Math.round((nilaiFilled / totalActive) * 100);

  const settingsKeys = Object.keys(settings) as (keyof typeof settings)[];
  const settingsFilled = settingsKeys.filter(k => settings[k] !== '').length;
  const settingsCompletion = Math.round((settingsFilled / settingsKeys.length) * 100);

  const overallCompletion = Math.round((dataSiswaCompletion + nilaiCompletion + settingsCompletion) / 3);

  const fase = getFase(settings.jenjang, settings.kelas);
  const printStudent = students.find(s => s.id === selectedPrintId) || students[0];

  const ekstraList = settings.ekskulList
    .filter(eks => printStudent.ekstra && printStudent.ekstra[eks])
    .map(eks => ({ nama: eks, ket: printStudent.ekstra[eks] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans print:bg-none print:bg-white print:text-black">
      
      {/* --- Cyberpunk Control Panel (Hidden on Print) --- */}
      <div className="p-4 sm:p-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white/5 border border-cyan-400/50 rounded-xl p-4 mb-4 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)] flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-cyan-400">
                <FileText className="w-6 h-6" />
                RAPORT DIGITAL BUILDER
              </h1>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-bold transition-all ${
                    saveStatus === 'success' 
                      ? 'bg-green-500 text-white' 
                      : saveStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  } shadow-lg disabled:opacity-50`}
                >
                  <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-pulse' : ''}`} />
                  {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'success' ? 'Tersimpan!' : saveStatus === 'error' ? 'Gagal!' : 'Simpan Data'}
                </button>

                <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg">
                  <Download className="w-4 h-4" /> Export
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg cursor-pointer">
                  <Upload className="w-4 h-4" /> Import
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />
                </label>

                <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-bold bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white transition-all border border-red-500/30">
                  <Trash2 className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-lg border border-cyan-400/30 overflow-x-auto">
              {[
                { id: 'beranda', label: 'Beranda', icon: Home },
                { id: 'data-siswa', label: 'Data Siswa', icon: Users },
                { id: 'nilai', label: 'Daftar Nilai', icon: BookOpen },
                { id: 'raport', label: 'Raport Digital', icon: Printer },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center flex-1 sm:flex-none gap-2 px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap text-sm ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,255,255,0.5)]' 
                      : 'text-cyan-200 hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- TAB CONTENT --- */}
          <div className="bg-white/5 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-sm min-h-[600px]">
            
            {/* TAB: BERANDA */}
            {activeTab === 'beranda' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-black/30 border border-cyan-400/20 p-6 rounded-xl text-center">
                    <div className="text-cyan-400 mb-2"><CheckCircle className="w-8 h-8 mx-auto" /></div>
                    <div className="text-3xl font-bold text-white">{overallCompletion}%</div>
                    <div className="text-sm text-cyan-200 mt-1">Total Progress</div>
                  </div>
                  <div className="bg-black/30 border border-cyan-400/20 p-6 rounded-xl text-center">
                    <div className="text-cyan-400 mb-2"><Settings className="w-8 h-8 mx-auto" /></div>
                    <div className="text-3xl font-bold text-white">{settingsCompletion}%</div>
                    <div className="text-sm text-cyan-200 mt-1">Pengaturan Global</div>
                  </div>
                  <div className="bg-black/30 border border-cyan-400/20 p-6 rounded-xl text-center">
                    <div className="text-cyan-400 mb-2"><Users className="w-8 h-8 mx-auto" /></div>
                    <div className="text-3xl font-bold text-white">{dataSiswaCompletion}%</div>
                    <div className="text-sm text-cyan-200 mt-1">Data Siswa ({activeStudents.length}/35)</div>
                  </div>
                  <div className="bg-black/30 border border-cyan-400/20 p-6 rounded-xl text-center">
                    <div className="text-cyan-400 mb-2"><BookOpen className="w-8 h-8 mx-auto" /></div>
                    <div className="text-3xl font-bold text-white">{nilaiCompletion}%</div>
                    <div className="text-sm text-cyan-200 mt-1">Daftar Nilai</div>
                  </div>
                </div>

                <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                  <h2 className="text-xl font-semibold text-cyan-300 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Pengaturan Global Raport
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormSelect label="Jenjang" value={settings.jenjang} onChange={handleJenjangChange} options={JENJANG_OPTIONS} />
                    <FormSelect label="Kelas" value={settings.kelas} onChange={handleKelasChange} options={KELAS_OPTIONS[settings.jenjang]} />
                    {['SMK', 'MAK'].includes(settings.jenjang) && (
                      <FormSelect label="Program Keahlian" value={settings.kejuruan} onChange={handleKejuruanChange} options={SMK_PROGRAM} />
                    )}
                    <FormInput label="Fase (Otomatis)" value={fase} readOnly />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormSelect label="Semester" value={settings.semester} onChange={(e: any) => setSettings({...settings, semester: e.target.value})} options={SEMESTER_OPTIONS} />
                    <FormSelect label="Tahun Ajaran" value={settings.tahunAjaran} onChange={(e: any) => setSettings({...settings, tahunAjaran: e.target.value})} options={TAHUN_AJARAN_OPTIONS} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput label="Nama Sekolah" value={settings.namaSekolah} onChange={(e: any) => setSettings({...settings, namaSekolah: e.target.value})} />
                    <FormInput label="Alamat Sekolah" value={settings.alamatSekolah} onChange={(e: any) => setSettings({...settings, alamatSekolah: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput label="Nama Kepala Sekolah" value={settings.namaKepsek} onChange={(e: any) => setSettings({...settings, namaKepsek: e.target.value})} />
                    <FormInput label="NIP Kepala Sekolah" value={settings.nipKepsek} onChange={(e: any) => setSettings({...settings, nipKepsek: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput label="Nama Wali Kelas" value={settings.namaWali} onChange={(e: any) => setSettings({...settings, namaWali: e.target.value})} />
                    <FormInput label="NIP Wali Kelas" value={settings.nipWali} onChange={(e: any) => setSettings({...settings, nipWali: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Tempat, Tanggal Rapor" placeholder="Contoh: Jakarta, 15 Desember 2023" value={settings.tempatTanggal} onChange={(e: any) => setSettings({...settings, tempatTanggal: e.target.value})} />
                  </div>
                </div>

                {/* Pengaturan Ekstrakurikuler & Muatan Lokal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Ekstra */}
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" /> Ekstrakurikuler
                    </h2>
                    <div className="space-y-3">
                      {settings.ekskulList.map((eks, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <span className="text-sm text-cyan-200 w-24">Ekstra {idx + 1}</span>
                          <input
                            value={eks}
                            onChange={(e) => handleEkskulChange(idx, e.target.value)}
                            className="bg-black/40 border border-cyan-400/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400 flex-1 max-w-md"
                            placeholder="Nama Ekstrakurikuler..."
                          />
                          <button
                            onClick={() => handleRemoveEkskul(idx)}
                            className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            title="Hapus Ekstra"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddEkskul}
                        className="mt-2 bg-cyan-600/30 border border-cyan-400/50 text-cyan-300 py-2 px-4 rounded-lg hover:bg-cyan-500 hover:text-black transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        + Tambah Ekstrakurikuler
                      </button>
                    </div>
                  </div>

                  {/* Muatan Lokal */}
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> Muatan Lokal
                    </h2>
                    <div className="space-y-3">
                      {settings.muatanLokalList.map((ml, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <span className="text-sm text-cyan-200 w-24">Mulok {idx + 1}</span>
                          <input
                            value={ml}
                            onChange={(e) => handleMuatanLokalChange(idx, e.target.value)}
                            className="bg-black/40 border border-cyan-400/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-400 flex-1 max-w-md"
                            placeholder="Nama Muatan Lokal..."
                          />
                          <button
                            onClick={() => handleRemoveMuatanLokal(idx)}
                            className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            title="Hapus Muatan Lokal"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddMuatanLokal}
                        className="mt-2 bg-cyan-600/30 border border-cyan-400/50 text-cyan-300 py-2 px-4 rounded-lg hover:bg-cyan-500 hover:text-black transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        + Tambah Muatan Lokal
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DATA SISWA */}
            {activeTab === 'data-siswa' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 mb-4">
                  <Info className="w-5 h-5" />
                  <p className="text-sm">Isi data siswa di bawah ini. ID akan otomatis terhubung ke tab Nilai dan Raport. (Maksimal 35 Siswa)</p>
                </div>
                <div className="overflow-auto max-h-[65vh] bg-black/20 rounded-lg border border-white/10 relative shadow-inner">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-cyan-300">
                      <tr>
                        <th className="p-3 font-semibold sticky left-0 top-0 bg-[#1a1a2e] z-30 w-12 border-b border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">ID</th>
                        <th className="p-3 font-semibold sticky left-[48px] top-0 bg-[#1a1a2e] z-30 min-w-[200px] border-r border-b border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Nama Siswa</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[120px] border-b border-white/10">NISN</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[120px] border-b border-white/10">NIS</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 w-20 border-b border-white/10">Sakit</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 w-20 border-b border-white/10">Izin</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 w-20 border-b border-white/10">Alpha</th>
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[250px] border-b border-white/10">Catatan Wali Kelas</th>
                        {settings.semester === 'Genap' && (
                          <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[200px] border-b border-white/10">Keputusan</th>
                        )}
                        <th className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[250px] border-b border-white/10">Kokurikuler (Deskripsi)</th>
                        {settings.ekskulList.map((eks, idx) => (
                          <th key={idx} className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[200px] border-b border-white/10">Ekstra: {eks}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-2 sticky left-0 bg-[#1a1a2e] z-10 text-center text-cyan-400">{s.id}</td>
                          <td className="p-2 sticky left-[48px] bg-[#1a1a2e] z-10 border-r border-white/10">
                            <input value={s.nama} onChange={e => updateStudent(i, 'nama', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" placeholder="Nama..." />
                          </td>
                          <td className="p-2"><input value={s.nisn} onChange={e => updateStudent(i, 'nisn', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" /></td>
                          <td className="p-2"><input value={s.nis} onChange={e => updateStudent(i, 'nis', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" /></td>
                          <td className="p-2"><input type="number" value={s.sakit} onChange={e => updateStudent(i, 'sakit', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" /></td>
                          <td className="p-2"><input type="number" value={s.izin} onChange={e => updateStudent(i, 'izin', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" /></td>
                          <td className="p-2"><input type="number" value={s.alpha} onChange={e => updateStudent(i, 'alpha', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" /></td>
                          <td className="p-2"><input value={s.catatanWali} onChange={e => updateStudent(i, 'catatanWali', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" placeholder="Catatan Wali Kelas..." /></td>
                          {settings.semester === 'Genap' && (
                            <td className="p-2">
                              <select 
                                value={s.keputusan || ''} 
                                onChange={e => updateStudent(i, 'keputusan', e.target.value)} 
                                className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none text-xs"
                              >
                                <option value="" className="bg-[#1a1a2e]">-- Pilih Keputusan --</option>
                                {settings.jenjang === 'PAUD' ? (
                                  <>
                                    <option value="Selesai Fase Fondasi (Lulus)" className="bg-[#1a1a2e]">Selesai Fase Fondasi (Lulus)</option>
                                    <option value="Melanjutkan ke SD" className="bg-[#1a1a2e]">Melanjutkan ke SD</option>
                                  </>
                                ) : isFinalKelas(settings.jenjang, settings.kelas) ? (
                                  <>
                                    <option value="Lulus" className="bg-[#1a1a2e]">Lulus</option>
                                    <option value="Tidak Lulus" className="bg-[#1a1a2e]">Tidak Lulus</option>
                                  </>
                                ) : (
                                  <>
                                    <option value={`Naik ke kelas ${getNextKelas(settings.jenjang, settings.kelas)} (${getKelasTerbilang(getNextKelas(settings.jenjang, settings.kelas))})`} className="bg-[#1a1a2e]">{`Naik ke kelas ${getNextKelas(settings.jenjang, settings.kelas)} (${getKelasTerbilang(getNextKelas(settings.jenjang, settings.kelas))})`}</option>
                                    <option value={`Tinggal di kelas ${settings.kelas} (${getKelasTerbilang(settings.kelas)})`} className="bg-[#1a1a2e]">{`Tinggal di kelas ${settings.kelas} (${getKelasTerbilang(settings.kelas)})`}</option>
                                  </>
                                )}
                              </select>
                            </td>
                          )}
                          <td className="p-2"><input value={s.kokurikuler} onChange={e => updateStudent(i, 'kokurikuler', e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" placeholder="Deskripsi Kokurikuler..." /></td>
                          {settings.ekskulList.map((eks, idx) => (
                            <td key={idx} className="p-2">
                              <input value={s.ekstra?.[eks] || ''} onChange={e => updateStudentEkstra(i, eks, e.target.value)} className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-white focus:border-cyan-400 focus:outline-none" placeholder={`Keterangan ${eks}...`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DAFTAR NILAI */}
            {activeTab === 'nilai' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 mb-4">
                  <Info className="w-5 h-5" />
                  <p className="text-sm">Isi nilai untuk setiap mata pelajaran. Nama siswa otomatis diambil dari tab Data Siswa.</p>
                </div>
                <div className="overflow-auto max-h-[65vh] bg-black/20 rounded-lg border border-white/10 relative shadow-inner">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-cyan-300">
                      <tr>
                        <th className="p-3 font-semibold sticky left-0 top-0 bg-[#1a1a2e] z-30 w-12 border-b border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">ID</th>
                        <th className="p-3 font-semibold sticky left-[48px] top-0 bg-[#1a1a2e] z-30 min-w-[200px] border-r border-b border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Nama Siswa</th>
                        {subjects.map((sub, idx) => (
                          <th key={idx} className="p-3 font-semibold sticky top-0 bg-[#1a1a2e] z-20 min-w-[120px] text-center border-b border-white/10" title={sub}>
                            <div className="truncate w-32 mx-auto">{sub}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-2 sticky left-0 bg-[#1a1a2e] z-10 text-center text-cyan-400">{s.id}</td>
                          <td className="p-2 sticky left-[48px] bg-[#1a1a2e] z-10 border-r border-white/10">
                            <div className="px-2 py-1.5 text-white/80 truncate w-full">{s.nama || <span className="text-white/30 italic">Belum diisi...</span>}</div>
                          </td>
                          {subjects.map((sub, idx) => (
                            <td key={idx} className="p-2">
                              <input 
                                type="number" 
                                value={s.nilai[sub] || ''} 
                                onChange={e => updateStudentNilai(i, sub, e.target.value)} 
                                className="bg-black/40 border border-white/10 rounded px-2 py-1.5 w-full text-center text-white focus:border-cyan-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={!s.nama}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: RAPORT DIGITAL */}
            {activeTab === 'raport' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <label className="text-cyan-300 font-medium whitespace-nowrap">Pilih Siswa (ID):</label>
                    <select 
                      value={selectedPrintId} 
                      onChange={(e) => setSelectedPrintId(e.target.value)}
                      className="bg-black/40 border border-cyan-400/30 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-full sm:w-64"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#1a1a2e]">
                          ID {s.id} {s.nama ? `- ${s.nama}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,255,255,0.3)] w-full sm:w-auto"
                  >
                    <Printer className="w-5 h-5" />
                    Cetak PDF
                  </button>
                </div>

                {!printStudent.nama && (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center gap-2 text-yellow-200">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Data siswa ini masih kosong. Silakan isi di tab Data Siswa.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- Formal Report Card (Visible on Screen when Raport tab is active, and always on Print) --- */}
      <div className={`max-w-[21cm] mx-auto bg-white text-black p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 mb-12 ${activeTab === 'raport' ? 'block' : 'hidden print:block'}`}>
        
        {/* Header */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-[13px] leading-relaxed">
          <div>
            <div className="flex"><span className="w-32 font-semibold">Nama Murid</span><span className="mr-2">:</span><span>{printStudent.nama || '.........................'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">NISN / NIS</span><span className="mr-2">:</span><span>{printStudent.nisn || '..........'} / {printStudent.nis || '..........'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">Sekolah</span><span className="mr-2">:</span><span>{settings.namaSekolah || '.........................'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">Alamat</span><span className="mr-2">:</span><span>{settings.alamatSekolah || '.........................'}</span></div>
          </div>
          <div>
            <div className="flex"><span className="w-32 font-semibold">Kelas</span><span className="mr-2">:</span><span>{settings.kelas || '.........................'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">Fase</span><span className="mr-2">:</span><span>{fase || '.........................'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">Semester</span><span className="mr-2">:</span><span>{settings.semester || '.........................'}</span></div>
            <div className="flex"><span className="w-32 font-semibold">Tahun Ajaran</span><span className="mr-2">:</span><span>{settings.tahunAjaran || '.........................'}</span></div>
          </div>
        </div>

        {/* Table 1: Mata Pelajaran */}
        <table className="w-full border-collapse border border-black mb-6 text-[13px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-black p-2 w-10 text-center font-bold">No.</th>
              <th className="border border-black p-2 w-48 text-center font-bold">Mata Pelajaran</th>
              <th className="border border-black p-2 w-16 text-center font-bold">Nilai<br/>Akhir</th>
              <th className="border border-black p-2 text-center font-bold">Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => {
              const skor = printStudent.nilai[sub];
              if (!skor) return null;
              return (
                <tr key={i}>
                  <td className="border border-black p-2 text-center align-top">{i + 1}</td>
                  <td className="border border-black p-2 align-top">{sub}</td>
                  <td className="border border-black p-2 text-center align-top font-bold">{skor}</td>
                  <td className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">{generateDeskripsi(sub, skor)}</td>
                </tr>
              );
            })}
            {subjects.filter(sub => printStudent.nilai[sub]).length === 0 && (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center italic text-gray-500">Belum ada nilai yang diisi</td>
              </tr>
            )}
            <tr>
              <td className="border border-black p-2 text-center align-top">dst.</td>
              <td className="border border-black p-2 align-top"></td>
              <td className="border border-black p-2 text-center align-top"></td>
              <td className="border border-black p-2 align-top"></td>
            </tr>
          </tbody>
        </table>

        {/* Table 2: Kokurikuler */}
        <table className="w-full border-collapse border border-black mb-6 text-[13px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-black p-2 text-center font-bold">Kokurikuler</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 leading-relaxed min-h-[40px] whitespace-pre-line">
                {generateKokurikulerDescription(printStudent.kokurikuler)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Table 3: Ekstrakurikuler */}
        <table className="w-full border-collapse border border-black mb-6 text-[13px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-black p-2 w-10 text-center font-bold">No.</th>
              <th className="border border-black p-2 w-48 text-center font-bold">Ekstrakurikuler</th>
              <th className="border border-black p-2 text-center font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {ekstraList.map((e, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center align-top">{i + 1}</td>
                <td className="border border-black p-2 align-top">{e.nama}</td>
                <td className="border border-black p-2 align-top leading-relaxed">{e.ket}</td>
              </tr>
            ))}
            {ekstraList.length === 0 && (
              <tr>
                <td colSpan={3} className="border border-black p-4 text-center italic text-gray-500">Belum ada ekstrakurikuler yang diisi</td>
              </tr>
            )}
            <tr>
              <td className="border border-black p-2 text-center align-top">dst.</td>
              <td className="border border-black p-2 align-top"></td>
              <td className="border border-black p-2 align-top"></td>
            </tr>
          </tbody>
        </table>

        {/* Table 4 & 5: Ketidakhadiran & Catatan Wali Kelas */}
        <div className="grid grid-cols-[1fr_2fr] gap-6 mb-6 text-[13px]">
          <table className="w-full border-collapse border border-black h-fit">
            <thead>
              <tr className="bg-[#d9d9d9]">
                <th colSpan={2} className="border border-black p-2 text-center font-bold">Ketidakhadiran</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">Sakit</td>
                <td className="border border-black p-2 text-center">{printStudent.sakit ? `${printStudent.sakit} hari` : '... hari'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Izin</td>
                <td className="border border-black p-2 text-center">{printStudent.izin ? `${printStudent.izin} hari` : '... hari'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Tanpa Keterangan</td>
                <td className="border border-black p-2 text-center">{printStudent.alpha ? `${printStudent.alpha} hari` : '... hari'}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black h-full">
            <thead>
              <tr className="bg-[#d9d9d9]">
                <th className="border border-black p-2 text-center font-bold">Catatan Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 align-top min-h-[100px] whitespace-pre-wrap">
                  {printStudent.catatanWali}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 6: Tanggapan Orang Tua */}
        <table className="w-full border-collapse border border-black mb-8 text-[13px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="border border-black p-2 text-center font-bold">Tanggapan Orang Tua/Wali Murid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 align-top h-20">
              </td>
            </tr>
          </tbody>
        </table>

        {/* Table 7: Keputusan (Kenaikan Kelas / Kelulusan) */}
        {settings.semester === 'Genap' && (
          <table className="w-full border-collapse border border-black mb-6 text-[13px]">
            <thead>
              <tr className="bg-[#d9d9d9]">
                <th className="border border-black p-2 text-left font-bold uppercase">Keputusan:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-3 leading-relaxed">
                  <p>Berdasarkan pencapaian hasil belajar peserta didik pada semester 1 dan 2, yang bersangkutan ditetapkan:</p>
                  <p className="font-bold mt-2 text-center text-sm tracking-wide">
                    {printStudent.keputusan ? printStudent.keputusan.toUpperCase() : (
                      settings.jenjang === 'PAUD' ? 'SELESAI FASE FONDASI (LULUS)' : 
                      isFinalKelas(settings.jenjang, settings.kelas) ? 'LULUS' : 
                      `NAIK KE KELAS ${getNextKelas(settings.jenjang, settings.kelas)} (${getKelasTerbilang(getNextKelas(settings.jenjang, settings.kelas))})`.toUpperCase()
                    )}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Signatures */}
        <div className="flex justify-between text-[13px] mt-8 px-2">
          <div className="text-center w-[28%]">
            <p className="mb-20">Orang Tua Murid</p>
            <p>(.................................)</p>
          </div>
          <div className="text-center w-[35%]">
            <p className="mb-20">Kepala Sekolah</p>
            <p>(.................................)</p>
            {settings.namaKepsek && <p className="font-bold mt-1">{settings.namaKepsek}</p>}
            {settings.nipKepsek && <p>NIP. {settings.nipKepsek}</p>}
          </div>
          <div className="text-center w-[35%]">
            <p>{settings.tempatTanggal || '........................., .........................'}</p>
            <p className="mb-16">Wali Kelas</p>
            <p>(.................................)</p>
            {settings.namaWali && <p className="font-bold mt-1">{settings.namaWali}</p>}
            {settings.nipWali && <p>NIP. {settings.nipWali}</p>}
          </div>
        </div>

      </div>
      
      {/* --- Print Confirmation Modal --- */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
          <div className="bg-[#111111] border border-cyan-500/20 rounded-3xl w-full max-w-[480px] overflow-hidden shadow-[0_0_50px_rgba(0,100,255,0.15)] flex flex-col">
            {/* Top Header - Blue Gradient */}
            <div className="bg-gradient-to-b from-[#2e52e8] to-[#1e3a8a] p-8 text-center text-white relative">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)] backdrop-blur-md">
                 <Printer size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-1">Siap untuk Mencetak?</h2>
              <p className="text-white/80 text-sm">Terima kasih telah menggunakan layanan Pemuryadi!</p>
            </div>

            {/* Content Section */}
            <div className="p-6 text-white space-y-6">
              {/* Donation Box - Glowing Border */}
              <div className="border border-emerald-400/80 rounded-xl p-5 bg-black/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.1),0_0_15px_rgba(16,185,129,0.1)] outline outline-1 outline-offset-[-1px] outline-emerald-300">
                <h3 className="text-pink-400 font-bold flex items-center gap-2 mb-2 text-lg">
                  <Heart fill="currentColor" size={20} className="drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" /> Dukung Pemuryadi
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  Website ini dikembangkan secara mandiri untuk membantu rekan-rekan guru di seluruh Indonesia. Dukungan Anda sangat berarti agar saya bisa terus merawat dan meningkatkan fitur-fitur di sini.
                </p>
                <a 
                  href="https://saweria.co/pemuryadi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#f59e0b] to-[#eab308] hover:from-[#d97706] hover:to-[#ca8a04] text-white font-bold py-3 rounded-lg text-center transition-all flex items-center justify-center gap-2 shadow-xl border border-yellow-300/30"
                >
                   <Coffee size={20} /> Dukung via Saweria
                </a>
              </div>

              {/* Social Links */}
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold tracking-[0.1em] mb-4 uppercase">Ikuti Media Sosial Kami</p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.facebook.com/p.e.muryadi" target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] p-3 rounded-xl hover:opacity-90 transition-opacity text-white shadow-lg">
                    <Facebook size={24} fill="currentColor" strokeWidth={0} />
                  </a>
                  <a href="https://www.instagram.com/p.e.muryadi" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#cc2366] p-3 rounded-xl hover:opacity-90 transition-opacity text-white shadow-lg">
                    <Instagram size={24} />
                  </a>
                  <a href="https://www.tiktok.com/@p.e.muryadi" target="_blank" rel="noopener noreferrer" className="bg-black p-3 rounded-xl hover:bg-gray-900 transition-colors text-white shadow-lg border border-gray-800 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-1.58A4.1 4.1 0 0 1 14.545.45c-.01 0-.02 0-.02-.01V15c0 2.22-1.95 4.02-4.35 4.02-2.41 0-4.36-1.8-4.36-4.02 0-2.22 1.95-4.02 4.36-4.02.8 0 1.55.21 2.18.57V7.32c-.68-.18-1.42-.29-2.18-.29-4.82 0-8.73 3.6-8.73 8.04s3.9 8.04 8.73 8.04c4.82 0 8.73-3.6 8.73-8.04V9.69c1.64.91 3.52 1.45 5.51 1.45v-4.45zm0 0"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-[1fr_2fr] gap-3 pt-2">
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="bg-transparent hover:bg-white/5 text-gray-300 font-medium py-3 rounded-xl border border-gray-600/50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    setShowPrintModal(false);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="bg-[#2e52e8] hover:bg-[#1e3a8a] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                >
                  Lanjutkan Mencetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
