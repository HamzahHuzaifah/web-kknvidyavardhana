import React from 'react';
import { Shield, X, Save } from 'lucide-react';

export default function EditPermissionsModal({
  isOpen,
  onClose,
  targetUser,
  form,
  setForm,
  onSubmit,
  isSaving
}) {
  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
          <h3 className="text-lg font-black text-primary-dark uppercase flex items-center gap-2">
            <Shield size={20} /> Atur Izin Upload
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-primary-dark"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-600 font-medium">
          Tentukan jenis konten apa saja yang boleh diunggah oleh akun <span className="font-bold text-primary-dark">@{targetUser.username}</span>.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 border-primary-dark cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.can_upload_berita}
                onChange={(e) => setForm({ ...form, can_upload_berita: e.target.checked })}
                className="w-4 h-4 text-primary-dark rounded-sm focus:ring-primary-dark cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-primary-dark">Berita & Kabar</span>
                <span className="text-[10px] text-gray-500">Izin mengupload artikel berita dokumentasi kegiatan.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-primary-dark cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.can_upload_publikasi}
                onChange={(e) => setForm({ ...form, can_upload_publikasi: e.target.checked })}
                className="w-4 h-4 text-primary-dark rounded-sm focus:ring-primary-dark cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-primary-dark">Jurnal & Publikasi Ilmiah</span>
                <span className="text-[10px] text-gray-500">Izin mengupload paper riset / jurnal standar akademik.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 border-primary-dark cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.can_upload_modul}
                onChange={(e) => setForm({ ...form, can_upload_modul: e.target.checked })}
                className="w-4 h-4 text-primary-dark rounded-sm focus:ring-primary-dark cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-primary-dark">Modul & Buku Saku</span>
                <span className="text-[10px] text-gray-500">Izin mengupload modul edukasi dan panduan teknis.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t-2 border-dashed border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark font-black px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : (
                <>
                  <Save size={14} /> Simpan Izin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
