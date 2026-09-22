import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  MessageCircle, 
  Share2, 
  Navigation,
  Video
} from 'lucide-react';
import { DEFAULT_FOOTER_DATA } from '../utils/footerDefaults';
import AbstractGeometric from './AbstractGeometric';

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
  </svg>
);

// Helper ikon media sosial berdasarkan platform
const renderSocialIcon = (platform) => {
  const p = String(platform || '').toLowerCase();
  if (p.includes('instagram')) return <InstagramIcon size={16} />;
  if (p.includes('youtube')) return <YoutubeIcon size={16} />;
  if (p.includes('tiktok')) return <Video size={16} />;
  if (p.includes('whatsapp') || p.includes('wa')) return <MessageCircle size={16} />;
  return <Share2 size={16} />;
};

export default function Footer() {
  const [data, setData] = useState(DEFAULT_FOOTER_DATA);
  const [logoUrl, setLogoUrl] = useState('');

  const fetchFooterData = async () => {
    try {
      const res = await axios.get('/api/footer-info');
      if (res && res.data && typeof res.data === 'object') {
        setData(prev => ({
          ...prev,
          ...res.data,
          quick_links: Array.isArray(res.data.quick_links) ? res.data.quick_links : prev.quick_links,
          social_links: Array.isArray(res.data.social_links) ? res.data.social_links : prev.social_links
        }));
        if (res.data.logo_url) {
          setLogoUrl(res.data.logo_url);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data footer dinamis, menggunakan fallback:', err?.message);
    }
  };

  useEffect(() => {
    fetchFooterData();

    // Listener jika data footer di-update dari dashboard admin
    const handleFooterUpdate = (e) => {
      if (e?.detail) {
        setData(prev => ({
          ...prev,
          ...e.detail,
          quick_links: Array.isArray(e.detail.quick_links) ? e.detail.quick_links : prev.quick_links,
          social_links: Array.isArray(e.detail.social_links) ? e.detail.social_links : prev.social_links
        }));
      } else {
        fetchFooterData();
      }
    };

    // Listener jika logo website diubah di profil
    const handleLogoUpdate = (e) => {
      if (e?.detail?.logo_url) {
        setLogoUrl(e.detail.logo_url);
      }
    };

    window.addEventListener('footerUpdated', handleFooterUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('footerUpdated', handleFooterUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  const effectiveLogo = logoUrl || data.logo_url;
  const quickLinks = Array.isArray(data.quick_links) ? data.quick_links : DEFAULT_FOOTER_DATA.quick_links;
  const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];

  return (
    <footer className="bg-primary-dark text-white border-t-4 border-secondary-dark relative overflow-hidden mt-auto">
      {/* Subtle Background Accent Pattern */}
      <AbstractGeometric className="text-white" opacity="opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-yellow opacity-5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Kolom 1: Identitas, Brand & Deskripsi KKN (Col Span: 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              {effectiveLogo ? (
                <img
                  src={effectiveLogo}
                  alt={data.brand_title || 'Logo'}
                  className="w-10 h-10 object-contain bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] p-0.5"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-yellow text-primary-dark font-black text-xl flex items-center justify-center border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  K
                </div>
              )}
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight uppercase group-hover:text-secondary-light transition-colors">
                {data.brand_title || 'KKN Vidya Vardhana'}
              </span>
            </Link>

            {data.brand_tagline && (
              <div className="inline-block bg-primary-light/20 text-secondary-light border border-secondary-dark/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                {data.brand_tagline}
              </div>
            )}

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-normal">
              {data.about_text || DEFAULT_FOOTER_DATA.about_text}
            </p>

            {/* Media Sosial Resmi KKN */}
            {Number(data.show_social_links) === 1 && socialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Media Sosial Resmi:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id || s.platform + s.url}
                      href={s.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/70 hover:bg-secondary hover:text-primary-dark border border-blue-700/60 hover:border-secondary-dark transition-all duration-150 text-xs font-semibold shadow-sm"
                      title={`${s.platform}: ${s.username_handle || s.url}`}
                    >
                      {renderSocialIcon(s.platform)}
                      <span className="capitalize">{s.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom 2: Navigasi Cepat / Navbar Bawah (Col Span: 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-heading font-black text-secondary-light uppercase tracking-wider flex items-center gap-2 border-b border-blue-900 pb-2">
              <Navigation size={16} /> Navigasi Pintas
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => {
                const isInternal = link.url && link.url.startsWith('/');
                return (
                  <li key={idx}>
                    {isInternal ? (
                      <Link
                        to={link.url}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-secondary-light hover:translate-x-1 transition-all duration-150 py-0.5 group"
                      >
                        <ChevronRight size={13} className="text-secondary-dark group-hover:text-secondary-light transition-colors" />
                        <span>{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-secondary-light hover:translate-x-1 transition-all duration-150 py-0.5 group"
                      >
                        <ChevronRight size={13} className="text-secondary-dark group-hover:text-secondary-light transition-colors" />
                        <span>{link.label}</span>
                        <ExternalLink size={11} className="opacity-60" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Kolom 3: Kontak & Posko Layanan (Col Span: 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-heading font-black text-secondary-light uppercase tracking-wider flex items-center gap-2 border-b border-blue-900 pb-2">
              <MapPin size={16} /> Posko & Informasi
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              {data.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-secondary-light mt-0.5 shrink-0" />
                  <span className="leading-snug">{data.address}</span>
                </div>
              )}

              {data.operational_hours && (
                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-secondary-light mt-0.5 shrink-0" />
                  <span className="leading-snug">{data.operational_hours}</span>
                </div>
              )}

              {data.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-secondary-light shrink-0" />
                  <a
                    href={`mailto:${data.email}`}
                    className="hover:text-secondary-light hover:underline truncate transition-colors"
                  >
                    {data.email}
                  </a>
                </div>
              )}

              {data.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-secondary-light shrink-0" />
                  <a
                    href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`}
                    className="hover:text-secondary-light hover:underline transition-colors font-mono"
                  >
                    {data.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Kolom 4: Akses Lokasi & Status KKN (Col Span: 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-heading font-black text-secondary-light uppercase tracking-wider border-b border-blue-900 pb-2">
              Status Posko
            </h3>

            <div className="p-3 bg-blue-950/60 border-2 border-blue-900 shadow-sm space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 text-[11px] font-bold uppercase rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Posko Aktif
              </div>

              <p className="text-[11px] text-gray-300 leading-tight">
                Pusat pengaduan dan koordinasi kegiatan masyarakat Desa Ciasihan.
              </p>

              {Number(data.show_map_link) === 1 && data.map_url && (
                <a
                  href={data.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-secondary hover:bg-secondary-light text-primary-dark text-xs font-black uppercase py-2 px-3 border border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <MapPin size={13} /> Buka Peta Posko ↗
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Bottom Slogan */}
        <div className="border-t border-blue-900/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="text-center sm:text-left font-medium">
            {data.copyright_text || DEFAULT_FOOTER_DATA.copyright_text}
          </p>

          {data.bottom_bar_text && (
            <p className="text-center sm:text-right font-semibold text-gray-300">
              {data.bottom_bar_text}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
