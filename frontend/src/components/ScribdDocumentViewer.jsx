import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Calendar,
  User,
  Eye,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Info,
  Bookmark,
  Layers,
  ArrowLeft
} from 'lucide-react';

export default function ScribdDocumentViewer({
  article,
  sanitizedContent,
  relatedArticles = [],
  onDownload
}) {
  const [activeTab, setActiveTab] = useState(article.file_url ? 'pdf' : 'text');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const readerRef = useRef(null);

  const hasPdf = Boolean(article.file_url && article.file_url.toLowerCase().endsWith('.pdf'));
  const currentUrl = encodeURIComponent(window.location.href);
  const currentTitle = encodeURIComponent(article.title);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (readerRef.current?.requestFullscreen) {
        readerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(160, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 15));
  const handleZoomReset = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Filter other modules
  const moduleArticles = relatedArticles
    .filter((item) => item.id !== article.id)
    .slice(0, 4);

  return (
    <div className="bg-[#f4f5f8] min-h-screen pb-16 font-sans text-gray-800">
      {/* ========================================================================= */}
      {/* 1. TOP SCRIBD HEADER & BREADCRUMB                                         */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Breadcrumb & Document Badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden whitespace-nowrap">
              <Link to="/" className="hover:text-primary-dark font-medium transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <Link to="/berita" className="hover:text-primary-dark font-medium transition-colors">
                Modul & Dokumen
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold truncate max-w-xs sm:max-w-md">
                {article.title}
              </span>
            </div>

            {/* Quick Action Buttons on Top Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {article.file_url && (
                <a
                  href={article.file_url}
                  download
                  onClick={onDownload}
                  className="inline-flex items-center gap-1.5 bg-gradient-green text-white font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Download size={14} /> Unduh PDF
                </a>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 bg-white text-gray-700 hover:text-primary-dark font-bold text-xs px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-all"
                title="Cetak Naskah Dokumen"
              >
                <Printer size={14} /> Cetak
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-2 border rounded transition-all ${
                  linkCopied
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-gray-700 hover:text-primary-dark border-gray-300 hover:bg-gray-50'
                }`}
              >
                {linkCopied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{linkCopied ? 'Tersalin' : 'Bagikan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* 2. DOCUMENT HERO & METADATA BAR (Scribd Style)                            */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-5 sm:p-7 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-grow">
              {/* Type Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-gradient-yellow text-primary-dark border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <BookOpen size={12} /> Modul & Dokumen Pembelajaran
                </span>
                {hasPdf && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 bg-red-600 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <FileText size={12} /> Format PDF Asli
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-800 border border-green-700">
                  <ShieldCheck size={12} /> Akses Terbuka Bebas
                </span>
              </div>

              {/* Document Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                {article.title}
              </h1>

              {/* Scribd Author & Publication Bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-dark text-secondary font-black text-xs flex items-center justify-center border border-primary-dark">
                    {(article.author_name || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-gray-500">Diunggah oleh: </span>
                    <strong className="text-primary-dark">
                      {article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana'}
                    </strong>
                  </div>
                </div>

                <span className="text-gray-300 hidden sm:inline">•</span>

                <div className="flex items-center gap-1">
                  <Calendar size={13} className="text-secondary-dark" />
                  <span>
                    {new Date(article.published_date || article.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <span className="text-gray-300 hidden sm:inline">•</span>

                <div className="flex items-center gap-1 text-gray-700 font-semibold">
                  <Eye size={13} className="text-primary-dark" />
                  <span>{article.views_count || 1} Pembaca</span>
                </div>

                {article.downloads_count !== undefined && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <Download size={13} />
                      <span>{article.downloads_count || 0} Diunduh</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Hero Download Card */}
            {article.file_url && (
              <div className="lg:w-72 shrink-0 bg-yellow-50/80 border-2 border-primary-dark p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase text-primary-dark">
                  <span>Unduh Dokumen</span>
                  <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 font-mono">PDF</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                  Unduh seluruh modul atau buku saku ini secara lengkap dan gratis untuk dipelajari offline.
                </p>
                <a
                  href={article.file_url}
                  download
                  onClick={onDownload}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-green text-white font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Download size={15} /> Unduh Sekarang
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN 2-COLUMN LAYOUT: SCRIBD READER + SIDEBAR                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================================= */}
          {/* LEFT: THE SCRIBD DOCUMENT CANVAS                                        */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 space-y-6 min-w-0" ref={readerRef}>
            {/* READER CONTROLLER TOOLBAR (Gaya Scribd Sticky Floating Toolbar) */}
            <div className="bg-[#1e293b] text-white p-3 border-2 border-primary-dark shadow-hard flex flex-wrap items-center justify-between gap-3">
              {/* Tabs: PDF vs Naskah Teks (jika ada keduanya) */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 border border-slate-700">
                {hasPdf && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                      activeTab === 'pdf'
                        ? 'bg-secondary text-primary-dark shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <FileText size={13} /> Dokumen PDF
                  </button>
                )}
                {sanitizedContent && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                      activeTab === 'text'
                        ? 'bg-secondary text-primary-dark shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <BookOpen size={13} /> Naskah Modul
                  </button>
                )}
              </div>

              {/* Reader Controls: Zoom & Fullscreen */}
              <div className="flex items-center gap-1 sm:gap-2">
                {activeTab === 'text' && (
                  <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1 hover:text-secondary transition-colors"
                      title="Perkecil Teks"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="w-10 text-center font-mono text-[11px]">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1 hover:text-secondary transition-colors"
                      title="Perbesar Teks"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomReset}
                      className="p-1 hover:text-secondary transition-colors border-l border-slate-700 pl-1.5 ml-1"
                      title="Reset Ukuran"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                )}

                {hasPdf && (
                  <a
                    href={`${article.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-200 px-2.5 py-1.5 border border-slate-700 transition-colors"
                    title="Buka PDF di Tab Baru"
                  >
                    <ExternalLink size={13} /> Tab Baru
                  </a>
                )}

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-200 px-2.5 py-1.5 border border-slate-700 transition-colors"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Baca Layar Penuh'}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span className="hidden sm:inline">{isFullscreen ? 'Kecilkan' : 'Layar Penuh'}</span>
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SCRIBD READER CANVAS (Center Document Viewer)                       */}
            {/* =================================================================== */}
            <div className="bg-[#e5e7eb] p-2 sm:p-5 md:p-8 border-2 border-primary-dark shadow-hard min-h-[650px] flex justify-center">
              {/* VIEW 1: INTERACTIVE PDF VIEWER */}
              {activeTab === 'pdf' && hasPdf && (
                <div className="w-full bg-white shadow-2xl border border-gray-300 flex flex-col">
                  {/* Scribd PDF Header inside Canvas */}
                  <div className="bg-[#2c384a] text-gray-200 px-4 py-2 text-xs flex items-center justify-between border-b border-gray-700">
                    <span className="font-semibold truncate max-w-sm">
                      📄 {article.file_url.split('/').pop()}
                    </span>
                    <span className="text-[11px] text-gray-400">PDF Reader Interaktif</span>
                  </div>

                  {/* Responsive Iframe PDF Reader */}
                  <div className="w-full h-[680px] sm:h-[780px] md:h-[900px] bg-gray-100 relative">
                    <iframe
                      src={`${article.file_url}#view=FitH&toolbar=1`}
                      title={`PDF - ${article.title}`}
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}

              {/* VIEW 2: CLEAN BOOK / DOCUMENT PROSE CANVAS */}
              {activeTab === 'text' && (
                <div
                  className="w-full max-w-3xl bg-white shadow-2xl border border-gray-200 p-6 sm:p-10 md:p-14 space-y-6 transition-all"
                  style={{ fontSize: `${(zoomLevel / 100) * 15}px` }}
                >
                  {/* Paper Sheet Header */}
                  <div className="border-b-2 border-primary-dark pb-4 text-center space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-secondary-dark">
                      KKN VIDYA VARDHANA UNUSIA • MODUL PEMBELAJARAN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Penyusun: {article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana'} • {article.publisher || 'Desa Ciasihan, Bogor'}
                    </p>
                  </div>

                  {/* Paper Cover Thumbnail if present */}
                  {article.image_url && (
                    <div className="my-4 border border-gray-300 shadow-sm max-w-sm mx-auto overflow-hidden bg-gray-50">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full object-contain max-h-[360px]"
                      />
                    </div>
                  )}

                  {/* Abstract / Summary Quote */}
                  {article.abstract && (
                    <div className="bg-yellow-50/70 border-l-4 border-primary-dark p-4 my-4">
                      <div className="text-xs font-black uppercase text-primary-dark mb-1">
                        Ringkasan Modul
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                        {article.abstract}
                      </p>
                    </div>
                  )}

                  {/* Body Text */}
                  <div
                    className="prose article-body-content max-w-none text-gray-800 leading-relaxed font-serif space-y-4 [&>p]:leading-loose [&>blockquote]:border-l-4 [&>blockquote]:border-primary-dark [&>blockquote]:pl-4 [&>blockquote]:italic [&>h2]:font-sans [&>h2]:font-black [&>h3]:font-sans [&>h3]:font-bold"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />

                  {/* References */}
                  {article.references_list && (
                    <div className="border-t border-gray-200 pt-6 mt-8 space-y-2">
                      <h4 className="text-xs font-black uppercase text-primary-dark">
                        Daftar Pustaka & Rujukan:
                      </h4>
                      <p className="text-xs font-mono bg-gray-50 p-3 border border-gray-200 whitespace-pre-wrap text-gray-700">
                        {article.references_list}
                      </p>
                    </div>
                  )}

                  {/* Paper Sheet Footer */}
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-[11px] text-gray-400 font-mono">
                    <span>Dokumen Resmi KKN Vidya Vardhana</span>
                    <span>Halaman Pembahasan Modul</span>
                  </div>
                </div>
              )}
            </div>

            {/* SCRIBD SHARE & ENGAGEMENT BAR */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-secondary-dark" />
                <span className="text-xs font-black uppercase text-primary-dark">
                  Bagikan Dokumen Ini:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${currentTitle}%20|%20${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs px-3.5 py-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer.php?u=${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs px-3.5 py-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`font-bold text-xs px-3.5 py-1.5 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    linkCopied ? 'bg-green-600 text-white' : 'bg-white text-primary-dark hover:bg-gray-100'
                  }`}
                >
                  {linkCopied ? 'Tersalin!' : 'Salin Tautan'}
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT SIDEBAR: SCRIBD DOCUMENT DETAILS & RELATED MODULES                */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* WIDGET 1: TENTANG DOKUMEN INI (Scribd Document Info Card) */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-primary-dark pb-2.5">
                <Info size={17} className="text-primary-dark" />
                <h3 className="font-black text-xs uppercase tracking-wider text-primary-dark">
                  Informasi Dokumen Modul
                </h3>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-gray-500">
                  Deskripsi Modul:
                </span>
                <p className={`text-xs text-gray-700 leading-relaxed font-normal ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                  {article.abstract ||
                    article.content?.replace(/<[^>]+>/g, ' ').slice(0, 280) ||
                    'Modul pembelajaran dan panduan kerja resmi yang disusun oleh mahasiswa KKN Vidya Vardhana UNUSIA.'}
                </p>
                {(article.abstract || (article.content && article.content.length > 280)) && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs font-bold text-secondary-dark hover:underline"
                  >
                    {isDescExpanded ? 'Tutup Deskripsi' : 'Baca Selengkapnya...'}
                  </button>
                )}
              </div>

              {/* Specifications Table */}
              <div className="border-t border-gray-100 pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Format Dokumen</span>
                  <span className="font-bold text-gray-800">{hasPdf ? 'PDF / Naskah Digital' : 'Artikel Web Modul'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Kategori</span>
                  <span className="font-bold text-primary-dark">Modul Pembelajaran</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Hak Akses</span>
                  <span className="font-bold text-green-700">Open Access (Bebas)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Penerbit</span>
                  <span className="font-bold text-gray-800">{article.publisher || 'KKN Vidya Vardhana'}</span>
                </div>
                {article.doi_or_reg && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">No. Registrasi / DOI</span>
                    <span className="font-mono font-bold text-primary-dark">{article.doi_or_reg}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <span className="text-[11px] font-black uppercase text-gray-500 flex items-center gap-1">
                  <Tag size={12} /> Topik & Kata Kunci:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-700 px-2 py-0.5">
                    #ModulAjar
                  </span>
                  <span className="text-[11px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-700 px-2 py-0.5">
                    #KKN UNUSIA
                  </span>
                  <span className="text-[11px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-700 px-2 py-0.5">
                    #Desa Ciasihan
                  </span>
                  {article.keywords &&
                    article.keywords.split(/[,;]+/).map((k, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-300 px-2 py-0.5"
                      >
                        #{k.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* WIDGET 2: DOKUMEN & MODUL TERKAIT LAINNYA (Scribd Document Cards) */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2.5">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-secondary-dark" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-primary-dark">
                    Modul Terkait Lainnya
                  </h3>
                </div>
                <Link
                  to="/berita"
                  className="text-xs font-bold text-primary-dark hover:text-secondary-dark flex items-center gap-0.5"
                >
                  Lihat Semua <ChevronRight size={13} />
                </Link>
              </div>

              {moduleArticles.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">
                  Belum ada modul terkait lainnya yang diunggah.
                </p>
              ) : (
                <div className="space-y-3">
                  {moduleArticles.map((item) => (
                    <Link
                      key={item.id}
                      to={`/modul/${item.slug}`}
                      className="group flex gap-3 p-2 bg-gray-50 hover:bg-yellow-50/60 border border-gray-200 hover:border-primary-dark transition-all"
                    >
                      {/* Scribd Document Preview Miniature */}
                      <div className="w-16 h-20 bg-gray-200 border border-gray-300 shrink-0 relative overflow-hidden shadow-sm flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <FileText size={22} className="text-gray-400" />
                        )}
                        <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[8px] font-bold px-1 font-mono">
                          PDF
                        </span>
                      </div>

                      <div className="flex flex-col justify-between min-w-0 flex-grow py-0.5">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-primary-dark line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="text-[10px] text-gray-500 space-y-0.5">
                          <p className="truncate font-medium text-gray-700">
                            {item.authors_meta || item.author_name || 'Tim KKN'}
                          </p>
                          <div className="flex items-center gap-2">
                            <span>
                              {new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                            <span>•</span>
                            <span>👁️ {item.views_count || 1}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* WIDGET 3: KKN INFO BADGE */}
            <div className="bg-primary-dark text-white border-2 border-primary-dark shadow-hard p-5 space-y-3">
              <span className="text-[11px] font-black uppercase text-secondary tracking-widest block">
                POSKO KKN VIDYA VARDHANA
              </span>
              <h4 className="text-sm font-black text-white uppercase">
                Perpustakaan & Bahan Ajar Digital
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-normal">
                Modul dan bahan ajar ini merupakan wujud kontribusi mahasiswa KKN Universitas Nahdlatul Ulama Indonesia (UNUSIA) untuk kemajuan pendidikan anak-anak dan warga Desa Ciasihan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
