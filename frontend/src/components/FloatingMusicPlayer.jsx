import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

export default function FloatingMusicPlayer() {
  const { settings, isPlaying, isMuted, togglePlay, toggleMute } = useAudio();
  const [showTooltip, setShowTooltip] = useState(false);

  // If feature is disabled by admin, don't render floating player
  if (!settings || (settings.is_enabled !== 1 && settings.is_enabled !== true)) {
    return null;
  }

  return (
    <aside 
      aria-label="Pemutar Musik Latar"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Play/Pause Disc Button */}
      <button
        onClick={togglePlay}
        title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
        className={`w-12 h-12 rounded-full border-3 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
          isPlaying 
            ? 'bg-gradient-yellow text-primary-dark' 
            : 'bg-white text-gray-700'
        }`}
      >
        <div className={`flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
          <Music size={20} />
        </div>
      </button>

      {/* Control Actions & Status */}
      <div className="flex items-center bg-white border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-2.5 py-1.5 gap-2">
        <button
          onClick={togglePlay}
          className="text-primary-dark hover:text-accent-dark transition-colors p-1"
          title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button
          onClick={toggleMute}
          className="text-primary-dark hover:text-accent-dark transition-colors p-1"
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX size={15} className="text-red-600" /> : <Volume2 size={15} />}
        </button>

        {/* Status text / Title */}
        <div className="hidden sm:flex flex-col text-left max-w-[150px] pr-1">
          <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
            {isPlaying ? 'Sedang Diputar' : 'Musik Dijeda'}
          </span>
          <span className="text-xs font-bold text-primary-dark truncate">
            {settings.audio_title || 'Musik Sambutan'}
          </span>
        </div>
      </div>

      {/* Floating Hover Tooltip on mobile / compact */}
      {showTooltip && (
        <div className="sm:hidden absolute bottom-14 left-0 bg-primary-dark text-white text-[11px] font-bold py-1 px-3 border border-secondary-light shadow-hard whitespace-nowrap z-50">
          🎵 {settings.audio_title || 'Musik Sambutan'}
        </div>
      )}
    </aside>
  );
}
