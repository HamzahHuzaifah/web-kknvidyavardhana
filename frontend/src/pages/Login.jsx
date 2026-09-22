import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogIn, 
  AlertCircle, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Lock, 
  User,
  ShieldCheck
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import AbstractGeometric from '../components/AbstractGeometric';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch official logo if available
    axios.get('/api/profile-info')
      .then((res) => {
        if (res.data?.logo_url) setLogoUrl(res.data.logo_url);
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role || 'user');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/google-login', {
        credential: credentialResponse.credential,
        clientId: credentialResponse.clientId,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('role', response.data.user.role || 'user');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Login Google gagal.');
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      
      {/* ================= LEFT COLUMN: HERO & BRAND VISUAL (FULL-WIDTH 50%) ================= */}
      <div className="lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-[#172554] via-[#1E3A8A] to-[#0f172a] text-white px-6 py-8 sm:px-12 sm:py-14 lg:py-16 xl:py-20 lg:pr-16 xl:pr-20 lg:pl-8 xl:pl-[calc(50vw-640px+32px)] flex flex-col justify-between relative overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-primary-dark">
        
        {/* Subtle curved background lines */}
        <AbstractGeometric className="text-white" opacity="opacity-20" />

        {/* Top Brand Mark (Asterisk / Star Badge) */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-yellow text-primary-dark border-2 border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-2xl sm:text-3xl select-none">
            ✦
          </div>

          {/* Quick jump to login form on mobile */}
          <a 
            href="#form-login-section"
            className="lg:hidden inline-flex items-center gap-1.5 bg-gradient-yellow text-primary-dark font-black text-[11px] uppercase px-3 py-1.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <span>Form Login</span>
            <ArrowRight size={12} className="rotate-90" />
          </a>
        </div>

        {/* Main Greeting Typography */}
        <div className="relative z-10 my-auto py-8 sm:py-14 space-y-4">
          <span className="bg-white/10 text-secondary-light text-[11px] font-black px-3 py-1 border border-white/20 uppercase tracking-widest inline-block">
            Portal Akses Posko
          </span>
          
          <h1 className="text-[26px] sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight uppercase tracking-tight">
            Hello <br />
            <span className="text-secondary-light">VidyaVardhana!</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed max-w-lg pt-1">
            Satu pintu terpadu untuk mengelola publikasi riset, warta berita kegiatan, modul ajar desa, dan dokumentasi KKN Kelompok 07 di Desa Ciasihan.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-2.5 pt-4 border-t border-white/10 max-w-md">
            <div className="flex items-center gap-2.5 text-xs text-gray-200 font-medium">
              <CheckCircle2 size={16} className="text-secondary shrink-0" />
              <span>Kelola Berita, Modul & Jurnal Pengabdian</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-200 font-medium">
              <CheckCircle2 size={16} className="text-secondary shrink-0" />
              <span>Manajemen File & Portofolio Anggota</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-200 font-medium">
              <CheckCircle2 size={16} className="text-secondary shrink-0" />
              <span>Terintegrasi Database Posko Desa Ciasihan</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-300 font-medium">
            &copy; {new Date().getFullYear()} KKN Vidya Vardhana UNUSIA. All rights reserved.
          </p>
        </div>

      </div>

      {/* ================= RIGHT COLUMN: LOGIN FORM PANEL (FULL-WIDTH 50%) ================= */}
      <div id="form-login-section" className="lg:col-span-6 xl:col-span-6 bg-white px-6 py-8 sm:px-12 sm:py-14 lg:py-16 xl:py-20 lg:pl-16 xl:pl-20 lg:pr-8 xl:pr-[calc(50vw-640px+32px)] flex flex-col justify-between items-center relative min-h-full">
        
        {/* Top Navbar info within panel */}
        <div className="w-full max-w-md flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo KKN"
                className="w-9 h-9 object-contain bg-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-0.5"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-yellow text-primary-dark font-black text-xs flex items-center justify-center border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                KV
              </div>
            )}
            <span className="text-sm font-black uppercase text-primary-dark tracking-wide">
              KKN Vidya Vardhana
            </span>
          </div>

          <Link 
            to="/" 
            className="text-xs font-bold text-gray-500 hover:text-primary-dark flex items-center gap-1 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={14} />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md my-auto space-y-6">
          
          {/* Form Headline (Welcome Back!) */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-primary-dark uppercase tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Belum memiliki akun kontributor?{' '}
              <Link 
                to="/register" 
                className="font-black text-secondary-dark hover:underline underline-offset-2"
              >
                Daftar akun baru sekarang
              </Link>
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-red-600 text-red-700 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5 text-red-600" size={16} />
              <span className="font-bold text-xs leading-snug">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username or Email Input */}
            <div className="space-y-1.5">
              <label className="block text-primary-dark font-black uppercase text-xs tracking-wider">
                Username atau Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  required
                  placeholder="nama@email.com atau username..."
                  className="w-full border-2 border-primary-dark px-3.5 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:bg-yellow-50/40 bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-primary-dark font-black uppercase text-xs tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan password akun Anda..."
                  className="w-full border-2 border-primary-dark pl-3.5 pr-10 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:bg-yellow-50/40 bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-dark p-1"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button: Login Now */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-dark text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-6 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none active:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <span>{loading ? 'Memverifikasi...' : 'Login Now'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Divider: Atau Masuk Dengan */}
            <div className="py-2 flex items-center justify-center gap-3">
              <div className="h-0.5 flex-1 bg-gray-200"></div>
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider whitespace-nowrap">
                Atau Lanjutkan Dengan
              </span>
              <div className="h-0.5 flex-1 bg-gray-200"></div>
            </div>

            {/* Google Login Component */}
            <div className="flex justify-center pb-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                text="continue_with"
              />
            </div>

          </form>
        </div>

        {/* Quick Notice Footer */}
        <div className="w-full max-w-md pt-6 mt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Sistem Autentikasi Posko KKN Kelompok 07 • Desa Ciasihan
          </p>
        </div>

      </div>

    </div>
  );
}
