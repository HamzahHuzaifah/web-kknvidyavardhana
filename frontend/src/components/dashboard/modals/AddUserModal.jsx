import React from 'react';
import { UserPlus, X, Lock } from 'lucide-react';
import CustomSelect from '../../CustomSelect';

export default function AddUserModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isSaving
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
          <h3 className="text-lg font-black text-primary-dark uppercase flex items-center gap-2">
            <UserPlus size={20} /> Tambah Akun Baru
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-primary-dark"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-600 font-medium bg-yellow-50 border border-yellow-300 p-2.5">
          💡 Akun yang dibuat langsung oleh Admin otomatis berstatus <strong>Disetujui (ACC)</strong> dan bisa langsung digunakan untuk login.
        </p>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Username *
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="contoh: budi_kkn"
              className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none focus:bg-yellow-50 font-medium"
            />
          </div>

          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="contoh: budi@gmail.com"
              className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none focus:bg-yellow-50 font-medium"
            />
          </div>

          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Password Sementara *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Minimal 6 karakter"
              className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none focus:bg-yellow-50 font-medium"
            />
          </div>

          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Hak Akses (Role) *
            </label>
            <CustomSelect
              value={form.role}
              onChange={(val) => setForm({ ...form, role: val })}
              options={[
                { value: 'user', label: 'User (Anggota Reguler)' },
                { value: 'admin', label: 'Administrator (Akses Penuh)' }
              ]}
              className="w-full"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase border-2 border-primary-dark bg-white hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-black uppercase border-2 border-primary-dark bg-gradient-yellow text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan & Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
