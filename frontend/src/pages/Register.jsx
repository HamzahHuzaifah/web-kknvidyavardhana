import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Hanya akun @gmail.com yang diizinkan untuk mendaftar.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccessMsg(response.data.message || 'Pendaftaran berhasil! Silakan menunggu persetujuan (ACC) dari Admin.');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar. Silakan coba username lain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-primary-dark shadow-hard p-8 w-full max-w-md relative overflow-hidden">
        {/* Accent Geometric Decor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-yellow rounded-full mix-blend-multiply opacity-50 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-green rounded-full mix-blend-multiply opacity-30 -ml-8 -mb-8"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark uppercase drop-shadow-sm flex items-center gap-2">
              <UserPlus className="text-secondary-dark" size={30} /> Buat Akun
            </h2>
            <span className="bg-gradient-yellow text-primary-dark text-xs font-bold px-2 py-1 border border-primary-dark uppercase">
              Role: User
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-6 font-medium">
            Akun baru memiliki hak akses untuk publikasi/upload artikel setelah diverifikasi dan disetujui (ACC) oleh Admin.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-600 shadow-hard flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <span className="font-bold text-sm">{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="mb-6 p-6 bg-yellow-50 border-2 border-primary-dark shadow-hard flex flex-col gap-4 text-center">
              <div className="w-12 h-12 bg-accent-light mx-auto flex items-center justify-center border-2 border-primary-dark rounded-full">
                <CheckCircle2 size={28} className="text-accent-dark" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase text-primary-dark mb-1">
                  Pendaftaran Terkirim!
                </h3>
                <span className="inline-block bg-secondary-light text-secondary-dark font-bold text-xs uppercase px-3 py-1 border border-secondary-dark mb-3">
                  Status: Menunggu ACC Admin
                </span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  {successMsg}
                </p>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full bg-gradient-blue text-white font-bold py-3 uppercase tracking-wider text-sm border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all block text-center"
                >
                  Ke Halaman Login
                </Link>
                <Link
                  to="/"
                  className="text-xs font-bold text-primary-dark hover:underline flex items-center justify-center gap-1 mt-2"
                >
                  <ArrowLeft size={14} /> Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-primary-dark font-bold mb-1 uppercase text-xs tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-primary-dark px-4 py-2.5 focus:outline-none focus:border-secondary-dark transition-colors font-medium bg-gray-50 text-sm"
                  placeholder="Buat username unik (min. 3 karakter)"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-primary-dark mb-1">
                  Alamat Gmail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contoh@gmail.com"
                    required
                    className="w-full bg-gray-50 border-2 border-primary-dark p-3 text-sm font-bold text-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-0.5 focus:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-primary-dark font-bold mb-1 uppercase text-xs tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-primary-dark px-4 py-2.5 focus:outline-none focus:border-secondary-dark transition-colors font-medium bg-gray-50 text-sm"
                  placeholder="Masukkan password (min. 6 karakter)"
                />
              </div>

              <div>
                <label className="block text-primary-dark font-bold mb-1 uppercase text-xs tracking-wider">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-primary-dark px-4 py-2.5 focus:outline-none focus:border-secondary-dark transition-colors font-medium bg-gray-50 text-sm"
                  placeholder="Ulangi password Anda"
                />
              </div>

              <div className="p-3 bg-amber-50 border-2 border-amber-400 text-xs text-amber-900 font-medium flex items-start gap-2">
                <ShieldAlert size={18} className="shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Setelah mendaftar, akun Anda belum bisa langsung login hingga disetujui (ACC) oleh Admin KKN.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-yellow text-primary-dark font-bold text-base uppercase tracking-wider py-3.5 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {loading ? 'Mendaftarkan...' : <><UserPlus size={18} /> Daftar Sekarang</>}
              </button>

              <div className="border-t-2 border-gray-200 pt-4 text-center">
                <p className="text-xs text-gray-600 font-medium">
                  Sudah memiliki akun terdaftar?{' '}
                  <Link to="/login" className="font-bold text-primary-dark underline hover:text-secondary-dark ml-1">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
