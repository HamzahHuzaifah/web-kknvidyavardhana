import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Map, 
  Info, 
  Users, 
  Home as HomeIcon, 
  Compass, 
  Target, 
  Eye, 
  GraduationCap, 
  Settings, 
  Sparkles 
} from 'lucide-react';



export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, teamRes] = await Promise.all([
          axios.get('/api/profile-info'),
          axios.get('/api/team')
        ]);
        setProfile(profileRes.data);
        setTeam(teamRes.data);
      } catch (err) {
        console.error('Error fetching profile or team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIframeSrc = (iframeString) => {
    if (!iframeString) return null;
    const match = iframeString.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  const mapSrc = getIframeSrc(profile?.village_map_iframe) || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0125866170425!2d106.6669!3d-6.6578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69d7a224a18017%3A0xc4eb01df3f707f!2sDesa%20Ciasihan!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 font-bold text-primary-dark uppercase animate-pulse">
          Memuat data profil & susunan tim...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 space-y-16">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Title with Admin Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-primary-dark pb-6">
          <div>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider mb-2 inline-block">
              Dokumentasi & Informasi
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-primary-dark uppercase tracking-tight flex items-center gap-3">
              <Compass className="text-secondary-dark shrink-0" size={42} /> 
              Profil Lengkap
            </h1>
          </div>

          {isAdmin && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all self-start md:self-auto"
            >
              <Settings size={16} /> Kelola Profil di Dashboard
            </Link>
          )}
        </div>

        {/* ================= SECTION 1: TENTANG KAMI ================= */}
        <section className="space-y-8">
          <div className="bg-white border-2 border-primary-dark shadow-hard p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-yellow rounded-full mix-blend-multiply opacity-40 -mr-12 -mt-12 pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-blue text-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-primary-dark uppercase">
                    {profile?.about_title || 'Tentang KKN Vidya Vardhana'}
                  </h2>
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    Dedikasi & Semangat Pengabdian Masyarakat
                  </span>
                </div>
              </div>

              <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base whitespace-pre-line border-l-4 border-secondary-dark pl-4">
                {profile?.about_description || 'Inisiatif pengabdian mahasiswa berfokus pada kemajuan desa.'}
              </p>

              {/* Visi & Misi Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Visi */}
                <div className="bg-gray-50 border-2 border-primary-dark shadow-hard p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={22} className="text-accent-dark" />
                    <h3 className="text-lg font-black text-primary-dark uppercase">Visi Kami</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {profile?.vision || 'Mewujudkan desa berdaya saing dan mandiri.'}
                  </p>
                </div>

                {/* Misi */}
                <div className="bg-gray-50 border-2 border-primary-dark shadow-hard p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={22} className="text-secondary-dark" />
                    <h3 className="text-lg font-black text-primary-dark uppercase">Misi Kami</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                    {profile?.mission || 'Menyelenggarakan program edukasi dan pemberdayaan terpadu.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: MEET OUR TEAM ================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-primary-dark pb-3">
            <div>
              <span className="text-xs font-black uppercase text-secondary-dark tracking-wider">
                Struktur Organisasi
              </span>
              <h2 className="text-3xl font-black text-primary-dark uppercase flex items-center gap-2">
                <Users size={32} /> Meet Our Team
              </h2>
            </div>
            <p className="text-xs font-medium text-gray-500">
              Total Pengurus: {team.length} Anggota
            </p>
          </div>

          {team.length === 0 ? (
            <div className="bg-white border-2 border-primary-dark shadow-hard p-8 text-center">
              <p className="text-gray-500 italic font-medium">Susunan pengurus belum ditambahkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white border-2 border-primary-dark shadow-hard p-5 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-yellow"></div>

                  {/* Member Photo or Initial Avatar */}
                  <div className="w-28 h-28 my-4 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-gray-100 overflow-hidden relative">
                    {member.image_url ? (
                      <img 
                        src={`${member.image_url}`} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-blue text-white flex items-center justify-center font-black text-3xl">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-primary-dark uppercase tracking-tight mb-1">
                    {member.name}
                  </h3>

                  <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-2.5 py-0.5 border border-primary-dark uppercase mb-2">
                    {member.role}
                  </span>

                  {member.major && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <GraduationCap size={14} className="text-secondary-dark shrink-0" />
                      <span>{member.major}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= SECTION 3: PROFIL DESA ================= */}
        <section className="space-y-8">
          <div className="border-b-2 border-primary-dark pb-3">
            <span className="text-xs font-black uppercase text-accent-dark tracking-wider">
              Wilayah Pengabdian
            </span>
            <h2 className="text-3xl font-black text-primary-dark uppercase flex items-center gap-2">
              <HomeIcon size={32} /> Profil {profile?.village_name || 'Desa Ciasihan'}
            </h2>
          </div>

          <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
            <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed whitespace-pre-line">
              {profile?.village_description || 'Deskripsi wilayah desa pengabdian KKN.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3 Statistik Utama */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border-2 border-primary-dark shadow-hard p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-yellow rotate-45 transform translate-x-8 -translate-y-8"></div>
                <Users size={30} className="text-primary-dark mb-3" />
                <h4 className="text-xl font-bold text-primary-dark uppercase mb-1">Populasi Penduduk</h4>
                <p className="text-3xl font-black text-secondary-dark">{profile?.village_population || '-'}</p>
                <p className="text-xs text-gray-500 font-medium">Jiwa Terdata</p>
              </div>
              
              <div className="bg-white border-2 border-primary-dark shadow-hard p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-green rotate-45 transform translate-x-8 -translate-y-8"></div>
                <HomeIcon size={30} className="text-primary-dark mb-3" />
                <h4 className="text-xl font-bold text-primary-dark uppercase mb-1">Wilayah RT / RW</h4>
                <p className="text-3xl font-black text-accent-dark">{profile?.village_rtrw || '-'}</p>
                <p className="text-xs text-gray-500 font-medium">Struktur Wilayah Administratif</p>
              </div>

              <div className="bg-white border-2 border-primary-dark shadow-hard p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-blue rotate-45 transform translate-x-8 -translate-y-8"></div>
                <Map size={30} className="text-primary-dark mb-3" />
                <h4 className="text-xl font-bold text-primary-dark uppercase mb-1">Luas Wilayah</h4>
                <p className="text-3xl font-black text-primary-light">{profile?.village_area || '-'}</p>
                <p className="text-xs text-gray-500 font-medium">Cakupan Wilayah Desa</p>
              </div>
            </div>

            {/* Peta Wilayah Interaktif */}
            <div className="lg:col-span-2 bg-white border-2 border-primary-dark shadow-hard p-2 relative flex flex-col">
              <div className="absolute -top-3.5 -left-3.5 bg-gradient-yellow text-primary-dark font-black px-4 py-1.5 border-2 border-primary-dark shadow-hard z-20 text-xs uppercase">
                Peta Lokasi: {profile?.village_map_label || profile?.village_name || 'Desa Ciasihan'}
              </div>
              
              <div className="h-[460px] w-full border-2 border-primary-dark relative z-10 mt-2">
                {profile?.village_map_iframe && !mapSrc ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 p-4 text-center font-bold">
                    Format iframe Google Maps tidak valid. Mohon periksa kembali kode semat (embed) di pengaturan Profil.
                  </div>
                ) : (
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps"
                  ></iframe>
                )}
              </div>

              <div className="p-2 text-right">
                <span className="text-[11px] text-gray-500 font-medium">
                  {profile?.village_map_label || 'Pusat Kegiatan Desa'}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
