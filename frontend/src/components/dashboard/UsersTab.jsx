import React from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  X, 
  UserCheck, 
  UserX, 
  Shield, 
  UserMinus, 
  Key, 
  Trash2,
  LogOut
} from 'lucide-react';

export default function UsersTab({
  userList,
  loadingUsers,
  adminActionMsg,
  setAdminActionMsg,
  userSearchTerm,
  setUserSearchTerm,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  onUpdateUserStatus,
  onUpdateUserRole,
  onDeleteUser,
  onOpenAddUserModal,
  onOpenResetPasswordModal,
  onForceLogout,
  currentUsername
}) {
  const filteredUsers = userList.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingCount = userList.filter((u) => u.status === 'pending').length;
  const approvedCount = userList.filter((u) => u.status === 'approved').length;
  const rejectedCount = userList.filter((u) => u.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-primary-dark p-4 shadow-hard flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Total Akun</div>
            <div className="text-2xl font-black text-primary-dark">{userList.length}</div>
          </div>
          <div className="w-10 h-10 bg-gray-100 border border-primary-dark flex items-center justify-center font-black">
            👥
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-primary-dark p-4 shadow-hard flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black text-yellow-900 uppercase">Menunggu ACC</div>
            <div className="text-2xl font-black text-yellow-900">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 bg-yellow-200 border border-yellow-600 flex items-center justify-center font-black text-yellow-900">
            ⏳
          </div>
        </div>

        <div className="bg-green-50 border-2 border-primary-dark p-4 shadow-hard flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-accent-dark uppercase">Disetujui (ACC)</div>
            <div className="text-2xl font-black text-accent-dark">{approvedCount}</div>
          </div>
          <div className="w-10 h-10 bg-green-200 border border-accent-dark flex items-center justify-center font-black text-accent-dark">
            ✓
          </div>
        </div>

        <div className="bg-red-50 border-2 border-primary-dark p-4 shadow-hard flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-red-700 uppercase">Ditolak</div>
            <div className="text-2xl font-black text-red-700">{rejectedCount}</div>
          </div>
          <div className="w-10 h-10 bg-red-200 border border-red-700 flex items-center justify-center font-black text-red-700">
            ✕
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT PANEL */}
      <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary-dark pb-4 mb-4">
          <div>
            <h3 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
              <ShieldCheck size={22} /> Kelola Pengguna & Persetujuan (ACC)
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Kelola status akun, penugasan hak Administrator, reset kata sandi, dan ACC akun pendaftar baru.
            </p>
          </div>

          <button
            onClick={onOpenAddUserModal}
            className="inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark font-black px-3.5 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs tracking-wider shrink-0"
          >
            <UserPlus size={15} /> + Tambah Akun Langsung
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-gray-50 p-3 border-2 border-primary-dark">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari username pengguna..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border-2 border-primary-dark text-xs bg-white outline-none focus:bg-yellow-50 font-medium"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-dark uppercase">Role:</span>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="border-2 border-primary-dark px-2 py-1.5 text-xs font-bold bg-white outline-none"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Administrator</option>
              <option value="user">User (Anggota)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-dark uppercase">Status:</span>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              className="border-2 border-primary-dark px-2 py-1.5 text-xs font-bold bg-white outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">⏳ Pending (Menunggu ACC)</option>
              <option value="approved">✓ Approved (Aktif)</option>
              <option value="rejected">✕ Rejected (Ditolak)</option>
            </select>
          </div>
        </div>

        {/* ACTION MESSAGE NOTIFICATION */}
        {adminActionMsg.message && (
          <div
            className={`mb-4 p-3 border-2 text-xs font-bold shadow-hard flex items-center justify-between gap-2 ${
              adminActionMsg.type === 'success'
                ? 'bg-green-50 border-accent-dark text-accent-dark'
                : 'bg-red-50 border-red-600 text-red-600'
            }`}
          >
            <div className="flex items-center gap-2">
              {adminActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{adminActionMsg.message}</span>
            </div>
            <button
              onClick={() => setAdminActionMsg({ type: '', message: '' })}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* USERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-blue text-white text-xs uppercase">
                <th className="p-3 border-2 border-primary-dark">Pengguna</th>
                <th className="p-3 border-2 border-primary-dark">Hak Akses (Role)</th>
                <th className="p-3 border-2 border-primary-dark">Waktu Daftar</th>
                <th className="p-3 border-2 border-primary-dark">Status Akun</th>
                <th className="p-3 border-2 border-primary-dark text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500 font-bold border-2 border-primary-dark">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500 font-medium italic border-2 border-primary-dark bg-gray-50"
                  >
                    Tidak ada data akun yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const isMainAdmin = usr.username === 'admin';
                  const isSelf = usr.username === currentUsername;

                  return (
                    <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-2 border-primary-dark">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center font-black text-xs border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                              usr.role === 'admin' ? 'bg-yellow-300 text-primary-dark' : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {usr.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-primary-dark flex items-center gap-1.5">
                              <span>{usr.username}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-gray-200 px-1.5 py-0.2 border border-gray-400 font-bold">
                                  Anda
                                </span>
                              )}
                              {isMainAdmin && (
                                <span className="text-[10px] bg-yellow-200 text-yellow-900 px-1.5 py-0.2 border border-yellow-700 font-black">
                                  Utama
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 border-2 border-primary-dark font-medium">
                        {usr.role === 'admin' ? (
                          <span className="bg-yellow-100 text-yellow-900 border border-yellow-700 px-2 py-0.5 font-bold uppercase text-[10px]">
                            🛡️ Administrator
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 border border-gray-400 px-2 py-0.5 font-medium uppercase text-[10px]">
                            👤 User (Anggota)
                          </span>
                        )}
                      </td>

                      <td className="p-3 border-2 border-primary-dark text-gray-600 font-medium">
                        {new Date(usr.created_at).toLocaleString('id-ID')}
                        <div className="mt-1">
                          {usr.last_active && new Date() - new Date(usr.last_active) < 5 * 60 * 1000 ? (
                            <span className="text-[10px] font-black text-green-700 bg-green-100 border border-green-700 px-1.5 py-0.5 uppercase flex items-center w-fit gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-400 px-1.5 py-0.5 uppercase flex items-center w-fit gap-1">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              Offline
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 border-2 border-primary-dark">
                        {usr.status === 'approved' && (
                          <span className="bg-green-100 text-green-800 border border-green-700 px-2 py-0.5 font-bold uppercase text-[10px] inline-flex items-center gap-1">
                            <CheckCircle size={11} /> Disetujui (ACC)
                          </span>
                        )}
                        {usr.status === 'pending' && (
                          <span className="bg-yellow-100 text-yellow-900 border border-yellow-700 px-2 py-0.5 font-bold uppercase text-[10px] inline-flex items-center gap-1 animate-pulse">
                            ⏳ Menunggu ACC
                          </span>
                        )}
                        {usr.status === 'rejected' && (
                          <span className="bg-red-100 text-red-800 border border-red-700 px-2 py-0.5 font-bold uppercase text-[10px] inline-flex items-center gap-1">
                            ✕ Ditolak
                          </span>
                        )}
                      </td>

                      <td className="p-3 border-2 border-primary-dark text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {/* ACC OR REJECT BUTTONS */}
                          {usr.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onUpdateUserStatus(usr.id, 'approved')}
                                className="inline-flex items-center gap-1 bg-gradient-green text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                title="Setujui pendaftaran (ACC)"
                              >
                                <UserCheck size={11} /> ACC
                              </button>
                              <button
                                onClick={() => onUpdateUserStatus(usr.id, 'rejected')}
                                className="inline-flex items-center gap-1 bg-red-600 text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                title="Tolak pendaftaran"
                              >
                                <UserX size={11} /> Tolak
                              </button>
                            </>
                          )}

                          {usr.status === 'rejected' && (
                            <button
                              onClick={() => onUpdateUserStatus(usr.id, 'approved')}
                              className="inline-flex items-center gap-1 bg-gradient-green text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Setujui kembali akun"
                            >
                              <UserCheck size={11} /> Aktifkan Lagi
                            </button>
                          )}

                          {usr.status === 'approved' && !isSelf && !isMainAdmin && (
                            <button
                              onClick={() => onUpdateUserStatus(usr.id, 'rejected')}
                              className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Bekukan / Non-aktifkan akun"
                            >
                              Bekukan
                            </button>
                          )}

                          {/* ROLE MANAGEMENT */}
                          {!isMainAdmin && !isSelf && (
                            <>
                              {usr.role === 'user' ? (
                                <button
                                  onClick={() => onUpdateUserRole(usr.id, 'admin', usr.username)}
                                  className="inline-flex items-center gap-1 bg-gradient-yellow text-primary-dark font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                  title="Beri hak akses Administrator ke akun ini"
                                >
                                  <Shield size={11} /> + Jadikan Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateUserRole(usr.id, 'user', usr.username)}
                                  className="inline-flex items-center gap-1 bg-gray-200 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                  title="Turunkan hak akses ke User (Anggota)"
                                >
                                  <UserMinus size={11} /> Jadikan User
                                </button>
                              )}
                            </>
                          )}

                          {/* RESET PASSWORD BUTTON */}
                          {(!isMainAdmin || currentUsername === 'admin') && (
                            <button
                              onClick={() => onOpenResetPasswordModal(usr)}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Reset password pengguna"
                            >
                              <Key size={11} /> Sandi
                            </button>
                          )}

                          {/* FORCE LOGOUT BUTTON */}
                          {usr.status === 'approved' && !isSelf && (
                            <button
                              onClick={() => onForceLogout(usr.id, usr.username)}
                              className="inline-flex items-center gap-1 bg-red-600 text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Logout Paksa"
                            >
                              <LogOut size={11} /> Kick
                            </button>
                          )}

                          {/* DELETE USER BUTTON */}
                          {!isMainAdmin && !isSelf && (
                            <button
                              onClick={() => onDeleteUser(usr.id, usr.username)}
                              className="inline-flex items-center p-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                              title="Hapus akun permanen"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}

                          {isMainAdmin && !isSelf && (
                            <span className="text-[11px] text-gray-400 italic">Akun Sistem</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
