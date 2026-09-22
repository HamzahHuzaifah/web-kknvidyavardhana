import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Download, 
  Share2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Eye, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  GraduationCap, 
  Tag, 
  ShieldCheck, 
  Bookmark,
  Layers,
  Clock,
  ChevronRight,
  Flame,
  Info,
  MapPin,
  Newspaper
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [citationFormat, setCitationFormat] = useState('apa');
  const [citationCopied, setCitationCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchAllArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Inject Google Scholar & Dublin Core Meta Tags
  useEffect(() => {
    if (!article) return;

    const metaTags = [];
    const addMeta = (name, content) => {
      if (!content) return;
      const el = document.createElement('meta');
      el.setAttribute('name', name);
      el.setAttribute('content', content);
      document.head.appendChild(el);
      metaTags.push(el);
    };

    addMeta('citation_title', article.title);
    
    const authorsStr = article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana';
    const authorsList = authorsStr.split(',').map(a => a.trim().split(' (')[0]);
    authorsList.forEach(author => {
      addMeta('citation_author', author);
    });

    addMeta('citation_publication_date', article.published_date 
      ? new Date(article.published_date).toISOString().split('T')[0] 
      : new Date(article.created_at).toISOString().split('T')[0]
    );
    addMeta('citation_journal_title', 'Publikasi KKN Vidya Vardhana');
    if (article.volume) addMeta('citation_volume', article.volume.toString());
    if (article.issue) addMeta('citation_issue', article.issue.toString());
    
    addMeta('citation_publisher', article.publisher || 'KKN Vidya Vardhana');
    addMeta('citation_abstract_html_url', window.location.href);
    if (article.file_url && article.file_url.toLowerCase().endsWith('.pdf')) {
      addMeta('citation_pdf_url', `${window.location.origin}${article.file_url}`);
    }
    if (article.keywords) {
      addMeta('citation_keywords', article.keywords);
    }

    document.title = `${article.title} - KKN Vidya Vardhana UNUSIA`;

    return () => {
      metaTags.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [article]);

  const fetchArticle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/articles/${slug}`);
      setArticle(res.data);

      if (res.data && res.data.id) {
        axios.post(`/api/articles/${res.data.id}/view`).then((vRes) => {
          if (vRes.data && vRes.data.views_count !== undefined) {
            setArticle((prev) => prev ? { ...prev, views_count: vRes.data.views_count } : prev);
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Artikel atau publikasi tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllArticles = async () => {
    try {
      const res = await axios.get('/api/articles');
      setRecentArticles(res.data || []);
    } catch (err) {
      console.error('Error loading article list:', err);
    }
  };

  const handleDownload = () => {
    if (!article) return;
    axios.post(`/api/articles/${article.id}/download`).then((dRes) => {
      if (dRes.data && dRes.data.downloads_count !== undefined) {
        setArticle((prev) => prev ? { ...prev, downloads_count: dRes.data.downloads_count } : prev);
      }
    }).catch(() => {});
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Calculate estimated reading time
  const getReadingTime = (text) => {
    if (!text) return '2 Menit';
    const words = text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} Menit Baca`;
  };

  // Generate Citations
  const generateCitation = () => {
    if (!article) return '';
    const author = article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana';
    const dateObj = article.published_date ? new Date(article.published_date) : new Date(article.created_at);
    const year = dateObj.getFullYear();
    const title = article.title;
    const publisher = article.publisher || 'KKN Vidya Vardhana';
    const url = window.location.href;
    const reg = article.doi_or_reg ? ` No. ${article.doi_or_reg}.` : '';
    
    const vol = article.volume ? `Vol. ${article.volume}` : '';
    const iss = article.issue ? `No. ${article.issue}` : '';
    const volIss = vol || iss ? ` ${vol}${vol && iss ? ' ' : ''}${iss}` : '';
    const apaVolIss = vol || iss ? `, ${article.volume || ''}${article.issue ? `(${article.issue})` : ''}` : '';

    switch (citationFormat) {
      case 'acm':
        return `${author}. ${year}. ${title}. ${publisher}${volIss ? `, ${volIss}` : ''}.${reg} ${url}`;
      case 'acs':
        return `${author}. ${title}. ${publisher}. ${year}${volIss ? `, ${volIss}` : ''}.${reg} ${url}`;
      case 'abnt':
        return `${author.toUpperCase()}. ${title}. ${publisher}, ${year}${volIss ? `, ${volIss}` : ''}.${reg} Tersedia di: ${url}.`;
      case 'chicago':
        return `${author}. "${title}." ${publisher}, ${year}${volIss ? `, ${volIss}` : ''}.${reg}`;
      case 'ieee':
        return `${author}, "${title}," ${publisher}${volIss ? `, ${volIss}` : ''}, ${year}.${reg} [Online]. Tersedia: ${url}`;
      case 'harvard':
        return `${author} (${year}) '${title}', ${publisher}${volIss ? `, ${volIss}` : ''}.${reg} Tersedia di: ${url} (Diakses: ${new Date().toLocaleDateString('id-ID')}).`;
      case 'mla':
        return `${author}. "${title}." ${publisher}, ${year}${volIss ? `, ${volIss}` : ''}.${reg} ${url}.`;
      case 'turabian':
        return `${author}. "${title}." ${publisher} (${year}${volIss ? `, ${volIss}` : ''}).${reg}`;
      case 'vancouver':
        return `${author}. ${title}. ${publisher}; ${year}${volIss ? ` ${volIss}` : ''}.${reg}`;
      case 'bibtex':
        return `@article{kkn_${article.id}_${year},\n  title={${title}},\n  author={${author}},\n  year={${year}},\n  publisher={${publisher}},\n  volume={${article.volume || ''}},\n  number={${article.issue || ''}},\n  url={${url}}\n}`;
      case 'apa':
      default:
        return `${author}. (${year}). ${title}.${reg} ${publisher}${apaVolIss}. ${url}`;
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(generateCitation());
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-dark border-t-transparent animate-spin mb-4"></div>
        <p className="font-black text-sm uppercase text-primary-dark tracking-wider">Memuat Berita & Naskah...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-xl mx-auto bg-white border-4 border-primary-dark shadow-hard p-8 text-center space-y-4">
          <BookOpen size={48} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black uppercase text-primary-dark">Berita Tidak Ditemukan</h2>
          <p className="text-xs text-gray-600 font-medium">
            {error || 'Berita atau publikasi yang Anda cari tidak tersedia atau alamat tautan telah diperbarui.'}
          </p>
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-5 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft size={16} /> Kembali ke Portal Berita
          </Link>
        </div>
      </div>
    );
  }

  const isAcademic = article.category === 'publikasi';
  const isModule = article.category === 'modul';
  const isPdf = article.file_url && article.file_url.toLowerCase().endsWith('.pdf');

  // Filter related articles (exclude current)
  const otherArticles = recentArticles.filter(item => item.id !== article.id);
  const relatedArticles = otherArticles.filter(item => item.category === article.category).slice(0, 3);
  const displayRelated = relatedArticles.length > 0 ? relatedArticles : otherArticles.slice(0, 3);
  const popularArticles = [...otherArticles].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

  const currentUrl = encodeURIComponent(window.location.href);
  const currentTitle = encodeURIComponent(article.title);

  // Normalize non-breaking spaces (&nbsp; / \u00A0) into regular spaces so browser wraps lines at true word boundaries
  const sanitizedContent = useMemo(() => {
    if (!article?.content) return '';
    const normalized = article.content
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00a0/g, ' ');
    return DOMPurify.sanitize(normalized);
  }, [article?.content]);

  return (
    <div className="bg-[#f9fafb] min-h-screen py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS (Sesuai Referensi Indonara) */}
        {/* ========================================================================= */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-6 overflow-hidden text-ellipsis whitespace-nowrap bg-white py-2.5 px-4 border border-gray-200 rounded shadow-sm">
          <Link to="/" className="text-primary-dark hover:text-secondary-dark font-bold transition-colors">
            Beranda
          </Link>
          <span className="text-gray-400 font-normal">/</span>
          <Link to="/berita" className="text-primary-dark hover:text-secondary-dark font-bold transition-colors">
            {isAcademic ? 'Publikasi Ilmiah' : isModule ? 'Modul & Panduan' : 'Berita KKN'}
          </Link>
          <span className="text-gray-400 font-normal">/</span>
          <span className="text-gray-700 truncate max-w-xs sm:max-w-md md:max-w-lg font-medium">
            {article.title}
          </span>
        </nav>

        {/* ========================================================================= */}
        {/* MAIN 2-COLUMN LAYOUT: CONTENT + SIDEBAR */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT / MAIN COLUMN (approx 68%) */}
          {/* ======================================================================= */}
          <main className="lg:col-span-8 space-y-6 min-w-0">
            
            {/* ARTICLE CARD WRAPPER */}
            <article className="bg-white border-2 border-primary-dark shadow-hard p-5 sm:p-7 md:p-9 space-y-6">
              
              {/* CATEGORY & ACCREDITATION BADGE */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] inline-block ${
                  isAcademic ? 'bg-gradient-green text-white' : isModule ? 'bg-gradient-yellow text-primary-dark' : 'bg-gradient-blue text-white'
                }`}>
                  {isAcademic ? '📑 Publikasi Ilmiah' : isModule ? '📚 Modul & Buku Saku' : '📰 Berita KKN'}
                </span>

                {isAcademic && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-100 text-yellow-900 border border-primary-dark flex items-center gap-1">
                    <ShieldCheck size={13} /> Open Access Peer-Reviewed
                  </span>
                )}
              </div>

              {/* POST TITLE (Headline Besar & Jelas Sesuai Indonara) */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug tracking-tight">
                {article.title}
              </h1>

              {/* POST META BAR (Sesuai Gaya Indonara: Pewarta, Tanggal, Views, Durasi) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-gray-600 border-y border-gray-200 py-3">
                <div className="flex items-center gap-1.5 font-bold text-primary-dark">
                  <User size={14} className="text-secondary-dark" />
                  <span>Pewarta: {article.author_name || 'Tim Redaksi KKN Vidya Vardhana'}</span>
                </div>

                <span className="text-gray-300 hidden sm:inline">•</span>

                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-secondary-dark" />
                  <span>
                    {new Date(article.published_date || article.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <span className="text-gray-300 hidden sm:inline">•</span>

                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-secondary-dark" />
                  <span>{getReadingTime(article.content)}</span>
                </div>

                <span className="text-gray-300 hidden sm:inline">•</span>

                <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <Eye size={14} className="text-primary" />
                  <span>{article.views_count || 1} Pembaca</span>
                </div>
              </div>

              {/* FEATURED IMAGE & CAPTION (Gaya Gambar & tr-caption Indonara) */}
              {article.image_url ? (
                <div className="space-y-2 my-4">
                  <div className="border-2 border-primary-dark overflow-hidden bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img
                      src={`${article.image_url}`}
                      alt={article.title}
                      className="w-full max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                  {/* Photo Caption */}
                  <p className="text-[12px] italic text-gray-500 text-center bg-gray-50 py-1.5 px-3 border-b border-gray-200">
                    Dokumentasi: {article.title} (Dok: Tim KKN Kelompok 07 Vidya Vardhana UNUSIA)
                  </p>
                </div>
              ) : null}

              {/* AUTHORS & ACADEMIC INFO BAR (Jika Jurnal/Modul) */}
              {(isAcademic || isModule || article.doi_or_reg) && (
                <div className="bg-yellow-50/70 border-2 border-primary-dark p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark">
                    <GraduationCap size={16} className="text-secondary-dark" />
                    <span>Penulis & Afiliasi Akademik</span>
                  </div>
                  <p className="text-sm font-black text-primary-dark">
                    {article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
                    <span>Penerbit: <strong>{article.publisher || 'KKN Vidya Vardhana'}</strong></span>
                    {article.doi_or_reg && (
                      <>
                        <span>•</span>
                        <span className="bg-white px-2 py-0.5 border border-primary-dark font-mono text-primary-dark font-bold text-[11px]">
                          DOI/Reg: {article.doi_or_reg}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ABSTRACT (Jika Jurnal atau Modul) */}
              {article.abstract && (
                <div className="bg-gray-50 border-l-4 border-primary-dark p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark">
                    <Bookmark size={15} className="text-secondary-dark" />
                    <span>Abstrak / Ringkasan</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                    {article.abstract}
                  </p>
                </div>
              )}

              {/* POST CONTENT / BODY (Editorial News Prose) */}
              <div className="pt-2">
                <div
                  className="prose max-w-none text-gray-800 text-sm sm:text-base leading-relaxed font-normal space-y-4 [&>p]:leading-loose [&>blockquote]:border-l-4 [&>blockquote]:border-primary-dark [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-yellow-50/50 [&>blockquote]:py-2"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>

              {/* REFERENCES (Jika Tersedia) */}
              {article.references_list && (
                <div className="border-t-2 border-gray-200 pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-secondary-dark" />
                    <h3 className="text-sm font-black uppercase text-primary-dark">Daftar Pustaka (References)</h3>
                  </div>
                  <div className="bg-gray-50 p-4 border border-gray-200 text-xs font-mono whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {article.references_list}
                  </div>
                </div>
              )}

              {/* TAGS / LABELS SECTION (Sesuai Referensi Indonara) */}
              <div className="border-t border-gray-200 pt-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase">
                  <Tag size={14} className="text-secondary-dark" />
                  <span>Topik & Label Berita:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold bg-gray-100 hover:bg-yellow-200 text-gray-800 border border-gray-300 px-3 py-1 transition-colors">
                    #KKN UNUSIA
                  </span>
                  <span className="text-xs font-bold bg-gray-100 hover:bg-yellow-200 text-gray-800 border border-gray-300 px-3 py-1 transition-colors">
                    #Vidya Vardhana
                  </span>
                  <span className="text-xs font-bold bg-gray-100 hover:bg-yellow-200 text-gray-800 border border-gray-300 px-3 py-1 transition-colors">
                    #Desa Ciasihan
                  </span>
                  <span className="text-xs font-bold bg-gray-100 hover:bg-yellow-200 text-gray-800 border border-gray-300 px-3 py-1 transition-colors">
                    #Pamijahan Bogor
                  </span>
                  {article.keywords && article.keywords.split(/[,;]+/).map((k, idx) => (
                    <span key={idx} className="text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-700 px-3 py-1">
                      #{k.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* SOCIAL SHARE BUTTONS (Sesuai Bar Bagikan Indonara) */}
              <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-3">
                <span className="text-xs font-black uppercase text-primary-dark flex items-center gap-1.5">
                  <Share2 size={14} className="text-secondary-dark" /> Bagikan Kabar Ini:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${currentTitle}%20|%20${currentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs px-3.5 py-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    WhatsApp
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer.php?u=${currentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs px-3.5 py-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Facebook
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    X (Twitter)
                  </a>

                  {/* Salin Tautan */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      linkCopied ? 'bg-green-600 text-white' : 'bg-white text-primary-dark hover:bg-gray-100'
                    }`}
                  >
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                    {linkCopied ? 'Tersalin!' : 'Salin Tautan'}
                  </button>
                </div>
              </div>

              {/* ABOUT AUTHOR BOX (Kotak Redaksi / Pewarta Sesuai Indonara) */}
              <div className="bg-gradient-to-r from-gray-50 to-yellow-50/40 border-2 border-primary-dark p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-dark text-secondary font-black text-xl flex items-center justify-center border-2 border-primary-dark shadow-sm shrink-0">
                  {article.author_name ? article.author_name.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase text-primary-dark">
                      {article.author_name || 'Tim Redaksi KKN Vidya Vardhana'}
                    </h4>
                    <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.2 border border-green-700">
                      Pewarta Resmi
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    Mahasiswa Kuliah Kerja Nyata (KKN) Kelompok 07 Vidya Vardhana Universitas Nahdlatul Ulama Indonesia (UNUSIA) Tahun 2026. Mengabdi di Desa Ciasihan, Kecamatan Pamijahan, Kabupaten Bogor.
                  </p>
                </div>
              </div>

            </article>

            {/* ===================================================================== */}
            {/* HOW TO CITE WIDGET (Jika Jurnal Ilmiah atau Modul) */}
            {/* ===================================================================== */}
            {(isAcademic || isModule) && (
              <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-primary-dark pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-secondary-dark" />
                    <h3 className="font-black text-sm uppercase text-primary-dark">Cara Mensitasi Naskah Ini (How to Cite)</h3>
                  </div>
                  <CustomSelect
                    value={citationFormat}
                    onChange={setCitationFormat}
                    options={['apa', 'acm', 'acs', 'abnt', 'chicago', 'harvard', 'ieee', 'mla', 'turabian', 'vancouver', 'bibtex'].map(fmt => ({ value: fmt, label: fmt.toUpperCase() }))}
                    className="w-36 text-xs"
                  />
                </div>
                <div className="p-3 bg-gray-50 border border-primary-dark font-mono text-xs text-gray-800 leading-relaxed overflow-x-auto select-all">
                  {generateCitation()}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      citationCopied ? 'bg-green-600 text-white' : 'bg-gradient-yellow text-primary-dark hover:translate-y-0.5 hover:shadow-none'
                    }`}
                  >
                    {citationCopied ? <Check size={14} /> : <Copy size={14} />}
                    {citationCopied ? 'Sitasi Berhasil Tersalin!' : `Salin Sitasi (${citationFormat.toUpperCase()})`}
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* INTERACTIVE PDF VIEWER (Jika Ada Lampiran PDF) */}
            {/* ===================================================================== */}
            {isPdf && (
              <div id="pdf-reader" className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4 scroll-mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-primary-dark pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-red-600" />
                    <h3 className="font-black text-sm uppercase text-primary-dark">
                      Pratinjau Naskah Lengkap (Interactive PDF Reader)
                    </h3>
                  </div>
                  <a
                    href={`${article.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-black uppercase bg-white border border-primary-dark px-2.5 py-1 hover:bg-gray-100 flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Buka Layar Penuh
                  </a>
                </div>
                <div className="w-full h-[620px] bg-gray-100 border-2 border-primary-dark overflow-hidden relative shadow-inner">
                  <iframe
                    src={`${article.file_url}#view=FitH&toolbar=1`}
                    title={`PDF Viewer - ${article.title}`}
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* RELATED ARTICLES SECTION (Sesuai "Related Article" Indonara) */}
            {/* ===================================================================== */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
                <div className="flex items-center gap-2">
                  <Newspaper size={18} className="text-primary-dark" />
                  <h3 className="font-black text-sm uppercase text-primary-dark tracking-tight">
                    Artikel Terkait & Anda Mungkin Menyukai
                  </h3>
                </div>
                <Link to="/berita" className="text-xs font-bold text-primary-dark hover:text-secondary-dark flex items-center gap-1">
                  Lihat Semua <ChevronRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {displayRelated.map((item) => (
                  <Link
                    key={item.id}
                    to={`/berita/${item.slug}`}
                    className="group flex flex-col bg-gray-50 border border-gray-200 hover:border-primary-dark transition-all h-full"
                  >
                    {item.image_url ? (
                      <div className="h-32 overflow-hidden bg-gray-200">
                        <img
                          src={`${item.image_url}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-primary-dark/10 flex items-center justify-center">
                        <Newspaper size={24} className="text-primary-dark/40" />
                      </div>
                    )}
                    <div className="p-3 flex flex-col flex-grow space-y-2">
                      <span className="text-[10px] font-black uppercase text-secondary-dark">
                        {item.category === 'publikasi' ? 'Publikasi' : item.category === 'modul' ? 'Modul' : 'Berita'}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-primary-dark line-clamp-2 leading-snug flex-grow">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </main>

          {/* ======================================================================= */}
          {/* RIGHT / SIDEBAR COLUMN (approx 32% - Sesuai Sidebar Indonara) */}
          {/* ======================================================================= */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            
            {/* FAST DOWNLOAD CARD (Jika Ada Berkas PDF) */}
            {article.file_url && (
              <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-3">
                <span className="text-[11px] font-black uppercase text-primary-dark flex items-center gap-1.5 border-b border-gray-200 pb-2">
                  <Download size={15} className="text-secondary-dark" /> Berkas Naskah Lengkap
                </span>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Tersedia dokumen naskah lengkap format PDF untuk diunduh dan dipelajari.
                </p>
                <a
                  href={`${article.file_url}`}
                  download
                  onClick={handleDownload}
                  className="flex justify-center items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-4 py-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all w-full text-center"
                >
                  <Download size={16} /> Unduh Full-Text (PDF)
                </a>
              </div>
            )}

            {/* WIDGET 1: POPULAR & RECENT POSTS (Gaya Bilah Sisi Indonara) */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-primary-dark pb-2">
                <Flame size={18} className="text-red-500" />
                <h3 className="font-black text-xs uppercase tracking-wider text-primary-dark">
                  Berita Terpopuler
                </h3>
              </div>

              <div className="space-y-3">
                {popularArticles.map((item, idx) => (
                  <Link
                    key={item.id}
                    to={`/berita/${item.slug}`}
                    className="flex items-start gap-3 group pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-dark text-secondary font-black text-xs flex items-center justify-center shrink-0 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-secondary-dark line-clamp-2 leading-snug transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Eye size={10} /> {item.views_count || 1}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* WIDGET 2: KATEGORI & RUBRIK */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-5 space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-primary-dark border-b-2 border-primary-dark pb-2">
                Rubrik Publikasi
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/berita"
                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-yellow-50 text-xs font-bold text-primary-dark border border-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">📰 Berita KKN</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  to="/berita"
                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-yellow-50 text-xs font-bold text-primary-dark border border-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">📑 Publikasi Ilmiah</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  to="/berita"
                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-yellow-50 text-xs font-bold text-primary-dark border border-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">📚 Modul & Buku Saku</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              </div>
            </div>

            {/* WIDGET 3: TENTANG KKN DESA CIASIHAN */}
            <div className="bg-primary-dark text-white border-2 border-primary-dark shadow-hard p-5 space-y-3">
              <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-wider">
                <MapPin size={15} /> KKN UNUSIA Kelompok 07
              </div>
              <h4 className="font-black text-sm uppercase text-secondary tracking-tight">
                KKN Vidya Vardhana
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-normal">
                Mengabdi di Desa Ciasihan, Kec. Pamijahan, Kab. Bogor, Jawa Barat. Membawa semangat pendidikan, inovasi digital, dan pemberdayaan masyarakat.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all mt-2"
              >
                Lihat Profil Desa <ChevronRight size={13} />
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
