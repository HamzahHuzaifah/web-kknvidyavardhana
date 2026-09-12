import { useState } from 'react';
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

export default function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'berita', // 'berita' | 'publikasi' | 'modul'
    content: '',
    abstract: '',
    keywords: '',
    authors_meta: '',
    doi_or_reg: '',
    image: null,
    document: null
  });
  const [preview, setPreview] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuillChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, document: file });
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
    data.append('authors_meta', formData.authors_meta);
    data.append('doi_or_reg', formData.doi_or_reg);

    if (formData.image) {
      data.append('image', formData.image);
    }
    if (formData.document) {
      data.append('document', formData.document);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/articles', data, {
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

          <Link
            to="/berita"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark border-2 border-primary-dark bg-white px-3.5 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start sm:self-auto"
          >
            <ArrowLeft size={14} /> Lihat Semua Publikasi
          </Link>
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
                  desc: 'Dokumentasi kegiatan harian, kabar desa, dan liputan program kerja.' 
                },
                { 
                  id: 'publikasi', 
                  label: '📑 Jurnal & Publikasi Ilmiah', 
                  desc: 'Laporan pengabdian ilmiah, paper riset KKN, artikel berstandar OJS & SINTA.' 
                },
                { 
                  id: 'modul', 
                  label: '📚 Modul & Buku Saku', 
                  desc: 'Panduan teknis, modul edukasi masyarakat, dan buku saku pelatihan.' 
                }
              ].map((c) => (
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
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
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

      </div>
    </div>
  );
}
