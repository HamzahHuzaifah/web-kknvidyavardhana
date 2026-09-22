import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Music, Volume2, Sparkles, ArrowRight, VolumeX } from 'lucide-react';

export default function WelcomeAudioModal() {
  const { showModal, setShowModal, settings, startWelcomeMusic } = useAudio();

  if (!showModal || !settings) return null;

  const handleDismissWithoutMusic = () => {
    sessionStorage.setItem('kkn_welcome_dismissed', 'true');
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDF5] border-4 border-primary-dark shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 sm:p-8 relative text-center overflow-hidden">
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 translate-x-10 -translate-y-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 -translate-x-10 translate-y-10 pointer-events-none"></div>

        {/* Badge & Music Icon */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-yellow border-3 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4 rounded-full animate-bounce">
            <Music size={28} className="text-primary-dark" />
          </div>

          <span className="bg-primary-dark text-secondary-light text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-primary-dark mb-3 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} /> KKN Vidya Vardhana
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-primary-dark uppercase tracking-tight leading-tight mb-2">
            {settings.title || 'Selamat Datang di Website Resmi'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-5 max-w-sm">
            {settings.subtitle || 'Pusat informasi, dokumentasi kegiatan, dan publikasi program pengabdian masyarakat.'}
          </p>

          {/* Music Track Indicator */}
          {settings.audio_title && (
            <div className="w-full bg-white border-2 border-primary-dark p-2.5 mb-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Volume2 size={16} className="text-accent-dark shrink-0 animate-pulse" />
              <span className="truncate">Lagu: <strong className="text-primary-dark">{settings.audio_title}</strong></span>
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={startWelcomeMusic}
            className="w-full bg-gradient-yellow text-primary-dark font-black text-sm uppercase py-3.5 px-6 border-3 border-primary-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1.5 transition-all flex items-center justify-center gap-2 group tracking-wider"
          >
            <span>{settings.button_text || 'Buka Website & Putar Musik 🎵'}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Dismiss without music */}
          <button
            onClick={handleDismissWithoutMusic}
            className="mt-4 text-xs font-bold text-gray-500 hover:text-primary-dark underline flex items-center gap-1 transition-colors"
          >
            <VolumeX size={13} />
            <span>Buka website tanpa suara</span>
          </button>
        </div>

      </div>
    </div>
  );
}
