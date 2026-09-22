import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AudioContext = createContext(null);

export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function AudioProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytReadyRef = useRef(false);

  // Fetch Welcome Audio Settings on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/welcome-audio');
        const data = res.data;
        setSettings(data);

        // Check sessionStorage
        const alreadyDismissed = sessionStorage.getItem('kkn_welcome_dismissed');
        if (!alreadyDismissed && (data.is_enabled === 1 || data.is_enabled === true)) {
          setShowModal(true);
        }
      } catch (err) {
        console.error('Failed to load welcome audio settings:', err);
      }
    };

    fetchSettings();
  }, []);

  // Initialize YouTube Iframe API if source is youtube
  useEffect(() => {
    if (!settings || settings.source_type !== 'youtube') return;
    const videoId = getYouTubeVideoId(settings.audio_url);
    if (!videoId) return;

    // Load YT API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        try {
          ytPlayerRef.current = new window.YT.Player('kkn-hidden-youtube-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              loop: 1,
              playlist: videoId
            },
            events: {
              onReady: () => {
                ytReadyRef.current = true;
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                }
              }
            }
          });
        } catch (e) {
          console.warn('YT Player init error:', e);
        }
      } else {
        setTimeout(initYT, 300);
      }
    };

    initYT();

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [settings?.source_type, settings?.audio_url]);

  // Manage HTML5 Audio element
  useEffect(() => {
    if (!settings || settings.source_type === 'youtube') return;
    if (!settings.audio_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    audioRef.current.src = settings.audio_url;
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onpause = () => setIsPlaying(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [settings?.source_type, settings?.audio_url]);

  // Triggered when user clicks "Buka Website & Putar Musik" on Welcome Card
  const startWelcomeMusic = () => {
    sessionStorage.setItem('kkn_welcome_dismissed', 'true');
    setShowModal(false);

    if (!settings || (settings.is_enabled !== 1 && settings.is_enabled !== true)) return;

    if (settings.source_type === 'youtube') {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        // Retry shortly if player was still initializing
        setTimeout(() => {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.unMute();
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 800);
      }
    } else if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const togglePlay = () => {
    if (!settings) return;

    if (settings.source_type === 'youtube') {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // 1 = PLAYING
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    } else if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error(e));
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (!settings) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (settings.source_type === 'youtube') {
      if (ytPlayerRef.current) {
        if (nextMute) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
      }
    } else if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await axios.get('/api/welcome-audio');
      setSettings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AudioContext.Provider value={{
      settings,
      showModal,
      setShowModal,
      isPlaying,
      isMuted,
      startWelcomeMusic,
      togglePlay,
      toggleMute,
      refreshSettings
    }}>
      {children}
      {/* Hidden container for YouTube Background Player */}
      <div id="kkn-hidden-youtube-player" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
