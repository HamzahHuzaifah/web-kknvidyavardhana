import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Users, 
  Pencil, 
  Trash2,
  X
} from 'lucide-react';

export default function ProfileTab({ token, onConfirm }) {
  // ── Profile Form State ──────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    about_title: '',
    about_description: '',
    vision: '',
    mission: '',
    village_name: '',
    village_description: '',
    village_population: '',
    village_rtrw: '',
    village_area: '',
    village_latitude: '',
    village_longitude: '',
    village_map_label: ''
  });
  const [profileSaveMsg, setProfileSaveMsg] = useState({ type: '', message: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Team Member State ───────────────────────────────────
  const [teamList, setTeamList] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', major: '', display_order: 0 });
  const [memberImage, setMemberImage] = useState(null);
  const [teamActionMsg, setTeamActionMsg] = useState({ type: '', message: '' });
  const [savingMember, setSavingMember] = useState(false);

  // ── Fetch Data ──────────────────────────────────────────
  const fetchAll = async () => {
    setLoadingTeam(true);
    try {
      const [profileRes, teamRes] = await Promise.all([
        axios.get('/api/profile-info'),
        axios.get('/api/team')
      ]);
      if (profileRes.data) {
        setProfileForm({
          about_title: profileRes.data.about_title || '',
          about_description: profileRes.data.about_description || '',
          vision: profileRes.data.vision || '',
          mission: profileRes.data.mission || '',
          village_name: profileRes.data.village_name || '',
          village_description: profileRes.data.village_description || '',
          village_population: profileRes.data.village_population || '',
          village_rtrw: profileRes.data.village_rtrw || '',
          village_area: profileRes.data.village_area || '',
          village_latitude: profileRes.data.village_latitude || '',
          village_longitude: profileRes.data.village_longitude || '',
          village_map_label: profileRes.data.village_map_label || ''
        });
      }
      setTeamList(teamRes.data || []);
    } catch (err) {
      console.error('Error fetching profile & team:', err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Profile Handlers ────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaveMsg({ type: '', message: '' });
    try {
      const response = await axios.put('/api/profile-info', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSaveMsg({ type: 'success', message: response.data.message });
    } catch (error) {
      setProfileSaveMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan profil.'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Team Member Handlers ────────────────────────────────
  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMemberImage(e.target.files[0]);
    }
  };

  const handleStartEditMember = (member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      role: member.role,
      major: member.major || '',
      display_order: member.display_order || 0
    });
    setMemberImage(null);
    setTeamActionMsg({ type: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setMemberForm({ name: '', role: '', major: '', display_order: 0 });
    setMemberImage(null);
    setTeamActionMsg({ type: '', message: '' });
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSavingMember(true);
    setTeamActionMsg({ type: '', message: '' });
    try {
      const formData = new FormData();
      formData.append('name', memberForm.name);
      formData.append('role', memberForm.role);
      formData.append('major', memberForm.major);
      formData.append('display_order', memberForm.display_order);
      if (memberImage) formData.append('image', memberImage);

      if (editingMemberId) {
        await axios.put(`/api/team/${editingMemberId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setTeamActionMsg({ type: 'success', message: 'Data anggota tim berhasil diperbarui!' });
      } else {
        await axios.post('/api/team', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setTeamActionMsg({ type: 'success', message: 'Anggota tim baru berhasil ditambahkan!' });
      }
      handleCancelEditMember();
      fetchAll();
    } catch (error) {
      setTeamActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan anggota tim.'
      });
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = (id) => {
    onConfirm({
      title: 'Hapus Anggota Tim',
      message: 'Apakah Anda yakin ingin menghapus data anggota ini dari daftar susunan pengurus?',
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/team/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTeamActionMsg({ type: 'success', message: 'Anggota tim berhasil dihapus.' });
          fetchAll();
        } catch (error) {
          setTeamActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus anggota tim.'
          });
        }
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* Edit Profil */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
              <Compass size={22} /> Edit Informasi Profil & Desa
            </h2>
          </div>
          <Link to="/profile" target="_blank" className="text-xs font-bold text-primary-dark underline">
            Lihat Halaman Profil ↗
          </Link>
        </div>

        {profileSaveMsg.message && (
          <div className={`mb-6 p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
            profileSaveMsg.type === 'success' 
              ? 'bg-green-50 border-accent-dark text-accent-dark' 
              : 'bg-red-50 border-red-600 text-red-600'
          }`}>
            {profileSaveMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{profileSaveMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Judul Tentang Kami</label>
              <input type="text" name="about_title" value={profileForm.about_title} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Deskripsi Tentang KKN</label>
              <textarea name="about_description" rows={3} value={profileForm.about_description} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Visi KKN</label>
              <textarea name="vision" rows={3} value={profileForm.vision} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Misi KKN</label>
              <textarea name="mission" rows={3} value={profileForm.mission} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Nama Desa</label>
              <input type="text" name="village_name" value={profileForm.village_name} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Deskripsi Profil Desa</label>
              <textarea name="village_description" rows={3} value={profileForm.village_description} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Populasi (cth: 5,420 Jiwa)</label>
              <input type="text" name="village_population" value={profileForm.village_population} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">RT / RW (cth: 12 / 04)</label>
              <input type="text" name="village_rtrw" value={profileForm.village_rtrw} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Luas Wilayah (cth: 3.2 km²)</label>
              <input type="text" name="village_area" value={profileForm.village_area} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Latitude</label>
              <input type="text" name="village_latitude" value={profileForm.village_latitude} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Longitude</label>
              <input type="text" name="village_longitude" value={profileForm.village_longitude} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Label Penanda (Marker)</label>
              <input type="text" name="village_map_label" value={profileForm.village_map_label} onChange={handleProfileChange} required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:bg-yellow-50" />
            </div>
          </div>

          <button type="submit" disabled={savingProfile}
            className="inline-flex items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-6 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50">
            <Save size={16} /> {savingProfile ? 'Menyimpan...' : 'Simpan Pembaruan Profil & Desa'}
          </button>
        </form>
      </div>

      {/* Kelola Pengurus */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
        <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
          <Users size={22} /> Kelola Susunan Pengurus (Meet Our Team)
        </h2>

        {teamActionMsg.message && (
          <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center justify-between gap-2 ${
            teamActionMsg.type === 'success' 
              ? 'bg-green-50 border-accent-dark text-accent-dark' 
              : 'bg-red-50 border-red-600 text-red-600'
          }`}>
            <div className="flex items-center gap-2">
              {teamActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{teamActionMsg.message}</span>
            </div>
            <button onClick={() => setTeamActionMsg({ type: '', message: '' })} className="text-gray-400 hover:text-gray-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Form Tambah / Edit Anggota */}
        <div className={`border-2 p-4 space-y-4 ${editingMemberId ? 'border-yellow-500 bg-yellow-50' : 'border-primary-dark bg-gray-50'}`}>
          {editingMemberId && (
            <p className="text-xs font-black text-yellow-800 uppercase">✏️ Mode Edit Anggota — ubah data lalu klik Perbarui</p>
          )}
          <form onSubmit={handleSaveMember} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Nama *</label>
                <input type="text" name="name" value={memberForm.name} onChange={handleMemberFormChange} required
                  className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jabatan *</label>
                <input type="text" name="role" value={memberForm.role} onChange={handleMemberFormChange} required
                  className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jurusan</label>
                <input type="text" name="major" value={memberForm.major} onChange={handleMemberFormChange}
                  className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Urutan</label>
                <input type="number" name="display_order" value={memberForm.display_order} onChange={handleMemberFormChange}
                  className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:bg-yellow-50" />
              </div>
              <div className="sm:col-span-2 md:col-span-4">
                <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Foto Anggota</label>
                <input type="file" accept="image/*" onChange={handleMemberImageChange}
                  className="w-full border-2 border-primary-dark p-1 text-xs bg-white" />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={savingMember}
                className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50">
                <Save size={14} /> {savingMember ? 'Menyimpan...' : (editingMemberId ? 'Perbarui Anggota' : 'Simpan Anggota Baru')}
              </button>
              {editingMemberId && (
                <button type="button" onClick={handleCancelEditMember}
                  className="bg-gray-200 text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5">
                  <X size={14} /> Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabel Anggota */}
        <div className="overflow-x-auto">
          {loadingTeam ? (
            <p className="text-center text-xs text-gray-500 font-bold py-8">Memuat data tim...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-blue text-white text-xs uppercase">
                  <th className="p-2.5 border-2 border-primary-dark">Foto</th>
                  <th className="p-2.5 border-2 border-primary-dark">Nama</th>
                  <th className="p-2.5 border-2 border-primary-dark">Jabatan</th>
                  <th className="p-2.5 border-2 border-primary-dark">Jurusan</th>
                  <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {teamList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 italic border-2 border-primary-dark">
                      Belum ada anggota tim. Tambahkan menggunakan form di atas.
                    </td>
                  </tr>
                ) : teamList.map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${editingMemberId === m.id ? 'bg-yellow-50' : ''}`}>
                    <td className="p-2 border-2 border-primary-dark text-center">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="w-10 h-10 object-cover border border-primary-dark mx-auto" />
                      ) : (
                        <div className="w-10 h-10 bg-primary-dark text-white flex items-center justify-center font-bold text-sm mx-auto">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 border-2 border-primary-dark font-bold text-primary-dark">{m.name}</td>
                    <td className="p-2.5 border-2 border-primary-dark font-bold">{m.role}</td>
                    <td className="p-2.5 border-2 border-primary-dark text-gray-600">{m.major || '-'}</td>
                    <td className="p-2.5 border-2 border-primary-dark text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleStartEditMember(m)}
                          className="p-1.5 bg-yellow-400 hover:bg-yellow-500 border border-primary-dark transition-all" title="Edit anggota">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark transition-all" title="Hapus anggota">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
