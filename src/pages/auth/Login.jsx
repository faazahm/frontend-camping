import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Mail } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { 
        identifier: email, 
        password: password 
      });
      
      const userData = response.data.user || response.data.data || response.data;
      const token = response.data.token || response.data.access_token;
      
      console.log('DEBUG LOGIN: Data User dari Server:', userData);
      console.log('DEBUG LOGIN: Role terdeteksi:', userData.role);

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('userUpdated'));
        
        const userRole = String(userData.role || '').toLowerCase().trim();
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Login gagal. Token tidak diterima.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      // Menggunakan /api/auth/google sesuai pola yang berhasil untuk profile/booking
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Dispatch event agar Navbar terupdate
          window.dispatchEvent(new Event('userUpdated'));
          
          const userRole = String(response.data.user.role || '').toLowerCase().trim();
          
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login Google gagal.';
      setError(errorMessage);
      console.error('Google login error detail:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Login Google gagal. Silakan coba lagi.');
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h2>
        <p className="text-gray-600 mt-2">Silakan masuk ke akun Anda</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
            Lupa password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Atau masuk dengan</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center w-full overflow-hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            shape="pill"
            size="large"
            text="signin_with"
            width="320"
          />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Belum punya akun?{' '}
        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
};

export default Login;
