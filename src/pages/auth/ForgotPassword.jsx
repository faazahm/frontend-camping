import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Input Email, 2: Verify OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('Kode verifikasi telah dikirim ke email Anda.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim kode. Pastikan email terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-reset-token', { token: otp });
      // Simpan token baru jika backend mengembalikannya untuk proses reset
      if (response.data.token) {
        setOtp(response.data.token);
      }
      setSuccess('Kode verifikasi valid. Silakan buat password baru.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode verifikasi salah atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        token: otp, 
        newPassword: newPassword 
      });
      alert('Password berhasil diubah! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleRequestOtp} className="space-y-6">
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
        <p className="mt-2 text-sm text-gray-500">
          Masukkan email yang terdaftar untuk menerima kode verifikasi.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Mengirim...' : (
          <>
            Kirim Kode <ArrowRight size={18} className="ml-2" />
          </>
        )}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kode Verifikasi</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CheckCircle size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors text-center tracking-widest text-lg"
            placeholder="XXXXXX"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          Masukkan kode yang telah dikirim ke {email}
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-2"
      >
        Ganti Email
      </button>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
      </button>
    </form>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 && 'Lupa Password'}
          {step === 2 && 'Verifikasi Kode'}
          {step === 3 && 'Buat Password Baru'}
        </h2>
        <p className="text-gray-600 mt-2">
          {step === 1 && 'Kami akan membantu memulihkan akun Anda'}
          {step === 2 && 'Cek email Anda untuk kode verifikasi'}
          {step === 3 && 'Masukkan password baru Anda'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {success}
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <div className="mt-8 text-center">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
