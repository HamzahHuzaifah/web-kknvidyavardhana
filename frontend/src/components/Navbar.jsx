import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { Home, User, BookOpen, LayoutDashboard, Image as ImageIcon, LogIn, LogOut, UserCircle, Menu, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import EditAccountModal from './dashboard/modals/EditAccountModal';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [editAccountModalUser, setEditAccountModalUser] = useState(null);

  const isNavActive = (path) => {
    if (path === '/') return pathname === '/';
    if (path === '/profile') return pathname === '/profile' || pathname.startsWith('/portofolio') || pathname.startsWith('/portfolio') || pathname.startsWith('/profil');
    if (path === '/media') return pathname.startsWith('/media');
    if (path === '/berita') return pathname.startsWith('/berita');
    if (path === '/dashboard') return pathname.startsWith('/dashboard');
    if (path === '/login') return pathname === '/login' || pathname === '/register';
    return pathname === path;
  };

  const getDesktopNavLinkClass = (path) => {
    const active = isNavActive(path);
    return `flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-xs uppercase tracking-wider font-bold ${
      active
        ? 'bg-gradient-yellow text-primary-dark font-black border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-0.5'
        : 'text-gray-100 hover:text-secondary-light hover:-translate-y-0.5'
    }`;
  };

  const getMobileNavLinkClass = (path) => {
    const active = isNavActive(path);
    return `flex items-center gap-3 px-3.5 py-3 rounded-md transition-all text-sm font-bold ${
      active
        ? 'bg-gradient-yellow text-primary-dark font-black border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)] translate-x-1'
        : 'text-white hover:bg-primary-light/30 hover:text-secondary-light font-medium'
    }`;
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get('/api/profile-info');
        if (res.data && res.data.logo_url) {
          setLogoUrl(res.data.logo_url);
          const link = document.querySelector("link[rel~='icon']");
          if (link) link.href = res.data.logo_url;
        }
      } catch (e) {
        // fallback to default
      }
    };
    fetchLogo();

    const handleLogoUpdate = (e) => {
      if (e.detail && e.detail.logo_url) {
        setLogoUrl(e.detail.logo_url);
        const link = document.querySelector("link[rel~='icon']");
        if (link) link.href = e.detail.logo_url;
      }
    };
    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  const confirmLogout = async () => {
    try {
      await api.post('/api/logout'); // Tells backend to nullify active_token
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setShowLogoutModal(false);
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleUpdateAccount = async (id, formData, isSelf) => {
    try {
      const response = await axios.post('/api/users/me/account/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data?.message || 'Profil akun berhasil diperbarui!');
      setEditAccountModalUser(null);
      if (formData.username && formData.username !== currentUsername) {
        localStorage.setItem('username', formData.username);
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal memperbarui profil akun.');
    }
  };

  return (
    <nav className="bg-primary-dark text-white sticky top-0 z-50 border-b-4 border-secondary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu} className="flex-shrink-0 flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={`${logoUrl}`}
                  alt="Logo"
                  className="w-8 h-8 object-contain bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] p-0.5"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-yellow text-primary-dark font-bold flex items-center justify-center border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  K
                </div>
              )}
              <span className="font-bold text-lg sm:text-xl tracking-tight uppercase">KKN Vidya Vardhana</span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border-2 border-transparent focus:border-secondary-light outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex sm:items-center sm:space-x-3">
            <Link to="/" className={getDesktopNavLinkClass('/')}>
              <Home size={16} /> Beranda
            </Link>
            <Link to="/profile" className={getDesktopNavLinkClass('/profile')}>
              <User size={16} /> Profil
            </Link>
            <Link to="/media" className={getDesktopNavLinkClass('/media')}>
              <ImageIcon size={16} /> Media
            </Link>
            <Link to="/berita" className={getDesktopNavLinkClass('/berita')}>
              <BookOpen size={16} /> Berita
            </Link>
            {token ? (
              <button onClick={() => setEditAccountModalUser({ id: 'me', username: currentUsername, email: '', isSelf: true })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-bold text-gray-100 hover:text-secondary-light hover:-translate-y-0.5 transition-all">
                <UserCircle size={16} /> {currentUsername}
              </button>
            ) : (
              <Link to="/login" className={getDesktopNavLinkClass('/login')}>
                <LogIn size={16} /> Login
              </Link>
            )}

            {token && (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-primary-light">
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 border transition-all ${
                    isNavActive('/dashboard')
                      ? 'bg-secondary-light text-primary-dark border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                      : 'text-secondary-light border-secondary-light/60 hover:bg-secondary-light hover:text-primary-dark'
                  }`}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 border border-primary-dark text-xs font-black uppercase hover:bg-red-700 transition-colors shadow-sm">
                  <LogOut size={13} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-secondary-dark bg-primary-dark">
          <div className="px-4 pt-3 pb-5 space-y-2 flex flex-col">
            <Link to="/" onClick={closeMenu} className={getMobileNavLinkClass('/')}>
              <Home size={18} /> Beranda
            </Link>
            <Link to="/profile" onClick={closeMenu} className={getMobileNavLinkClass('/profile')}>
              <User size={18} /> Profil
            </Link>
            <Link to="/media" onClick={closeMenu} className={getMobileNavLinkClass('/media')}>
              <ImageIcon size={18} /> Media
            </Link>
            <Link to="/berita" onClick={closeMenu} className={getMobileNavLinkClass('/berita')}>
              <BookOpen size={18} /> Berita
            </Link>
            {token ? (
              <button onClick={() => { setEditAccountModalUser({ id: 'me', username: currentUsername, email: '', isSelf: true }); closeMenu(); }} className="flex items-center gap-3 px-3.5 py-3 rounded-md text-white hover:bg-primary-light/30 transition-colors font-medium text-sm w-full text-left">
                <UserCircle size={18} /> {currentUsername}
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu} className={getMobileNavLinkClass('/login')}>
                <LogIn size={18} /> Login
              </Link>
            )}
            
            <div className="h-px bg-primary-light/40 my-2"></div>
            
            {token && (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={closeMenu} 
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-md transition-all text-sm font-black uppercase ${
                    isNavActive('/dashboard')
                      ? 'bg-gradient-yellow text-primary-dark border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)] translate-x-1'
                      : 'text-secondary-light hover:bg-primary-light/30'
                  }`}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-3 mt-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold text-sm text-left w-full text-white shadow-sm">
                  <LogOut size={18} /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM LOGOUT MODAL */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Konfirmasi Keluar Akun"
        message="Apakah Anda yakin ingin keluar dari sesi akun Anda saat ini?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <EditAccountModal 
        isOpen={!!editAccountModalUser}
        onClose={() => setEditAccountModalUser(null)}
        user={editAccountModalUser}
        onSave={handleUpdateAccount}
        isLoading={false}
      />
    </nav>
  );
}
