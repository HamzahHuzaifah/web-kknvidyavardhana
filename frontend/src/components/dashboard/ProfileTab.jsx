import { Link } from 'react-router-dom';
import { 
  Compass, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Users, 
  Pencil, 
  Trash2 
} from 'lucide-react';

export default function ProfileTab({
  profileForm,
  handleProfileChange,
  handleSaveProfile,
  profileSaveMsg,
  teamList,
  teamActionMsg,
  memberForm,
  handleMemberFormChange,
  handleMemberImageChange,
  handleSaveMember,
  handleStartEditMember,
  editingMemberId,
  savingMember,
  handleDeleteMember
}) {
  return (
    <div className="space-y-10">
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
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Judul Tentang Kami
              </label>
              <input
                type="text"
                name="about_title"
                value={profileForm.about_title}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Deskripsi Tentang KKN
              </label>
              <textarea
                name="about_description"
                rows={3}
                value={profileForm.about_description}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Visi KKN
              </label>
              <textarea
                name="vision"
                rows={3}
                value={profileForm.vision}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Misi KKN
              </label>
              <textarea
                name="mission"
                rows={3}
                value={profileForm.mission}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Nama Desa
              </label>
              <input
                type="text"
                name="village_name"
                value={profileForm.village_name}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Deskripsi Profil Desa
              </label>
              <textarea
                name="village_description"
                rows={3}
                value={profileForm.village_description}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Populasi (cth: 5,420 Jiwa)
              </label>
              <input
                type="text"
                name="village_population"
                value={profileForm.village_population}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                RT / RW (cth: 12 / 04)
              </label>
              <input
                type="text"
                name="village_rtrw"
                value={profileForm.village_rtrw}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Luas Wilayah (cth: 3.2 km²)
              </label>
              <input
                type="text"
                name="village_area"
                value={profileForm.village_area}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Latitude
              </label>
              <input
                type="text"
                name="village_latitude"
                value={profileForm.village_latitude}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Longitude
              </label>
              <input
                type="text"
                name="village_longitude"
                value={profileForm.village_longitude}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                Label Penanda (Marker)
              </label>
              <input
                type="text"
                name="village_map_label"
                value={profileForm.village_map_label}
                onChange={handleProfileChange}
                required
                className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-6 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <Save size={16} /> Simpan Pembaruan Profil & Desa
          </button>
        </form>
      </div>

      {/* Kelola Pengurus */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
        <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
          <Users size={22} /> Kelola Susunan Pengurus (Meet Our Team)
        </h2>

        {teamActionMsg.message && (
          <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
            teamActionMsg.type === 'success' 
              ? 'bg-green-50 border-accent-dark text-accent-dark' 
              : 'bg-red-50 border-red-600 text-red-600'
          }`}>
            {teamActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{teamActionMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveMember} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Nama *</label>
              <input
                type="text"
                name="name"
                value={memberForm.name}
                onChange={handleMemberFormChange}
                required
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jabatan *</label>
              <input
                type="text"
                name="role"
                value={memberForm.role}
                onChange={handleMemberFormChange}
                required
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jurusan</label>
              <input
                type="text"
                name="major"
                value={memberForm.major}
                onChange={handleMemberFormChange}
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Urutan</label>
              <input
                type="number"
                name="display_order"
                value={memberForm.display_order}
                onChange={handleMemberFormChange}
                className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Foto Anggota</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMemberImageChange}
                className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingMember}
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            <Save size={14} /> {editingMemberId ? 'Perbarui Anggota' : 'Simpan Anggota Baru'}
          </button>
        </form>

        <div className="overflow-x-auto">
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
              {teamList.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-2 border-2 border-primary-dark text-center">
                    {m.image_url ? (
                      <img
                        src={`http://localhost:5000${m.image_url}`}
                        alt={m.name}
                        className="w-10 h-10 object-cover border border-primary-dark mx-auto"
                      />
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
                      <button
                        onClick={() => handleStartEditMember(m)}
                        className="p-1.5 bg-yellow-400 hover:bg-yellow-500 border border-primary-dark"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark"
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
