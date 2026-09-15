import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ArticleCard from '../components/ArticleCard';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Compass, 
  Sparkles, 
  Eye, 
  Target, 
  Users, 
  GraduationCap, 
  Home as HomeIcon, 
  Map, 
  Video, 
  Camera, 
  Radio, 
  Share2, 
  ExternalLink, 
  Play, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Layers,
  ArrowUpRight
} from 'lucide-react';

// Fix Leaflet marker icon issue in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to dynamically re-center map
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

// Helper to convert social video URLs into working embed URLs
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

  return trimmed;
}

// Animation variant matching page transition (spring stiffness 260, damping 20)
const scrollSpringVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      mass: 0.5
    }
  }
};

// Reusable Pagination Component
function PaginationControls({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, itemName = 'item' }) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t-2 border-primary-dark">
      <span className="text-xs font-bold text-gray-600 uppercase">
        Menampilkan <strong className="text-primary-dark font-black">{startItem}-{endItem}</strong> dari <strong className="text-primary-dark font-black">{totalItems}</strong> {itemName}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border-2 border-primary-dark bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 font-black text-xs border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              currentPage === pageNum
                ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                : 'bg-white text-primary-dark hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border-2 border-primary-dark bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
          title="Halaman Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  // Articles state
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articleCategory, setArticleCategory] = useState('all');
  const [articlePage, setArticlePage] = useState(1);
  const articlesPerPage = 3;

  // Profile & Team state
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [teamPage, setTeamPage] = useState(1);
  const teamPerPage = 3;

  // Media & Social state
  const [mediaList, setMediaList] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaPage, setMediaPage] = useState(1);
  const mediaPerPage = 2;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, profRes, teamRes, mediaRes, socialRes] = await Promise.all([
          axios.get('/api/articles'),
          axios.get('/api/profile-info'),
          axios.get('/api/team'),
          axios.get('/api/media'),
          axios.get('/api/social-links')
        ]);

        setArticles(artRes.data || []);
        setProfile(profRes.data || null);
        setTeam(teamRes.data || []);
        setMediaList(mediaRes.data || []);
        setSocialLinks(socialRes.data || []);
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoadingArticles(false);
        setLoadingProfile(false);
        setLoadingMedia(false);
      }
    };

    fetchData();
  }, []);

  // Filtered Articles
  const filteredArticles = articles.filter((art) => {
    if (articleCategory === 'all') return true;
    return art.category === articleCategory;
  });

  const totalArticlePages = Math.ceil(filteredArticles.length / articlesPerPage);
  const paginatedArticles = filteredArticles.slice(
    (articlePage - 1) * articlesPerPage,
    articlePage * articlesPerPage
  );

  // Paginated Media
  const totalMediaPages = Math.ceil(mediaList.length / mediaPerPage);
  const paginatedMedia = mediaList.slice(
    (mediaPage - 1) * mediaPerPage,
    mediaPage * mediaPerPage
  );

  // Paginated Team
  const totalTeamPages = Math.ceil(team.length / teamPerPage);
  const paginatedTeam = team.slice(
    (teamPage - 1) * teamPerPage,
    teamPage * teamPerPage
  );

  // Map coordinates
  const defaultPosition = [-6.6578, 106.6669];
  const position = profile && profile.village_latitude && profile.village_longitude
    ? [parseFloat(profile.village_latitude), parseFloat(profile.village_longitude)]
    : defaultPosition;

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return <Video size={18} className="text-red-600" />;
      case 'instagram':
        return <Camera size={18} className="text-pink-600" />;
      case 'tiktok':
        return <Radio size={18} className="text-black" />;
      default:
        return <Share2 size={18} className="text-primary-dark" />;
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

  return (
    <div className="bg-gray-50 min-h-screen pb-20 space-y-24 overflow-x-hidden">
      {/* 1. HERO SECTION (TOP) */}
      <Hero
        location="Desa Ciasihan, Pamijahan"
        titleLine1="Selamat Datang di Website"
        titleLine2="KKN Vidya Vardhana"
        description="Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan."
        ctaText="Jelajahi Program"
      />

      {/* =========================================================================
          2. HALAMAN PROFIL (TENTANG KAMI, TIM PENGURUS, PROFIL DESA & PETA)
      ========================================================================= */}
      <motion.section 
        id="profil" 
        className="max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        variants={scrollSpringVariant}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b-4 border-primary-dark pb-4">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Tentang KKN & Wilayah Pengabdian
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-2.5">
              <Compass className="text-secondary-dark shrink-0" size={36} />
              Profil Lengkap & Wilayah
            </h2>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-dark hover:text-secondary-dark border-2 border-primary-dark bg-white px-4 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start sm:self-auto"
          >
            Buka Halaman Profil <ArrowUpRight size={15} />
          </Link>
        </div>

        {loadingProfile ? (
          <div className="flex justify-center items-center h-48 bg-white border-2 border-primary-dark shadow-hard">
            <div className="animate-spin w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Tentang Kami & Visi Misi */}
            <motion.div 
              className="bg-white border-2 border-primary-dark shadow-hard p-6 sm:p-8 relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={scrollSpringVariant}
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-yellow rounded-full mix-blend-multiply opacity-40 -mr-12 -mt-12 pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-blue text-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary-dark uppercase">
                      {profile?.about_title || 'Tentang KKN Vidya Vardhana'}
                    </h3>
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      Dedikasi & Semangat Pengabdian Masyarakat
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base whitespace-pre-line border-l-4 border-secondary-dark pl-4">
                  {profile?.about_description || 'Inisiatif pengabdian mahasiswa berfokus pada kemajuan desa.'}
                </p>

                {/* Visi & Misi Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-gray-50 border-2 border-primary-dark shadow-hard p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye size={20} className="text-accent-dark" />
                      <h4 className="text-base font-black text-primary-dark uppercase">Visi Kami</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                      {profile?.vision || 'Mewujudkan desa berdaya saing dan mandiri.'}
                    </p>
                  </div>

                  <div className="bg-gray-50 border-2 border-primary-dark shadow-hard p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} className="text-secondary-dark" />
                      <h4 className="text-base font-black text-primary-dark uppercase">Misi Kami</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                      {profile?.mission || 'Menyelenggarakan program edukasi dan pemberdayaan terpadu.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Meet Our Team (With Pagination) */}
            <motion.div 
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={scrollSpringVariant}
            >
              <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
                <div className="flex items-center gap-2">
                  <Users size={24} className="text-secondary-dark" />
                  <h3 className="text-2xl font-black text-primary-dark uppercase">
                    Meet Our Team (Pengurus KKN)
                  </h3>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {team.length} Anggota
                </span>
              </div>

              {team.length === 0 ? (
                <div className="bg-white border-2 border-primary-dark p-6 text-center text-xs text-gray-500 italic">
                  Susunan pengurus belum ditambahkan.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {paginatedTeam.map((member) => (
                      <div 
                        key={member.id}
                        className="bg-white border-2 border-primary-dark shadow-hard p-5 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform"
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-yellow"></div>
                        <div className="w-24 h-24 my-3 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 overflow-hidden">
                          {member.image_url ? (
                            <img 
                              src={`${member.image_url}`} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-blue text-white flex items-center justify-center font-black text-2xl">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="text-base font-black text-primary-dark uppercase tracking-tight mb-1">
                          {member.name}
                        </h4>
                        <span className="bg-gradient-yellow text-primary-dark text-[11px] font-black px-2 py-0.5 border border-primary-dark uppercase mb-1">
                          {member.role}
                        </span>
                        {member.major && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                            <GraduationCap size={13} className="text-secondary-dark" />
                            <span>{member.major}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <PaginationControls
                    currentPage={teamPage}
                    totalPages={totalTeamPages}
                    onPageChange={setTeamPage}
                    totalItems={team.length}
                    itemsPerPage={teamPerPage}
                    itemName="anggota tim"
                  />
                </>
              )}
            </motion.div>

            {/* Profil Desa & Peta Wilayah */}
            <motion.div 
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={scrollSpringVariant}
            >
              <div className="border-b-2 border-primary-dark pb-2">
                <span className="text-xs font-black uppercase text-accent-dark tracking-wider">
                  Wilayah Pengabdian
                </span>
                <h3 className="text-2xl font-black text-primary-dark uppercase flex items-center gap-2">
                  <HomeIcon size={26} /> Profil {profile?.village_name || 'Desa Ciasihan'}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statistik Desa */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-primary-dark shadow-hard p-5 relative overflow-hidden">
                    <Users size={26} className="text-primary-dark mb-2" />
                    <h5 className="text-sm font-bold text-primary-dark uppercase">Populasi Penduduk</h5>
                    <p className="text-2xl font-black text-secondary-dark">{profile?.village_population || '-'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Jiwa Terdata</p>
                  </div>

                  <div className="bg-white border-2 border-primary-dark shadow-hard p-5 relative overflow-hidden">
                    <HomeIcon size={26} className="text-primary-dark mb-2" />
                    <h5 className="text-sm font-bold text-primary-dark uppercase">Wilayah RT / RW</h5>
                    <p className="text-2xl font-black text-accent-dark">{profile?.village_rtrw || '-'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Struktur Wilayah</p>
                  </div>

                  <div className="bg-white border-2 border-primary-dark shadow-hard p-5 relative overflow-hidden">
                    <Map size={26} className="text-primary-dark mb-2" />
                    <h5 className="text-sm font-bold text-primary-dark uppercase">Luas Wilayah</h5>
                    <p className="text-2xl font-black text-primary-light">{profile?.village_area || '-'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Cakupan Wilayah Desa</p>
                  </div>
                </div>

                {/* Leaflet Map */}
                <div className="lg:col-span-2 bg-white border-2 border-primary-dark shadow-hard p-2 relative flex flex-col">
                  <div className="absolute -top-3.5 -left-3.5 bg-gradient-yellow text-primary-dark font-black px-3 py-1 border-2 border-primary-dark shadow-hard z-20 text-xs uppercase">
                    Peta Interaktif: {profile?.village_name || 'Desa Ciasihan'}
                  </div>
                  <div className="h-[380px] w-full border-2 border-primary-dark relative z-10 mt-2">
                    <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <ChangeMapView coords={position} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={position}>
                        <Popup>
                          <strong className="text-xs font-bold uppercase text-primary-dark">
                            {profile?.village_map_label || 'Pusat Kegiatan Desa'}
                          </strong>
                          <br />
                          <span className="text-[11px] text-gray-600">
                            Lat: {position[0]}, Lng: {position[1]}
                          </span>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>


      {/* =========================================================================
          3. HALAMAN MEDIA (MEDSOS & VIDEO TERSEMAT DENGAN PAGINATION)
      ========================================================================= */}
      <motion.section 
        id="media" 
        className="max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        variants={scrollSpringVariant}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b-4 border-primary-dark pb-4">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Pusat Dokumentasi Digital
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-2.5">
              <Video className="text-secondary-dark shrink-0" size={36} />
              Media & Dokumentasi
            </h2>
          </div>
          <Link
            to="/media"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-dark hover:text-secondary-dark border-2 border-primary-dark bg-white px-4 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start sm:self-auto"
          >
            Buka Halaman Media <ArrowUpRight size={15} />
          </Link>
        </div>

        {loadingMedia ? (
          <div className="flex justify-center items-center h-48 bg-white border-2 border-primary-dark shadow-hard">
            <div className="animate-spin w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Saluran Media Sosial Resmi */}
            {socialLinks.length > 0 && (
              <motion.div 
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.15 }}
                variants={scrollSpringVariant}
              >
                <div className="flex items-center gap-2">
                  <Share2 size={20} className="text-secondary-dark" />
                  <h3 className="text-lg font-black text-primary-dark uppercase">
                    Saluran Media Sosial Resmi KKN
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border-2 border-primary-dark shadow-hard p-4 flex items-center justify-between group hover:-translate-y-1 transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-100 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-100 transition-colors">
                          {getPlatformIcon(s.platform)}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-500">
                            {s.platform}
                          </span>
                          <h4 className="text-sm font-black text-primary-dark group-hover:text-secondary-dark">
                            {s.username_handle || s.platform}
                          </h4>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-primary-dark group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Video & Dokumentasi Tersemat (PAGINATED) */}
            <motion.div 
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              variants={scrollSpringVariant}
            >
              <div className="flex items-center justify-between border-b-2 border-primary-dark pb-2">
                <div className="flex items-center gap-2">
                  <Play size={22} className="text-secondary-dark" />
                  <h3 className="text-xl font-black text-primary-dark uppercase">
                    Video & Cuplikan Kegiatan
                  </h3>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {mediaList.length} Konten
                </span>
              </div>

              {mediaList.length === 0 ? (
                <div className="bg-white border-2 border-primary-dark shadow-hard p-8 text-center text-gray-500 italic font-medium">
                  Belum ada video atau konten media yang ditambahkan.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {paginatedMedia.map((item) => {
                      const embedUrl = formatEmbedUrl(item.url, item.platform, item.is_autoplay);
                      const isInstagram = item.platform === 'instagram' || item.url.includes('instagram.com');

                      return (
                        <div 
                          key={item.id}
                          className="bg-white border-2 border-primary-dark shadow-hard p-6 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 border border-primary-dark ${getPlatformBadge(item.platform)}`}>
                                {item.platform}
                              </span>
                              {item.is_autoplay === 1 && (
                                <span className="bg-gradient-yellow text-primary-dark text-[10px] font-black px-2 py-0.5 border border-primary-dark uppercase flex items-center gap-1">
                                  <Sparkles size={10} /> Autoplay
                                </span>
                              )}
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-primary-dark hover:underline flex items-center gap-1"
                            >
                              Sumber <ExternalLink size={12} />
                            </a>
                          </div>

                          <div className={`w-full bg-black border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${
                            isInstagram ? 'h-[440px]' : 'aspect-video'
                          }`}>
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
                                URL Video Tidak Valid
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <h4 className="text-lg font-black text-primary-dark uppercase tracking-tight mb-1">
                              {item.title}
                            </h4>
                            {item.caption && (
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-2">
                                {item.caption}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <PaginationControls
                    currentPage={mediaPage}
                    totalPages={totalMediaPages}
                    onPageChange={setMediaPage}
                    totalItems={mediaList.length}
                    itemsPerPage={mediaPerPage}
                    itemName="video dokumentasi"
                  />
                </>
              )}
            </motion.div>
          </div>
        )}
      </motion.section>


      {/* =========================================================================
          4. HALAMAN BERITA & PUBLIKASI (DENGAN FILTER & PAGINATION)
      ========================================================================= */}
      <motion.section 
        id="berita" 
        className="max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.12 }}
        variants={scrollSpringVariant}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b-4 border-primary-dark pb-4">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Update & Publikasi Terbaru
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-2.5">
              <BookOpen className="text-secondary-dark shrink-0" size={36} />
              Berita, Publikasi & Modul
            </h2>
          </div>
          <Link
            to="/berita"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-dark hover:text-secondary-dark border-2 border-primary-dark bg-white px-4 py-2 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start sm:self-auto"
          >
            Buka Halaman Berita <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'Semua Konten' },
            { id: 'berita', label: '📰 Berita & Kegiatan' },
            { id: 'publikasi', label: '📑 Riset & Publikasi' },
            { id: 'modul', label: '📚 Modul & Buku Saku' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setArticleCategory(cat.id);
                setArticlePage(1); // Reset page on category change
              }}
              className={`px-3.5 py-1.5 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                articleCategory === cat.id
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loadingArticles ? (
          <div className="flex justify-center items-center h-48 bg-white border-2 border-primary-dark shadow-hard">
            <div className="animate-spin w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full"></div>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="bg-white p-8 border-2 border-primary-dark shadow-hard text-center">
            <p className="text-gray-600 font-medium">Belum ada artikel yang dipublikasikan pada kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedArticles.map((article) => (
                <motion.div 
                  key={article.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.15 }}
                  variants={scrollSpringVariant}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>

            <PaginationControls
              currentPage={articlePage}
              totalPages={totalArticlePages}
              onPageChange={setArticlePage}
              totalItems={filteredArticles.length}
              itemsPerPage={articlesPerPage}
              itemName="artikel & publikasi"
            />
          </div>
        )}
      </motion.section>
    </div>
  );
}
