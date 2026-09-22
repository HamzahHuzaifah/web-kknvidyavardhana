import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft,
  Mail, 
  MessageCircle, 
  Globe,
  Briefcase,
  Star,
  Quote,
  ExternalLink,
  ChevronDown,
  Share2,
  Copy,
  Check,
  X,
  Send
} from 'lucide-react';

export default function PortfolioDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    window.scrollTo(0, 0);
  }, [slug]);

  const safeJsonParse = (str, fallback) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch (e) { return fallback; }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/team/${slug}/portfolio`);
      const data = response.data;
      
      data.social_links = safeJsonParse(data.social_links, {});
      data.portfolio_projects = safeJsonParse(data.portfolio_projects, []);
      data.skills_experience = safeJsonParse(data.skills_experience, []);
      data.testimonials = safeJsonParse(data.testimonials, []);
      
      setProfile(data);

      // Auto redirect to slug URL if currently on numeric ID or older slug
      if (data.slug && slug !== data.slug) {
        navigate(`/portofolio/${data.slug}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    const activeSlug = profile?.slug || slug;
    return `${window.location.origin}/portofolio/${activeSlug}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.name || 'Anggota'} | Portofolio KKN Vidya Vardhana`,
      text: `Lihat profil dan portofolio ${profile?.name || ''} (${profile?.role || ''}) di website KKN Vidya Vardhana:`,
      url: getShareUrl()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-primary-dark">Memuat data profil...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] font-sans flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-black text-primary-dark">PROFIL TIDAK DITEMUKAN</h1>
            <Link to="/" className="inline-block px-6 py-2 bg-gradient-yellow text-primary-dark font-bold border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    name, role, major, image_url, greeting, about_me, 
    contact_email, contact_phone, social_links, 
    portfolio_projects, skills_experience, testimonials
  } = profile;

  const hasProjects = portfolio_projects.length > 0;
  const hasSkills = skills_experience.length > 0;
  const hasTestimonials = testimonials.length > 0;
  
  const defaultImage = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random";
  const currentShareUrl = getShareUrl();
  const shareText = encodeURIComponent(`Lihat profil dan portofolio ${name} (${role}) di website KKN Vidya Vardhana: ${currentShareUrl}`);

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans flex flex-col">

      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Top Bar: Back Button & Share Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 font-black text-primary-dark hover:text-accent-dark bg-white px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs"
            >
              <ArrowLeft size={16} /> Kembali ke Profil Tim
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-black px-3.5 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs"
                title="Salin Tautan Profil"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-accent-dark" />
                    <span className="text-accent-dark">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Salin Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark font-black px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs"
              >
                <Share2 size={16} />
                <span>Bagikan Profil</span>
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <section className="bg-white border-4 border-primary-dark shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-gray-100 border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <img 
                  src={image_url || defaultImage} 
                  alt={name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                {greeting && <p className="text-lg md:text-xl font-bold text-gray-500 italic">"{greeting}"</p>}
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-primary-dark uppercase tracking-tight mb-2">
                    {name}
                  </h1>
                  <h2 className="text-xl md:text-2xl font-bold text-blue-600 uppercase tracking-widest inline-block bg-blue-50 px-3 py-1 border-2 border-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {role}
                  </h2>
                </div>
                {major && <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{major}</p>}
                
                {/* Social & Contact Actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                  {contact_phone && (
                    <a href={`https://wa.me/${contact_phone}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-green text-white font-black px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs">
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  )}
                  {contact_email && (
                    <a href={`mailto:${contact_email}`}
                      className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs">
                      <Mail size={16} /> Email
                    </a>
                  )}
                  {social_links.linkedin && (
                    <a href={social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-primary-dark bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all text-blue-600 font-bold text-xs uppercase flex items-center gap-1">
                      <Globe size={16} /> LinkedIn
                    </a>
                  )}
                  {social_links.instagram && (
                    <a href={social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-primary-dark bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all text-pink-600 font-bold text-xs uppercase flex items-center gap-1">
                      <Globe size={16} /> Instagram
                    </a>
                  )}
                  {social_links.github && (
                    <a href={social_links.github} target="_blank" rel="noopener noreferrer" className="p-2 border-2 border-primary-dark bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all text-gray-800 font-bold text-xs uppercase flex items-center gap-1">
                      <Globe size={16} /> GitHub
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-black px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs"
                  >
                    <Share2 size={16} /> Bagikan
                  </button>
                </div>
              </div>
            </div>
            
            {about_me && (
              <div className="mt-12 pt-8 border-t-4 border-dashed border-gray-300">
                <h3 className="text-xl font-black text-primary-dark uppercase mb-4 flex items-center gap-2">
                  <Star className="text-yellow-500" /> Tentang Saya
                </h3>
                <p className="text-gray-700 leading-relaxed font-medium text-lg whitespace-pre-line">
                  {about_me}
                </p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Skills & Experience */}
            {(hasSkills || hasTestimonials) && (
              <div className="lg:col-span-1 space-y-8">
                {hasSkills && (
                  <section className="bg-[#f0f9ff] border-4 border-blue-600 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] p-6">
                    <h3 className="text-lg font-black text-blue-900 uppercase mb-6 flex items-center gap-2 border-b-4 border-blue-200 pb-2">
                      <Briefcase size={20} /> Pengalaman & Keahlian
                    </h3>
                    <div className="space-y-6">
                      {skills_experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-blue-600 before:rounded-full before:border-2 before:border-white before:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-l-2 border-blue-200 pb-6 last:pb-0">
                          <h4 className="font-black text-primary-dark text-base uppercase leading-tight mb-1">{exp.role}</h4>
                          {exp.company && <p className="font-bold text-blue-600 text-sm">{exp.company}</p>}
                          {exp.year && <p className="text-xs font-bold text-gray-500 mt-1 bg-white inline-block px-2 py-0.5 border-2 border-gray-200">{exp.year}</p>}
                          {exp.file_url && (
                            <a href={exp.file_url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 font-bold text-[10px] uppercase hover:underline flex items-center gap-1">
                              <ExternalLink size={12} /> Lihat Sertifikat/Dokumen
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {hasTestimonials && (
                  <section className="bg-yellow-50 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)] p-6">
                    <h3 className="text-lg font-black text-yellow-900 uppercase mb-6 flex items-center gap-2 border-b-4 border-yellow-200 pb-2">
                      <Quote size={20} /> Testimoni
                    </h3>
                    <div className="space-y-6">
                      {testimonials.map((testi, idx) => (
                        <div key={idx} className="bg-white p-4 border-2 border-yellow-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-sm font-medium text-gray-700 italic mb-3">"{testi.content}"</p>
                          <div className="flex items-center gap-3 border-t-2 border-gray-100 pt-3">
                            <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center font-black text-yellow-800">
                              {testi.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-xs text-primary-dark uppercase">{testi.name}</p>
                              {testi.role && <p className="text-[10px] font-bold text-gray-500">{testi.role}</p>}
                            </div>
                          </div>
                          {testi.file_url && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <a href={testi.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-[10px] uppercase hover:underline inline-flex items-center gap-1">
                                <ExternalLink size={12} /> Lihat Lampiran
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Right Column: Portfolio Projects */}
            {hasProjects && (
              <div className={hasSkills || hasTestimonials ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <section className="bg-white border-4 border-primary-dark shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
                  <h3 className="text-2xl font-black text-primary-dark uppercase mb-8 flex items-center gap-3 border-b-4 border-primary-dark pb-4">
                    Karya & Proyek Terpilih
                  </h3>
                  
                  <div className="space-y-8">
                    {portfolio_projects.map((proj, idx) => (
                      <div key={idx} className="group border-2 border-gray-200 hover:border-primary-dark hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all p-5 md:p-6 bg-gray-50 hover:bg-white flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <h4 className="text-xl font-black text-primary-dark uppercase group-hover:text-blue-600 transition-colors">
                              {proj.title}
                            </h4>
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold text-[10px] uppercase px-3 py-1.5 border-2 border-black hover:bg-white hover:text-black transition-colors whitespace-nowrap">
                                Lihat Proyek <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {proj.description}
                          </p>
                          {proj.file_url && (
                            <div className="mt-3">
                              <a href={proj.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs uppercase hover:underline">
                                <ExternalLink size={14} /> Lihat Dokumen Lampiran
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            
          </div>
        </div>
      </main>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-4 border-primary-dark shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-primary-dark bg-gray-100 hover:bg-red-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Share2 size={22} className="text-accent-dark" />
              <h3 className="text-xl font-black text-primary-dark uppercase">Bagikan Portofolio</h3>
            </div>
            <p className="text-xs text-gray-500 font-bold mb-5">
              Bagikan profil dan karya {name} kepada rekan atau di media sosial.
            </p>

            {/* URL Box & Copy */}
            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">Tautan Portofolio</label>
              <div className="flex items-stretch border-2 border-primary-dark bg-gray-50">
                <input
                  type="text"
                  readOnly
                  value={currentShareUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-transparent outline-none select-all text-gray-800"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-primary-dark text-white px-4 text-xs font-black uppercase hover:bg-accent-dark transition-colors flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <span className="block text-[11px] font-black uppercase text-gray-600 mb-2">Kirim Cepat Lewat:</span>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black text-xs uppercase py-2.5 px-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(`Portofolio ${name} (${role}) - KKN Vidya Vardhana`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0088cc] text-white font-black text-xs uppercase py-2.5 px-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Send size={16} /> Telegram
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentShareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0A66C2] text-white font-black text-xs uppercase py-2.5 px-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Globe size={16} /> LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(`Portofolio ${name} (${role}) - KKN Vidya Vardhana`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-black text-white font-black text-xs uppercase py-2.5 px-3 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <ExternalLink size={16} /> Twitter / X
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
