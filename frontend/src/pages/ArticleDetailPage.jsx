import { useState, useEffect } from 'react';
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
  Hash, 
  ShieldCheck, 
  Bookmark,
  Layers
} from 'lucide-react';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [citationFormat, setCitationFormat] = useState('apa'); // 'apa' | 'ieee' | 'harvard' | 'bibtex'
  const [citationCopied, setCitationCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  // Inject Google Scholar & Dublin Core Meta Tags
  useEffect(() => {
    if (!article) return;

    const metaTags = [];
    const addMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      metaTags.push(el);
    };

    addMeta('citation_title', article.title);
    addMeta('citation_author', article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana');
    addMeta('citation_publication_date', new Date(article.created_at).toISOString().split('T')[0]);
    addMeta('citation_publisher', article.publisher || 'KKN Vidya Vardhana');
    addMeta('citation_abstract_html_url', window.location.href);
    if (article.file_url && article.file_url.toLowerCase().endsWith('.pdf')) {
      addMeta('citation_pdf_url', `http://localhost:5000${article.file_url}`);
    }
    if (article.keywords) {
      addMeta('citation_keywords', article.keywords);
    }

    // Set page title
    document.title = `${article.title} | Portal Publikasi KKN Vidya Vardhana`;

    return () => {
      // Clean up injected meta tags when unmounting
      metaTags.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [article]);

  const fetchArticle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/articles/${slug}`);
      setArticle(res.data);

      // Track view counter
      if (res.data && res.data.id) {
        axios.post(`http://localhost:5000/api/articles/${res.data.id}/view`).then((vRes) => {
          if (vRes.data && vRes.data.views_count !== undefined) {
            setArticle((prev) => prev ? { ...prev, views_count: vRes.data.views_count } : prev);
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Artikel atau publikasi ilmiah tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!article) return;
    // Track download counter
    axios.post(`http://localhost:5000/api/articles/${article.id}/download`).then((dRes) => {
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

  // Generate Citations
  const generateCitation = () => {
    if (!article) return '';
    const author = article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana';
    const year = new Date(article.created_at).getFullYear();
    const title = article.title;
    const publisher = article.publisher || 'KKN Vidya Vardhana';
    const url = window.location.href;
    const reg = article.doi_or_reg ? ` No. ${article.doi_or_reg}.` : '';

    switch (citationFormat) {
      case 'ieee':
        return `${author}, "${title}," ${publisher}, ${year}.${reg} [Online]. Tersedia: ${url}`;
      case 'harvard':
        return `${author} (${year}) '${title}', ${publisher}.${reg} Tersedia di: ${url} (Diakses: ${new Date().toLocaleDateString('id-ID')}).`;
      case 'bibtex':
        return `@article{kkn_${article.id}_${year},\n  title={${title}},\n  author={${author}},\n  year={${year}},\n  publisher={${publisher}},\n  url={${url}}\n}`;
      case 'apa':
      default:
        return `${author}. (${year}). ${title}.${reg} ${publisher}. ${url}`;
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
        <p className="font-black text-sm uppercase text-primary-dark">Memuat naskah publikasi...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-xl mx-auto bg-white border-4 border-primary-dark shadow-hard p-8 text-center space-y-4">
          <BookOpen size={48} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black uppercase text-primary-dark">Naskah Tidak Ditemukan</h2>
          <p className="text-xs text-gray-600 font-medium">
            {error || 'Naskah publikasi atau artikel yang Anda cari tidak tersedia atau tautan telah berubah.'}
          </p>
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-5 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft size={16} /> Kembali ke Katalog Publikasi
          </Link>
        </div>
      </div>
    );
  }

  const isAcademic = article.category === 'publikasi';
  const isModule = article.category === 'modul';
  const isPdf = article.file_url && article.file_url.toLowerCase().endsWith('.pdf');

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* BREADCRUMB & BACK ACTION */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold border-b-2 border-primary-dark pb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Link to="/" className="hover:text-primary-dark underline">Beranda</Link>
            <span>/</span>
            <Link to="/berita" className="hover:text-primary-dark underline">Katalog Publikasi</Link>
            <span>/</span>
            <span className="text-primary-dark uppercase font-black">{article.category}</span>
          </div>

          <Link
            to="/berita"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark bg-white border border-primary-dark px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
          >
            <ArrowLeft size={13} /> Kembali
          </Link>
        </div>

        {/* HEADER PUBLIKASI AKADEMIK */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 md:p-8 space-y-6">
          
          {/* BADGES & OPEN ACCESS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-black uppercase px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                isAcademic
                  ? 'bg-gradient-green text-white'
                  : isModule
                  ? 'bg-gradient-yellow text-primary-dark'
                  : 'bg-gradient-blue text-white'
              }`}>
                {isAcademic ? '📑 JURNAL ILMIAH & PENGABDIAN' : isModule ? '📚 MODUL & BUKU SAKU' : '📰 KABAR & BERITA KKN'}
              </span>

              {isAcademic && (
                <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-yellow-100 text-yellow-900 border border-primary-dark flex items-center gap-1">
                  <ShieldCheck size={13} /> Open Access Peer-Reviewed
                </span>
              )}
            </div>

            {/* METRICS COUNTER */}
            <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 border border-primary-dark" title="Total Pembaca">
                <Eye size={14} className="text-primary-dark" />
                <span>{article.views_count || 1} Views</span>
              </span>
              {article.file_url && (
                <span className="flex items-center gap-1 bg-green-50 text-green-900 px-2.5 py-1 border border-green-800" title="Total Unduhan PDF">
                  <Download size={14} className="text-green-800" />
                  <span>{article.downloads_count || 0} Downloads</span>
                </span>
              )}
            </div>
          </div>

          {/* MAIN ARTICLE TITLE */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-dark uppercase tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* AUTHORS & AFFILIATIONS RIBBON */}
          <div className="bg-yellow-50/70 border-2 border-primary-dark p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary-dark">
              <GraduationCap size={16} className="text-secondary-dark" />
              <span>Penulis & Afiliasi Akademik</span>
            </div>
            <p className="text-sm font-black text-primary-dark">
              {article.authors_meta || article.author_name || 'Tim KKN Vidya Vardhana'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 font-medium pt-1">
              <span>Penerbit: <strong>{article.publisher || 'KKN Vidya Vardhana'}</strong></span>
              <span>•</span>
              <span>Publikasi: <strong>{new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              {article.doi_or_reg && (
                <>
                  <span>•</span>
                  <span className="bg-white px-2 py-0.5 border border-primary-dark font-mono text-primary-dark font-bold text-[11px]">
                    Reg: {article.doi_or_reg}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* SHARE AND QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {article.file_url && (
                <a
                  href={`http://localhost:5000${article.file_url}`}
                  download
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Download size={15} /> Unduh Full-Text (PDF)
                </a>
              )}
              {isPdf && (
                <a
                  href="#pdf-reader"
                  className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <FileText size={15} /> Baca PDF di Layar
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-bold text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all"
              >
                {linkCopied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
                {linkCopied ? 'Tersalin!' : 'Bagikan Link'}
              </button>
            </div>
          </div>
        </div>

        {/* ABSTRACT & KEYWORDS CARD (IF AVAILABLE) */}
        {(article.abstract || isAcademic) && (
          <div className="bg-white border-2 border-primary-dark shadow-hard p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-primary-dark pb-2">
              <Bookmark size={18} className="text-secondary-dark" />
              <h2 className="text-base font-black text-primary-dark uppercase">Abstrak (Abstract)</h2>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed italic bg-gray-50 p-4 border-l-4 border-primary-dark">
              {article.abstract || 'Abstrak tidak disertakan pada artikel ini.'}
            </p>

            {article.keywords && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-primary-dark flex items-center gap-1">
                  <Tag size={13} /> Kata Kunci:
                </span>
                {article.keywords.split(/[,;]+/).map((k, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-700 px-2.5 py-0.5"
                  >
                    #{k.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HOW TO CITE WIDGET */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-primary-dark pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-600" />
              <h3 className="font-black text-sm uppercase text-primary-dark">Cara Mensitasi Naskah Ini (How to Cite)</h3>
            </div>
            
            {/* Format Selector Pills */}
            <div className="flex gap-1">
              {['apa', 'ieee', 'harvard', 'bibtex'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`px-2.5 py-1 text-[10px] font-black uppercase border border-primary-dark transition-all ${
                    citationFormat === fmt
                      ? 'bg-primary-dark text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-primary-dark'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-primary-dark font-mono text-xs text-gray-800 leading-relaxed overflow-x-auto select-all">
            {generateCitation()}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyCitation}
              className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                citationCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-yellow text-primary-dark hover:translate-y-0.5 hover:shadow-none'
              }`}
            >
              {citationCopied ? <Check size={14} /> : <Copy size={14} />}
              {citationCopied ? 'Sitasi Berhasil Tersalin!' : `Salin Sitasi (${citationFormat.toUpperCase()})`}
            </button>
          </div>
        </div>

        {/* COVER IMAGE DISPLAY */}
        {article.image_url && (
          <div className="bg-white border-2 border-primary-dark shadow-hard p-3">
            <img
              src={`http://localhost:5000${article.image_url}`}
              alt={article.title}
              className="w-full max-h-[480px] object-cover border border-primary-dark"
            />
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 md:p-10 space-y-6">
          <h3 className="text-lg font-black uppercase text-primary-dark border-b-2 border-primary-dark pb-2">
            Pembahasan & Isi Dokumen
          </h3>

          <div
            className="prose max-w-none text-sm sm:text-base text-gray-800 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
          />
        </div>

        {/* IN-PAGE INTERACTIVE PDF VIEWER */}
        {isPdf && (
          <div id="pdf-reader" className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-primary-dark pb-3">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-red-600" />
                <h3 className="font-black text-sm uppercase text-primary-dark">
                  Pratinjau Naskah Lengkap (Interactive PDF Reader)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:5000${article.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-black uppercase bg-white border border-primary-dark px-2.5 py-1 hover:bg-gray-100 flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Buka Layar Penuh
                </a>
                <a
                  href={`http://localhost:5000${article.file_url}`}
                  download
                  onClick={handleDownload}
                  className="text-[11px] font-black uppercase bg-gradient-green text-white border border-primary-dark px-2.5 py-1 flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Download size={12} /> Unduh Naskah
                </a>
              </div>
            </div>

            <div className="w-full h-[680px] bg-gray-100 border-2 border-primary-dark overflow-hidden relative shadow-inner">
              <iframe
                src={`http://localhost:5000${article.file_url}#view=FitH&toolbar=1`}
                title={`PDF Viewer - ${article.title}`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
