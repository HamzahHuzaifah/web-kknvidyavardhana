import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

import CustomSelect from '../CustomSelect';
import AddUserModal from './modals/AddUserModal';
import EditAccountModal from './modals/EditAccountModal';
import EditPermissionsModal from './modals/EditPermissionsModal';

export default function UsersTab({
  isAdmin,
  currentUsername,
  showAlert,
  setConfirmModal,
  closeConfirmModal
}) {
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState({ type: '', message: '' });
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [savingNewUser, setSavingNewUser] = useState(false);

  const [editAccountModalUser, setEditAccountModalUser] = useState(null);

  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [editPermissionsUser, setEditPermissionsUser] = useState(null);
  const [permissionsForm, setPermissionsForm] = useState({ can_upload_berita: false, can_upload_publikasi: false, can_upload_modul: false });
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  // Handlers
  const handleUpdateUserStatus = async (userId, targetStatus) => {
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/admin/users/${userId}/status/update`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      fetchUsers();
    } catch (error) {
      setAdminActionMsg({ 
        type: 'error', 
        message: error.response?.data?.error || 'Gagal mengubah status akun.' 
      });
    }
  };

  const handleUpdateUserRole = (userId, targetRole, targetUsername) => {
    const isPromote = targetRole === 'admin';
    setConfirmModal({
      isOpen: true,
      title: isPromote ? 'Jadikan Administrator' : 'Turunkan ke User',
      message: isPromote 
        ? `Apakah Anda yakin ingin MEMBERIKAN HAK AKSES ADMIN kepada akun '${targetUsername}'? Pengguna ini akan memiliki wewenang penuh mengelola konten dan pengguna website.`
        : `Apakah Anda yakin ingin MENURUNKAN role akun '${targetUsername}' menjadi User (Anggota biasa)?`,
      confirmText: isPromote ? 'Ya, Berikan Akses Admin' : 'Ya, Turunkan Role',
      cancelText: 'Batal',
      showCancel: true,
      type: isPromote ? 'warning' : 'info',
      onConfirm: async () => {
        closeConfirmModal();
        setAdminActionMsg({ type: '', message: '' });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `/api/admin/users/${userId}/role/update`,
            { role: targetRole },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAdminActionMsg({ type: 'success', message: response.data.message });
          fetchUsers();
        } catch (error) {
          setAdminActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal mengubah role pengguna.'
          });
        }
      },
      isLoading: false
    });
  };

  const handleDeleteUser = (userId, targetUsername) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      message: `PERINGATAN: Apakah Anda yakin ingin MENGHAPUS akun '${targetUsername}' secara permanen?\n\nSeluruh riwayat presensi yang terkait akun ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Akun',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        setAdminActionMsg({ type: '', message: '' });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(
            `/api/admin/users/${userId}/delete`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAdminActionMsg({ type: 'success', message: response.data.message });
          fetchUsers();
        } catch (error) {
          setAdminActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus akun pengguna.'
          });
        }
      },
      isLoading: false
    });
  };

  const handleForceLogout = async (userId, targetUsername) => {
    setConfirmModal({
      isOpen: true,
      title: 'Logout Paksa Pengguna',
      message: `Apakah Anda yakin ingin MELOGOUT PAKSA sesi pengguna '${targetUsername}'? Pengguna akan langsung dikeluarkan dari sistem.`,
      confirmText: 'Ya, Logout Paksa',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        setAdminActionMsg({ type: '', message: '' });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post(`/api/admin/users/${userId}/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdminActionMsg({ type: 'success', message: response.data.message });
          fetchUsers();
        } catch (error) {
          setAdminActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal melogout paksa pengguna.'
          });
        }
      },
      isLoading: false
    });
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (newUserForm.username.trim().length < 3) {
      showAlert('Username minimal 3 karakter!', 'Validasi Formulir');
      return;
    }
    if (newUserForm.password.length < 6) {
      showAlert('Password minimal 6 karakter!', 'Validasi Formulir');
      return;
    }

    setSavingNewUser(true);
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/admin/users',
        newUserForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      setShowAddUserModal(false);
      setNewUserForm({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setAdminActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menambahkan akun baru.'
      });
    } finally {
      setSavingNewUser(false);
    }
  };

  const handleUpdateAccount = async (id, formData, isSelf) => {
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const url = isSelf ? '/api/users/me/account/update' : `/api/admin/users/${id}/account/update`;
      
      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdminActionMsg({ type: 'success', message: response.data?.message || 'Profil akun berhasil diperbarui!' });
      setEditAccountModalUser(null);
      fetchUsers();
      
      if (isSelf && formData.username && formData.username !== currentUsername) {
        localStorage.setItem('username', formData.username);
        window.location.reload();
      }
    } catch (error) {
      setAdminActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal memperbarui profil akun.'
      });
    }
  };

  const handleOpenEditPermissions = (user) => {
    setEditPermissionsUser(user);
    setPermissionsForm({
      can_upload_berita: !!user.can_upload_berita,
      can_upload_publikasi: !!user.can_upload_publikasi,
      can_upload_modul: !!user.can_upload_modul
    });
    setShowEditPermissionsModal(true);
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!editPermissionsUser) return;
    setSavingPermissions(true);
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/admin/users/${editPermissionsUser.id}/permissions/update`,
        permissionsForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      setShowEditPermissionsModal(false);
      fetchUsers(); 
    } catch (error) {
      setAdminActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan izin upload.'
      });
    } finally {
      setSavingPermissions(false);
    }
  };

  const safeUsers = Array.isArray(userList) ? userList : [];
  const filteredUsers = safeUsers.filter((u) => {
    const matchesSearch = (u.username || '').toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingCount = safeUsers.filter((u) => u.status === 'pending').length;
  const approvedCount = safeUsers.filter((u) => u.status === 'approved').length;
  const rejectedCount = safeUsers.filter((u) => u.status === 'rejected').length;

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
              Kelola status akun, penugasan hak Administrator, edit profil akun, dan ACC akun pendaftar baru.
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
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
            <CustomSelect
              value={userRoleFilter}
              onChange={setUserRoleFilter}
              options={[
                { value: 'all', label: 'Semua Role' },
                { value: 'admin', label: 'Administrator' },
                { value: 'user', label: 'User (Anggota)' }
              ]}
              className="min-w-[150px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-dark uppercase">Status:</span>
            <CustomSelect
              value={userStatusFilter}
              onChange={setUserStatusFilter}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'pending', label: '⏳ Pending (Menunggu ACC)' },
                { value: 'approved', label: '✓ Approved (Aktif)' },
                { value: 'rejected', label: '✕ Rejected (Ditolak)' }
              ]}
              className="min-w-[200px]"
            />
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
                                onClick={() => handleUpdateUserStatus(usr.id, 'approved')}
                                className="inline-flex items-center gap-1 bg-gradient-green text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                title="Setujui pendaftaran (ACC)"
                              >
                                <UserCheck size={11} /> ACC
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus(usr.id, 'rejected')}
                                className="inline-flex items-center gap-1 bg-red-600 text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                title="Tolak pendaftaran"
                              >
                                <UserX size={11} /> Tolak
                              </button>
                            </>
                          )}

                          {usr.status === 'rejected' && (
                            <button
                              onClick={() => handleUpdateUserStatus(usr.id, 'approved')}
                              className="inline-flex items-center gap-1 bg-gradient-green text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Setujui kembali akun"
                            >
                              <UserCheck size={11} /> Aktifkan Lagi
                            </button>
                          )}

                          {usr.status === 'approved' && !isSelf && !isMainAdmin && (
                            <button
                              onClick={() => handleUpdateUserStatus(usr.id, 'rejected')}
                              className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Bekukan / Non-aktifkan akun"
                            >
                              Bekukan
                            </button>
                          )}

                          {/* EDIT PERMISSIONS BUTTON */}
                          {usr.status === 'approved' && !isMainAdmin && (
                            <button
                              onClick={() => handleOpenEditPermissions(usr)}
                              className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Atur Hak Akses Upload"
                            >
                              <Shield size={11} /> Izin
                            </button>
                          )}

                          {/* ROLE TOGGLE */}
                          {!isMainAdmin && usr.status === 'approved' && (
                            <>
                              {usr.role === 'user' ? (
                                <button
                                  onClick={() => handleUpdateUserRole(usr.id, 'admin', usr.username)}
                                  className="inline-flex items-center gap-1 bg-gradient-yellow text-primary-dark font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                  title="Beri hak akses Administrator ke akun ini"
                                >
                                  <Shield size={11} /> + Jadikan Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateUserRole(usr.id, 'user', usr.username)}
                                  className="inline-flex items-center gap-1 bg-gray-200 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                  title="Turunkan hak akses ke User (Anggota)"
                                >
                                  <UserMinus size={11} /> Jadikan User
                                </button>
                              )}
                            </>
                          )}

                          {/* EDIT ACCOUNT BUTTON */}
                          {(!isMainAdmin || currentUsername === 'admin') && (
                            <button
                              onClick={() => setEditAccountModalUser({
                                id: usr.id,
                                username: usr.username,
                                email: usr.email,
                                isSelf: isSelf
                              })}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Edit akun pengguna"
                            >
                              <Key size={11} /> Akun
                            </button>
                          )}

                          {/* FORCE LOGOUT BUTTON */}
                          {usr.status === 'approved' && !isSelf && (
                            <button
                              onClick={() => handleForceLogout(usr.id, usr.username)}
                              className="inline-flex items-center gap-1 bg-red-600 text-white font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                              title="Logout Paksa"
                            >
                              <LogOut size={11} /> Kick
                            </button>
                          )}

                          {/* DELETE USER BUTTON */}
                          {!isMainAdmin && !isSelf && (
                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.username)}
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

      {/* MODALS */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        newUserForm={newUserForm}
        setNewUserForm={setNewUserForm}
        handleCreateUserSubmit={handleCreateUserSubmit}
        savingNewUser={savingNewUser}
      />

      <EditAccountModal
        isOpen={!!editAccountModalUser}
        onClose={() => setEditAccountModalUser(null)}
        user={editAccountModalUser}
        onSave={handleUpdateAccount}
      />

      <EditPermissionsModal
        isOpen={showEditPermissionsModal}
        onClose={() => setShowEditPermissionsModal(false)}
        user={editPermissionsUser}
        permissionsForm={permissionsForm}
        setPermissionsForm={setPermissionsForm}
        onSubmit={handleSavePermissions}
        isSaving={savingPermissions}
      />
    </div>
  );
}
