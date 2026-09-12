import React from 'react';
import { Key, X, Lock } from 'lucide-react';

export default function ResetPasswordModal({
  user,
  onClose,
  newPassword,
  setNewPassword,
  onSubmit,
  isSaving
}) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
          <h3 className="text-base font-black text-primary-dark uppercase flex items-center gap-2">
            <Key size={18} /> Reset Password
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-primary-dark"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-600 font-medium">
          Mengubah kata sandi untuk akun: <strong>{user.username}</strong>
        </p>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-primary-dark font-black text-xs uppercase mb-1">
              Password Baru *
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none focus:bg-yellow-50 font-medium pl-8"
              />
              <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold uppercase border-2 border-primary-dark bg-white hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-black uppercase border-2 border-primary-dark bg-gradient-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Perbarui Sandi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
