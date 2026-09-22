import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Music, 
  Volume2, 
  Upload, 
  Link as LinkIcon, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Check, 
  X,
  Play,
  Pause
} from 'lucide-react';
import { useAudio, getYouTubeVideoId } from '../../context/AudioContext';

const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
  </svg>
);

export default function WelcomeAudioTab({ token }) {
  const { refreshSettings, setShowModal } = useAudio();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', message: '' });

  const [form, setForm] = useState({
    is_enabled: true,
    title: 'Selamat Datang di Website Resmi',
    subtitle: 'KKN Vidya Vardhana Desa Ciasihan',
    button_text: 'Buka Website & Putar Musik 🎵',
    source_type: 'upload', // 'upload' | 'youtube' | 'url'
    audio_url: '',
    audio_title: 'Musik Sambutan'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState('');
  const [testingAudioPlaying, setTestingAudioPlaying] = useState(false);
  const [testAudioElement, setTestAudioElement] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/welcome-audio');
      const data = res.data;
      setForm({
        is_enabled: data.is_enabled === 1 || data.is_enabled === true,
        title: data.title || '',
        subtitle: data.subtitle || '',
        button_text: data.button_text || '',
        source_type: data.source_type || 'upload',
        audio_url: data.audio_url || '',
        audio_title: data.audio_title || ''
      });
      if (data.source_type !== 'youtube' && data.audio_url) {
        setPreviewAudioUrl(data.audio_url);
      }
    } catch (err) {
      console.error('Error fetching welcome audio settings:', err);
      setActionMsg({ type: 'error', message: 'Gagal memuat pengaturan musik sambutan.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        alert('Ukuran file maksimal 15MB.');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewAudioUrl(objectUrl);
      if (!form.audio_title) {
        setForm(prev => ({ ...prev, audio_title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleTestAudioToggle = () => {
    if (!previewAudioUrl) return;

    if (testingAudioPlaying && testAudioElement) {
      testAudioElement.pause();
      setTestingAudioPlaying(false);
    } else {
      const audio = new Audio(previewAudioUrl);
      audio.onended = () => setTestingAudioPlaying(false);
      audio.play().then(() => {
        setTestAudioElement(audio);
        setTestingAudioPlaying(true);
      }).catch(e => {
        console.error(e);
        alert('Gagal memutar audio pratinjau.');
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionMsg({ type: '', message: '' });

    if (testAudioElement) {
      testAudioElement.pause();
      setTestingAudioPlaying(false);
    }

    try {
      const formData = new FormData();
      formData.append('is_enabled', form.is_enabled ? 1 : 0);
      formData.append('title', form.title);
      formData.append('subtitle', form.subtitle);
      formData.append('button_text', form.button_text);
      formData.append('source_type', form.source_type);
      formData.append('audio_title', form.audio_title);
      formData.append('audio_url', form.audio_url);

      if (selectedFile) {
        formData.append('audio_file', selectedFile);
      }

      const res = await axios.post('/api/welcome-audio/edit', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setActionMsg({ type: 'success', message: res.data.message });
      if (res.data.audio_url) {
        setForm(prev => ({ ...prev, audio_url: res.data.audio_url }));
        if (form.source_type !== 'youtube') {
          setPreviewAudioUrl(res.data.audio_url);
        }
      }
      setSelectedFile(null);
      await refreshSettings();
    } catch (err) {
      console.error(err);
      setActionMsg({ 
        type: 'error', 
        message: err.response?.data?.error || 'Gagal menyimpan pengaturan.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const currentYoutubeId = form.source_type === 'youtube' ? getYouTubeVideoId(form.audio_url) : null;

  if (loading) {
    return <div className="p-8 text-center text-primary-dark font-bold">Memuat pengaturan musik sambutan...</div>;
  }

  return (
    <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
      {/* Title & Preview Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary-dark pb-4">
        <div>
          <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
            <Music size={22} className="text-accent-dark" /> Pengaturan Musik & Sambutan Web
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Atur kartu pembuka ala undangan pernikahan serta latar musik otomatis saat pengunjung pertama kali membuka web.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('kkn_welcome_dismissed');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-black px-4 py-2 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs shrink-0"
        >
          <Eye size={15} /> Uji Coba Tampilan Modal
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg.message && (
        <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
          actionMsg.type === 'success' 
            ? 'bg-green-50 border-accent-dark text-accent-dark' 
            : 'bg-red-50 border-red-600 text-red-600'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Toggle On/Off Switch */}
        <div className="bg-[#FFFDF5] border-2 border-primary-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div>
            <span className="text-sm font-black uppercase text-primary-dark block">
              Aktifkan Fitur Sambutan & Musik
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Jika dinonaktifkan, web akan langsung terbuka biasa tanpa kartu sambutan dan tanpa audio.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_enabled}
              onChange={(e) => setForm(prev => ({ ...prev, is_enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none border-2 border-primary-dark peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-primary-dark peer-checked:after:bg-white after:border-2 after:border-primary-dark after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-dark"></div>
          </label>
        </div>

        {/* Text Customization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-primary-dark mb-1">
              Judul Kartu Sambutan
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Selamat Datang di Website Resmi"
              className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-primary-dark mb-1">
              Teks Tombol Pembuka
            </label>
            <input
              type="text"
              value={form.button_text}
              onChange={(e) => setForm(prev => ({ ...prev, button_text: e.target.value }))}
              placeholder="Contoh: Buka Website & Putar Musik 🎵"
              className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-bold"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-primary-dark mb-1">
              Subjudul / Kalimat Sambutan
            </label>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Contoh: KKN Vidya Vardhana Desa Ciasihan - Inisiatif Pengabdian Mahasiswa..."
              className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-medium"
            />
          </div>
        </div>

        {/* Audio Source Selector */}
        <div className="space-y-4 pt-2">
          <label className="block text-xs font-black uppercase text-primary-dark">
            Sumber Suara / Musik Latar:
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'upload', label: 'Upload File (.mp3)', icon: <Upload size={16} /> },
              { id: 'youtube', label: 'Link YouTube', icon: <YoutubeIcon size={16} /> },
              { id: 'url', label: 'Link URL Audio', icon: <LinkIcon size={16} /> }
            ].map(tab => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setForm(prev => ({ ...prev, source_type: tab.id }))}
                className={`py-2.5 px-3 border-2 border-primary-dark text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
                  form.source_type === tab.id
                    ? 'bg-gradient-yellow text-primary-dark shadow-none translate-y-0.5'
                    : 'bg-white text-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id}</span>
              </button>
            ))}
          </div>

          {/* Option 1: File Upload */}
          {form.source_type === 'upload' && (
            <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Upload File Audio (Format: MP3, WAV, M4A, OGG - Maks. 15MB)
                </label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-primary-dark file:text-xs file:font-black file:uppercase file:bg-primary-dark file:text-white hover:file:bg-accent-dark cursor-pointer"
                />
              </div>

              {previewAudioUrl && (
                <div className="flex items-center gap-3 bg-white p-3 border-2 border-primary-dark">
                  <button
                    type="button"
                    onClick={handleTestAudioToggle}
                    className="p-2 bg-gradient-yellow border border-primary-dark text-primary-dark font-black hover:scale-105 transition-transform"
                    title={testingAudioPlaying ? 'Stop' : 'Putar Audio'}
                  >
                    {testingAudioPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-gray-700 block">
                      {selectedFile ? `File baru: ${selectedFile.name}` : `File saat ini: ${form.audio_url}`}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Klik tombol play untuk mendengarkan pratinjau audio.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option 2: YouTube Link */}
          {form.source_type === 'youtube' && (
            <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Link Video/Musik YouTube
                </label>
                <input
                  type="text"
                  value={form.audio_url}
                  onChange={(e) => setForm(prev => ({ ...prev, audio_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-mono"
                />
                <p className="text-[11px] text-gray-500 font-medium mt-1">
                  💡 Masukkan link video YouTube (misal musik instrumen atau lagu KKN). Audio akan diputar di latar belakang secara otomatis.
                </p>
              </div>

              {currentYoutubeId ? (
                <div className="flex items-center gap-3 bg-white p-2 border-2 border-green-600 text-xs font-bold text-green-700">
                  <Check size={16} />
                  <span>ID Video Valid: <code className="font-mono">{currentYoutubeId}</code></span>
                </div>
              ) : form.audio_url ? (
                <div className="flex items-center gap-2 bg-white p-2 border-2 border-red-500 text-xs font-bold text-red-600">
                  <X size={16} />
                  <span>Link YouTube tidak valid. Pastikan link lengkap seperti <code>https://www.youtube.com/watch?v=...</code></span>
                </div>
              ) : null}
            </div>
          )}

          {/* Option 3: Direct URL */}
          {form.source_type === 'url' && (
            <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Direct URL File Audio (.mp3 / .wav / .ogg)
                </label>
                <input
                  type="text"
                  value={form.audio_url}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, audio_url: e.target.value }));
                    setPreviewAudioUrl(e.target.value);
                  }}
                  placeholder="https://example.com/audio/music.mp3"
                  className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-mono"
                />
              </div>

              {previewAudioUrl && (
                <div className="flex items-center gap-3 bg-white p-3 border-2 border-primary-dark">
                  <button
                    type="button"
                    onClick={handleTestAudioToggle}
                    className="p-2 bg-gradient-yellow border border-primary-dark text-primary-dark font-black hover:scale-105 transition-transform"
                  >
                    {testingAudioPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <span className="text-xs font-bold text-gray-700">Tes Suara Direct URL</span>
                </div>
              )}
            </div>
          )}

          {/* Track Title */}
          <div>
            <label className="block text-xs font-black uppercase text-primary-dark mb-1">
              Nama Lagu / Musik (Tampil di Widget & Kartu)
            </label>
            <input
              type="text"
              value={form.audio_title}
              onChange={(e) => setForm(prev => ({ ...prev, audio_title: e.target.value }))}
              placeholder="Contoh: Instrumen Sambutan KKN Vidya Vardhana"
              className="w-full px-3 py-2 border-2 border-primary-dark text-xs outline-none focus:bg-yellow-50 font-bold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t-2 border-primary-dark flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-6 py-2.5 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Musik'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
