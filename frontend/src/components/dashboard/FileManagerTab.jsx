import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FolderOpen, 
  Crown, 
  Copy, 
  Upload, 
  Folder, 
  Image as ImageIcon, 
  Film, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  Star, 
  Play, 
  Check, 
  Eye, 
  ExternalLink, 
  Trash2, 
  Download 
} from 'lucide-react';
import CustomSelect from '../CustomSelect';
import PreviewMediaModal from './modals/PreviewMediaModal';
import { processFilesForHeic, convertHeicToJpgIfNeeded } from '../../utils/heicHelper';

export default function FileManagerTab({
  isAdmin,
  setConfirmModal,
  closeConfirmModal,
  showAlert
}) {
  const [fileList, setFileList] = useState([]);
  const [fileCounts, setFileCounts] = useState({ total: 0, images: 0, videos: 0, documents: 0, others: 0 });
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [fileSourceFilter, setFileSourceFilter] = useState('all');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [convertingHeic, setConvertingHeic] = useState(false);
  const [fileActionMsg, setFileActionMsg] = useState({ type: '', message: '' });
  const [activeLogoUrl, setActiveLogoUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  
  const [previewMediaModal, setPreviewMediaModal] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const fetchMediaFiles = async () => {
    if (!isAdmin) return;
    setLoadingFiles(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/files?type=${fileTypeFilter}&source=${fileSourceFilter}`;
      if (fileSearchTerm.trim()) {
        url += `&q=${encodeURIComponent(fileSearchTerm.trim())}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFileList(Array.isArray(response.data?.files) ? response.data.files : []);
      setFileCounts(response.data?.counts && typeof response.data.counts === 'object' ? response.data.counts : { total: 0, images: 0, videos: 0, documents: 0, others: 0 });
    } catch (err) {
      console.error('Error fetching media files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchMediaFiles();
  }, [fileTypeFilter, fileSourceFilter, isAdmin]);

  const handleUploadMediaFiles = async (e) => {
    let files = e.target.files;
    if (!files || files.length === 0) return;

    setFileUploading(true);
    setFileActionMsg({ type: '', message: '' });

    // Convert any HEIC/HEIF files to JPG before uploading
    files = await processFilesForHeic(files, setConvertingHeic);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('source', 'direct_upload');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFileActionMsg({ type: 'success', message: res.data.message });
      fetchMediaFiles();
      e.target.value = '';
    } catch (err) {
      setFileActionMsg({
        type: 'error',
        message: err.response?.data?.error || 'Gagal mengunggah berkas ke Manajer Berkas.'
      });
    } finally {
      setFileUploading(false);
    }
  };

  const handleSetAsLogo = (fileUrl) => {
    setConfirmModal({
      isOpen: true,
      title: 'Pasang Sebagai Logo Website',
      message: 'Apakah Anda yakin ingin memasang gambar ini sebagai Logo Resmi Website KKN Vidya Vardhana? Logo akan langsung diperbarui di bilah navigasi (Navbar).',
      confirmText: 'Ya, Pasang Logo',
      cancelText: 'Batal',
      showCancel: true,
      type: 'warning',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put(
            '/api/settings/logo',
            { logo_url: fileUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setActiveLogoUrl(fileUrl);
          setFileActionMsg({ type: 'success', message: res.data.message });
          window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logo_url: fileUrl } }));
        } catch (err) {
          setFileActionMsg({
            type: 'error',
            message: err.response?.data?.error || 'Gagal memasang logo website.'
          });
        }
      },
      isLoading: false
    });
  };

  const handleDeleteMediaFile = (file) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Berkas Permanen',
      message: `Apakah Anda yakin ingin menghapus berkas "${file.original_name}" secara permanen? Berkas fisik akan dihapus dari server dan tidak dapat dipulihkan.`,
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`/api/files/${file.id}/delete`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFileActionMsg({ type: 'success', message: res.data.message });
          if (activeLogoUrl === file.file_url) {
            setActiveLogoUrl('');
            window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logo_url: '' } }));
          }
          fetchMediaFiles();
        } catch (err) {
          setFileActionMsg({
            type: 'error',
            message: err.response?.data?.error || 'Gagal menghapus berkas.'
          });
        }
      },
      isLoading: false
    });
  };

  const handleCopyFileUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2500);
    }).catch(() => {
      showAlert('Gagal menyalin link ke clipboard.');
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Logo Banner */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-primary-dark">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-[11px] font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Media Repository & Assets
            </span>
            <h2 className="text-2xl font-black text-primary-dark uppercase flex items-center gap-2">
              <FolderOpen size={26} className="text-secondary-dark" /> Manajer Berkas & Media Terpadu
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-1 max-w-2xl">
              Semua foto, video, dan dokumen website KKN ditampung di sini. Berkas yang diunggah dari berita, modul, ataupun langsung oleh admin akan otomatis terdata dan siap digunakan kembali untuk logo website, materi berita, atau lampiran publikasi.
            </p>
          </div>

          {/* LOGO STATUS WIDGET */}
          <div className="bg-yellow-50 border-2 border-primary-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 bg-white border-2 border-primary-dark flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden">
              {activeLogoUrl ? (
                <img
                  src={`${activeLogoUrl}`}
                  alt="Logo Website Aktif"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-black text-2xl text-primary-dark">K</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Crown size={14} className="text-yellow-600" />
                <span className="text-[11px] font-black uppercase text-primary-dark">Logo Website Aktif</span>
              </div>
              <p className="text-[10px] text-gray-600 font-medium max-w-[200px] truncate">
                {activeLogoUrl ? activeLogoUrl : 'Menggunakan logo default (Huruf K)'}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                {activeLogoUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopyFileUrl(activeLogoUrl)}
                    className="text-[10px] font-black uppercase bg-white px-2 py-0.5 border border-primary-dark hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Copy size={10} /> Salin URL
                  </button>
                )}
                <label className="text-[10px] font-black uppercase bg-primary-dark text-white px-2 py-0.5 border border-primary-dark hover:bg-black cursor-pointer inline-flex items-center gap-1">
                  <Upload size={10} /> Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        const fd = new FormData();
                        fd.append('logo', f);
                        try {
                          const token = localStorage.getItem('token');
                          const res = await axios.post('/api/settings/logo/edit', fd, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          setActiveLogoUrl(res.data.logo_url);
                          setFileActionMsg({ type: 'success', message: res.data.message });
                          window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logo_url: res.data.logo_url } }));
                          fetchMediaFiles();
                        } catch (err) {
                          setFileActionMsg({ type: 'error', message: 'Gagal mengunggah logo.' });
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-dark text-white flex items-center justify-center shrink-0">
              <Folder size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Berkas</span>
              <span className="text-xl font-black text-primary-dark">{fileCounts.total}</span>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-blue text-white flex items-center justify-center shrink-0">
              <ImageIcon size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Foto & Gambar</span>
              <span className="text-xl font-black text-primary-dark">{fileCounts.images}</span>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center shrink-0">
              <Film size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-800 uppercase block">Video Dokumentasi</span>
              <span className="text-xl font-black text-primary-dark">{fileCounts.videos}</span>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-yellow text-primary-dark flex items-center justify-center shrink-0 border border-primary-dark">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-yellow-900 uppercase block">Dokumen & Modul</span>
              <span className="text-xl font-black text-primary-dark">{fileCounts.documents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION MESSAGE */}
      {fileActionMsg.message && (
        <div
          className={`p-4 border-2 text-xs font-bold shadow-hard flex items-center justify-between gap-2 ${
            fileActionMsg.type === 'success'
              ? 'bg-green-50 border-accent-dark text-accent-dark'
              : 'bg-red-50 border-red-600 text-red-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {fileActionMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{fileActionMsg.message}</span>
          </div>
          <button
            onClick={() => setFileActionMsg({ type: '', message: '' })}
            className="text-xs font-black uppercase hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* DRAG AND DROP / UPLOAD BOX */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
          <h3 className="text-base font-black text-primary-dark uppercase flex items-center gap-2">
            <UploadCloud size={20} /> Unggah Berkas Baru ke Repositori
          </h3>
          <span className="text-xs text-gray-500 font-bold">Mendukung Multi-Upload</span>
        </div>

        <div className="relative border-2 border-dashed border-primary-dark bg-gray-50 hover:bg-yellow-50/50 p-8 text-center transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif,video/*,.mov,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            onChange={handleUploadMediaFiles}
            disabled={fileUploading || convertingHeic}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            {(fileUploading || convertingHeic) ? (
            <>
              <RefreshCw size={36} className="text-secondary-dark animate-spin" />
              <p className="font-black text-sm text-primary-dark uppercase">
                {convertingHeic ? 'Mengonversi HEIC ke JPG...' : 'Sedang Mengunggah Berkas...'}
              </p>
              <p className="text-xs text-gray-500">Mohon tunggu beberapa saat hingga seluruh file tersimpan.</p>
            </>
            ) : (
              <>
                <div className="w-14 h-14 bg-gradient-yellow text-primary-dark border-2 border-primary-dark flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <UploadCloud size={28} />
                </div>
                <p className="font-black text-sm text-primary-dark uppercase pt-2">
                  Klik atau Tarik File ke Sini untuk Mengunggah
                </p>
                <p className="text-xs text-gray-600 font-medium max-w-md">
                  Mendukung foto (JPG, PNG, WebP, HEIC), video (MP4, MOV, WebM), dan dokumen (PDF, Word, Excel, Zip).
                </p>
                <span className="bg-primary-dark text-white font-bold text-[11px] px-3 py-1.5 uppercase border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2">
                  Pilih Berkas Dari Komputer
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TOOLBAR: FILTER & PENCARIAN */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* CATEGORY TABS */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `Semua (${fileCounts.total})` },
              { id: 'image', label: `🖼️ Gambar (${fileCounts.images})` },
              { id: 'video', label: `🎬 Video (${fileCounts.videos})` },
              { id: 'document', label: `📄 Dokumen (${fileCounts.documents})` },
              { id: 'other', label: `📦 Lainnya (${fileCounts.others})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFileTypeFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  fileTypeFilter === cat.id
                    ? 'bg-primary-dark text-white translate-y-0.5 shadow-none'
                    : 'bg-white text-primary-dark hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* SEARCH & SOURCE FILTER */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              value={fileSourceFilter}
              onChange={setFileSourceFilter}
              options={[
                { value: 'all', label: 'Semua Sumber' },
                { value: 'direct_upload', label: '🚀 Upload Langsung' },
                { value: 'article', label: '📰 Dari Berita / Modul' },
                { value: 'team', label: '👥 Dari Profil / Tim' },
                { value: 'logo', label: '👑 Logo Website' }
              ]}
              className="min-w-[150px]"
            />

            <div className="relative">
              <input
                type="text"
                value={fileSearchTerm}
                onChange={(e) => setFileSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchMediaFiles();
                }}
                placeholder="Cari nama berkas..."
                className="border-2 border-primary-dark px-3 py-1.5 text-xs bg-white outline-none pr-8 w-48 sm:w-56 font-medium"
              />
              <button
                type="button"
                onClick={fetchMediaFiles}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-dark"
              >
                <Search size={14} />
              </button>
            </div>

            <button
              onClick={fetchMediaFiles}
              className="p-2 border-2 border-primary-dark bg-gray-100 hover:bg-gray-200 text-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Muat Ulang"
            >
              <RefreshCw size={14} className={loadingFiles ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* MEDIA GRID LIST */}
        {loadingFiles ? (
          <div className="py-16 text-center">
            <RefreshCw size={32} className="mx-auto text-primary-dark animate-spin mb-2" />
            <p className="text-xs font-bold uppercase text-primary-dark">Memuat daftar berkas media...</p>
          </div>
        ) : fileList.length === 0 ? (
          <div className="py-14 text-center border-2 border-dashed border-gray-300 bg-gray-50 p-6 space-y-2">
            <Folder size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="font-black text-sm uppercase text-primary-dark">Belum ada berkas yang ditemukan</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {fileSearchTerm || fileTypeFilter !== 'all' || fileSourceFilter !== 'all'
                ? 'Tidak ada berkas yang cocok dengan filter atau kata kunci pencarian Anda.'
                : 'Unggah foto, video, atau dokumen menggunakan form upload di atas untuk memulai.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {fileList.map((file) => {
              const isImg = file.file_type === 'image';
              const isVid = file.file_type === 'video';
              const isDoc = file.file_type === 'document';
              const isCurrentLogo = activeLogoUrl && activeLogoUrl === file.file_url;
              const ext = (file.filename.split('.').pop() || '').toUpperCase();

              return (
                <div
                  key={file.id}
                  className={`bg-white border-2 border-primary-dark shadow-hard flex flex-col justify-between group transition-all hover:-translate-y-1 ${
                    isCurrentLogo ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {/* THUMBNAIL CONTAINER */}
                  <div className="relative h-44 bg-gray-100 border-b-2 border-primary-dark overflow-hidden flex items-center justify-center">
                    {isImg ? (
                      <img
                        src={`${file.file_url}`}
                        alt={file.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => setPreviewMediaModal(file)}
                      />
                    ) : isVid ? (
                      <div
                        onClick={() => setPreviewMediaModal(file)}
                        className="w-full h-full relative cursor-pointer group flex items-center justify-center bg-black"
                      >
                        <video
                          src={`${file.file_url}`}
                          className="w-full h-full object-cover opacity-80"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPreviewMediaModal(file)}
                        className="w-full h-full cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-blue-50 p-4"
                      >
                        <div className="w-12 h-12 bg-primary-dark text-white flex items-center justify-center font-black border border-primary-dark mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <FileText size={24} />
                        </div>
                        <span className="text-[11px] font-black uppercase text-primary-dark">
                          {ext} Dokumen
                        </span>
                        <span className="text-[10px] text-gray-500">{formatFileSize(file.file_size)}</span>
                      </div>
                    )}

                    {/* BADGES OVERLAY */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 border border-primary-dark bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        .{ext} • {formatFileSize(file.file_size)}
                      </span>
                      {isCurrentLogo && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-gradient-yellow text-primary-dark border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                          <Star size={10} className="fill-current text-primary-dark" /> LOGO AKTIF
                        </span>
                      )}
                    </div>

                    {/* SOURCE BADGE */}
                    <div className="absolute top-2 right-2 pointer-events-none">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                          file.source === 'article'
                            ? 'bg-blue-100 text-blue-900'
                            : file.source === 'team'
                            ? 'bg-green-100 text-green-900'
                            : file.source === 'logo'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {file.source === 'article'
                          ? '📰 Berita'
                          : file.source === 'team'
                          ? '👥 Tim'
                          : file.source === 'logo'
                          ? '👑 Logo'
                          : '🚀 Upload'}
                      </span>
                    </div>
                  </div>

                  {/* CARD INFO BODY */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p
                        className="font-bold text-xs text-primary-dark truncate"
                        title={file.original_name}
                      >
                        {file.original_name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium pt-1">
                        <span>Oleh: {file.uploaded_by || 'Admin'}</span>
                        <span>{new Date(file.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS TOOLBAR */}
                    <div className="pt-2 border-t border-gray-200 space-y-1.5">
                      {/* Copy URL & Set As Logo Row */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyFileUrl(file.file_url)}
                          className={`text-[10px] font-black uppercase px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1 ${
                            copiedUrl === file.file_url
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-primary-dark hover:bg-gray-100'
                          }`}
                        >
                          {copiedUrl === file.file_url ? (
                            <>
                              <Check size={11} /> Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Salin URL
                            </>
                          )}
                        </button>

                        {isImg ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsLogo(file.file_url)}
                            disabled={isCurrentLogo}
                            className={`text-[10px] font-black uppercase px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1 ${
                              isCurrentLogo
                                ? 'bg-yellow-400 text-primary-dark cursor-default font-bold opacity-80'
                                : 'bg-gradient-yellow text-primary-dark hover:bg-yellow-400'
                            }`}
                            title="Pasang gambar ini sebagai logo website resmi"
                          >
                            <Crown size={11} /> {isCurrentLogo ? 'Logo Aktif' : 'Pasang Logo'}
                          </button>
                        ) : (
                          <a
                            href={`${file.file_url}`}
                            download
                            className="text-[10px] font-black uppercase px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-white text-primary-dark hover:bg-gray-100 flex items-center justify-center gap-1"
                          >
                            <Download size={11} /> Unduh
                          </a>
                        )}
                      </div>

                      {/* Secondary Actions: Preview, Download, Delete */}
                      <div className="flex items-center justify-between gap-1 pt-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPreviewMediaModal(file)}
                          className="text-gray-700 hover:text-primary-dark font-bold flex items-center gap-1"
                        >
                          <Eye size={12} /> Pratinjau
                        </button>
                        <a
                          href={`${file.file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-700 hover:text-primary-dark font-bold flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Buka Tab
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteMediaFile(file)}
                          className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                          title="Hapus berkas permanen"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PreviewMediaModal
        previewMediaModal={previewMediaModal}
        onClose={() => setPreviewMediaModal(null)}
      />
    </div>
  );
}
