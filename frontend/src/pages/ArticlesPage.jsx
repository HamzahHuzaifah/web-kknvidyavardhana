import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  BookOpen, 
  Search, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  UploadCloud, 
  ChevronRight,
  Sparkles,
  Layers,
  Eye,
  Filter,
  ArrowRight,
  Flame,
  Clock,
  ExternalLink,
  Check,
  Share2
} from 'lucide-react';

export default function ArticlesPage() {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Controls
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'berita' | 'publikasi' | 'modul'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/articles');
      setAllArticles(response.data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to strip HTML tags for clean preview
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = DOMPurify.sanitize(html);
    return tmp.textContent || tmp.innerText || '';
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allArticles.length, berita: 0, publikasi: 0, modul: 0 };
    allArticles.forEach((item) => {
      const cat = item.category?.toLowerCase() || 'berita';
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });
    return counts;
  }, [allArticles]);

  // Filtered & Sorted Articles
  const processedArticles = useMemo(() => {
    let result = allArticles.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category?.toLowerCase() === categoryFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchSearch = 
        !searchQuery ||
        item.title?.toLowerCase().includes(query) ||
        (item.author_name && item.author_name.toLowerCase().includes(query)) ||
        (item.authors_meta && item.authors_meta.toLowerCase().includes(query)) ||
        (item.keywords && item.keywords.toLowerCase().includes(query)) ||
        (item.abstract && item.abstract.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [allArticles, categoryFilter, searchQuery, sortBy]);

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'publikasi':
        return 'bg-gradient-green text-white';
      case 'modul':
        return 'bg-gradient-yellow text-primary-dark font-black';
      case 'berita':
      default:
        return 'bg-gradient-blue text-white';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'publikasi':
        return '📑 Riset & Publikasi';
      case 'modul':
        return '📚 Modul & Buku Saku';
      case 'berita':
      default:
        return '📰 Kabar Berita';
    }
  };

  const getItemUrl = (item) => {
    if (item.category === 'modul') return `/modul/${item.slug}`;
    if (item.category === 'publikasi') return `/publikasi/${item.slug}`;
    return `/berita/${item.slug}`;
  };

  // Headline article (first article if no search and on 'all' view)
  const isHeadlineView = !searchQuery && categoryFilter === 'all' && sortBy === 'newest' && processedArticles.length > 0;
  const headlineArticle = isHeadlineView ? processedArticles[0] : null;
  const standardArticles = isHeadlineView ? processedArticles.slice(1) : processedArticles;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border-4 border-primary-dark shadow-hard p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full animate-spin mx-auto"></div>
          <div>
            <h4 className="text-base font-black text-primary-dark uppercase tracking-wider">Memuat Arsip Berita</h4>
            <p className="text-xs text-gray-600 font-medium mt-1">Mengambil warta berita, publikasi, dan modul ajar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF5] min-h-screen font-sans text-gray-900 pb-24">
      
      {/* ================= HERO HEADER BANNER ================= */}
      <section className="bg-primary-dark text-white border-b-4 border-primary-dark relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric background decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          
          {/* Breadcrumb / Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-yellow text-primary-dark text-[11px] font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary-dark" /> WARTA & ARSIP DIGITAL • KKN KELOMPOK 07
              </span>
              <span className="hidden sm:inline-block bg-white/10 text-gray-200 text-[11px] font-bold px-3 py-1 border border-white/20 uppercase tracking-wider">
                DESA CIASIHAN
              </span>
            </div>

            {token && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <UploadCloud size={16} /> Upload Konten Baru
              </Link>
            )}
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Warta Berita, Riset & Modul Ajar
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              Pusat publikasi resmi Posko KKN Vidya Vardhana UNUSIA. Menghimpun liputan kegiatan sosial warga, jurnal pengabdian terindeks, dan buku saku Kurikulum Merdeka bagi kemajuan Desa Ciasihan.
            </p>
          </div>

          {/* Key Facts Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Total Publikasi Terbit</span>
              <span className="text-sm font-black text-white">{categoryCounts.all} Dokumen</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Kabar Berita</span>
              <span className="text-sm font-black text-white">{categoryCounts.berita} Liputan</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Publikasi & Riset</span>
              <span className="text-sm font-black text-white">{categoryCounts.publikasi} Naskah Ilmiah</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Modul & Buku Saku</span>
              <span className="text-sm font-black text-white">{categoryCounts.modul} Buku Tersedia</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE CONTROLS BAR ================= */}
      <div className="sticky top-16 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-4 border-primary-dark shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-primary-dark text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Semua ({categoryCounts.all})
              </button>

              <button
                onClick={() => setCategoryFilter('berita')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                  categoryFilter === 'berita'
                    ? 'bg-gradient-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📰 Berita ({categoryCounts.berita})
              </button>

              <button
                onClick={() => setCategoryFilter('publikasi')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                  categoryFilter === 'publikasi'
                    ? 'bg-gradient-green text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📑 Publikasi ({categoryCounts.publikasi})
              </button>

              <button
                onClick={() => setCategoryFilter('modul')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                  categoryFilter === 'modul'
                    ? 'bg-gradient-yellow text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📚 Modul ({categoryCounts.modul})
              </button>
            </div>

            {/* Search Input & Sort Options */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
              
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berita atau modul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-2 border-primary-dark text-xs font-medium placeholder-gray-500 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center border-2 border-primary-dark bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                    sortBy === 'newest'
                      ? 'bg-primary-dark text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Urutkan Terbaru"
                >
                  <Clock size={11} /> Terbaru
                </button>
                <div className="w-px h-4 bg-primary-dark"></div>
                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                    sortBy === 'popular'
                      ? 'bg-primary-dark text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Urutkan Paling Populer"
                >
                  <Flame size={11} /> Populer
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">

        {/* ================= HEADLINE FEATURED STORY (BENTO EDITORIAL) ================= */}
        {headlineArticle && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-yellow text-primary-dark text-[10px] font-black px-2.5 py-0.5 border border-primary-dark uppercase tracking-wider">
                Sorotan Utama
              </span>
              <span className="text-xs font-black uppercase text-primary-dark tracking-wide">
                Kabar Paling Hangat Dari Posko
              </span>
            </div>

            <div className="bg-white border-4 border-primary-dark shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 group">
              
              {/* Left Column: Image (7 cols) */}
              <div className="lg:col-span-7 aspect-video lg:aspect-auto border-b-4 lg:border-b-0 lg:border-r-4 border-primary-dark relative overflow-hidden bg-gray-100">
                {headlineArticle.image_url ? (
                  <img 
                    src={`${headlineArticle.image_url}`} 
                    alt={headlineArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-blue flex items-center justify-center text-white">
                    <FileText size={64} className="opacity-30" />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getCategoryBadge(headlineArticle.category)}`}>
                    {getCategoryLabel(headlineArticle.category)}
                  </span>
                  {headlineArticle.doi_or_reg && (
                    <span className="text-[10px] font-bold bg-white text-primary-dark px-2 py-1 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono">
                      {headlineArticle.doi_or_reg}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 border border-white/40 flex items-center gap-1.5 shadow-sm">
                  <Eye size={12} /> {headlineArticle.views_count || 0} Pembaca
                </div>
              </div>

              {/* Right Column: Narrative (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-secondary-dark" />
                      {new Date(headlineArticle.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <User size={13} className="text-secondary-dark shrink-0" />
                      <span className="truncate">{headlineArticle.authors_meta || headlineArticle.author_name || 'Tim KKN 07'}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-primary-dark uppercase tracking-tight leading-snug group-hover:text-primary-light transition-colors">
                    <Link to={getItemUrl(headlineArticle)}>
                      {headlineArticle.title}
                    </Link>
                  </h2>

                  {headlineArticle.keywords && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {headlineArticle.keywords.split(/[,;]+/).slice(0, 4).map((kw, i) => (
                        <span key={i} className="text-[10px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-800 px-2 py-0.5">
                          #{kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed line-clamp-4 pt-1">
                    {stripHtml(headlineArticle.abstract || headlineArticle.content)}
                  </p>
                </div>

                {/* Card CTA */}
                <div className="pt-4 border-t-2 border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <Link
                    to={getItemUrl(headlineArticle)}
                    className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-5 py-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    <span>Baca Liputan Lengkap</span>
                    <ArrowRight size={15} />
                  </Link>

                  {headlineArticle.file_url && (
                    <a
                      href={`${headlineArticle.file_url}`}
                      download
                      onClick={() => {
                        axios.post(`/api/articles/${headlineArticle.id}/download`).catch(() => {});
                      }}
                      className="inline-flex items-center gap-1.5 bg-gradient-green text-white font-black text-xs uppercase px-3.5 py-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                      title="Unduh Naskah / Dokumen"
                    >
                      <Download size={15} /> Unduh
                    </a>
                  )}
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ================= ARTICLES GRID ================= */}
        <section className="space-y-6">
          
          <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
            <span className="text-xs font-black uppercase text-primary-dark tracking-wider">
              {categoryFilter === 'all' ? 'Daftar Arsip & Artikel Terbaru' : `Arsip Kategori: ${getCategoryLabel(categoryFilter)}`}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {processedArticles.length} Konten Ditemukan
            </span>
          </div>

          {processedArticles.length === 0 ? (
            <div className="bg-white border-4 border-primary-dark shadow-hard p-12 text-center space-y-3">
              <p className="text-gray-500 font-bold uppercase text-sm">
                Tidak ada artikel atau naskah yang cocok dengan pencarian Anda.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                className="bg-primary-dark text-white font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-sm"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {standardArticles.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    {/* Thumbnail Frame */}
                    <div className="aspect-video w-full border-b-4 border-primary-dark bg-gray-100 relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={`${item.image_url}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-blue flex items-center justify-center text-white">
                          <FileText size={48} className="opacity-30" />
                        </div>
                      )}

                      {/* Category Badge & DOI */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getCategoryBadge(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.doi_or_reg && (
                          <span className="text-[9px] font-bold bg-white text-primary-dark px-1.5 py-0.5 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-mono">
                            {item.doi_or_reg}
                          </span>
                        )}
                      </div>

                      {/* View Counter */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 border border-white/40 shadow-sm">
                        <Eye size={11} /> {item.views_count || 0}
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-secondary-dark" />
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <User size={13} className="text-secondary-dark shrink-0" />
                          <span className="truncate">{item.authors_meta || item.author_name || 'Tim KKN'}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-primary-dark uppercase tracking-tight line-clamp-2 group-hover:text-primary-light transition-colors leading-snug">
                        <Link to={getItemUrl(item)}>{item.title}</Link>
                      </h3>

                      {/* Keywords if available */}
                      {item.keywords && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.keywords.split(/[,;]+/).slice(0, 3).map((k, i) => (
                            <span key={i} className="text-[9px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-800 px-1.5 py-0.2">
                              #{k.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Excerpt */}
                      <p className="text-xs text-gray-600 font-medium line-clamp-3 leading-relaxed">
                        {stripHtml(item.abstract || item.content)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 border-t-2 border-gray-100 mt-3 flex items-center justify-between gap-2">
                    <Link
                      to={getItemUrl(item)}
                      className="inline-flex items-center gap-1 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <span>{item.category === 'publikasi' ? 'Buka Jurnal' : item.category === 'modul' ? 'Buka Modul' : 'Baca Berita'}</span>
                      <ChevronRight size={14} />
                    </Link>

                    {item.file_url && (
                      <a
                        href={`${item.file_url}`}
                        download
                        onClick={() => {
                          axios.post(`/api/articles/${item.id}/download`).catch(() => {});
                        }}
                        className="inline-flex items-center gap-1 bg-gradient-green text-white font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                        title="Unduh Naskah / Modul"
                      >
                        <Download size={14} /> Unduh
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
