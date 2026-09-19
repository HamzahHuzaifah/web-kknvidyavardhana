import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  AlertCircle, 
  Save, 
  UserCircle 
} from 'lucide-react';
import { convertHeicToJpgIfNeeded } from '../../utils/heicHelper';

export default function MyProfileTab({ token }) {
  const [profileForm, setProfileForm] = useState({ name: '', role: '', major: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convertingImage, setConvertingImage] = useState(false);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/team/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setProfileForm({
        name: data.name || '',
        role: data.role || '',
        major: data.major || ''
      });
      setCurrentImageUrl(data.image_url);
    } catch (err) {
      if (err.response?.status === 404) {
        setActionMsg({
          type: 'info',
          message: 'Profil Anda belum ditambahkan ke dalam Susunan Pengurus oleh Admin.'
        });
      } else {
        setActionMsg({
          type: 'error',
          message: 'Gagal memuat profil.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = await convertHeicToJpgIfNeeded(e.target.files[0], setConvertingImage);
      setProfileImage(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionMsg({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('role', profileForm.role);
      formData.append('major', profileForm.major);
      if (profileImage) formData.append('image', profileImage);

      const response = await axios.post('/api/team/me/edit', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setActionMsg({ type: 'success', message: response.data.message });
      fetchMyProfile();
    } catch (error) {
      setActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal memperbarui profil.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
      <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
        <UserCircle size={22} /> Kelola Profil Tim Saya
      </h2>
      <p className="text-sm text-gray-600 font-medium">
        Ubah biodata dan foto Anda yang akan tampil pada halaman "Meet Our Team".
      </p>

      {actionMsg.message && (
        <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-green-50 border-accent-dark text-accent-dark' 
          : actionMsg.type === 'info' ? 'bg-blue-50 border-blue-600 text-blue-600'
          : 'bg-red-50 border-red-600 text-red-600'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.message}</span>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 italic">Memuat profil...</p>
      ) : actionMsg.type === 'info' ? null : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-1/3 space-y-2">
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Foto Profil Saat Ini</label>
              {currentImageUrl ? (
                <img src={currentImageUrl} alt="Profile" className="w-full max-w-[200px] h-auto object-cover border-2 border-primary-dark shadow-hard" />
              ) : (
                <div className="w-full max-w-[200px] aspect-square bg-gray-100 flex items-center justify-center border-2 border-primary-dark border-dashed">
                  <span className="text-gray-400 text-xs font-bold">Belum ada foto</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*,.heic,.heif" 
                onChange={handleImageChange}
                disabled={convertingImage}
                className="w-full max-w-[200px] text-[10px] file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-bold file:bg-gray-100 hover:file:bg-gray-200 mt-2" 
              />
              {convertingImage && (
                <p className="text-[10px] font-bold text-secondary-dark uppercase animate-pulse">⏳ Mengonversi foto...</p>
              )}
            </div>

            <div className="sm:w-2/3 space-y-4">
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Nama Tampil *</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleChange} required
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Jabatan / Peran *</label>
                <input type="text" name="role" value={profileForm.role} onChange={handleChange} required
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Jurusan / Program Studi</label>
                <input type="text" name="major" value={profileForm.major} onChange={handleChange}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-6 py-3 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Perbarui Profil'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
