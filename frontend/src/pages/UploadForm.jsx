import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  UploadCloud,
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Paperclip, 
  Layers, 
  ShieldAlert, 
  ArrowLeft, 
  BookOpen, 
  LogIn, 
  UserPlus, 
  UserCheck, 
  FolderOpen, 
  GraduationCap, 
  Tag, 
  Hash, 
  Sparkles 
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import CustomDatePicker from '../components/CustomDatePicker';
import { convertHeicToJpgIfNeeded } from '../utils/heicHelper';

export default function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'berita', // 'berita' | 'publikasi' | 'modul'
    content: '',
    abstract: '',
    keywords: '',
    authors_meta: '',
    doi_or_reg: '',
    references_list: '',
    volume: '',
    issue: '',
    published_date: '',
    image: null,
    document: null
  });
  const [preview, setPreview] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get('/api/users/me/permissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPermissions(response.data);
        
        if (response.data.role !== 'admin') {
          if (!response.data.can_upload_berita && response.data.can_upload_publikasi) {
            setFormData(prev => ({ ...prev, category: 'publikasi' }));
          } else if (!response.data.can_upload_berita && !response.data.can_upload_publikasi && response.data.can_upload_modul) {
            setFormData(prev => ({ ...prev, category: 'modul' }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      } finally {
        setLoadingPermissions(false);
      }
    };
    if (token) fetchPermissions();
  }, [token]);


  const handleFillDummyData = () => {
    setFormData({
      title: 'Strategi Implementasi E-Government dalam Meningkatkan Pelayanan Publik di Era Digital',
      category: 'publikasi',
      content: '<p>Penelitian ini mengeksplorasi efektivitas penerapan sistem E-Government di tingkat pemerintahan daerah. Melalui pendekatan kualitatif dan studi kasus pada 3 kota besar, ditemukan bahwa kendala utama bukan pada infrastruktur teknologi, melainkan pada literasi digital aparat dan kultur birokrasi. Artikel ini membedah faktor-faktor tersebut secara mendalam.</p><h2>Metode Penelitian</h2><p>Penelitian menggunakan pendekatan kualitatif dengan teknik pengumpulan data observasi partisipatif dan wawancara mendalam.</p><h2>Hasil dan Pembahasan</h2><p>Tingkat adopsi teknologi sangat bervariasi dan bergantung pada kepemimpinan di masing-masing instansi. Pelayanan publik meningkat drastis setelah SOP digital disederhanakan sebesar 40%.</p>',
      abstract: 'Penelitian ini bertujuan menganalisis implementasi e-government pada pelayanan publik. Hasil menunjukkan adanya korelasi positif antara literasi digital aparatur dengan kepuasan masyarakat. Rekomendasi mencakup program pelatihan berkelanjutan dan restrukturisasi SOP pelayanan digital.',
      keywords: 'E-Government, Pelayanan Publik, Literasi Digital, Reformasi Birokrasi',
      authors_meta: 'Budi Santoso, Siti Aminah, Reza Pahlevi',
      doi_or_reg: '10.56070/egov.2026.012',
      volume: '12',
      issue: '2',
      published_date: '2026-05-14',
      references_list: 'Santoso, B. (2025). Administrasi Publik Digital. Jakarta: Penerbit Universitas.\nAminah, S. (2024). Analisis Kebijakan E-Gov. Jurnal Ilmu Pemerintahan, 8(2), 45-60.\nPahlevi, R. (2023). Dinamika Organisasi Birokrasi di Indonesia. Bandung: Pustaka Abadi.',
      image: null,
      document: null
    });
    setStatus({ type: 'success', message: 'Form berhasil diisi dengan data dummy publikasi jurnal ilmiah!' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    file = await convertHeicToJpgIfNeeded(file, setIsConvertingImage);
    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
      setDocumentName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!token) {
      setStatus({ 
        type: 'error', 
        message: 'Akses Ditolak: Anda harus login ke akun Anda terlebih dahulu sebelum dapat mempublikasikan konten.' 
      });
      return;
    }

    if (!formData.title.trim()) {
      setStatus({ type: 'error', message: 'Judul konten wajib diisi.' });
      return;
    }

    if (!formData.content.trim()) {
      setStatus({ type: 'error', message: 'Isi konten atau pembahasan wajib diisi.' });
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('abstract', formData.abstract);
    data.append('keywords', formData.keywords);
    if (formData.authors_meta) data.append('authors_meta', formData.authors_meta);
    if (formData.doi_or_reg) data.append('doi_or_reg', formData.doi_or_reg);
    if (formData.references_list) data.append('references_list', formData.references_list);
    if (formData.volume) data.append('volume', formData.volume);
    if (formData.issue) data.append('issue', formData.issue);
    if (formData.published_date) data.append('published_date', formData.published_date);

    if (formData.image) {
      data.append('image', formData.image);
    }
    if (formData.document) {
      data.append('document', formData.document);
    }

    try {
      const response = await axios.post('/api/articles', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStatus({ 
        type: 'success', 
        message: response.data.message || `Konten ${formData.category.toUpperCase()} berhasil dipublikasikan!` 
      });
      setFormData({ 
        title: '', 
        category: formData.category, 
        content: '', 
        abstract: '',
        keywords: '',
        authors_meta: '',
        doi_or_reg: '',
        volume: '',
        issue: '',
        published_date: '',
        references_list: '',
        image: null, 
        document: null 
      });
      setPreview(null);
      setDocumentName('');
      if (document.getElementById('image-upload')) {
        document.getElementById('image-upload').value = '';
      }
      if (document.getElementById('document-upload')) {
        document.getElementById('document-upload').value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Terjadi kesalahan saat mengunggah konten.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const isAcademic = formData.category === 'publikasi';
  const isModule = formData.category === 'modul';

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-primary-dark pb-4">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Panel Publikasi Resmi
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-3">
              <Upload className="text-secondary-dark shrink-0" size={32} /> 
              Publikasikan Karya & Berita
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleFillDummyData}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-white bg-gradient-blue border-2 border-primary-dark px-3.5 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Sparkles size={14} /> Isi Dummy Data (Test)
            </button>
            <Link
              to="/berita"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark border-2 border-primary-dark bg-white px-3.5 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft size={14} /> Publikasi
            </Link>
          </div>
        </div>

        {/* Info Box Akun Login */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-blue text-white border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <UserCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Mengunggah Sebagai:</span>
              <span className="text-sm font-black text-primary-dark uppercase">
                {username || 'Pengguna'} ({role === 'admin' ? 'ADMINISTRATOR' : 'ANGGOTA KKN'})
              </span>
            </div>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-900 border border-yellow-800 font-bold px-2.5 py-1">
            Status: Terverifikasi
          </span>
        </div>

        {/* Feedback Alert */}
        {status.message && (
          <div
            className={`p-4 border-2 text-xs font-bold shadow-hard flex items-start gap-3 ${
              status.type === 'success'
                ? 'bg-green-50 border-accent-dark text-accent-dark'
                : 'bg-red-50 border-red-600 text-red-600'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span>{status.message}</span>
              {status.type === 'success' && (
                <div className="mt-2">
                  <Link
                    to="/berita"
                    className="underline font-black uppercase tracking-wider text-[11px] hover:text-black"
                  >
                    Buka Halaman Publikasi & Baca Sekarang →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN FORM */}
        {loadingPermissions ? (
          <div className="bg-white border-2 border-primary-dark shadow-hard p-10 text-center font-bold text-gray-500">
            Memeriksa hak akses Anda...
          </div>
        ) : permissions && permissions.role !== 'admin' && !permissions.can_upload_berita && !permissions.can_upload_publikasi && !permissions.can_upload_modul ? (
          <div className="bg-red-50 border-2 border-red-600 shadow-hard p-10 text-center space-y-4">
            <ShieldAlert size={48} className="mx-auto text-red-600" />
            <h2 className="text-xl font-black text-red-700 uppercase">Akses Upload Belum Dibuka</h2>
            <p className="text-sm font-medium text-red-800 max-w-md mx-auto">
              Akun Anda saat ini belum memiliki izin untuk mengunggah jenis konten apa pun. 
              Silakan hubungi Administrator KKN untuk membuka akses upload Anda.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary-dark shadow-hard p-6 md:p-8 space-y-6">
          
          {/* CATEGORY SELECTOR PILLS */}
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={16} /> Pilih Format Konten *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'berita', 
                  label: '📰 Berita & Kabar', 
                  desc: 'Dokumentasi kegiatan harian, kabar desa, dan liputan program kerja.',
                  allowed: permissions?.role === 'admin' || permissions?.can_upload_berita
                },
                { 
                  id: 'publikasi', 
                  label: '📑 Jurnal & Publikasi Ilmiah', 
                  desc: 'Laporan pengabdian ilmiah, paper riset KKN, artikel berstandar OJS & SINTA.',
                  allowed: permissions?.role === 'admin' || permissions?.can_upload_publikasi
                },
                { 
                  id: 'modul', 
                  label: '📚 Modul & Buku Saku', 
                  desc: 'Panduan teknis, modul edukasi masyarakat, dan buku saku pelatihan.',
                  allowed: permissions?.role === 'admin' || permissions?.can_upload_modul
                }
              ].filter(c => c.allowed).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setFormData({ ...formData, category: c.id })}
                  className={`p-3 text-left border-2 border-primary-dark transition-all flex flex-col justify-between ${
                    formData.category === c.id
                      ? 'bg-gradient-yellow text-primary-dark shadow-hard translate-y-0.5'
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span className="font-black text-xs uppercase mb-1">{c.label}</span>
                  <span className="text-[10px] text-gray-600 font-medium leading-tight">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ACADEMIC / OJS NOTICE BANNER */}
          {isAcademic && (
            <div className="p-3.5 bg-blue-50 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2.5">
              <GraduationCap size={20} className="text-secondary-dark shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-black uppercase text-primary-dark block">Standar Publikasi Ilmiah (OJS & Google Scholar)</span>
                <p className="text-gray-600 font-medium text-[11px]">
                  Format ini menyertakan metadata akademik resmi (Abstrak, Kata Kunci, Penulis & Afiliasi, serta No. Registrasi) agar otomatis terindeks dan mendukung fitur sitasi (APA/IEEE).
                </p>
              </div>
            </div>
          )}

          {/* JUDUL KONTEN */}
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase tracking-wider mb-2">
              {isAcademic ? 'Judul Artikel / Naskah Publikasi Ilmiah *' : isModule ? 'Judul Modul & Buku Saku *' : 'Judul Berita Kegiatan *'}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder={
                isAcademic 
                  ? 'Contoh: Pemberdayaan UMKM Pengrajin Bambu Melalui Digital Marketing di Desa Ciasihan...' 
                  : isModule 
                  ? 'Contoh: Buku Saku Panduan Pembuatan Pupuk Kompos Organik Skala Rumah Tangga...' 
                  : 'Contoh: Mahasiswa KKN Vidya Vardhana Gelar Sosialisasi Pola Hidup Bersih...'
              }
              className="w-full border-2 border-primary-dark p-3 text-xs sm:text-sm font-bold bg-gray-50 focus:bg-white outline-none transition-colors"
            />
          </div>

          {/* ACADEMIC FIELDS: AUTHORS & AFFILIATION, DOI/REG */}
          {(isAcademic || isModule) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-yellow-50/60 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <GraduationCap size={14} /> Penulis & Afiliasi Kampus
                </label>
                <input
                  type="text"
                  name="authors_meta"
                  value={formData.authors_meta}
                  onChange={handleInputChange}
                  placeholder="Contoh: Hamzah Huzaifah (UPN Veteran Jakarta), Tim KKN"
                  className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none font-medium"
                />
                <span className="text-[9px] text-gray-500 mt-0.5 block">Format: Nama Penulis (Universitas/Jurusan)</span>
              </div>

              <div>
                <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash size={14} /> No. Registrasi LPPM / DOI / ISBN
                </label>
                <input
                  type="text"
                  name="doi_or_reg"
                  value={formData.doi_or_reg}
                  onChange={handleInputChange}
                  placeholder="Contoh: LPPM-KKN/2026/08/VV-01 atau DOI: 10.xxxx/..."
                  className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none font-medium"
                />
                <span className="text-[9px] text-gray-500 mt-0.5 block">Identitas registrasi ilmiah atau nomor modul</span>
              </div>

              {/* KEYWORDS */}
              <div className="sm:col-span-2">
                <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag size={14} /> Kata Kunci (Keywords)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="Contoh: KKN; UMKM; Digital Marketing; Ciasihan; Pemberdayaan"
                  className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none font-medium"
                />
                <span className="text-[9px] text-gray-500 mt-0.5 block">Pisahkan kata kunci dengan tanda titik koma (;) atau koma</span>
              </div>

              {/* ISSUE, VOLUME, PUBLISHED DATE */}
              {isAcademic && (
                <>
                  <div>
                    <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <BookOpen size={14} /> Volume & Issue
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="volume"
                        value={formData.volume}
                        onChange={handleInputChange}
                        placeholder="Vol"
                        className="w-1/2 border-2 border-primary-dark p-2 text-xs bg-white outline-none font-medium"
                      />
                      <input
                        type="number"
                        name="issue"
                        value={formData.issue}
                        onChange={handleInputChange}
                        placeholder="No"
                        className="w-1/2 border-2 border-primary-dark p-2 text-xs bg-white outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag size={14} /> Tanggal Publikasi Asli
                    </label>
                    <CustomDatePicker
                      value={formData.published_date}
                      onChange={(val) => handleInputChange({ target: { name: 'published_date', value: val } })}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* ABSTRACT */}
              <div className="sm:col-span-2">
                <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1">
                  {isAcademic ? 'Abstrak (Abstract) Publikasi *' : 'Sinopsis / Ringkasan Modul *'}
                </label>
                <textarea
                  name="abstract"
                  rows={3}
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Tuliskan intisari latar belakang, metode pengabdian, hasil program, dan kesimpulan (150-250 kata)..."
                  className="w-full border-2 border-primary-dark p-2.5 text-xs bg-white outline-none font-medium"
                />
              </div>

              {/* REFERENCES (Daftar Pustaka) */}
              {isAcademic && (
                <div className="sm:col-span-2">
                  <label className="block text-primary-dark font-black text-[11px] uppercase tracking-wider mb-1">
                    Daftar Pustaka (References)
                  </label>
                  <textarea
                    name="references_list"
                    rows={4}
                    value={formData.references_list}
                    onChange={handleInputChange}
                    placeholder="Tuliskan daftar pustaka yang digunakan, pisahkan dengan baris baru (Enter)..."
                    className="w-full border-2 border-primary-dark p-2.5 text-xs bg-white outline-none font-medium leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* ISI KONTEN LENGKAP (QUILL) */}
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{isAcademic ? 'Isi Naskah / Pembahasan Ilmiah Lengkap *' : 'Uraian Konten & Pembahasan *'}</span>
              <span className="text-[10px] text-gray-500 font-bold">Mendukung format Rich Text Editor</span>
            </label>
            <div className="border-2 border-primary-dark bg-white">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleQuillChange}
                modules={modules}
                placeholder="Tuliskan naskah lengkap, dokumentasi terperinci, atau panduan modul di sini..."
                className="min-h-[220px]"
              />
            </div>
          </div>

          {/* FILE UPLOAD SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* COVER IMAGE */}
            <div className="p-4 border-2 border-primary-dark bg-gray-50 space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-primary-dark" />
                <label className="font-black text-xs uppercase text-primary-dark">
                  Foto Sampul (Cover Image)
                </label>
              </div>

              {preview ? (
                <div className="relative border-2 border-primary-dark h-36 bg-black overflow-hidden flex items-center justify-center">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFormData({ ...formData, image: null });
                      if (document.getElementById('image-upload')) {
                        document.getElementById('image-upload').value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 border border-primary-dark"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-primary-dark p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50/50 transition-colors text-center">
                  <UploadCloud size={28} className="text-gray-400 mb-1" />
                  <span className="text-xs font-black text-primary-dark uppercase">Pilih Gambar Sampul</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">JPG, PNG, WebP (Maks 10MB)</span>
                  {isConvertingImage && (
                    <p className="text-[10px] font-bold text-secondary-dark uppercase animate-pulse">
                      ⏳ Mengonversi HEIC ke JPG...
                    </p>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleFileChange}
                    disabled={isConvertingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* DOCUMENT / PDF FILE */}
            <div className="p-4 border-2 border-primary-dark bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary-dark" />
                  <label className="font-black text-xs uppercase text-primary-dark">
                    Naskah Lengkap (PDF / Modul)
                  </label>
                </div>
                {isAcademic && (
                  <span className="text-[10px] font-black uppercase bg-gradient-yellow px-1.5 py-0.5 border border-primary-dark">
                    Sangat Dianjurkan
                  </span>
                )}
              </div>

              {documentName ? (
                <div className="p-4 bg-white border-2 border-primary-dark flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip size={16} className="text-secondary-dark shrink-0" />
                    <span className="text-xs font-bold text-primary-dark truncate">{documentName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentName('');
                      setFormData({ ...formData, document: null });
                      if (document.getElementById('document-upload')) {
                        document.getElementById('document-upload').value = '';
                      }
                    }}
                    className="text-red-600 font-bold text-xs hover:underline shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-primary-dark p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50/50 transition-colors text-center">
                  <FileText size={28} className="text-gray-400 mb-1" />
                  <span className="text-xs font-black text-primary-dark uppercase">
                    Pilih File PDF Naskah / Modul
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">PDF, DOCX, ZIP (Untuk Dibaca di Web)</span>
                  <input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-green text-white font-black py-3.5 border-2 border-primary-dark shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isSubmitting ? (
              'Sedang Mempublikasikan...'
            ) : (
              <>
                <UploadCloud size={18} /> Publikasikan {formData.category.toUpperCase()} Sekarang
              </>
            )}
          </button>
        </form>
        )}

      </div>
    </div>
  );
}
