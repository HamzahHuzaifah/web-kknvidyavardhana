import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UploadForm from './pages/UploadForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Media from './pages/Media';
import ArticlesPage from './pages/ArticlesPage';
import PortfolioDetail from './pages/PortfolioDetail';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AnimatedPage from './components/AnimatedPage';
import ErrorBoundary from './components/ErrorBoundary';

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
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        <Route path="/media" element={<AnimatedPage><Media /></AnimatedPage>} />
        <Route path="/portofolio/:id" element={<PortfolioDetail />} />
        <Route path="/berita" element={<AnimatedPage><ArticlesPage /></AnimatedPage>} />
        <Route path="/berita/:slug" element={<AnimatedPage><ArticleDetailPage /></AnimatedPage>} />
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
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;
