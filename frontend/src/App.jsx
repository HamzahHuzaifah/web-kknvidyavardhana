import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AnimatedPage from './components/AnimatedPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        <Route path="/media" element={<AnimatedPage><Media /></AnimatedPage>} />
        <Route path="/berita" element={<AnimatedPage><ArticlesPage /></AnimatedPage>} />
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
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
