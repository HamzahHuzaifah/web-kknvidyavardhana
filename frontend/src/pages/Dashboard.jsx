import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  ShieldCheck, 
  UploadCloud, 
  Compass, 
  Video, 
  BookOpen, 
  FolderOpen,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ConfirmModal from '../components/ConfirmModal';
import UsersTab from '../components/dashboard/UsersTab';
import ArticlesTab from '../components/dashboard/ArticlesTab';
import FileManagerTab from '../components/dashboard/FileManagerTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import SocialMediaTab from '../components/dashboard/SocialMediaTab';
import JumbotronTab from '../components/dashboard/JumbotronTab';
import EditAccountModal from '../components/dashboard/modals/EditAccountModal';
import MyProfileTab from '../components/dashboard/MyProfileTab';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';

export default function Dashboard() {
  const username = localStorage.getItem('username') || 'Pengguna';
  const role = localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'welcome');
  const [editAccountModalUser, setEditAccountModalUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  
  // Custom Pop-up / Confirm Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Konfirmasi Tindakan',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    showCancel: true,
    type: 'danger',
    onConfirm: null,
    isLoading: false
  });

  useEffect(() => {
    if (!isAdmin) {
      const token = localStorage.getItem('token');
      if (token) {
        axios.get('/api/users/me/permissions', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setUserPermissions(res.data);
        }).catch(err => console.error(err));
      }
    }
  }, [isAdmin]);

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = (message, title = 'Perhatian') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText: 'Mengerti',
      cancelText: 'Tutup',
      showCancel: false,
      type: 'warning',
      onConfirm: () => closeConfirmModal(),
      isLoading: false
    });
  };

  const handleUpdateAccount = async (id, formData, isSelf) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/me/account/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert(response.data?.message || 'Profil akun berhasil diperbarui!', 'Berhasil');
      setEditAccountModalUser(null);
      
      if (formData.username && formData.username !== username) {
        localStorage.setItem('username', formData.username);
        window.location.reload();
      }
    } catch (error) {
      showAlert(error.response?.data?.error || 'Gagal memperbarui profil akun.', 'Gagal');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile & Status Card */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-yellow rounded-full mix-blend-multiply opacity-30 -mr-12 -mt-12 pointer-events-none"></div>

          <div>
            <div className="flex items-start sm:items-center gap-4 mb-2">
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-3xl font-black text-primary-dark uppercase leading-none">
                  Halo, {username}!
                </h1>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase mt-1 sm:mt-0 ${
                isAdmin 
                  ? 'bg-gradient-yellow text-primary-dark' 
                  : 'bg-gradient-green text-white'
              }`}>
                Role: {isAdmin ? 'ADMINISTRATOR' : 'USER (ANGGOTA)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {isAdmin 
                ? 'Panel Pengelolaan: ACC Akun, Profil, Medsos, serta Kelola Berita, Publikasi & Modul.' 
                : 'Hak Akses: Mempublikasikan Berita, Publikasi & Modul KKN.'}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-bold px-4 py-2.5 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs tracking-wider"
            >
              <UploadCloud size={16} /> Upload Berita / Modul
            </Link>
          </div>
        </div>

        {/* NAVIGATION TABS FOR ADMIN */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 border-b-2 border-primary-dark pb-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <ShieldCheck size={15} /> ACC & Kelola User
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'articles'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <BookOpen size={15} /> Kelola Berita, Publikasi & Modul
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'files'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <FolderOpen size={15} /> Manajer Berkas & Media Terpadu
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'social'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Video size={15} /> Kelola Medsos Resmi & Video Web
            </button>
            
            <button
              onClick={() => setActiveTab('jumbotron')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'jumbotron'
                  ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Layers size={15} /> Banner
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Compass size={15} /> Profil Tim & Desa
            </button>
          </div>
        )}

        {/* TAB CONTENTS (ANIMATED) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ErrorBoundary key={activeTab} message="Gagal memuat tab ini. Pastikan server backend cPanel telah di-restart untuk memuat perubahan terbaru.">
              {isAdmin && activeTab === 'users' && (
                <UsersTab 
                  isAdmin={isAdmin}
                  currentUsername={username}
                  showAlert={showAlert}
                  setConfirmModal={setConfirmModal}
                  closeConfirmModal={closeConfirmModal}
                />
              )}

              {isAdmin && activeTab === 'articles' && (
                <ArticlesTab 
                  setConfirmModal={setConfirmModal}
                  closeConfirmModal={closeConfirmModal}
                />
              )}

              {isAdmin && activeTab === 'files' && (
                <FileManagerTab 
                  isAdmin={isAdmin}
                  setConfirmModal={setConfirmModal}
                  closeConfirmModal={closeConfirmModal}
                  showAlert={showAlert}
                />
              )}

              {isAdmin && activeTab === 'profile' && (
                <ProfileTab 
                  token={localStorage.getItem('token')} 
                  setConfirmModal={setConfirmModal}
                  closeConfirmModal={closeConfirmModal}
                />
              )}

              {isAdmin && activeTab === 'social' && (
                <SocialMediaTab 
                  isAdmin={isAdmin}
                  setConfirmModal={setConfirmModal}
                  closeConfirmModal={closeConfirmModal}
                />
              )}

              {isAdmin && activeTab === 'jumbotron' && (
                <JumbotronTab 
                  showAlert={(msg, title) => showAlert(msg, title)}
                  setAdminActionMsg={() => {}} 
                  setConfirmModal={setConfirmModal}
                />
              )}
            </ErrorBoundary>

            {/* Welcome Tab for Standard User */}
            {!isAdmin && activeTab === 'welcome' && (
              <div className="bg-white border-2 border-primary-dark shadow-hard p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 border-2 border-primary-dark rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <ShieldCheck size={40} className="text-primary-dark" />
                </div>
                <h2 className="text-2xl font-black text-primary-dark uppercase">Selamat Datang di Panel KKN</h2>
                <p className="text-gray-600 font-medium max-w-lg mx-auto">
                  Anda masuk sebagai <strong>User (Anggota Biasa)</strong>. Saat ini akses Anda terbatas pada fitur publikasi artikel, berita, dan modul. Hubungi Ketua / Admin jika membutuhkan akses pengelolaan data profil atau persetujuan.
                </p>
                <div className="pt-6 flex justify-center gap-4">
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black px-6 py-3 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider"
                  >
                    <UploadCloud size={20} /> Mulai Upload Berita
                  </Link>
                  {userPermissions?.can_edit_profile && (
                    <button
                      onClick={() => setActiveTab('my-profile')}
                      className="inline-flex items-center gap-2 bg-gradient-blue text-white font-black px-6 py-3 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider"
                    >
                      <Compass size={20} /> Kelola Profil Saya
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isAdmin && activeTab === 'my-profile' && userPermissions?.can_edit_profile && (
              <MyProfileTab token={localStorage.getItem('token')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onCancel={closeConfirmModal}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        showCancel={confirmModal.showCancel}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        isLoading={confirmModal.isLoading}
      />

      <EditAccountModal
        isOpen={!!editAccountModalUser}
        onClose={() => setEditAccountModalUser(null)}
        user={editAccountModalUser}
        onSave={handleUpdateAccount}
      />
    </div>
  );
}
