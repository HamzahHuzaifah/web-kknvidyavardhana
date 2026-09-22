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
  MapPin,
  CheckCircle2
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

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={handleDismissWithoutMusic}
    >
      {/* Modal Card (Stop propagation so clicking inside does not dismiss) */}
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden relative transition-all transform animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Decorative Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-primary to-yellow-400"></div>

        {/* Close Button (X) */}
        <button
          type="button"
          onClick={handleDismissWithoutMusic}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
          title="Tutup & Masuk Langsung"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Logo */}
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo KKN" 
                className="w-13 h-13 object-contain shrink-0 rounded-xl p-1 bg-slate-50 border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-13 h-13 rounded-xl bg-gradient-yellow text-primary-dark font-black text-xl flex items-center justify-center shrink-0 border border-amber-300 shadow-sm">
                KV
              </div>
            )}

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 text-[11px] font-bold">
                <Sparkles size={12} className="text-amber-600" />
                <span>Portal Resmi KKN Kelompok 07</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {settings.title || 'KKN Vidya Vardhana UNUSIA'}
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin size={12} className="text-rose-500 shrink-0" />
                <span>Desa Ciasihan, Kec. Pamijahan, Kab. Bogor</span>
              </p>
            </div>
          </div>

          {/* Informative Highlights Section */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Apa yang dapat Anda temukan di website ini:
            </span>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <Newspaper size={14} />
                </div>
                <div>
                  <strong className="text-slate-800">Kabar & Berita Posko:</strong>
                  <p className="text-slate-600 text-[11px]">Liputan pengobatan gratis, renovasi fasilitas, dan kegiatan sosial warga.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <FileText size={14} />
                </div>
                <div>
                  <strong className="text-slate-800">Publikasi Riset & Pengabdian:</strong>
                  <p className="text-slate-600 text-[11px]">Karya ilmiah dan dokumentasi akademis terindeks yang dapat disitasi.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <BookOpen size={14} />
                </div>
                <div>
                  <strong className="text-slate-800">Modul Pembelajaran & Dokumen:</strong>
                  <p className="text-slate-600 text-[11px]">Bahan ajar dan buku saku Kurikulum Merdeka gratis format PDF.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Track Info Pill (Subtle, informative) */}
          {settings.audio_title && (
            <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <Music size={14} className="text-amber-600 shrink-0 animate-pulse" />
                <span className="truncate text-[11px] text-slate-600">
                  Lagu Sambutan: <strong className="text-slate-900 font-semibold">{settings.audio_title}</strong>
                </span>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-medium shrink-0 ml-2">
                Audio Latar
              </span>
            </div>
          )}

          {/* SINGLE ACTION BUTTON (Clean, direct, informative) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={startWelcomeMusic}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-900 font-black text-sm uppercase py-3.5 px-6 rounded-xl border border-amber-400/80 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group tracking-wide"
            >
              <span>{settings.button_text && settings.button_text !== 'Buka Website & Putar Musik 🎵' ? settings.button_text : 'Mulai Eksplorasi Website 🎵'}</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
