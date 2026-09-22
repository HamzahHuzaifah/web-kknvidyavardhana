import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PanelBottom, 
  Save, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { DEFAULT_FOOTER_DATA } from '../../utils/footerDefaults';

export default function FooterTab({ showAlert, setConfirmModal }) {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    brand_title: DEFAULT_FOOTER_DATA.brand_title,
    brand_tagline: DEFAULT_FOOTER_DATA.brand_tagline,
    about_text: DEFAULT_FOOTER_DATA.about_text,
    address: DEFAULT_FOOTER_DATA.address,
    email: DEFAULT_FOOTER_DATA.email,
    phone: DEFAULT_FOOTER_DATA.phone,
    operational_hours: DEFAULT_FOOTER_DATA.operational_hours,
    copyright_text: DEFAULT_FOOTER_DATA.copyright_text,
    quick_links: DEFAULT_FOOTER_DATA.quick_links,
    show_social_links: 1,
    show_map_link: 1,
    map_url: DEFAULT_FOOTER_DATA.map_url,
    bottom_bar_text: DEFAULT_FOOTER_DATA.bottom_bar_text
  });

  // State untuk input link baru
  const [newLink, setNewLink] = useState({ label: '', url: '' });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/footer-info');
      if (res && res.data && typeof res.data === 'object') {
        setFormData({
          brand_title: res.data.brand_title || DEFAULT_FOOTER_DATA.brand_title,
          brand_tagline: res.data.brand_tagline || DEFAULT_FOOTER_DATA.brand_tagline,
          about_text: res.data.about_text || DEFAULT_FOOTER_DATA.about_text,
          address: res.data.address || DEFAULT_FOOTER_DATA.address,
          email: res.data.email || DEFAULT_FOOTER_DATA.email,
          phone: res.data.phone || DEFAULT_FOOTER_DATA.phone,
          operational_hours: res.data.operational_hours || DEFAULT_FOOTER_DATA.operational_hours,
          copyright_text: res.data.copyright_text || DEFAULT_FOOTER_DATA.copyright_text,
          quick_links: Array.isArray(res.data.quick_links) ? res.data.quick_links : DEFAULT_FOOTER_DATA.quick_links,
          show_social_links: Number(res.data.show_social_links ?? 1),
          show_map_link: Number(res.data.show_map_link ?? 1),
          map_url: res.data.map_url || DEFAULT_FOOTER_DATA.map_url,
          bottom_bar_text: res.data.bottom_bar_text || DEFAULT_FOOTER_DATA.bottom_bar_text
        });
      }
    } catch (err) {
      console.warn('Gagal memuat footer-info dari backend:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  // Handler Tautan Cepat
  const handleAddLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) {
      if (showAlert) showAlert('Mohon isi label judul tautan dan URL tautan.', 'Perhatian');
      return;
    }
    setFormData(prev => ({
      ...prev,
      quick_links: [...prev.quick_links, { label: newLink.label.trim(), url: newLink.url.trim() }]
    }));
    setNewLink({ label: '', url: '' });
  };

  const handleRemoveLink = (index) => {
    setFormData(prev => ({
      ...prev,
      quick_links: prev.quick_links.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateLinkItem = (index, field, val) => {
    setFormData(prev => {
      const updated = [...prev.quick_links];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      }
      return { ...prev, quick_links: updated };
    });
  };

  const handleResetToDefaultLinks = () => {
    if (setConfirmModal) {
      setConfirmModal({
        isOpen: true,
        title: 'Kembalikan Tautan Default',
        message: 'Apakah Anda yakin ingin mengatur ulang daftar tautan navigasi ke setelan awal?',
        confirmText: 'Ya, Kembalikan',
        cancelText: 'Batal',
        type: 'warning',
        onConfirm: () => {
          setFormData(prev => ({ ...prev, quick_links: DEFAULT_FOOTER_DATA.quick_links }));
        }
      });
    } else {
      setFormData(prev => ({ ...prev, quick_links: DEFAULT_FOOTER_DATA.quick_links }));
    }
  };

  const handleResetAllToDefaults = () => {
    if (setConfirmModal) {
      setConfirmModal({
        isOpen: true,
        title: 'Reset Seluruh Data Footer',
        message: 'Semua isian formulir footer akan dikembalikan ke teks bawaan sistem. Lanjutkan?',
        confirmText: 'Ya, Reset Semua',
        cancelText: 'Batal',
        type: 'danger',
        onConfirm: () => {
          setFormData({
            ...DEFAULT_FOOTER_DATA,
            quick_links: DEFAULT_FOOTER_DATA.quick_links
          });
        }
      });
    }
  };

  // Submit Simpan Pembaruan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg({ type: '', message: '' });

    try {
      const payload = {
        ...formData,
        quick_links: formData.quick_links
      };

      const res = await axios.post('/api/footer-info/edit', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSaveMsg({
        type: 'success',
        message: res.data?.message || 'Informasi footer berhasil disimpan!'
      });

      // Beritahu komponen Footer publik agar langsung ter-update secara real-time
      window.dispatchEvent(new CustomEvent('footerUpdated', { detail: payload }));

      if (showAlert) {
        showAlert('Pengaturan informasi footer berhasil disimpan ke sistem!', 'Berhasil');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Gagal menyimpan perubahan footer.';
      setSaveMsg({ type: 'error', message: errMsg });
      if (showAlert) {
        showAlert(errMsg, 'Terjadi Kesalahan');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary-dark pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
              <PanelBottom size={22} /> Pengaturan Footer & Navbar Bawah
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-1">
              Sesuaikan informasi kontak, alamat posko, tautan navigasi pintas, dan hak cipta yang muncul di bagian bawah website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAllToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-primary-dark text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all"
            >
              <RotateCcw size={13} /> Reset Standar
            </button>
          </div>
        </div>

        {/* Notifikasi Hasil Simpan */}
        {saveMsg.message && (
          <div className={`mb-6 p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
            saveMsg.type === 'success' 
              ? 'bg-green-50 border-accent-dark text-accent-dark' 
              : 'bg-red-50 border-red-600 text-red-600'
          }`}>
            {saveMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{saveMsg.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Identitas & Teks Brand */}
          <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
            <h3 className="font-black text-sm text-primary-dark uppercase tracking-wide border-b border-gray-300 pb-2">
              1. Identitas & Teks Utama
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Nama / Judul Footer *
                </label>
                <input
                  type="text"
                  name="brand_title"
                  value={formData.brand_title}
                  onChange={handleChange}
                  required
                  placeholder="KKN Vidya Vardhana"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Slogan Singkat (Badge Tagline)
                </label>
                <input
                  type="text"
                  name="brand_tagline"
                  value={formData.brand_tagline}
                  onChange={handleChange}
                  placeholder="Inisiatif Pengabdian Mahasiswa untuk Pemberdayaan Desa"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Deskripsi Singkat Footer
                </label>
                <textarea
                  name="about_text"
                  rows={3}
                  value={formData.about_text}
                  onChange={handleChange}
                  placeholder="Tuliskan gambaran singkat mengenai program KKN..."
                  className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Posko Layanan */}
          <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
            <h3 className="font-black text-sm text-primary-dark uppercase tracking-wide border-b border-gray-300 pb-2">
              2. Kontak & Posko Layanan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Alamat Posko / Kantor Desa
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Kantor Balai Desa Ciasihan, Kec. Pamijahan, Kab. Bogor..."
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Jam Operasional Posko
                </label>
                <input
                  type="text"
                  name="operational_hours"
                  value={formData.operational_hours}
                  onChange={handleChange}
                  placeholder="Senin - Sabtu: 08:00 - 17:00 WIB"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Email Resmi Posko
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="kkn.vidyavardhana@gmail.com"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Nomor Telepon / WhatsApp Posko
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+62 812-3456-7890"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Link Google Maps Posko (URL)
                </label>
                <input
                  type="url"
                  name="map_url"
                  value={formData.map_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pengelola Tautan Cepat (Navbar Bawah) */}
          <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <h3 className="font-black text-sm text-primary-dark uppercase tracking-wide">
                3. Tautan Navigasi Pintas (Navbar Bawah)
              </h3>
              <button
                type="button"
                onClick={handleResetToDefaultLinks}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Setel Ulang ke Tautan Bawaan
              </button>
            </div>

            {/* List Tautan yang ada */}
            <div className="space-y-2">
              {formData.quick_links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white border-2 border-primary-dark p-2">
                  <span className="text-xs font-black text-primary-dark w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLinkItem(idx, 'label', e.target.value)}
                    placeholder="Judul Tautan (Label)"
                    className="w-1/2 border border-gray-300 px-2.5 py-1 text-xs outline-none focus:border-primary-dark"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLinkItem(idx, 'url', e.target.value)}
                    placeholder="URL (/berita atau https://...)"
                    className="w-1/2 border border-gray-300 px-2.5 py-1 text-xs outline-none focus:border-primary-dark font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark shrink-0 transition-colors"
                    title="Hapus tautan ini"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Tambah Tautan Baru */}
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-700 uppercase mb-2">Tambah Tautan Baru:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  placeholder="Label (Contoh: Buku Panduan)"
                  className="sm:w-1/2 border-2 border-primary-dark px-3 py-1.5 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="URL Target (Contoh: /modul atau https://...)"
                  className="sm:w-1/2 border-2 border-primary-dark px-3 py-1.5 text-xs bg-white outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="inline-flex items-center justify-center gap-1 bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all shrink-0"
                >
                  <Plus size={14} /> Tambahkan
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Hak Cipta & Slogan Bawah */}
          <div className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
            <h3 className="font-black text-sm text-primary-dark uppercase tracking-wide border-b border-gray-300 pb-2">
              4. Hak Cipta (Copyright) & Slogan Bawah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Teks Hak Cipta
                </label>
                <input
                  type="text"
                  name="copyright_text"
                  value={formData.copyright_text}
                  onChange={handleChange}
                  placeholder="© 2024-2026 KKN Vidya Vardhana. Seluruh Hak Cipta Dilindungi."
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                  Slogan Kaki (Kanan Bawah)
                </label>
                <input
                  type="text"
                  name="bottom_bar_text"
                  value={formData.bottom_bar_text}
                  onChange={handleChange}
                  placeholder="Bersama Mewujudkan Kemajuan Berkelanjutan di Desa Ciasihan"
                  className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none focus:bg-yellow-50"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Opsi Visibilitas */}
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 space-y-3">
            <h3 className="font-black text-sm text-yellow-900 uppercase tracking-wide">
              5. Pengaturan Tampilan Elemen
            </h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_social_links"
                  checked={Number(formData.show_social_links) === 1}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xs font-bold text-primary-dark">
                  Tampilkan Ikon Media Sosial Resmi di Footer
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_map_link"
                  checked={Number(formData.show_map_link) === 1}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xs font-bold text-primary-dark">
                  Tampilkan Tombol Tautan Peta Lokasi Posko
                </span>
              </label>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-6 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Menyimpan Perubahan...' : 'Simpan Seluruh Pengaturan Footer'}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Live Preview */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
          <h3 className="text-base font-black text-primary-dark uppercase flex items-center gap-2">
            <Eye size={18} /> Pratinjau Langsung (Live Preview Footer)
          </h3>
          <span className="text-[11px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 border border-gray-300">
            Tampilan Visual
          </span>
        </div>

        {/* Mock Footer Preview Box */}
        <div className="bg-primary-dark text-white border-4 border-secondary-dark p-6 shadow-inner space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            {/* Brand */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-yellow text-primary-dark font-black flex items-center justify-center border border-white">
                  K
                </div>
                <span className="font-heading font-black text-base uppercase text-white">
                  {formData.brand_title || 'KKN Vidya Vardhana'}
                </span>
              </div>
              {formData.brand_tagline && (
                <span className="inline-block bg-primary-light/30 text-secondary-light px-2 py-0.5 text-[10px] font-bold uppercase">
                  {formData.brand_tagline}
                </span>
              )}
              <p className="text-gray-300 text-[11px] leading-relaxed">
                {formData.about_text}
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="font-bold text-secondary-light uppercase text-xs border-b border-blue-900 pb-1">
                Navigasi Pintas
              </h4>
              <ul className="space-y-1 text-[11px] text-gray-300">
                {formData.quick_links.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-1 hover:text-secondary-light">
                    <ChevronRight size={11} className="text-secondary-dark" />
                    <span>{link.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Posko Info */}
            <div className="md:col-span-4 space-y-2 text-[11px] text-gray-300">
              <h4 className="font-bold text-secondary-light uppercase text-xs border-b border-blue-900 pb-1">
                Posko & Kontak
              </h4>
              {formData.address && (
                <div className="flex items-start gap-1.5">
                  <MapPin size={13} className="text-secondary-light mt-0.5 shrink-0" />
                  <span>{formData.address}</span>
                </div>
              )}
              {formData.operational_hours && (
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-secondary-light shrink-0" />
                  <span>{formData.operational_hours}</span>
                </div>
              )}
              {formData.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-secondary-light shrink-0" />
                  <span>{formData.email}</span>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-secondary-light shrink-0" />
                  <span>{formData.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar Preview */}
          <div className="border-t border-blue-900/80 pt-4 flex flex-col sm:flex-row justify-between text-[10px] text-gray-400 gap-2">
            <span>{formData.copyright_text}</span>
            <span>{formData.bottom_bar_text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
