import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Register Form, 2: Verification
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending register request to:', api.defaults.baseURL + '/auth/register');
      const response = await api.post('/auth/register', formData);
      console.log('Register response:', response);
      
      setStep(2); 
    } catch (err) {
      console.error('Register error full object:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal mendaftar. Silakan coba lagi.';
      setError(msg);
      
      // Force step 2 untuk testing jika diinginkan, tapi untuk sekarang kita tampilkan error
      // setStep(2); 
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-email', { 
        email: formData.email, 
        code: verificationCode 
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        alert('Email berhasil diverifikasi!');
        navigate('/dashboard');
      } else {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Kode verifikasi salah atau kadaluarsa.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    try {
      await api.post('/auth/resend-verification', { 
        email: formData.email 
      });
      alert('Kode verifikasi baru telah dikirim ke email Anda.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode.');
      console.error('Resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 ? 'Buat Akun Baru' : 'Verifikasi Akun'}
        </h2>
        <p className="text-gray-600 mt-2">
          {step === 1 
            ? 'Daftar untuk mulai petualangan camping Anda' 
            : `Kami telah mengirimkan kode verifikasi ke ${formData.email}`
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
          {error.toLowerCase().includes('timeout') && (
            <button 
              type="button"
              onClick={() => setStep(2)}
              className="mt-2 text-xs text-red-600 underline font-semibold block"
            >
              Lewati ke Verifikasi (Mode Debug)
            </button>
          )}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Username Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memproses...' : (
              <>
                Daftar Sekarang <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Kode verifikasi telah dikirim ke <strong>{formData.email}</strong>
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <CheckCircle size={18} />
              </div>
              <input
                type="text"
                placeholder="Masukkan 6 Digit Kode"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-xl font-bold"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
            </button>
          </form>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500">Tidak menerima kode?</p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-1 disabled:text-gray-400"
            >
              {resendLoading ? 'Mengirim...' : 'Kirim Ulang Kode'}
            </button>
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Kembali ke Pendaftaran
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
          Masuk
        </Link>
      </p>
    </div>
  );
};

export default Register;
