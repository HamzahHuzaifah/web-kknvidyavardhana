import { Link, useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, UploadCloud, LayoutDashboard, Image as ImageIcon, LogIn, LogOut, UserCircle } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-primary-dark text-white sticky top-0 z-50 border-b-4 border-secondary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-yellow text-primary-dark font-bold flex items-center justify-center border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                K
              </div>
              <span className="font-bold text-xl tracking-tight uppercase">KKN Vidya Vardhana</span>
            </Link>
          </div>
          
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

            {token ? (
              <div className="flex items-center gap-3 pl-2 border-l-2 border-primary-light">
                <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold hover:text-secondary-light">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 border border-primary-dark text-xs font-bold uppercase hover:bg-red-700">
                  <LogOut size={13} /> Keluar
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 bg-gradient-blue text-white px-3.5 py-1.5 border-2 border-white shadow-[2px_2px_0px_0px_rgba(234,179,8,1)] hover:brightness-110 hover:translate-y-0.5 hover:shadow-none transition-all font-bold uppercase text-xs">
                <LogIn size={15} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
