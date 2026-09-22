import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Search,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  Quote,
  Building2,
  Filter
} from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Controls
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'about' | 'team' | 'village'
  const [searchMember, setSearchMember] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

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
        setTeam(teamRes.data || []);
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

  // Extract unique roles for quick filter pill
  const availableRoles = useMemo(() => {
    if (!team || team.length === 0) return ['ALL'];
    const roles = Array.from(new Set(team.map(m => m.role?.trim()).filter(Boolean)));
    return ['ALL', ...roles];
  }, [team]);

  // Filtered team members
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchSearch = member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(searchMember.toLowerCase())) ||
        (member.major && member.major.toLowerCase().includes(searchMember.toLowerCase()));
      const matchRole = selectedRoleFilter === 'ALL' || member.role?.trim().toLowerCase() === selectedRoleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [team, searchMember, selectedRoleFilter]);

  // Helper to parse mission points cleanly
  const missionPoints = useMemo(() => {
    if (!profile?.mission) return [];
    return profile.mission
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-*•\d\.\)]+\s*/, '')); // remove existing bullet/numbering
  }, [profile?.mission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 font-sans">
        <div className="bg-white border-4 border-primary-dark shadow-hard p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-dark border-t-secondary-dark rounded-full animate-spin mx-auto"></div>
          <div>
            <h4 className="text-base font-black text-primary-dark uppercase tracking-wider">Memuat Profil</h4>
            <p className="text-xs text-gray-600 font-medium mt-1">Mengambil data profil posko dan susunan tim...</p>
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
                <Sparkles size={12} className="text-primary-dark" /> KKN KELOMPOK 07 • POSKO CIASIHAN
              </span>
              <span className="hidden sm:inline-block bg-white/10 text-gray-200 text-[11px] font-bold px-3 py-1 border border-white/20 uppercase tracking-wider">
                UNUSIA JAKARTA
              </span>
            </div>

            {isAdmin && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <Settings size={15} /> Kelola Profil di Dashboard
              </Link>
            )}
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Profil Posko & Wilayah Pengabdian
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              Mengenal visi dedikasi mahasiswa KKN Vidya Vardhana UNUSIA, susunan tim pengurus, serta eksplorasi potensi kemajuan masyarakat Desa Ciasihan, Kecamatan Pamijahan, Kabupaten Bogor.
            </p>
          </div>

          {/* Key Facts Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Wilayah Mitra</span>
              <span className="text-sm font-black text-white truncate">{profile?.village_name || 'Desa Ciasihan'}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Total Tim Pengurus</span>
              <span className="text-sm font-black text-white">{team.length} Anggota</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Kecamatan / Kab.</span>
              <span className="text-sm font-black text-white truncate">Pamijahan, Bogor</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-3 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-secondary-light tracking-wider">Periode Pengabdian</span>
              <span className="text-sm font-black text-white">2026 / Angkatan KKN</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE NAVIGATION TABS ================= */}
      <div className="sticky top-16 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-4 border-primary-dark shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-primary-dark whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-primary-dark text-white shadow-hard -translate-y-0.5'
                  : 'bg-white text-primary-dark hover:bg-yellow-50'
              }`}
            >
              Semua Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-primary-dark whitespace-nowrap transition-all ${
                activeTab === 'about'
                  ? 'bg-gradient-yellow text-primary-dark shadow-hard -translate-y-0.5'
                  : 'bg-white text-primary-dark hover:bg-yellow-50'
              }`}
            >
              Tentang & Visi-Misi
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-primary-dark whitespace-nowrap transition-all ${
                activeTab === 'team'
                  ? 'bg-gradient-blue text-white shadow-hard -translate-y-0.5'
                  : 'bg-white text-primary-dark hover:bg-yellow-50'
              }`}
            >
              Struktur Tim ({team.length})
            </button>
            <button
              onClick={() => setActiveTab('village')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-primary-dark whitespace-nowrap transition-all ${
                activeTab === 'village'
                  ? 'bg-gradient-green text-white shadow-hard -translate-y-0.5'
                  : 'bg-white text-primary-dark hover:bg-yellow-50'
              }`}
            >
              Profil Desa & Peta
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">

        {/* ================= SECTION 1: TENTANG KAMI & VISI MISI ================= */}
        {(activeTab === 'all' || activeTab === 'about') && (
          <section id="section-about" className="space-y-8 animate-fade-in">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-4 border-primary-dark pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-secondary-dark flex items-center gap-1.5">
                  <Compass size={16} /> FILOSOFI & LANDASAN
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight">
                  Tentang KKN Vidya Vardhana
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase">
                Dedikasi Pengabdian Berkelanjutan
              </span>
            </div>

            {/* Asymmetrical Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column (7 cols): Main Story & Philosophy */}
              <div className="lg:col-span-7 bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-yellow text-primary-dark border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shrink-0">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-secondary-dark">
                        Makna & Identitas Nama
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-primary-dark uppercase">
                        {profile?.about_title || 'Membangun Peradaban Lewat Ilmu'}
                      </h3>
                    </div>
                  </div>

                  {/* Philosophy Quote Pill */}
                  <div className="bg-yellow-50 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 relative">
                    <Quote className="text-secondary-dark/30 absolute top-2 right-2" size={40} />
                    <p className="text-xs sm:text-sm font-bold text-gray-800 italic leading-relaxed relative z-10">
                      "Vidya Vardhana diambil dari bahasa Sansekerta yang melambangkan penumbuhan ilmu pengetahuan, pencerahan budi pekerti, dan pengabdian nyata bagi masyarakat desa."
                    </p>
                  </div>

                  {/* Story Description */}
                  <div className="text-gray-700 text-sm sm:text-base font-normal leading-relaxed whitespace-pre-line space-y-4">
                    {profile?.about_description || 'Inisiatif pengabdian mahasiswa berfokus pada kemajuan desa melalui kolaborasi tridharma perguruan tinggi.'}
                  </div>
                </div>

                {/* 3 Pillars Highlight at bottom of narrative */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t-2 border-primary-dark">
                  <div className="bg-gray-50 border-2 border-primary-dark p-3">
                    <div className="text-xs font-black text-primary-dark uppercase flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} className="text-accent-dark" /> Edukasi
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">Bimbingan literasi, modul ajar, dan workshop anak.</p>
                  </div>
                  <div className="bg-gray-50 border-2 border-primary-dark p-3">
                    <div className="text-xs font-black text-primary-dark uppercase flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} className="text-accent-dark" /> Kesehatan
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">Layanan pengobatan gratis bersama mitra LAZNAS.</p>
                  </div>
                  <div className="bg-gray-50 border-2 border-primary-dark p-3">
                    <div className="text-xs font-black text-primary-dark uppercase flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} className="text-accent-dark" /> Publikasi
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">Dokumentasi karya riset ilmiah terindeks.</p>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Visi & Misi Cards */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* VISI CARD (Prestigious Navy Accent) */}
                <div className="bg-primary-dark text-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-secondary text-primary-dark font-black text-[10px] uppercase px-2.5 py-0.5 border border-primary-dark tracking-wider">
                        Visi Strategis
                      </span>
                      <div className="p-1.5 bg-white/10 border border-white/20 text-secondary">
                        <Eye size={18} />
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-black uppercase text-white tracking-wide">
                      Visi Pengabdian
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed border-l-3 border-secondary pl-3">
                      {profile?.vision || 'Mewujudkan masyarakat Desa Ciasihan yang mandiri, berpendidikan, religius, dan berdaya saing melalui program kolaborasi berkelanjutan.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-right">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                      ★ Arah Tujuan Utama KKN
                    </span>
                  </div>
                </div>

                {/* MISI CARD (Neat Structured List) */}
                <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-accent-dark text-white font-black text-[10px] uppercase px-2.5 py-0.5 border border-primary-dark tracking-wider">
                        Misi Aksi
                      </span>
                      <div className="p-1.5 bg-yellow-100 border border-primary-dark text-primary-dark">
                        <Target size={18} />
                      </div>
                    </div>

                    <h4 className="text-xl font-black uppercase text-primary-dark tracking-wide">
                      Misi & Komitmen Program
                    </h4>

                    {/* Misi points structured nicely */}
                    {missionPoints.length > 0 ? (
                      <div className="space-y-2.5 pt-1">
                        {missionPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-medium leading-snug">
                            <span className="w-5 h-5 bg-gradient-yellow text-primary-dark border border-primary-dark font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              {idx + 1}
                            </span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                        {profile?.mission || 'Menyelenggarakan program edukasi bermutu dan memberdayakan potensi ekonomi warga lokal.'}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-gray-100 text-right">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Rencana Aksi Lapangan
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ================= SECTION 2: MEET OUR TEAM ================= */}
        {(activeTab === 'all' || activeTab === 'team') && (
          <section id="section-team" className="space-y-8 animate-fade-in">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-primary-dark pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-secondary-dark flex items-center gap-1.5">
                  <Users size={16} /> SUMBER DAYA MANUSIA
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight">
                  Susunan Tim Pengurus KKN
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="bg-primary-dark text-white text-xs font-black px-3 py-1.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                  {team.length} Anggota Terdata
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border-3 border-primary-dark shadow-hard p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, jabatan, atau jurusan..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-primary-dark text-xs font-medium placeholder-gray-500 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                <span className="text-[11px] font-black uppercase text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                  <Filter size={12} /> Filter:
                </span>
                {availableRoles.slice(0, 5).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 border-primary-dark shrink-0 transition-all ${
                      selectedRoleFilter === r
                        ? 'bg-gradient-yellow text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {r === 'ALL' ? 'Semua Peran' : r}
                  </button>
                ))}
              </div>

            </div>

            {/* Team Grid */}
            {filteredTeam.length === 0 ? (
              <div className="bg-white border-4 border-primary-dark shadow-hard p-12 text-center space-y-3">
                <p className="text-gray-500 font-bold uppercase text-sm">Tidak ada anggota tim yang cocok dengan pencarian Anda.</p>
                <button
                  onClick={() => { setSearchMember(''); setSelectedRoleFilter('ALL'); }}
                  className="bg-primary-dark text-white font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredTeam.map((member) => {
                  const memberSlug = member.slug || (member.name ? member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : member.id);
                  const isLeader = member.role && (member.role.toLowerCase().includes('ketua') || member.role.toLowerCase().includes('koordinator'));
                  
                  return (
                    <div 
                      key={member.id}
                      className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                    >
                      {/* Top decorative color strip */}
                      <div className={`h-2.5 w-full ${isLeader ? 'bg-gradient-yellow' : 'bg-gradient-blue'}`}></div>

                      <div className="p-6 flex flex-col items-center text-center space-y-4 flex-grow">
                        
                        {/* Member Photo Frame with Brutalist Shadow */}
                        <div className="relative w-36 h-36 border-3 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-100 overflow-hidden shrink-0 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                          {member.image_url ? (
                            <img 
                              src={`${member.image_url}`} 
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-blue text-white flex items-center justify-center font-black text-4xl">
                              {member.name.charAt(0)}
                            </div>
                          )}

                          {/* Member Badge Overlay */}
                          {isLeader && (
                            <div className="absolute top-1.5 right-1.5 bg-gradient-yellow text-primary-dark p-1 border border-primary-dark shadow-sm" title="Pimpinan Posko">
                              <Award size={13} />
                            </div>
                          )}
                        </div>

                        {/* Name and Role */}
                        <div className="space-y-1.5 w-full">
                          <h3 className="text-lg font-black text-primary-dark uppercase tracking-tight group-hover:text-primary-light transition-colors line-clamp-1">
                            {member.name}
                          </h3>

                          <div>
                            <span className={`inline-block text-[11px] font-black px-3 py-0.5 border border-primary-dark uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              isLeader
                                ? 'bg-gradient-yellow text-primary-dark'
                                : 'bg-primary-dark text-white'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </div>

                        {/* Major / Study Program */}
                        {member.major && (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 border border-gray-200 px-3 py-1 w-full truncate">
                            <GraduationCap size={14} className="text-secondary-dark shrink-0" />
                            <span className="truncate">{member.major}</span>
                          </div>
                        )}

                      </div>

                      {/* Card Footer: Action Button */}
                      <div className="p-4 pt-0 w-full">
                        <Link 
                          to={`/portofolio/${memberSlug}`} 
                          className="block w-full"
                        >
                          <button className="w-full bg-white hover:bg-primary-dark text-primary-dark hover:text-white border-2 border-primary-dark font-black text-xs uppercase py-2.5 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 group-btn">
                            <span>Buka Portofolio Lengkap</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </section>
        )}

        {/* ================= SECTION 3: PROFIL DESA CIASIHAN ================= */}
        {(activeTab === 'all' || activeTab === 'village') && (
          <section id="section-village" className="space-y-8 animate-fade-in">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-4 border-primary-dark pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-secondary-dark flex items-center gap-1.5">
                  <HomeIcon size={16} /> WILAYAH PENGABDIAN MITRA
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight">
                  Mengenal {profile?.village_name || 'Desa Ciasihan'}
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <MapPin size={14} className="text-red-600" /> Kecamatan Pamijahan, Kab. Bogor
              </span>
            </div>

            {/* 3 Key Statistics Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Stat 1: Populasi */}
              <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-secondary-dark tracking-wider bg-yellow-50 px-2.5 py-0.5 border border-primary-dark">
                    Demografi Penduduk
                  </span>
                  <div className="w-10 h-10 bg-gradient-yellow text-primary-dark border-2 border-primary-dark flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Users size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl sm:text-4xl font-black text-primary-dark tracking-tight">
                    {profile?.village_population || '-'}
                  </h4>
                  <p className="text-xs font-bold text-gray-600 uppercase mt-1">Total Jiwa Terdata</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">Warga masyarakat aktif di Desa Ciasihan</p>
                </div>
              </div>

              {/* Stat 2: RT/RW */}
              <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-accent-dark tracking-wider bg-emerald-50 px-2.5 py-0.5 border border-primary-dark">
                    Tata Kelola Administrasi
                  </span>
                  <div className="w-10 h-10 bg-gradient-green text-white border-2 border-primary-dark flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Building2 size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl sm:text-4xl font-black text-accent-dark tracking-tight">
                    {profile?.village_rtrw || '-'}
                  </h4>
                  <p className="text-xs font-bold text-gray-600 uppercase mt-1">Rukun Warga / Rukun Tetangga</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">Cakupan lingkungan pemukiman warga</p>
                </div>
              </div>

              {/* Stat 3: Luas Wilayah */}
              <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider bg-blue-50 px-2.5 py-0.5 border border-primary-dark">
                    Bentang Geografis
                  </span>
                  <div className="w-10 h-10 bg-gradient-blue text-white border-2 border-primary-dark flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Map size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl sm:text-4xl font-black text-primary-light tracking-tight">
                    {profile?.village_area || '-'}
                  </h4>
                  <p className="text-xs font-bold text-gray-600 uppercase mt-1">Luas Wilayah Desa</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">Potensi perkebunan, persawahan & hunian</p>
                </div>
              </div>

            </div>

            {/* Village Narrative & Overview Card */}
            <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-yellow text-primary-dark text-xs font-black px-3 py-0.5 border border-primary-dark uppercase">
                  Sekilas Wilayah
                </span>
                <h3 className="text-xl font-black text-primary-dark uppercase">
                  Profil & Karakteristik Wilayah Pengabdian
                </h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base font-normal leading-relaxed whitespace-pre-line border-l-4 border-secondary-dark pl-4">
                {profile?.village_description || 'Desa Ciasihan merupakan salah satu desa di Kecamatan Pamijahan, Kabupaten Bogor, dengan bentang alam asri di kawasan kaki Gunung Salak dan potensi perkebunan serta kearifan lokal yang tinggi.'}
              </p>
            </div>

            {/* Interactive Digital Map Console (OS Window Style) */}
            <div className="bg-white border-4 border-primary-dark shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              
              {/* Window Header Bar */}
              <div className="bg-primary-dark text-white p-3.5 sm:p-4 border-b-4 border-primary-dark flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mac/Brutalist Window Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded-full border border-black inline-block"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full border border-black inline-block"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full border border-black inline-block"></span>
                  </div>
                  <div className="h-4 w-px bg-white/20"></div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={15} className="text-secondary" /> 
                    <span>Peta Wilayah: {profile?.village_map_label || profile?.village_name || 'Desa Ciasihan, Pamijahan, Bogor'}</span>
                  </span>
                </div>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile?.village_name || 'Desa Ciasihan Pamijahan Bogor')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark text-[11px] font-black uppercase px-3 py-1.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <span>Buka di Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Iframe Frame */}
              <div className="w-full h-[460px] bg-gray-100 relative">
                {profile?.village_map_iframe && !mapSrc ? (
                  <div className="w-full h-full flex items-center justify-center p-6 text-center text-gray-600 font-bold text-sm">
                    Kode iframe Google Maps tidak dapat diparsing. Mohon cek pengaturan di dashboard.
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
                    title="Peta Interaktif Desa Ciasihan"
                  ></iframe>
                )}
              </div>

              {/* Window Footer Bar */}
              <div className="p-3 bg-yellow-50/80 border-t-2 border-primary-dark flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 font-medium">
                  📍 Posko Pengabdian Mahasiswa KKN 07 Vidya Vardhana UNUSIA
                </span>
                <span className="text-[11px] font-black uppercase text-primary-dark">
                  Kecamatan Pamijahan • Kabupaten Bogor
                </span>
              </div>

            </div>

          </section>
        )}

      </div>

    </div>
  );
}
