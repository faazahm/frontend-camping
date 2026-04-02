import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    profile_picture: null
  });

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  });

  useEffect(() => {
    // Load initial data from user object in localStorage
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      profile_picture: null
    });
    if (user.profile_picture) {
      setPreviewImage(user.profile_picture);
    }
    setFetching(false);
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Coba ambil data profil terbaru dari server saat halaman dimuat
        const response = await api.get('/api/profile');
        console.log('DEBUG: Response Profile dari Server:', response.data);
        
        if (response.data.success || response.status === 200) {
          // Mengambil data dari response.data atau response.data.data
          const userData = response.data.data || response.data.user || response.data;
          
          console.log('DEBUG: Data User yang akan dipakai:', userData);

          // Update state form dengan fallback ke field yang mungkin berbeda di backend
          setFormData({
            full_name: userData.full_name || userData.name || '',
            phone_number: userData.phone_number || userData.phone || '',
            address: userData.address || '',
          });
          
          if (userData.profile_picture) {
            setPreviewImage(userData.profile_picture);
          }

          // Update localStorage agar Navbar sinkron
          const updatedUser = { ...user, ...userData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          window.dispatchEvent(new Event('userUpdated'));
        }
      } catch (error) {
        console.error('Error fetching profile from server:', error);
        // Jika gagal (misal API GET belum ada), biarkan menggunakan data dari localStorage awal
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('DEBUG: File dipilih:', file.name, file.size);
      setFormData(prev => ({ ...prev, profile_picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('DEBUG: Preview Base64 siap');
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const data = new FormData();
      
      // Bersihkan data sebelum dikirim
      const cleanFullName = formData.full_name.trim();
      const cleanPhoneNumber = formData.phone_number.trim();
      const cleanAddress = formData.address.trim();

      data.append('full_name', cleanFullName);
      data.append('phone_number', cleanPhoneNumber);
      data.append('address', cleanAddress);
      
      // Jika backend menggunakan 'name' atau 'phone'
      data.append('name', cleanFullName);
      data.append('phone', cleanPhoneNumber);
      
      if (formData.profile_picture instanceof File) {
        data.append('profile_picture', formData.profile_picture);
      }

      console.log('DEBUG: Mengirim data ke API...', {
        full_name: cleanFullName,
        phone_number: cleanPhoneNumber,
        address: cleanAddress,
        hasImage: !!formData.profile_picture
      });

      // Backend sudah mendukung PUT & POST untuk Profile
      const response = await api.put('/api/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('DEBUG: Raw Response dari Server:', response);

      // Cek keberhasilan dari berbagai kemungkinan format response backend
      const isSuccess = response.status === 200 || 
                        response.status === 201 || 
                        response.data?.success === true || 
                        (typeof response.data?.message === 'string' && response.data.message.toLowerCase().includes('success'));

      if (isSuccess) {
        // Ambil data user terbaru dari response jika ada
        const responseData = response.data?.data || response.data?.user || response.data;
        
        // Gabungkan data lama dengan data baru yang baru saja dikirim/diterima
        const updatedUser = {
          ...user,
          full_name: cleanFullName,
          phone_number: cleanPhoneNumber,
          address: cleanAddress,
        };

        // Jika server mengembalikan data user yang lebih lengkap, gunakan itu
        if (responseData && typeof responseData === 'object' && (responseData.full_name || responseData.name || responseData.email)) {
          updatedUser.full_name = responseData.full_name || responseData.name || updatedUser.full_name;
          updatedUser.phone_number = responseData.phone_number || responseData.phone || updatedUser.phone_number;
          updatedUser.address = responseData.address || updatedUser.address;
          
          // Penanganan khusus untuk foto
          const serverPhoto = responseData.profile_picture || responseData.image || responseData.avatar || responseData.foto;
          if (serverPhoto) {
            updatedUser.profile_picture = serverPhoto;
          }
        }

        // PRIORITAS: Jika user baru saja upload foto, gunakan preview base64 sebagai data profile_picture
        if (formData.profile_picture instanceof File && previewImage) {
          updatedUser.profile_picture = previewImage;
          console.log('DEBUG: Menggunakan preview lokal (base64) untuk localStorage');
        } else if (responseData && typeof responseData === 'object') {
           // Penanganan khusus untuk foto dari server
           const serverPhoto = responseData.profile_picture || responseData.image || responseData.avatar || responseData.foto;
           if (serverPhoto) {
             updatedUser.profile_picture = serverPhoto;
             console.log('DEBUG: Menggunakan foto dari server:', serverPhoto);
           }
        }

        // Simpan ke localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Notify UI components (Navbar, dll)
        window.dispatchEvent(new Event('userUpdated'));
        
        // Pastikan preview tetap yang terbaru
        if (updatedUser.profile_picture) {
          setPreviewImage(updatedUser.profile_picture);
        }
        
        setMessage({ 
          type: 'success', 
          content: response.data?.message || 'Profil berhasil diperbarui!' 
        });

        // Scroll ke atas agar pesan terlihat
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ 
          type: 'error', 
          content: response.data.message || 'Gagal memperbarui profil di server.' 
        });
      }
    } catch (error) {
      console.error('Update profile error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      setMessage({ 
        type: 'error', 
        content: `Gagal API: ${errorMsg}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    // Sesuai instruksi baru: Gunakan URL lengkap langsung dari backend (Supabase)
    return path;
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profil</h1>
            <p className="text-gray-600 dark:text-gray-400">Perbarui informasi pribadi Anda</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg transition-transform group-hover:scale-105 relative">
                  {previewImage ? (
                    <>
                      <img 
                        src={getImageUrl(previewImage)} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.log("Image load error, showing fallback");
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.profile-fallback-icon');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="profile-fallback-icon hidden w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                        <User className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                      </div>
                    </>
                  ) : (
                    <User className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-orange-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-orange-700 transition-colors transform hover:scale-110">
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Klik ikon kamera untuk mengganti foto</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email (Tetap)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Masukkan alamat lengkap Anda"
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Message Alert */}
            {message.content && (
              <div className={`mt-6 p-4 rounded-2xl text-sm flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                  : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              }`}>
                {message.content}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-200 dark:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;