import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const AdminEquipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = [
        '/api/admin/equipments',
        '/admin/equipments'
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(`${endpoint}?t=${new Date().getTime()}`);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error('Gagal memuat data peralatan');
      }

      const data = response.data?.data || response.data || [];
      
      const mappedData = (Array.isArray(data) ? data : []).map(item => {
        // Mendapatkan URL gambar dari backend (sekarang menggunakan Supabase URL lengkap)
        // Prioritaskan field URL lengkap dari backend baru
        const finalImageUrl = item.photo_url_full || item.image_url || item.photo_url || item.photo || item.image;
        
        // Coba cari UUID di semua field jika field 'uuid' tidak ada secara eksplisit
        const foundUuid = Object.values(item).find(val => 
          typeof val === 'string' && val.length > 30 && val.includes('-')
        );

        const mappedItem = {
          ...item,
          id: foundUuid || item.uuid || item.id, 
          name: item.name || 'Tanpa Nama',
          price: Number(item.price) || 0,
          stock: Number(item.stock) || 0,
          image_url: finalImageUrl
        };
        
        return mappedItem;
      });

      setEquipments(mappedData);
    } catch (err) {
      console.error('Error fetching equipments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (equipment = null) => {
    if (equipment) {
      setCurrentEquipment(equipment);
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        price: equipment.price || '',
        stock: equipment.stock || '',
        image: null
      });
      setImagePreview(equipment.image_url);
    } else {
      setCurrentEquipment(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEquipment(null);
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
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || '');
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      
      if (formData.image instanceof File) {
        // Hanya kirim field 'image' jika ada file baru (Mendukung COALESCE di backend)
        data.append('image', formData.image);
      }

      let response;
      if (currentEquipment) {
        // Node.js mendukung PUT murni dengan multipart/form-data
        const updateUrl = `/api/admin/equipments/${currentEquipment.id}`;
        
        try {
          response = await api.put(updateUrl, data);
        } catch (err) {
          if (err.response?.status === 404) {
            response = await api.put(`/admin/equipments/${currentEquipment.id}`, data);
          } else {
            throw err;
          }
        }
      } else {
        // POST request with fallback
        try {
          response = await api.post('/api/admin/equipments', data);
        } catch (err) {
          if (err.response?.status === 404) {
            response = await api.post('/admin/equipments', data);
          } else {
            throw err;
          }
        }
      }

      alert('Data peralatan berhasil disimpan!');
      fetchEquipments();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving equipment:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data';
      alert(`GAGAL SIMPAN: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus peralatan ini?')) return;

    const previousEquipments = [...equipments];
    setEquipments(prev => prev.filter(item => item.id !== id));

    try {
      const endpoints = [
        `/api/admin/equipments/${id}`,
        `/admin/equipments/${id}`
      ];

      let success = false;
      for (const endpoint of endpoints) {
        try {
          const res = await api.delete(endpoint);
          if (res.status === 200 || res.status === 204) {
            success = true;
            break;
          }
        } catch (err) {
          console.warn(`Delete failed at ${endpoint}:`, err.message);
        }
      }

      if (!success) throw new Error('Gagal menghapus peralatan');
      alert('Peralatan berhasil dihapus.');
    } catch (err) {
      setEquipments(previousEquipments);
      alert(`GAGAL MENGHAPUS: ${err.message}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const filteredEquipments = equipments.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Peralatan</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola stok dan harga peralatan camping</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Tambah Peralatan
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari nama peralatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="px-6 py-5">Peralatan</th>
                <th className="px-6 py-5">Harga Sewa</th>
                <th className="px-6 py-5">Stok</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredEquipments.length > 0 ? (
                filteredEquipments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Package size={16} className="text-blue-500" />
                        <span className={`font-medium ${item.stock < 5 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                          {item.stock} Unit
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-95 shadow-sm border border-blue-100 dark:border-blue-800" title="Edit">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95 shadow-sm border border-red-100 dark:border-red-800" title="Hapus">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    Belum ada data peralatan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentEquipment ? 'Edit Peralatan' : 'Tambah Peralatan'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi informasi peralatan di bawah ini</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nama Peralatan</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: Tenda Kapasitas 4 Orang"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Deskripsi</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Jelaskan detail peralatan..."
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Harga Sewa (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: 50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Stok Unit</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: 10"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Foto Peralatan</label>
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-900 flex-shrink-0 flex items-center justify-center border border-gray-100">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" id="equip-image" onChange={handleImageChange} accept="image/*" className="hidden" />
                      <label htmlFor="equip-image" className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                        Pilih Gambar
                      </label>
                      <p className="text-[10px] text-gray-500 mt-2 italic">Format: JPG, PNG, atau WEBP. Maksimal 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-8 py-4 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {currentEquipment ? 'Simpan Perubahan' : 'Tambah Peralatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEquipments;
