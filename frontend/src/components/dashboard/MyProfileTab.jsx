import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  AlertCircle, 
  Save, 
  UserCircle,
  Briefcase,
  Wrench,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  Trash2
} from 'lucide-react';
import { convertHeicToJpgIfNeeded } from '../../utils/heicHelper';

export default function MyProfileTab({ token }) {
  const [profileForm, setProfileForm] = useState({ 
    name: '', role: '', major: '', 
    greeting: '', about_me: '', 
    contact_email: '', contact_phone: '',
    social_links: { instagram: '', linkedin: '', github: '' },
    portfolio_projects: [],
    skills_experience: [],
    testimonials: []
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convertingImage, setConvertingImage] = useState(false);

  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState('basic'); // basic, about, projects, skills, testimonials

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const safeJsonParse = (str, fallback) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch (e) { return fallback; }
  };

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
        major: data.major || '',
        greeting: data.greeting || '',
        about_me: data.about_me || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        social_links: safeJsonParse(data.social_links, { instagram: '', linkedin: '', github: '' }),
        portfolio_projects: safeJsonParse(data.portfolio_projects, []),
        skills_experience: safeJsonParse(data.skills_experience, []),
        testimonials: safeJsonParse(data.testimonials, [])
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

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [name]: value }
    }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = await convertHeicToJpgIfNeeded(e.target.files[0], setConvertingImage);
      setProfileImage(file);
    }
  };

  // Generic Array Handlers
  const addArrayItem = (field, emptyItem) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: [...prev[field], emptyItem]
    }));
  };

  const updateArrayItem = (field, index, key, value) => {
    setProfileForm(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [key]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const removeArrayItem = (field, index) => {
    setProfileForm(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
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
      formData.append('greeting', profileForm.greeting);
      formData.append('about_me', profileForm.about_me);
      formData.append('contact_email', profileForm.contact_email);
      formData.append('contact_phone', profileForm.contact_phone);
      
      formData.append('social_links', JSON.stringify(profileForm.social_links));
      formData.append('portfolio_projects', JSON.stringify(profileForm.portfolio_projects));
      formData.append('skills_experience', JSON.stringify(profileForm.skills_experience));
      formData.append('testimonials', JSON.stringify(profileForm.testimonials));

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

  if (loading) {
    return <p className="text-sm text-gray-500 italic p-6">Memuat profil...</p>;
  }

  if (actionMsg.type === 'info') {
    return (
      <div className="bg-blue-50 border-2 border-blue-600 text-blue-600 p-6 shadow-hard flex items-center gap-3">
        <AlertCircle size={24} />
        <span className="font-bold">{actionMsg.message}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary-dark pb-4">
        <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
          <UserCircle size={22} /> Kelola Profil & Portofolio Saya
        </h2>
        <button onClick={handleSave} disabled={saving}
          className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-6 py-2 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {actionMsg.message && (
        <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-green-50 border-accent-dark text-accent-dark' 
          : 'bg-red-50 border-red-600 text-red-600'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.message}</span>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'basic', label: 'Info & Kontak', icon: <UserCircle size={14} /> },
          { id: 'about', label: 'Tentang Saya', icon: <MessageSquare size={14} /> },
          { id: 'projects', label: 'Proyek / Karya', icon: <ImageIcon size={14} /> },
          { id: 'skills', label: 'Keahlian & Pengalaman', icon: <Wrench size={14} /> },
          { id: 'testimonials', label: 'Testimoni', icon: <Briefcase size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-black uppercase border-2 border-primary-dark transition-all flex items-center gap-2 ${
              activeSubTab === tab.id 
                ? 'bg-primary-dark text-white shadow-none translate-y-0.5' 
                : 'bg-white text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeSubTab === 'basic' && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 space-y-2">
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

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Email Kontak (Opsional)</label>
                <input type="email" name="contact_email" value={profileForm.contact_email} onChange={handleChange}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">No WhatsApp (Opsional)</label>
                <input type="text" name="contact_phone" value={profileForm.contact_phone} onChange={handleChange} placeholder="Contoh: 628123456789"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Link LinkedIn (Opsional)</label>
                <input type="url" name="linkedin" value={profileForm.social_links?.linkedin || ''} onChange={handleSocialChange}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Link Instagram (Opsional)</label>
                <input type="url" name="instagram" value={profileForm.social_links?.instagram || ''} onChange={handleSocialChange}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Link GitHub (Opsional)</label>
                <input type="url" name="github" value={profileForm.social_links?.github || ''} onChange={handleSocialChange}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'about' && (
          <div className="space-y-4">
            <div>
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Sapaan Singkat (Greeting)</label>
              <textarea name="greeting" rows="2" value={profileForm.greeting} onChange={handleChange} placeholder="Contoh: Halo! Saya Budi, desainer grafis yang suka tantangan."
                className="w-full border-2 border-primary-dark p-3 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-xs uppercase mb-1">Tentang Saya (Lengkap)</label>
              <textarea name="about_me" rows="6" value={profileForm.about_me} onChange={handleChange} placeholder="Ceritakan latar belakang, ketertarikan, dan hal yang membuat Anda unik..."
                className="w-full border-2 border-primary-dark p-3 text-sm font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
          </div>
        )}

        {activeSubTab === 'projects' && (
          <div className="space-y-6">
            <p className="text-xs text-gray-500 font-bold mb-4">Tambahkan karya atau proyek terbaik Anda (Opsional).</p>
            {profileForm.portfolio_projects.map((proj, idx) => (
              <div key={idx} className="p-4 border-2 border-primary-dark bg-gray-50 relative">
                <button onClick={() => removeArrayItem('portfolio_projects', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Judul Proyek</label>
                    <input type="text" value={proj.title} onChange={(e) => updateArrayItem('portfolio_projects', idx, 'title', e.target.value)}
                      className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Link URL (Opsional)</label>
                    <input type="url" value={proj.link} onChange={(e) => updateArrayItem('portfolio_projects', idx, 'link', e.target.value)}
                      className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase mb-1">Deskripsi Singkat</label>
                    <textarea rows="2" value={proj.description} onChange={(e) => updateArrayItem('portfolio_projects', idx, 'description', e.target.value)}
                      className="w-full border-2 border-gray-300 p-2 text-xs outline-none focus:border-primary-dark" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('portfolio_projects', { title: '', description: '', link: '' })}
              className="px-4 py-2 border-2 border-dashed border-primary-dark text-primary-dark font-bold text-xs uppercase flex items-center gap-2 hover:bg-gray-50 w-full justify-center">
              <Plus size={16} /> Tambah Proyek / Karya
            </button>
          </div>
        )}

        {activeSubTab === 'skills' && (
          <div className="space-y-6">
            <p className="text-xs text-gray-500 font-bold mb-4">Tambahkan riwayat pengalaman kerja/organisasi atau keahlian spesifik (Opsional).</p>
            {profileForm.skills_experience.map((exp, idx) => (
              <div key={idx} className="p-4 border-2 border-primary-dark bg-gray-50 relative">
                <button onClick={() => removeArrayItem('skills_experience', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Posisi / Keahlian</label>
                    <input type="text" value={exp.role} onChange={(e) => updateArrayItem('skills_experience', idx, 'role', e.target.value)}
                      className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Tempat / Institusi (Opsional)</label>
                    <input type="text" value={exp.company} onChange={(e) => updateArrayItem('skills_experience', idx, 'company', e.target.value)}
                      className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Tahun (Opsional)</label>
                    <input type="text" value={exp.year} onChange={(e) => updateArrayItem('skills_experience', idx, 'year', e.target.value)}
                      className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('skills_experience', { role: '', company: '', year: '' })}
              className="px-4 py-2 border-2 border-dashed border-primary-dark text-primary-dark font-bold text-xs uppercase flex items-center gap-2 hover:bg-gray-50 w-full justify-center">
              <Plus size={16} /> Tambah Pengalaman / Keahlian
            </button>
          </div>
        )}

        {activeSubTab === 'testimonials' && (
          <div className="space-y-6">
            <p className="text-xs text-gray-500 font-bold mb-4">Tambahkan kutipan testimoni dari dosen, rekan, atau klien (Opsional).</p>
            {profileForm.testimonials.map((testi, idx) => (
              <div key={idx} className="p-4 border-2 border-primary-dark bg-gray-50 relative">
                <button onClick={() => removeArrayItem('testimonials', idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Nama Pemberi Testimoni</label>
                      <input type="text" value={testi.name} onChange={(e) => updateArrayItem('testimonials', idx, 'name', e.target.value)}
                        className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Jabatan / Status (Opsional)</label>
                      <input type="text" value={testi.role} onChange={(e) => updateArrayItem('testimonials', idx, 'role', e.target.value)}
                        className="w-full border-2 border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Isi Testimoni</label>
                    <textarea rows="3" value={testi.content} onChange={(e) => updateArrayItem('testimonials', idx, 'content', e.target.value)}
                      className="w-full border-2 border-gray-300 p-2 text-xs outline-none focus:border-primary-dark" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('testimonials', { name: '', role: '', content: '' })}
              className="px-4 py-2 border-2 border-dashed border-primary-dark text-primary-dark font-bold text-xs uppercase flex items-center gap-2 hover:bg-gray-50 w-full justify-center">
              <Plus size={16} /> Tambah Testimoni
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
