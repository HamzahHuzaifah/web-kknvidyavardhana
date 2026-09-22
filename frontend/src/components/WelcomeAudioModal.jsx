import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import axios from 'axios';
import { 
  X, 
  Sparkles, 
  Newspaper, 
  BookOpen, 
  FileText, 
  Music, 
  ArrowRight,
  MapPin
} from 'lucide-react';

export default function WelcomeAudioModal() {
  const { showModal, setShowModal, settings, startWelcomeMusic } = useAudio();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    axios.get('/api/profile-info').then((res) => {
      if (res.data?.logo_url) setLogoUrl(res.data.logo_url);
    }).catch(() => {});
  }, []);

  if (!showModal || !settings) return null;

  const handleDismissWithoutMusic = () => {
    sessionStorage.setItem('kkn_welcome_dismissed', 'true');
    setShowModal(false);
  };

  const buttonLabel = settings.button_text && settings.button_text !== 'Buka Website & Putar Musik 🎵'
    ? settings.button_text
    : 'Mulai Eksplorasi Website';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/85 backdrop-blur-sm animate-fade-in"
      onClick={handleDismissWithoutMusic}
    >
      {/* Modal Card with KKN Neo-Brutalist Border & Hard Shadow */}
      <div 
        className="bg-[#FFFDF5] border-4 border-primary-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full max-h-[92vh] overflow-y-auto relative text-left transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with KKN Primary Dark */}
        <div className="bg-primary-dark text-white p-3.5 sm:p-4 flex items-center justify-between border-b-4 border-primary-dark">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo KKN" 
                className="w-9 h-9 object-contain shrink-0 p-0.5 bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-yellow text-primary-dark font-black text-sm flex items-center justify-center shrink-0 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]">
                KV
              </div>
            )}

            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-secondary" /> POSKO KKN KELOMPOK 07
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide truncate">
                KKN VIDYA VARDHANA UNUSIA
              </h3>
            </div>
          </div>

          {/* Close Button (X) */}
          <button
            type="button"
            onClick={handleDismissWithoutMusic}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all shrink-0 ml-2"
            title="Tutup & Masuk Langsung"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Greeting Headline */}
          <div className="space-y-1.5">
            <span className="bg-gradient-yellow text-primary-dark text-[10px] font-black px-2.5 py-0.5 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider inline-block">
              Portal Resmi Desa Ciasihan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-primary-dark uppercase tracking-tight leading-snug">
              {settings.title || 'Selamat Datang di Portal KKN Vidya Vardhana'}
            </h2>
            <p className="text-xs text-gray-700 font-medium leading-relaxed flex items-center gap-1.5 pt-0.5">
              <MapPin size={13} className="text-red-600 shrink-0" />
              <span>Desa Ciasihan, Kecamatan Pamijahan, Kabupaten Bogor, Jawa Barat.</span>
            </p>
          </div>

          {/* 3 Informative Highlights Cards (KKN Theme) */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary-dark block">
              Jelajahi Konten & Informasi Posko:
            </span>

            {/* Item 1: Berita */}
            <div className="bg-white border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-blue text-white border-2 border-primary-dark flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <Newspaper size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase text-primary-dark">
                  Kabar & Berita Posko
                </h4>
                <p className="text-[11px] text-gray-600 font-medium leading-snug mt-0.5">
                  Liputan pengobatan gratis LAZNAS, renovasi fasilitas, dan kegiatan sosial warga desa.
                </p>
              </div>
            </div>

            {/* Item 2: Publikasi */}
            <div className="bg-white border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-green text-white border-2 border-primary-dark flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase text-primary-dark">
                  Publikasi Riset & Pengabdian
                </h4>
                <p className="text-[11px] text-gray-600 font-medium leading-snug mt-0.5">
                  Karya ilmiah terindeks Google Scholar yang dapat diunduh dan disitasi secara terbuka.
                </p>
              </div>
            </div>

            {/* Item 3: Modul */}
            <div className="bg-white border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-yellow text-primary-dark border-2 border-primary-dark flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black uppercase text-primary-dark">
                  Modul Ajar & Buku Saku
                </h4>
                <p className="text-[11px] text-gray-600 font-medium leading-snug mt-0.5">
                  Buku saku dan modul Kurikulum Merdeka bebas unduh dengan pembaca dokumen interaktif.
                </p>
              </div>
            </div>
          </div>

          {/* Audio Track Info Pill (KKN Theme) */}
          {settings.audio_title && (
            <div className="bg-yellow-50/90 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Music size={15} className="text-secondary-dark shrink-0 animate-pulse" />
                <span className="truncate text-[11px] text-gray-700 font-medium">
                  Instrumen Sambutan: <strong className="text-primary-dark">{settings.audio_title}</strong>
                </span>
              </div>
              <span className="bg-primary-dark text-secondary text-[9px] font-black uppercase px-2 py-0.5 border border-primary-dark shrink-0 shadow-sm">
                Audio Aktif
              </span>
            </div>
          )}

          {/* SINGLE ACTION BUTTON (KKN Signature Neo-Brutalist Button) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={startWelcomeMusic}
              className="w-full bg-gradient-yellow text-primary-dark font-black text-sm uppercase py-3.5 px-6 border-3 border-primary-dark shadow-hard hover:translate-y-1 hover:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-2 group tracking-wider"
            >
              <span>{buttonLabel}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
