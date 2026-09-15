import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, User, BookOpen, LayoutDashboard, Image as ImageIcon, LogIn, LogOut, UserCircle, Menu, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

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

  const confirmLogout = () => {
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
          <div className="hidden lg:flex sm:items-center sm:space-x-5">
            <Link to="/" className="flex items-center gap-2 hover:text-secondary-light hover:-translate-y-0.5 transition-transform font-medium text-sm">
              <Home size={17} /> Beranda
            </Link>
            <Link to="/profile" className="flex items-center gap-2 hover:text-secondary-light hover:-translate-y-0.5 transition-transform font-medium text-sm">
              <User size={17} /> Profil
            </Link>
            <Link to="/media" className="flex items-center gap-2 hover:text-secondary-light hover:-translate-y-0.5 transition-transform font-medium text-sm">
              <ImageIcon size={17} /> Media
            </Link>
            <Link to="/berita" className="flex items-center gap-2 hover:text-secondary-light hover:-translate-y-0.5 transition-transform font-medium text-sm">
              <BookOpen size={17} /> Berita
            </Link>
            <Link to={token ? "/dashboard" : "/login"} className="flex items-center gap-2 hover:text-secondary-light hover:-translate-y-0.5 transition-transform font-medium text-sm">
              <UserCircle size={17} /> Akun
            </Link>

            {token && (
              <div className="flex items-center gap-3 pl-2 border-l-2 border-primary-light">
                <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold hover:text-secondary-light">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 border border-primary-dark text-xs font-bold uppercase hover:bg-red-700">
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
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-medium text-sm">
              <Home size={18} /> Beranda
            </Link>
            <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-medium text-sm">
              <User size={18} /> Profil
            </Link>
            <Link to="/media" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-medium text-sm">
              <ImageIcon size={18} /> Media
            </Link>
            <Link to="/berita" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-medium text-sm">
              <BookOpen size={18} /> Berita
            </Link>
            <Link to={token ? "/dashboard" : "/login"} onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-medium text-sm">
              <UserCircle size={18} /> Akun
            </Link>
            
            <div className="h-px bg-primary-light my-2"></div>
            
            {token && (
              <>
                <Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary-light transition-colors font-bold text-sm text-secondary-light">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 mt-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold text-sm text-left w-full">
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
    </nav>
  );
}
