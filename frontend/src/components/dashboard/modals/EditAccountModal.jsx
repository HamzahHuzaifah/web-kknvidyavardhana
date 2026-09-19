import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Key } from 'lucide-react';

export default function EditAccountModal({ isOpen, onClose, user, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    new_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        new_password: ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData, user.isSelf);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-yellow border-b-4 border-primary-dark p-4 flex justify-between items-center">
          <h3 className="text-lg font-black text-primary-dark uppercase flex items-center gap-2">
            <ShieldAlert size={20} /> 
            {user.isSelf ? 'Pengaturan Akun Saya' : `Edit Akun: ${user.username}`}
          </h3>
          <button
            onClick={onClose}
            className="text-primary-dark hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Username Baru *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-primary-dark"
            />
          </div>

          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-primary-dark"
            />
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
              Wajib menggunakan akhiran @gmail.com
            </p>
          </div>

          <div className="pt-4 border-t-2 border-dashed border-gray-300 mt-2">
            <label className="block text-primary-dark font-black text-xs uppercase mb-1 flex items-center gap-1.5">
              <Key size={14} /> Password Baru (Opsional)
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              className="w-full border-2 border-primary-dark px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-primary-dark"
            />
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
              Minimal 6 Karakter
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-green text-white font-black text-xs uppercase px-4 py-3 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 bg-white border-2 border-primary-dark font-black text-xs uppercase hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
