import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Edit, Trash2, ShieldCheck, FileImage } from 'lucide-react';
import MediaPickerModal from './modals/MediaPickerModal';
import ImageCropperModal from './modals/ImageCropperModal';

export default function JumbotronTab({ showAlert, setAdminActionMsg, setConfirmModal }) {
  const [slides, setSlides] = useState([]);
  const [animationType, setAnimationType] = useState('fade');
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    display_order: 0,
    is_active: 1
  });
  const [saving, setSaving] = useState(false);

  // Media Picker & Cropper State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropTargetUrl, setCropTargetUrl] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch slides
      const slideRes = await axios.get('/api/jumbotron/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlides(Array.isArray(slideRes.data) ? slideRes.data : []);

      // Fetch animation setting from profile info
      const profileRes = await axios.get('/api/profile-info');
      if (profileRes.data && typeof profileRes.data === 'object' && profileRes.data.jumbotron_animation) {
        setAnimationType(profileRes.data.jumbotron_animation);
      }
    } catch (error) {
      console.error('Error fetching jumbotron data:', error);
      showAlert('Gagal memuat data jumbotron.', 'Gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnimation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/profile-info/edit', { jumbotron_animation: animationType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminActionMsg({ type: 'success', message: 'Tipe animasi jumbotron berhasil disimpan.' });
    } catch (error) {
      showAlert('Gagal menyimpan tipe animasi.', 'Gagal');
    }
  };

  const handleOpenForm = (slide = null) => {
    if (slide) {
      setEditingId(slide.id);
      setFormData({
        image_url: slide.image_url,
        title: slide.title,
        subtitle: slide.subtitle,
        display_order: slide.display_order,
        is_active: slide.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        image_url: '',
        title: '',
        subtitle: '',
        display_order: slides.length + 1,
        is_active: 1
      });
    }
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      showAlert('URL Gambar wajib diisi. Silakan pilih dari Media.', 'Validasi Gagal');
      return;
    }

    setSaving(true);
    setAdminActionMsg({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.post(`/api/jumbotron/admin/${editingId}/edit`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminActionMsg({ type: 'success', message: 'Slide berhasil diperbarui!' });
      } else {
        await axios.post('/api/jumbotron/admin', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminActionMsg({ type: 'success', message: 'Slide berhasil ditambahkan!' });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      showAlert(error.response?.data?.error || 'Gagal menyimpan slide.', 'Gagal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Slide Jumbotron',
      message: 'Apakah Anda yakin ingin menghapus slide ini secara permanen?',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const token = localStorage.getItem('token');
          await axios.post(`/api/jumbotron/admin/${id}/delete`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdminActionMsg({ type: 'success', message: 'Slide berhasil dihapus.' });
          fetchData();
        } catch (error) {
          showAlert(error.response?.data?.error || 'Gagal menghapus slide.', 'Gagal');
        } finally {
          setConfirmModal({ isOpen: false });
        }
      }
    });
  };

  // Helper for MediaPicker
  const handleSelectFile = (file) => {
    // Instead of setting directly, open the cropper
    setCropTargetUrl(file.file_url);
    setShowMediaPicker(false);
    setShowCropper(true);
  };
  
  // Handle Crop Finish
  const handleCropDone = async (croppedBlob) => {
    try {
      const token = localStorage.getItem('token');
      
      // We need to upload this new cropped blob
      const formData = new FormData();
      // Add extension since blob might not have one
      formData.append('files', croppedBlob, `cropped-jumbotron-${Date.now()}.jpg`);
      formData.append('source', 'jumbotron_crop');

      const res = await axios.post('/api/files/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newFileUrl = res.data.files[0].file_url;
      
      // Update the Jumbotron form data with the new cropped image
      setFormData((prev) => ({ ...prev, image_url: newFileUrl }));
      setShowCropper(false);
      setCropTargetUrl(null);
      setAdminActionMsg({ type: 'success', message: 'Gambar berhasil disesuaikan!' });
    } catch (error) {
      console.error('Failed to upload cropped image:', error);
      showAlert('Gagal mengunggah hasil potongan gambar.', 'Error');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white border-4 border-primary-dark shadow-hard p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-primary-dark uppercase flex items-center gap-2">
              <Layers size={24} /> Kelola Banner / Jumbotron
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Atur gambar slide (carousel) yang muncul di halaman utama beserta teks dan tipe animasinya.
            </p>
          </div>
          <button
            onClick={() => handleOpenForm(null)}
            className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Slide Baru
          </button>
        </div>
      </div>

      {/* ANIMATION SETTINGS */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
        <h4 className="text-lg font-black text-primary-dark uppercase border-b-2 border-gray-200 pb-2 mb-4">Pengaturan Tampilan</h4>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-primary-dark font-black text-xs uppercase mb-2">Tipe Animasi Transisi Slide</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input 
                  type="radio" 
                  name="animationType" 
                  value="fade" 
                  checked={animationType === 'fade'}
                  onChange={(e) => setAnimationType(e.target.value)}
                  className="w-4 h-4 text-primary-dark"
                />
                Fade (Memudar)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input 
                  type="radio" 
                  name="animationType" 
                  value="slide" 
                  checked={animationType === 'slide'}
                  onChange={(e) => setAnimationType(e.target.value)}
                  className="w-4 h-4 text-primary-dark"
                />
                Slide (Bergeser)
              </label>
            </div>
          </div>
          <button
            onClick={handleSaveAnimation}
            className="bg-primary text-white font-bold text-xs uppercase px-4 py-2 border border-primary-dark hover:bg-primary-dark transition-colors"
          >
            Simpan Tipe Animasi
          </button>
        </div>
      </div>

      {/* FORM ADD/EDIT */}
      {showForm && (
        <div className="bg-gray-50 border-2 border-dashed border-primary-dark p-6 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xl font-black text-primary-dark uppercase mb-4 flex items-center gap-2">
            <Edit size={20} /> {editingId ? 'Edit Slide' : 'Tambah Slide Baru'}
          </h4>
          <form onSubmit={handleSubmitForm} className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Pilih Gambar Latar *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  readOnly
                  placeholder="Klik tombol Pilih Media..."
                  className="flex-1 border-2 border-primary-dark px-3 py-2 text-sm bg-gray-100 font-medium text-gray-700 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="bg-gradient-blue text-white font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-sm hover:translate-y-0.5 hover:shadow-none flex items-center gap-2 transition-all"
                >
                  <FileImage size={14} /> Pilih Media
                </button>
              </div>
              {formData.image_url && (
                <div className="mt-2 h-32 w-48 border-2 border-primary-dark overflow-hidden bg-gray-200">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase">
                * Rekomendasi Ukuran: 1920x1080px (Rasio 16:9) atau Landscape. Format: JPG/PNG/WEBP. Ukuran maksimal: 2MB agar loading web tetap cepat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">Judul (Opsional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="cth: SELAMAT DATANG DI WEBSITE"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-yellow-400 font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">Urutan Tampil (Angka)</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-yellow-400 font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-primary-dark font-black text-xs uppercase mb-1">Sub-judul / Deskripsi (Opsional)</label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows="2"
                placeholder="cth: Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata."
                className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-yellow-400 font-medium outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">
                Tampilkan Slide Ini (Aktif)
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-green text-white font-black text-xs uppercase px-6 py-2.5 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Menyimpan...' : 'Simpan Slide'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border-2 border-primary-dark text-primary-dark font-black text-xs uppercase px-6 py-2.5 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE LIST */}
      <div className="bg-white border-2 border-primary-dark shadow-hard overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Memuat data jumbotron...</div>
        ) : !Array.isArray(slides) || slides.length === 0 ? (
          <div className="p-8 text-center border-b-2 border-primary-dark">
            <Layers size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 font-bold">Belum ada slide Jumbotron yang ditambahkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-dark text-white uppercase text-[10px] tracking-wider">
                  <th className="p-3 border-b-2 border-primary-dark whitespace-nowrap">Order</th>
                  <th className="p-3 border-b-2 border-primary-dark">Gambar</th>
                  <th className="p-3 border-b-2 border-primary-dark w-1/3">Konten Teks</th>
                  <th className="p-3 border-b-2 border-primary-dark text-center">Status</th>
                  <th className="p-3 border-b-2 border-primary-dark text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-800">
                {(Array.isArray(slides) ? slides : []).map((slide) => (
                  <tr key={slide.id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                    <td className="p-3 font-black text-center">{slide.display_order}</td>
                    <td className="p-3">
                      <div className="w-24 h-16 bg-gray-100 border border-primary-dark overflow-hidden flex items-center justify-center">
                        <img src={slide.image_url} alt="slide" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-primary-dark text-xs mb-1 line-clamp-1">{slide.title || '-'}</div>
                      <div className="text-[10px] text-gray-500 line-clamp-2">{slide.subtitle || '-'}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        slide.is_active ? 'bg-green-100 text-green-700 border border-green-700' : 'bg-red-100 text-red-700 border border-red-700'
                      }`}>
                        {slide.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenForm(slide)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Slide"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="p-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-colors"
                          title="Hapus Slide"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        target="image"
        onSelectFile={handleSelectFile}
        formatFileSize={formatFileSize}
      />

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageUrl={cropTargetUrl}
        onCropDone={handleCropDone}
        aspectRatio={16 / 9}
      />
    </div>
  );
}
