import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      // credentialResponse contains credential and clientId
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
    <div className="bg-gray-50 min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-primary-dark shadow-hard p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-yellow rounded-full mix-blend-multiply opacity-50 -mr-10 -mt-10"></div>
        
        <h2 className="text-3xl font-bold text-primary-dark uppercase mb-2 drop-shadow-sm flex items-center gap-2 relative z-10">
          <LogIn className="text-secondary-dark" size={32} /> Masuk Akun
        </h2>
        <p className="text-xs text-gray-600 mb-6 font-medium relative z-10">
          Masuk sebagai Admin atau Anggota terverifikasi.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-600 shadow-hard flex items-start gap-3 relative z-10">
            <AlertCircle className="shrink-0 mt-0.5" />
            <span className="font-bold text-sm leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-4">
            <label className="block text-primary-dark font-bold mb-2 uppercase text-sm tracking-wide">Username atau Email</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-primary-dark px-4 py-3 focus:outline-none focus:ring-0 focus:border-secondary-dark transition-colors font-medium bg-gray-50"
              placeholder="Masukkan username atau email..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-primary-dark font-bold mb-2 uppercase text-sm tracking-wide">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-primary-dark px-4 py-3 focus:outline-none focus:ring-0 focus:border-secondary-dark transition-colors font-medium bg-gray-50"
              placeholder="Masukkan password..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-blue text-white font-bold text-lg uppercase tracking-wider py-4 border-2 border-primary-dark shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="my-6 flex items-center justify-center gap-2 text-gray-400">
            <div className="h-0.5 w-full bg-gray-200"></div>
            <span className="text-xs uppercase font-bold text-gray-500 whitespace-nowrap">Atau Masuk Dengan</span>
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <div className="border-t-2 border-gray-200 mt-6 pt-4 text-center">
            <p className="text-xs text-gray-600 font-medium mb-3">
              Belum punya akun anggota?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-yellow text-primary-dark font-bold py-2.5 px-4 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all text-xs uppercase tracking-wider"
            >
              <UserPlus size={16} /> Daftar Akun Baru
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
