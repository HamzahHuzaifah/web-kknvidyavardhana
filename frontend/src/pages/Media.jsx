import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Camera, 
  Image as ImageIcon, 
  ExternalLink, 
  Play, 
  Settings, 
  Share2, 
  Sparkles,
  Radio,
  Search,
  Filter,
  Check,
  Copy,
  Film,
  Tv,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

// Helper to convert social video URLs into working embed URLs with autoplay
function formatEmbedUrl(url, platform, isAutoplay) {
  if (!url) return '';
  const trimmed = url.trim();

  // YouTube
  if (platform === 'youtube' || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    let videoId = '';
    if (trimmed.includes('youtu.be/')) {
      videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
    } else if (trimmed.includes('/shorts/')) {
      videoId = trimmed.split('/shorts/')[1]?.split('?')[0];
    } else if (trimmed.includes('watch?v=')) {
      videoId = trimmed.split('watch?v=')[1]?.split('&')[0];
    } else if (trimmed.includes('/embed/')) {
      videoId = trimmed.split('/embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      const autoplayParam = isAutoplay ? '1' : '0';
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&mute=1&playsinline=1&rel=0&loop=1&playlist=${videoId}`;
    }
  }

  // Instagram
  if (platform === 'instagram' || trimmed.includes('instagram.com')) {
    let cleanUrl = trimmed.split('?')[0].replace(/\/$/, '');
    if (!cleanUrl.endsWith('/embed')) {
      cleanUrl = `${cleanUrl}/embed`;
    }
    return cleanUrl;
  }

  // TikTok
  if (platform === 'tiktok' || trimmed.includes('tiktok.com')) {
    const videoMatch = trimmed.match(/\/video\/(\d+)/);
    if (videoMatch && videoMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${videoMatch[1]}`;
    }
  }

  // Fallback / direct embed
  return trimmed;
}

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive Filter & Search
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, socialRes] = await Promise.all([
          axios.get('/api/media'),
          axios.get('/api/social-links')
        ]);
        setMediaList(mediaRes.data || []);
        setSocialLinks(socialRes.data || []);
      } catch (err) {
        console.error('Error fetching media or social links:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return <Video size={20} className="text-red-600" />;
      case 'instagram':
        return <Camera size={20} className="text-pink-600" />;
      case 'tiktok':
        return <Radio size={20} className="text-black" />;
      default:
        return <Share2 size={20} className="text-primary-dark" />;
    }
  };

  const getPlatformCardStyle = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return {
          badge: 'bg-red-600 text-white',
          hoverBorder: 'hover:border-red-600',
          actionText: 'Tonton di YouTube'
        };
      case 'instagram':
        return {
          badge: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
          hoverBorder: 'hover:border-pink-600',
          actionText: 'Kunjungi Instagram'
        };
      case 'tiktok':
        return {
          badge: 'bg-black text-white',
          hoverBorder: 'hover:border-black',
          actionText: 'Jelajahi TikTok'
        };
      default:
        return {
          badge: 'bg-primary-dark text-white',
          hoverBorder: 'hover:border-primary-dark',
          actionText: 'Buka Saluran'
        };
    }
  };

  // Platform count helper
  const platformCounts = useMemo(() => {
    const counts = { ALL: mediaList.length };
    mediaList.forEach((m) => {
      const p = m.platform ? m.platform.toLowerCase() : 'other';
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [mediaList]);

  // Filtered media list
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchPlatform = selectedPlatform === 'ALL' || item.platform?.toLowerCase() === selectedPlatform.toLowerCase();
      const matchSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchPlatform && matchSearch;
    });
  }, [mediaList, selectedPlatform, searchQuery]);

  const handleCopyVideoUrl = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border-4 border-primary-dark shadow-hard p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full animate-spin mx-auto"></div>
          <div>
            <h4 className="text-base font-black text-primary-dark uppercase tracking-wider">Memuat Galeri</h4>
            <p className="text-xs text-gray-600 font-medium mt-1">Mengambil dokumentasi video dan saluran media sosial...</p>
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
                <Sparkles size={12} className="text-primary-dark" /> PUSAT DOKUMENTASI DIGITAL • MULTIMEDIA
              </span>
              <span className="hidden sm:inline-block bg-white/10 text-gray-200 text-[11px] font-bold px-3 py-1 border border-white/20 uppercase tracking-wider">
                POSKO CIASIHAN
              </span>
            </div>

            {isAdmin && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <Settings size={15} /> Kelola Media di Dashboard
              </Link>
            )}
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Galeri Media & Saluran Medsos
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              Arsip video dokumenter, liputan aksi pengabdian di Desa Ciasihan, serta saluran resmi komunikasi digital mahasiswa KKN Vidya Vardhana UNUSIA.
            </p>
          </div>

          {/* Key Facts Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Total Video Tersemat</span>
              <span className="text-sm font-black text-white">{mediaList.length} Konten</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Saluran Resmi</span>
              <span className="text-sm font-black text-white">{socialLinks.length} Akun Terverifikasi</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Platform Didukung</span>
              <span className="text-sm font-black text-white">YouTube, IG, TikTok</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Status Pemutaran</span>
              <span className="text-sm font-black text-white">HD Digital Player</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">

        {/* ================= SECTION 1: SALURAN MEDSOS RESMI ================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-4 border-primary-dark pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-secondary-dark flex items-center gap-1.5">
                <Share2 size={16} /> KONEKSI DIGITAL RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-primary-dark uppercase tracking-tight">
                Saluran Media Sosial KKN
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase">
              Follow & Subscribe untuk Informasi Terkini
            </span>
          </div>

          {socialLinks.length === 0 ? (
            <div className="bg-white border-4 border-primary-dark shadow-hard p-8 text-center text-sm font-medium text-gray-500 italic">
              Belum ada akun media sosial yang didaftarkan oleh admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {socialLinks.map((s) => {
                const style = getPlatformCardStyle(s.platform);
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white border-4 border-primary-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden ${style.hoverBorder}`}
                  >
                    <div className="space-y-4">
                      {/* Top platform bar */}
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 bg-gray-50 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-50 transition-colors">
                          {getPlatformIcon(s.platform)}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 border border-primary-dark tracking-wider ${style.badge}`}>
                          {s.platform}
                        </span>
                      </div>

                      {/* Username / Handle */}
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                          Akun Resmi Posko
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-primary-dark group-hover:text-primary-light transition-colors truncate">
                          {s.username_handle || s.platform}
                        </h3>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="mt-5 pt-3 border-t-2 border-gray-100 flex items-center justify-between text-xs font-black uppercase text-primary-dark group-hover:text-secondary-dark transition-colors">
                      <span>{style.actionText}</span>
                      <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= SECTION 2: VIDEO DOKUMENTER & KONTEN TERSEMAT ================= */}
        <section className="space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-primary-dark pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-secondary-dark flex items-center gap-1.5">
                <Film size={16} /> REKAM JEJAK PENGABDIAN
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight">
                Galeri Video & Konten Tersemat
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-primary-dark text-white text-xs font-black px-3 py-1.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                {mediaList.length} Video Tersemat
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border-4 border-primary-dark shadow-hard p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari video dokumenter atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-primary-dark text-xs font-medium placeholder-gray-500 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            {/* Platform Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
              <span className="text-[11px] font-black uppercase text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                <Filter size={12} /> Kategori:
              </span>
              
              <button
                onClick={() => setSelectedPlatform('ALL')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                  selectedPlatform === 'ALL'
                    ? 'bg-primary-dark text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Semua ({platformCounts.ALL || 0})
              </button>

              {platformCounts.youtube > 0 && (
                <button
                  onClick={() => setSelectedPlatform('youtube')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                    selectedPlatform === 'youtube'
                      ? 'bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  YouTube ({platformCounts.youtube})
                </button>
              )}

              {platformCounts.instagram > 0 && (
                <button
                  onClick={() => setSelectedPlatform('instagram')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                    selectedPlatform === 'instagram'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Instagram ({platformCounts.instagram})
                </button>
              )}

              {platformCounts.tiktok > 0 && (
                <button
                  onClick={() => setSelectedPlatform('tiktok')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                    selectedPlatform === 'tiktok'
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  TikTok ({platformCounts.tiktok})
                </button>
              )}
            </div>

          </div>

          {/* Media Items Display Grid */}
          {filteredMedia.length === 0 ? (
            <div className="bg-white border-4 border-primary-dark shadow-hard p-12 text-center space-y-3">
              <p className="text-gray-500 font-bold uppercase text-sm">Tidak ada video atau konten media yang cocok.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedPlatform('ALL'); }}
                className="bg-primary-dark text-white font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-sm"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {filteredMedia.map((item) => {
                const embedUrl = formatEmbedUrl(item.url, item.platform, item.is_autoplay);
                const isInstagram = item.platform?.toLowerCase() === 'instagram' || item.url?.includes('instagram.com');
                const isTiktok = item.platform?.toLowerCase() === 'tiktok' || item.url?.includes('tiktok.com');
                const isYtShort = item.platform?.toLowerCase() === 'youtube' && item.url?.includes('/shorts/');
                const isVertical = isTiktok || isYtShort;

                let frameContainerHeight = 'aspect-video w-full';
                if (isVertical) {
                  frameContainerHeight = 'aspect-[9/16] w-full max-w-[340px] mx-auto';
                } else if (isInstagram) {
                  frameContainerHeight = 'h-[520px] w-full max-w-[420px] mx-auto';
                }

                return (
                  <div 
                    key={item.id}
                    className="bg-white border-4 border-primary-dark shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden transition-all duration-300"
                  >
                    
                    {/* Top Console Bar */}
                    <div className="bg-primary-dark text-white p-3 sm:p-3.5 border-b-4 border-primary-dark flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 border border-primary-dark shadow-sm ${getPlatformCardStyle(item.platform).badge}`}>
                          {item.platform}
                        </span>
                        {item.is_autoplay === 1 && (
                          <span className="bg-gradient-yellow text-primary-dark text-[9px] font-black px-2 py-0.5 border border-primary-dark uppercase flex items-center gap-1 shadow-sm">
                            <Sparkles size={10} /> Autoplay
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyVideoUrl(item.url, item.id)}
                          className="bg-white/10 hover:bg-white text-white hover:text-primary-dark text-[10px] font-bold uppercase px-2.5 py-1 border border-white/30 transition-all flex items-center gap-1"
                          title="Salin Tautan Video"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check size={11} className="text-secondary" />
                              <span className="text-secondary">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Bagikan</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-yellow text-primary-dark text-[10px] font-black uppercase px-2.5 py-1 border border-primary-dark shadow-sm hover:translate-y-0.5 transition-all flex items-center gap-1"
                          title="Buka link asli di platform terkait"
                        >
                          <span>Sumber</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    {/* Media Player Screen Container */}
                    <div className="bg-zinc-950 p-2 sm:p-4 flex items-center justify-center border-b-4 border-primary-dark">
                      <div className={`bg-black border-2 border-zinc-800 shadow-md relative overflow-hidden ${frameContainerHeight}`}>
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={item.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            scrolling={isInstagram ? 'no' : 'auto'}
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-bold p-6 text-center space-y-2">
                            <Tv size={28} className="text-gray-500" />
                            <p>Format tautan video belum didukung untuk sematan langsung.</p>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-secondary underline"
                            >
                              Buka langsung di aplikasi
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video Info: Title & Caption */}
                    <div className="p-6 space-y-3 flex-grow flex flex-col justify-between bg-white">
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-black text-primary-dark uppercase tracking-tight leading-snug">
                          {item.title}
                        </h3>

                        {item.caption && (
                          <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line border-l-3 border-secondary-dark pl-3">
                            {item.caption}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t-2 border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                        <span>Dokumentasi Posko KKN 07</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-dark hover:text-secondary-dark flex items-center gap-1 transition-colors"
                        >
                          <span>Tonton Penuh</span>
                          <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
