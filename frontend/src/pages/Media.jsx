import { useState, useEffect } from 'react';
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
  Radio
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

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, socialRes] = await Promise.all([
          axios.get('/api/media'),
          axios.get('/api/social-links')
        ]);
        setMediaList(mediaRes.data);
        setSocialLinks(socialRes.data);
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

  const getPlatformBadge = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return 'bg-red-600 text-white';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white';
      case 'tiktok':
        return 'bg-black text-white';
      default:
        return 'bg-primary-dark text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 font-bold text-primary-dark uppercase animate-pulse">
          Memuat konten media & medsos...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Title with Admin Shortcut */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-primary-dark pb-6">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Pusat Dokumentasi Digital
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-3">
              <ImageIcon className="text-secondary-dark shrink-0" size={42} /> 
              Media & Medsos
            </h1>
          </div>

          {isAdmin && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start md:self-auto"
            >
              <Settings size={16} /> Kelola Media & Medsos di Dashboard
            </Link>
          )}
        </div>

        {/* ================= SECTION 1: SALURAN MEDSOS RESMI ================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-primary-dark pb-2">
            <Share2 size={24} className="text-secondary-dark" />
            <h2 className="text-2xl font-black text-primary-dark uppercase">
              Akun Media Sosial Resmi KKN
            </h2>
          </div>

          {socialLinks.length === 0 ? (
            <div className="bg-white border-2 border-primary-dark p-6 text-center text-xs font-medium text-gray-500 italic">
              Belum ada tautan media sosial yang didaftarkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-primary-dark shadow-hard p-5 flex items-center justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-100 transition-colors">
                      {getPlatformIcon(s.platform)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                        {s.platform}
                      </span>
                      <h3 className="text-sm font-black text-primary-dark group-hover:text-secondary-dark transition-colors">
                        {s.username_handle || s.platform}
                      </h3>
                    </div>
                  </div>

                  <ExternalLink size={18} className="text-primary-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ================= SECTION 2: VIDEO DOKUMENTER & KONTEN TERSEMAT ================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
            <div className="flex items-center gap-2">
              <Play size={24} className="text-secondary-dark" />
              <h2 className="text-2xl font-black text-primary-dark uppercase">
                Video & Konten Tersemat
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-500">
              {mediaList.length} Konten Tersedia
            </span>
          </div>

          {mediaList.length === 0 ? (
            <div className="bg-white border-2 border-primary-dark shadow-hard p-8 text-center text-gray-500 italic font-medium">
              Belum ada video atau konten media yang ditambahkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {mediaList.map((item) => {
                const embedUrl = formatEmbedUrl(item.url, item.platform, item.is_autoplay);
                const isInstagram = item.platform === 'instagram' || item.url.includes('instagram.com');
                const isTiktok = item.platform === 'tiktok' || item.url.includes('tiktok.com');
                const isYtShort = item.platform === 'youtube' && item.url.includes('/shorts/');
                const isVertical = isTiktok || isYtShort;

                let frameClass = '';
                if (isVertical) {
                  frameClass = 'aspect-[9/16] w-full max-w-[320px] mx-auto';
                } else if (isInstagram) {
                  frameClass = 'h-[500px] w-full max-w-[400px] mx-auto';
                } else {
                  frameClass = 'aspect-video w-full';
                }

                return (
                  <div 
                    key={item.id}
                    className="bg-white border-2 border-primary-dark shadow-hard p-6 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Decor tag */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 border border-primary-dark ${getPlatformBadge(item.platform)}`}>
                          {item.platform}
                        </span>
                        {item.is_autoplay === 1 && (
                          <span className="bg-gradient-yellow text-primary-dark text-[10px] font-black px-2 py-0.5 border border-primary-dark uppercase flex items-center gap-1">
                            <Sparkles size={11} /> Autoplay
                          </span>
                        )}
                      </div>
                      
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary-dark hover:underline flex items-center gap-1"
                        title="Buka link asli"
                      >
                        Buka Sumber <ExternalLink size={12} />
                      </a>
                    </div>

                    {/* Media Frame */}
                    <div className={`bg-black border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${frameClass}`}>
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
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          URL Media tidak valid
                        </div>
                      )}
                    </div>

                    {/* Title & Caption */}
                    <div className="mt-5 space-y-2 border-t-2 border-gray-100 pt-4">
                      <h3 className="text-xl font-black text-primary-dark uppercase tracking-tight">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                          {item.caption}
                        </p>
                      )}
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
