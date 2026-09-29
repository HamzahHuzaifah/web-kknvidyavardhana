import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AnimatedPage from './components/AnimatedPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AudioProvider } from './context/AudioContext';
import WelcomeAudioModal from './components/WelcomeAudioModal';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';

// Code Splitting (Lazy-load non-landing routes to keep initial bundle ultra-light)
const UploadForm = lazy(() => import('./pages/UploadForm'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Media = lazy(() => import('./pages/Media'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    let title = 'KKN Vidya Vardhana';
    
    if (path === '/') title = 'Beranda | KKN Vidya Vardhana';
    else if (path.startsWith('/profile')) title = 'Profil Desa | KKN Vidya Vardhana';
    else if (path.startsWith('/media')) title = 'Media & Galeri | KKN Vidya Vardhana';
    else if (path.startsWith('/berita')) title = 'Berita KKN | KKN Vidya Vardhana';
    else if (path.startsWith('/login')) title = 'Login | KKN Vidya Vardhana';
    else if (path.startsWith('/register')) title = 'Daftar | KKN Vidya Vardhana';
    else if (path.startsWith('/dashboard')) title = 'Dashboard Admin | KKN Vidya Vardhana';
    
    document.title = title;

    // Dynamically update canonical link per route
    const canonicalTag = document.getElementById('canonical-url');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', `https://vidyavardhana.my.id${path}`);
    }
  }, [location]);

  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Memuat...</span>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="/media" element={<AnimatedPage><Media /></AnimatedPage>} />
          <Route path="/portofolio/:slug" element={<PortfolioDetail />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="/profil/:slug" element={<PortfolioDetail />} />
          <Route path="/berita" element={<AnimatedPage><ArticlesPage /></AnimatedPage>} />
          <Route path="/berita/:slug" element={<AnimatedPage><ArticleDetailPage /></AnimatedPage>} />
          <Route path="/publikasi/:slug" element={<AnimatedPage><ArticleDetailPage /></AnimatedPage>} />
          <Route path="/jurnal/:slug" element={<AnimatedPage><ArticleDetailPage /></AnimatedPage>} />
          <Route path="/modul/:slug" element={<AnimatedPage><ArticleDetailPage /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AnimatedPage><Dashboard /></AnimatedPage>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <AnimatedPage><UploadForm /></AnimatedPage>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AudioProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </main>
          <ErrorBoundary message="Gagal memuat bagian footer website.">
            <Footer />
          </ErrorBoundary>

          {/* Welcome Audio Splash Modal & Floating Music Player */}
          <WelcomeAudioModal />
          <FloatingMusicPlayer />
        </div>
      </AudioProvider>
    </Router>
  );
}

export default App;
