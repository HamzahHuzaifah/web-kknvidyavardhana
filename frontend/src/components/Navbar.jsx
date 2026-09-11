import { Link } from 'react-router-dom';
import { Home, User, BookOpen, UploadCloud } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white sticky top-0 z-50 border-b-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary text-primary font-bold flex items-center justify-center border-2 border-primary shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                K
              </div>
              <span className="font-bold text-xl tracking-tight uppercase">Vidya Vardhana</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="flex items-center gap-2 hover:text-secondary hover:-translate-y-0.5 transition-transform font-medium">
              <Home size={18} /> Beranda
            </Link>
            <Link to="#" className="flex items-center gap-2 hover:text-secondary hover:-translate-y-0.5 transition-transform font-medium">
              <User size={18} /> Profil
            </Link>
            <Link to="#" className="flex items-center gap-2 hover:text-secondary hover:-translate-y-0.5 transition-transform font-medium">
              <BookOpen size={18} /> Berita
            </Link>
            <Link to="/upload" className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 border-2 border-primary shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-400 hover:translate-y-0.5 hover:shadow-none transition-all font-bold uppercase text-sm">
              <UploadCloud size={18} /> Upload
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
