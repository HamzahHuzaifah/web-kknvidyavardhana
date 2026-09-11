import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
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
  UserCheck
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'berita', // 'berita' | 'publikasi' | 'modul'
    content: '',
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
      setFormData({ title: '', category: formData.category, content: '', image: null, document: null });
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

  const categoryConfigs = {
    berita: {
      titleLabel: 'Judul Berita Kegiatan *',
      titlePlaceholder: 'Contoh: Pelatihan Digital Marketing untuk Pengrajin Bambu Desa Ciasihan...',
      contentPlaceholder: 'Tuliskan rangkaian acara kegiatan, sambutan aparat desa, dan hasil pelaksanaan...',
      docRequired: false,
      badge: '📰 Berita KKN'
    },
    publikasi: {
      titleLabel: 'Judul Laporan / Riset Publikasi *',
      titlePlaceholder: 'Contoh: Laporan Pengabdian: Analisis Kelayakan Program Bank Sampah Desa...',
      contentPlaceholder: 'Tuliskan abstrak, metodologi pengabdian, temuan lapangan, dan rekomendasi...',
      docRequired: false,
      badge: '📑 Publikasi Ilmiah'
    },
    modul: {
      titleLabel: 'Judul Modul & Buku Saku *',
      titlePlaceholder: 'Contoh: Buku Saku Panduan Pengolahan Kompos & Pupuk Organik Cair...',
      contentPlaceholder: 'Tuliskan deskripsi modul, sasaran pembaca (warga/pemuda), dan cara penggunaan modul...',
      docRequired: true,
      badge: '📚 Modul Pelatihan'
    }
  };

  const currentConfig = categoryConfigs[formData.category] || categoryConfigs.berita;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 space-y-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-primary-dark pb-4">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Ruang Publikasi Anggota
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-primary-dark uppercase flex items-center gap-3">
              <Upload className="text-secondary-dark shrink-0" size={36} /> 
              Upload Berita, Publikasi & Modul
            </h1>
          </div>

          <Link
            to="/berita"
            className="text-xs font-bold text-primary-dark hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <ArrowLeft size={14} /> Lihat Berita & Modul
          </Link>
        </div>

        {/* User Session Banner or Guest Notice */}
        {token ? (
          <div className="p-4 bg-white border-2 border-primary-dark shadow-hard flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="text-accent-dark shrink-0" size={20} />
              <div>
                <span className="text-xs text-gray-500 font-medium">Masuk Sebagai:</span>
                <p className="text-xs font-black text-primary-dark uppercase">
                  {username} <span className="text-gray-400 font-normal">({role?.toUpperCase()})</span>
                </p>
              </div>
            </div>
            <span className="bg-green-100 text-green-900 border border-green-800 text-[10px] font-black uppercase px-2 py-0.5">
              Siap Mempublikasikan
            </span>
          </div>
        ) : (
          <div className="p-5 bg-amber-50 border-2 border-primary-dark shadow-hard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase flex items-center gap-1.5">
                <ShieldAlert size={18} className="text-amber-700 shrink-0" /> Anda Belum Masuk Akun
              </h4>
              <p className="text-xs text-amber-900 font-medium">
                Untuk dapat mengirim publikasi atau modul baru, Anda perlu masuk ke akun terlebih dahulu.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex-1 sm:flex-none text-center bg-gradient-blue text-white text-xs font-black uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1"
              >
                <LogIn size={13} /> Masuk
              </Link>
              <Link
                to="/register"
                className="flex-1 sm:flex-none text-center bg-gradient-yellow text-primary-dark text-xs font-black uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1"
              >
                <UserPlus size={13} /> Daftar
              </Link>
            </div>
          </div>
        )}

        {/* Status Message */}
        {status.message && (
          <div className={`p-4 border-2 shadow-hard flex items-start gap-3 ${
            status.type === 'success' 
              ? 'bg-green-50 border-accent-dark text-accent-dark' 
              : 'bg-red-50 border-red-600 text-red-600'
          }`}>
            {status.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
            <span className="font-bold text-xs sm:text-sm leading-relaxed">{status.message}</span>
          </div>
        )}

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary-dark shadow-hard p-6 md:p-8 space-y-6">
          
          {/* CATEGORY TABS SELECTOR */}
          <div>
            <label className="block text-primary-dark font-black mb-2 uppercase text-xs tracking-wider flex items-center gap-1.5">
              <Layers size={16} className="text-secondary-dark" /> Pilih Jenis Konten yang Ingin Dibuat *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'berita', 
                  label: '📰 Buat Berita', 
                  desc: 'Dokumentasi & warta kegiatan acara KKN' 
                },
                { 
                  id: 'publikasi', 
                  label: '📑 Unggah Publikasi', 
                  desc: 'Riset, artikel ilmiah & laporan pengabdian' 
                },
                { 
                  id: 'modul', 
                  label: '📚 Unggah Modul', 
                  desc: 'Buku saku, modul & panduan warga (PDF)' 
                }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3.5 border-2 border-primary-dark text-left transition-all ${
                    formData.category === cat.id
                      ? 'bg-gradient-yellow text-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-black text-xs uppercase">{cat.label}</div>
                  <div className="text-[10px] text-gray-600 font-medium mt-1 leading-snug">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-primary-dark font-black mb-1.5 uppercase text-xs tracking-wider flex items-center gap-1.5">
              <FileText size={16} /> {currentConfig.titleLabel}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-primary-dark px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-secondary-dark transition-colors bg-gray-50"
              placeholder={currentConfig.titlePlaceholder}
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-primary-dark font-black mb-1.5 uppercase text-xs tracking-wider flex items-center gap-1.5">
              <ImageIcon size={16} /> Foto Sampul / Poster Dokumentasi (Opsional)
            </label>
            <div className="border-2 border-dashed border-primary-dark bg-gray-50 p-5 flex flex-col items-center justify-center relative hover:bg-gray-100 transition-colors cursor-pointer group">
              <input
                type="file"
                id="image-upload"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <div className="w-full relative z-0 text-center">
                  <img src={preview} alt="Preview" className="max-h-56 mx-auto object-contain border-2 border-primary-dark" />
                  <div className="mt-2 text-xs font-bold text-secondary-dark">Klik untuk mengganti gambar</div>
                </div>
              ) : (
                <div className="text-center relative z-0">
                  <div className="bg-primary-dark text-white p-2.5 inline-flex rounded-full mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <p className="text-primary-dark font-bold text-xs">Pilih Foto Sampul / Poster</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">JPG, PNG, WebP</p>
                </div>
              )}
            </div>
          </div>

          {/* Document / PDF Attachment (Highlighted for Modul and Publikasi) */}
          <div className={`p-4 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            formData.category === 'modul' || formData.category === 'publikasi' ? 'bg-yellow-50' : 'bg-gray-50'
          }`}>
            <label className="block text-primary-dark font-black mb-1 uppercase text-xs tracking-wider flex items-center gap-1.5">
              <Paperclip size={16} className="text-accent-dark" /> 
              Lampiran Berkas Dokumen (PDF / Word / Zip) {formData.category === 'modul' && <span className="text-red-600 font-bold">*Sangat Dianjurkan untuk Modul</span>}
            </label>
            <p className="text-[11px] text-gray-600 font-medium mb-3">
              {formData.category === 'modul'
                ? 'Lampirkan file PDF buku saku / modul pelatihan agar warga dapat mengunduhnya langsung.'
                : 'Lampirkan berkas naskah lengkap atau laporan pengabdian jika ada.'}
            </p>
            <input
              type="file"
              id="document-upload"
              name="document"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              onChange={handleDocumentChange}
              className="w-full border-2 border-primary-dark p-2 text-xs bg-white"
            />
            {documentName && (
              <p className="mt-2 text-xs font-bold text-accent-dark flex items-center gap-1">
                ✓ Berkas siap diunggah: {documentName}
              </p>
            )}
          </div>

          {/* Content Input (ReactQuill Rich Text) */}
          <div>
            <label htmlFor="content" className="block text-primary-dark font-black mb-1.5 uppercase text-xs tracking-wider flex items-center gap-1.5">
              <FileText size={16} /> Isi Artikel & Rincian Pembahasan *
            </label>
            <div className="border-2 border-primary-dark">
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleQuillChange}
                modules={modules}
                className="bg-white min-h-[220px]"
                placeholder={currentConfig.contentPlaceholder}
              />
            </div>
          </div>

          {/* Notice about Roles */}
          <div className="p-3 bg-gray-100 border-2 border-primary-dark text-[11px] text-gray-700 font-medium flex items-start gap-2">
            <ShieldAlert size={18} className="shrink-0 text-primary-dark mt-0.5" />
            <span>
              <strong>Aturan Pengelolaan:</strong> Seluruh anggota (User) dapat mengunggah postingan baru. Pengubahan teks (edit) dan penghapusan konten hanya dapat dilakukan oleh <strong>Admin</strong> melalui panel Dashboard KKN.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-yellow text-primary-dark font-black text-sm uppercase tracking-wider py-4 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-primary-dark border-t-transparent rounded-full"></div>
                Memproses Unggahan...
              </>
            ) : (
              <>
                <Upload size={18} /> Publikasikan {formData.category.toUpperCase()} Sekarang
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
