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
  Layers,
  PanelBottom,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ConfirmModal from '../components/ConfirmModal';
import UsersTab from '../components/dashboard/UsersTab';
import ArticlesTab from '../components/dashboard/ArticlesTab';
import FileManagerTab from '../components/dashboard/FileManagerTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import SocialMediaTab from '../components/dashboard/SocialMediaTab';
import JumbotronTab from '../components/dashboard/JumbotronTab';
import FooterTab from '../components/dashboard/FooterTab';
import WelcomeAudioTab from '../components/dashboard/WelcomeAudioTab';
import EditAccountModal from '../components/dashboard/modals/EditAccountModal';
import MyProfileTab from '../components/dashboard/MyProfileTab';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';
import { UserCircle, Music } from 'lucide-react';

export default function Dashboard() {
  const username = localStorage.getItem('username') || 'Pengguna';
  const role = localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'welcome');
  const [editAccountModalUser, setEditAccountModalUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  
  // Extract userId from token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch (e) {
      console.error("Failed to parse token", e);
    }
  }

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'users', label: 'ACC & Kelola User', icon: ShieldCheck },
    { id: 'articles', label: 'Kelola Berita, Publikasi & Modul', icon: BookOpen },
    { id: 'files', label: 'Manajer Berkas & Media Terpadu', icon: FolderOpen },
    { id: 'social', label: 'Kelola Medsos Resmi & Video Web', icon: Video },
    { id: 'jumbotron', label: 'Banner', icon: Layers },
    { id: 'profile', label: 'Profil Tim & Desa', icon: Compass },
    { id: 'footer', label: 'Kelola Footer', icon: PanelBottom },
    { id: 'audio', label: 'Musik & Sambutan', icon: Music },
    { id: 'my-profile', label: 'Kelola Profil Saya', icon: UserCircle },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Profile & Status Card */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-yellow rounded-full mix-blend-multiply opacity-30 -mr-12 -mt-12 pointer-events-none"></div>

          <div>
            <div className="flex items-start sm:items-center gap-4 mb-2 flex-wrap">
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-2xl sm:text-3xl font-black text-primary-dark uppercase leading-none">
                  Halo, {username}!
                </h1>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase ${
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

        {/* MAIN BODY: ADMIN WITH SIDEBAR OR STANDARD USER */}
        {isAdmin ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6 z-20">
              <div className="bg-white border-2 border-primary-dark shadow-hard p-4 sm:p-5">
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-primary-dark pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-primary-dark rounded-full animate-pulse"></span>
                    <h2 className="text-xs font-black uppercase text-primary-dark tracking-wider">
                      Menu Navigasi
                    </h2>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 border border-primary-dark text-primary-dark">
                    9 Tab Admin
                  </span>
                </div>

                {/* Mobile Toggle Button */}
                <div className="lg:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-black uppercase bg-yellow-50 border-2 border-primary-dark text-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="flex items-center gap-2 truncate mr-2">
                      Menu: <span className="text-primary-light font-extrabold truncate">{navTabs.find(t => t.id === activeTab)?.label || activeTab}</span>
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 bg-white border border-primary-dark shrink-0">
                      {isMobileMenuOpen ? 'Tutup ▲' : 'Buka Menu ▼'}
                    </span>
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className={`flex flex-col gap-2 ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
                  {navTabs.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isYellow = item.id === 'jumbotron' || item.id === 'audio';
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs uppercase border-2 border-primary-dark transition-all flex items-center justify-between gap-2 ${
                          isActive
                            ? isYellow
                              ? 'bg-gradient-yellow text-primary-dark font-black shadow-none translate-x-1'
                              : 'bg-gradient-blue text-white font-black shadow-none translate-x-1'
                            : 'bg-white text-primary-dark font-bold hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={16} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isYellow ? 'bg-primary-dark' : 'bg-secondary-light'}`} />
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Info / Tips in Sidebar Footer */}
                <div className="mt-4 pt-3 border-t-2 border-primary-dark hidden lg:block">
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    💡 Pilih menu di atas untuk mengelola data website. Data disimpan secara langsung ke database.
                  </p>
                </div>

              </div>
            </aside>

            {/* TAB CONTENTS (ANIMATED) */}
            <main className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ErrorBoundary key={activeTab} message="Gagal memuat tab ini. Pastikan server backend cPanel telah di-restart untuk memuat perubahan terbaru.">
                    {activeTab === 'users' && (
                      <UsersTab 
                        isAdmin={isAdmin}
                        currentUsername={username}
                        showAlert={showAlert}
                        setConfirmModal={setConfirmModal}
                        closeConfirmModal={closeConfirmModal}
                      />
                    )}

                    {activeTab === 'articles' && (
                      <ArticlesTab 
                        setConfirmModal={setConfirmModal}
                        closeConfirmModal={closeConfirmModal}
                        isAdmin={isAdmin}
                        userId={userId}
                        onBack={null}
                      />
                    )}

                    {activeTab === 'files' && (
                      <FileManagerTab 
                        isAdmin={isAdmin}
                        setConfirmModal={setConfirmModal}
                        closeConfirmModal={closeConfirmModal}
                        showAlert={showAlert}
                      />
                    )}

                    {activeTab === 'social' && (
                      <SocialMediaTab 
                        isAdmin={isAdmin}
                        setConfirmModal={setConfirmModal}
                        closeConfirmModal={closeConfirmModal}
                      />
                    )}

                    {activeTab === 'jumbotron' && (
                      <JumbotronTab 
                        showAlert={(msg, title) => showAlert(msg, title)}
                        setAdminActionMsg={() => {}} 
                        setConfirmModal={setConfirmModal}
                      />
                    )}

                    {activeTab === 'profile' && (
                      <ProfileTab 
                        token={localStorage.getItem('token')} 
                        setConfirmModal={setConfirmModal}
                        closeConfirmModal={closeConfirmModal}
                      />
                    )}

                    {activeTab === 'footer' && (
                      <FooterTab 
                        showAlert={showAlert}
                        setConfirmModal={setConfirmModal}
                      />
                    )}

                    {activeTab === 'audio' && (
                      <WelcomeAudioTab 
                        token={localStorage.getItem('token')}
                      />
                    )}

                    {activeTab === 'my-profile' && (
                      <div className="space-y-4">
                        <MyProfileTab token={localStorage.getItem('token')} />
                      </div>
                    )}
                  </ErrorBoundary>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        ) : (
          /* STANDARD USER VIEW */
          <main className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ErrorBoundary key={activeTab} message="Gagal memuat tab ini. Pastikan server backend cPanel telah di-restart untuk memuat perubahan terbaru.">
                  {activeTab === 'welcome' && (
                    <div className="bg-white border-2 border-primary-dark shadow-hard p-10 text-center space-y-4">
                      <div className="w-20 h-20 bg-blue-50 border-2 border-primary-dark rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                        <ShieldCheck size={40} className="text-primary-dark" />
                      </div>
                      <h2 className="text-2xl font-black text-primary-dark uppercase">Selamat Datang di Panel KKN</h2>
                      <p className="text-gray-600 font-medium max-w-lg mx-auto">
                        Anda masuk sebagai <strong>User (Anggota Biasa)</strong>. Saat ini akses Anda terbatas pada fitur publikasi artikel, berita, dan modul. Hubungi Ketua / Admin jika membutuhkan akses pengelolaan data profil atau persetujuan.
                      </p>
                      <div className="pt-6 flex flex-wrap justify-center items-stretch gap-4">
                        <Link
                          to="/upload"
                          className="flex-1 min-w-[220px] max-w-[280px] inline-flex items-center justify-center gap-2 bg-gradient-yellow text-primary-dark font-black px-5 py-3.5 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider text-xs sm:text-sm text-center"
                        >
                          <UploadCloud size={18} /> Mulai Upload Berita
                        </Link>

                        {userPermissions?.can_edit_profile && (
                          <button
                            onClick={() => setActiveTab('my-profile')}
                            className="flex-1 min-w-[220px] max-w-[280px] inline-flex items-center justify-center gap-2 bg-gradient-blue text-white font-black px-5 py-3.5 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider text-xs sm:text-sm text-center"
                          >
                            <Compass size={18} /> Kelola Profil Saya
                          </button>
                        )}

                        {(userPermissions?.can_upload_berita || userPermissions?.can_upload_publikasi || userPermissions?.can_upload_modul) && (
                          <button
                            onClick={() => setActiveTab('articles')}
                            className="flex-1 min-w-[220px] max-w-[280px] inline-flex items-center justify-center gap-2 bg-white hover:bg-yellow-50 text-primary-dark font-black px-5 py-3.5 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider text-xs sm:text-sm text-center"
                          >
                            <BookOpen size={18} /> Kelola Berita, Publikasi & Modul
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {(userPermissions?.can_upload_berita || userPermissions?.can_upload_publikasi || userPermissions?.can_upload_modul) && activeTab === 'articles' && (
                    <ArticlesTab 
                      setConfirmModal={setConfirmModal}
                      closeConfirmModal={closeConfirmModal}
                      isAdmin={false}
                      userId={userId}
                      onBack={() => setActiveTab('welcome')}
                    />
                  )}

                  {activeTab === 'my-profile' && userPermissions?.can_edit_profile && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setActiveTab('welcome')}
                        className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all mb-2"
                      >
                        <ArrowLeft size={13} /> Kembali ke Menu Dashboard
                      </button>
                      <MyProfileTab token={localStorage.getItem('token')} />
                    </div>
                  )}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </main>
        )}
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
