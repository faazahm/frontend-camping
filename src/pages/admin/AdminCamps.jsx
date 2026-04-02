import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  MapPin, 
  Star,
  Users,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  Tent
} from 'lucide-react';
import api from '../../services/api';

const AdminCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCamp, setCurrentCamp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    nightlyPrice: '',
    dailyCapacity: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkIdentity = async () => {
      try {
        const res = await api.get('/api/profile');
        const user = res.data?.data || res.data;
        const serverRole = String(user.role || '').toLowerCase().trim();
        console.log('IDENTITAS ADMIN CAMPS:', user);
        if (serverRole !== 'admin') {
          console.error(`PERINGATAN: Di Server, Role Anda adalah "${user.role}", bukan "admin".`);
        }
      } catch (err) {
        console.warn('Gagal cek identitas di AdminCamps');
      }
    };
    checkIdentity();
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let currentResponse;
      // Berdasarkan instruksi terbaru: Gunakan /api/admin/camps
      const endpoints = [
        '/api/admin/camps',
        '/admin/camps',
        '/api/camps',
        '/camps'
      ];

      let lastError;
      for (const endpoint of endpoints) {
        try {
          console.log(`DEBUG: Mencoba fetch dari ${endpoint}...`);
          // Menambahkan timestamp unik untuk memaksa browser/server memberikan data terbaru
          const response = await api.get(`${endpoint}?t=${new Date().getTime()}&nocache=true`);
          if (response.status === 200) {
            console.log(`DEBUG: Berhasil fetch dari ${endpoint}`, response.data);
            currentResponse = response;
            break;
          }
        } catch (err) {
          lastError = err;
          const status = err.response?.status;
          const errorData = err.response?.data;
          console.warn(`DEBUG: Fetch dari ${endpoint} gagal (${status}):`, errorData || err.message);
          
          if (status === 500) {
            console.error(`CRITICAL ERROR 500 di ${endpoint}:`, errorData);
          }
        }
      }

      if (!currentResponse) {
        const errorMsg = lastError?.response?.data?.message || lastError?.message || 'Semua endpoint fetch gagal';
        throw new Error(errorMsg);
      }

      // Ekstraksi data dari berbagai kemungkinan format response
      let campsData = [];
      if (Array.isArray(currentResponse.data)) {
        campsData = currentResponse.data;
      } else if (currentResponse.data?.data && Array.isArray(currentResponse.data.data)) {
        campsData = currentResponse.data.data;
      } else if (currentResponse.data && typeof currentResponse.data === 'object') {
        const possibleArray = Object.values(currentResponse.data).find(val => Array.isArray(val));
        if (possibleArray) campsData = possibleArray;
      }

      console.log(`DEBUG: Berhasil memproses ${campsData.length} data camp`);

      // Mapping data dengan fallback field name
      const mappedData = campsData.map(item => {
        const rawCapacity = item.dailyCapacity || item.capacity || 0;
        const rawPrice = item.nightlyPrice || item.price || 0;
        
        // Memperbaiki masalah pembulatan (misal 500 menjadi 499.99) dengan Math.round
        const capacity = Math.round(Number(rawCapacity));
        const price = Math.round(Number(rawPrice));

        // Mendapatkan URL gambar dari backend (sekarang menggunakan Supabase URL lengkap)
        const finalImageUrl = item.photo_url_full || item.image_url || item.photo_url || item.image_path || item.photo_path || item.image;
        
        return {
          ...item,
          id: item.id || item._id || item.uuid, 
          name: item.name || 'Tanpa Nama',
          location: item.location || 'Lokasi tidak diketahui',
          nightlyPrice: price,
          dailyCapacity: capacity,
          image_url: finalImageUrl,
          is_active: item.is_active !== undefined ? item.is_active : (item.isActive !== undefined ? item.isActive : true)
        };
      });

      setCamps(mappedData);
    } catch (error) {
      console.error('Error fetching camps detail:', error);
      setError(`Gagal memuat data camp: ${error.message}`);
      setCamps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (camp = null) => {
    if (camp) {
      setCurrentCamp(camp);
      // Gunakan mapping camelCase sesuai instruksi
      setFormData({
        name: camp.name || '',
        description: camp.description || '',
        location: camp.location || '',
        nightlyPrice: camp.nightlyPrice || '',
        dailyCapacity: camp.dailyCapacity || '',
        image: null
      });
      setImagePreview(camp.image_url);
    } else {
      setCurrentCamp(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        nightlyPrice: '',
        dailyCapacity: '',
        image: null
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCamp(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const hasImage = formData.image instanceof File;
    const campId = currentCamp?.id; 

    try {
      let response;
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || '');
      data.append('location', formData.location || '');
      
      // Gunakan nama field yang sesuai dengan Swagger (camelCase)
      // Gunakan Math.round untuk memastikan angka integer yang akurat (misal 300.0001 menjadi 300)
      const capacityValue = Math.round(Number(formData.dailyCapacity)) || 0;
      const priceValue = Math.round(Number(formData.nightlyPrice)) || 0;
      
      data.append('dailyCapacity', capacityValue);
      data.append('nightlyPrice', priceValue);
      
      // Gunakan format boolean yang paling umum (1/0) agar lebih stabil di berbagai backend
      data.append('is_active', '1');
      data.append('isActive', '1');

      if (hasImage) {
        // Hanya kirim field 'image' jika ada file baru (Mendukung COALESCE di backend)
        data.append('image', formData.image);
      }

      if (currentCamp) {
        // KEMBALI KE PUT: Berdasarkan Swagger, method yang benar adalah PUT.
        // Internal Server Error (500) sebelumnya mungkin terjadi karena format data atau field yang tidak pas.
        const updateUrl = `/api/admin/camps/${campId}`;
        
        try {
          console.log(`Mencoba Update (PUT) ke: ${updateUrl}`);
          response = await api.put(updateUrl, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          // Jika /api/admin/ gagal dengan 404, coba tanpa /api
          if (error.response?.status === 404) {
            console.warn("Mencoba fallback tanpa /api...");
            response = await api.put(`/admin/camps/${campId}`, data, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            throw error;
          }
        }
      } else {
        // Create logic
        const primaryCreateUrl = `/api/admin/camps`;
        const secondaryCreateUrl = `/admin/camps`;
        
        try {
          console.log(`Mencoba Create ke: ${primaryCreateUrl}`);
          response = await api.post(primaryCreateUrl, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          if (error.response?.status === 404 || error.response?.status === 405) {
            console.warn(`Endpoint ${primaryCreateUrl} gagal, mencoba fallback ke ${secondaryCreateUrl}`);
            response = await api.post(secondaryCreateUrl, data, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            throw error;
          }
        }
      }

      if (!response) {
        throw lastError;
      }
      
      console.log('Save camp success:', response.data);
      alert('Data berhasil disimpan!');
      fetchCamps();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving camp:', error);
      console.error('Response data:', error.response?.data);
      
      let serverMsg = 'Gagal menyimpan data';
      if (error.response?.data) {
        // Jika backend mengirimkan pesan error spesifik (misal: "Validation error")
        serverMsg = error.response.data.message || 
                    error.response.data.error || 
                    (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      } else {
        serverMsg = error.message;
      }
      
      alert(`GAGAL SIMPAN: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus lokasi camping ini?')) return;

    // Simpan data lama untuk fallback jika gagal
    const previousCamps = [...camps];
    
    try {
      // Optimistic Update: Hapus dari UI dulu
      setCamps(prev => prev.filter(c => c.id !== id));
      
      const deleteEndpoints = [
        `/api/admin/camps/${id}`,
        `/admin/camps/${id}`,
        `/api/camps/${id}`,
        `/camps/${id}`
      ];

      let deleted = false;
      let lastError;

      for (const endpoint of deleteEndpoints) {
        try {
          console.log(`DEBUG: Mencoba DELETE ke ${endpoint}...`);
          const response = await api.delete(endpoint);
          if (response.status === 200 || response.status === 204) {
            deleted = true;
            console.log(`Delete camp success via ${endpoint}`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Delete via ${endpoint} failed (${err.response?.status}):`, err.response?.data || err.message);
        }
      }

      if (!deleted) {
        throw lastError || new Error('Gagal menghapus dari semua endpoint');
      }

      alert('Data berhasil dihapus dari server.');
    } catch (error) {
      // Rollback UI jika gagal di server
      setCamps(previousCamps);
      console.error('Error deleting camp:', error);
      const serverMsg = error.response?.data?.message || error.message || 'Gagal menghapus data';
      alert(`GAGAL MENGHAPUS: ${serverMsg}. Data dikembalikan ke daftar.`);
    }
  };

  const formatImageUrl = (url) => {
    // Sesuai instruksi baru: Gunakan field image_url langsung dari API
    if (!url) return null;
    return url;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const filteredCamps = camps.filter(camp => {
    const matchesSearch = (camp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (camp.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Filter status aktif
    // Periksa apakah nilainya secara eksplisit false (baik boolean false, string 'false', atau angka 0)
    const isActuallyActive = !(
      camp.is_active === false || 
      camp.is_active === 'false' || 
      camp.is_active === 0 ||
      camp.is_active === '0'
    );
                     
    return matchesSearch && isActuallyActive;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Camp</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola lokasi camping yang tersedia untuk pengguna</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Tambah Lokasi
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari nama lokasi atau wilayah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Camps Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="px-6 py-5">Lokasi</th>
                <th className="px-6 py-5">Harga/Malam</th>
                <th className="px-6 py-5">Kapasitas Harian</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-orange-500 mx-auto" size={32} />
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredCamps.length > 0 ? (
                filteredCamps.map((camp) => {
                  console.log('DEBUG: Camp data row:', camp);
                  return (
                    <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                            {camp.image_url ? (
                              <img 
                                src={camp.image_url} 
                                alt={camp.name} 
                                className="w-full h-full object-cover" 
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.log('DEBUG: Image Load Error for:', e.target.src);
                                  e.target.onerror = null;
                                  // Gunakan placeholder jika gambar gagal dimuat
                                  e.target.src = 'https://placehold.co/150x150?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                              {camp.name}
                            </p>
                            <div className="flex items-center text-[11px] text-gray-500">
                              <MapPin size={12} className="mr-1" />
                              {camp.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatPrice(camp.nightlyPrice)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Users size={16} className="text-blue-500" />
                          <span className="font-medium">{camp.dailyCapacity} Orang</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(camp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-95"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(camp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Tent size={48} className="mx-auto mb-3 opacity-20" />
                    Belum ada data lokasi camping
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentCamp ? 'Edit Lokasi Camp' : 'Tambah Lokasi Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Lengkapi informasi detail lokasi camping</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nama Lokasi</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    placeholder="Contoh: Ranca Upas"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Wilayah/Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    placeholder="Contoh: Ciwidey, Bandung"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Harga per Malam</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.nightlyPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, nightlyPrice: val});
                      }}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Contoh: 10000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    value={formData.dailyCapacity}
                    onChange={(e) => setFormData({...formData, dailyCapacity: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm resize-none"
                  placeholder="Tuliskan deskripsi lengkap mengenai lokasi camping..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Foto Lokasi</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-48 h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 group relative">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="camp-image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="camp-image"
                      className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors shadow-sm"
                    >
                      Pilih Gambar
                    </label>
                    <p className="text-[10px] text-gray-500 mt-2 italic">Format: JPG, PNG, atau WEBP. Maksimal 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCamps;
