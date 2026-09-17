import { Link } from 'react-router-dom';
import { 
  Share2, 
  Trash2, 
  Play, 
  Save, 
  Pencil,
  ExternalLink 
} from 'lucide-react';
import CustomSelect from '../CustomSelect';

export default function SocialMediaTab({
  socialLinksList,
  socialForm,
  setSocialForm,
  handleSaveSocialLink,
  handleDeleteSocialLink,
  socialActionMsg,
  mediaList,
  mediaForm,
  handleMediaFormChange,
  handleSaveMedia,
  handleStartEditMedia,
  editingMediaId,
  savingMedia,
  handleDeleteMedia,
  mediaActionMsg
}) {
  return (
    <div className="space-y-10">
      {/* Kelola Medsos Resmi */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
        <div className="border-b-2 border-primary-dark pb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
            <Share2 size={22} /> Akun Media Sosial Resmi KKN
          </h2>
          <Link to="/media" target="_blank" className="text-xs font-bold text-primary-dark underline">
            Lihat Halaman Media ↗
          </Link>
        </div>

        {socialActionMsg.message && (
          <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
            socialActionMsg.type === 'success' ? 'bg-green-50 text-accent-dark' : 'bg-red-50 text-red-600'
          }`}>
            <span>{socialActionMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveSocialLink} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Platform *</label>
              <CustomSelect
                value={socialForm.platform}
                onChange={(val) => setSocialForm({ ...socialForm, platform: val })}
                options={[
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'other', label: 'Lainnya' }
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Username / Handle *</label>
              <input
                type="text"
                value={socialForm.username_handle}
                onChange={(e) => setSocialForm({ ...socialForm, username_handle: e.target.value })}
                required
                placeholder="@kkn_vidyavardhana"
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">URL Profil *</label>
              <input
                type="url"
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                required
                placeholder="https://instagram.com/..."
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Tambahkan Akun Medsos
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-blue text-white uppercase">
                <th className="p-2.5 border-2 border-primary-dark">Platform</th>
                <th className="p-2.5 border-2 border-primary-dark">Handle</th>
                <th className="p-2.5 border-2 border-primary-dark">URL</th>
                <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {socialLinksList.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2.5 border-2 border-primary-dark font-bold uppercase">{s.platform}</td>
                  <td className="p-2.5 border-2 border-primary-dark font-bold">{s.username_handle}</td>
                  <td className="p-2.5 border-2 border-primary-dark truncate max-w-xs">{s.url}</td>
                  <td className="p-2.5 border-2 border-primary-dark text-center">
                    <button
                      onClick={() => handleDeleteSocialLink(s.id)}
                      className="p-1.5 bg-red-600 text-white border border-primary-dark"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kelola Video Embed Autoplay */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
        <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
          <Play size={22} /> Kelola Video Tersemat (Autoplay)
        </h2>

        {mediaActionMsg.message && (
          <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
            mediaActionMsg.type === 'success' ? 'bg-green-50 text-accent-dark' : 'bg-red-50 text-red-600'
          }`}>
            <span>{mediaActionMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveMedia} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Judul Video *</label>
              <input
                type="text"
                name="title"
                value={mediaForm.title}
                onChange={handleMediaFormChange}
                required
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Platform *</label>
              <CustomSelect
                value={mediaForm.platform}
                onChange={(val) => handleMediaFormChange({ target: { name: 'platform', value: val } })}
                options={[
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'other', label: 'Lainnya' }
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Urutan</label>
              <input
                type="number"
                name="display_order"
                value={mediaForm.display_order}
                onChange={handleMediaFormChange}
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">URL Video *</label>
              <input
                type="url"
                name="url"
                value={mediaForm.url}
                onChange={handleMediaFormChange}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Caption</label>
              <textarea
                name="caption"
                rows={2}
                value={mediaForm.caption}
                onChange={handleMediaFormChange}
                className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-300">
              <input
                type="checkbox"
                id="is_autoplay"
                name="is_autoplay"
                checked={mediaForm.is_autoplay === 1}
                onChange={handleMediaFormChange}
                className="w-4 h-4"
              />
              <label htmlFor="is_autoplay" className="text-xs font-bold text-primary-dark">
                Putar Otomatis (Autoplay Video)
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingMedia}
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Save size={14} /> {editingMediaId ? 'Perbarui Media' : 'Simpan Media Baru'}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-blue text-white uppercase">
                <th className="p-2.5 border-2 border-primary-dark">Platform</th>
                <th className="p-2.5 border-2 border-primary-dark">Judul</th>
                <th className="p-2.5 border-2 border-primary-dark">URL</th>
                <th className="p-2.5 border-2 border-primary-dark text-center">Autoplay</th>
                <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2.5 border-2 border-primary-dark font-bold uppercase">{item.platform}</td>
                  <td className="p-2.5 border-2 border-primary-dark font-bold">{item.title}</td>
                  <td className="p-2.5 border-2 border-primary-dark truncate max-w-xs">{item.url}</td>
                  <td className="p-2.5 border-2 border-primary-dark text-center font-bold">
                    {item.is_autoplay === 1 ? 'Ya' : 'Tidak'}
                  </td>
                  <td className="p-2.5 border-2 border-primary-dark text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEditMedia(item)}
                        className="p-1.5 bg-yellow-400 border border-primary-dark"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 bg-red-600 text-white border border-primary-dark"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
