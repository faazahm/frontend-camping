import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2, 
  CheckCircle,
  XCircle, 
  X,
  Clock, 
  LogOut,
  MoreVertical,
  ChevronRight,
  Loader2,
  DollarSign,
  Eye,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';

const getStatusConfig = (status) => {
  const configs = {
    'PAID': { label: 'Dibayar', color: 'bg-green-100 text-green-700' },
    'CHECK_IN': { label: 'Check In', color: 'bg-blue-100 text-blue-700' },
    'CHECK_OUT': { label: 'Check Out', color: 'bg-purple-100 text-purple-700' },
    'PENDING': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
    'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' }
  };
  return configs[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, sortBy, order]);

  const fetchBookings = async (searchVal = searchTerm) => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        order
      };
      
      // We'll handle status filtering on the client-side to ensure it works perfectly
      // even if the backend params are tricky.
      if (searchVal) params.search = searchVal;

      console.log('Fetching bookings with params:', params);
      
      let response;
      try {
        response = await api.get('/api/admin/bookings', { params });
      } catch (err) {
        response = await api.get('/admin/bookings', { params });
      }

      console.log('RAW RESPONSE FROM BACKEND:', response.data);
      
      let data = response.data.data || response.data;
      
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Map data to ensure consistency
      const mappedData = data.map(item => {
        // Berdasarkan diagnosis: Backend mengharapkan public_id (UUID)
        // Kita simpan UUID ini sebagai target utama untuk update status
        const actualUUID = item.public_id || item.uuid || item.id;
        
        return {
          ...item,
          // Store original backend UUID untuk API calls (Penting agar tidak Invalid UUID)
          originalUUID: item.public_id || item.uuid, 
          userName: item.user?.full_name || item.userName || item.full_name || 'User',
          userEmail: item.user?.email || item.userEmail || item.email || `User #${item.user_id || '?' }`,
          campName: item.camp?.name || item.campName || 'Potrobayan River Camp',
          checkIn: item.start_date || item.check_in || item.checkIn,
          checkOut: item.end_date || item.check_out || item.checkOut,
          totalPrice: item.total_price || item.totalPrice || 0,
          status: item.status || 'PENDING',
          paymentProof: item.payment_proof || item.paymentProof
        };
      });

      // Apply Status Filtering on Client Side
      let filteredData = [...mappedData];
      if (statusFilter !== 'ALL') {
        filteredData = filteredData.filter(b => b.status === statusFilter);
      }

      // Client-side sorting
      const sortedData = filteredData.sort((a, b) => {
        if (sortBy === 'total_price') {
          return order === 'DESC' ? b.totalPrice - a.totalPrice : a.totalPrice - b.totalPrice;
        }
        if (sortBy === 'status') {
          return order === 'DESC' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
        }
        if (sortBy === 'created_at') {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return order === 'DESC' ? dateB - dateA : dateA - dateB;
        }
        return 0;
      });

      setBookings(sortedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      // Sangat Penting: Ambil originalUUID (public_id) yang kita simpan saat mapping
      // Jika originalUUID tidak ada, baru fallback ke id
      const bookingId = selectedBooking?.originalUUID || selectedBooking?.public_id || selectedBooking?.uuid || id;
      
      console.log(`Updating status for booking. Target ID: ${bookingId}, Status: ${newStatus}`);
      
      if (!bookingId || String(bookingId).length < 20) {
        console.error("ID yang akan dikirim bukan format UUID valid:", bookingId);
        throw new Error("ID Booking tidak valid (Bukan format UUID)");
      }

      // Sesuai instruksi: PUT ke /api/admin/bookings/{id}/status
      const response = await api.put(`/api/admin/bookings/${bookingId}/status`, { 
        status: newStatus 
      });

      if (response.status === 200 || response.status === 204) {
        console.log('Update status success:', response.data);
        
        // Update state lokal agar UI langsung berubah
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        
        // Update modal jika sedang terbuka
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMsg = error.response?.data?.message || 'Gagal memperbarui status. Pastikan ID adalah UUID yang valid.';
      alert(`Gagal: ${errorMsg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  const openDetail = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Booking</h1>
          <p className="text-gray-500 dark:text-gray-400">Pantau dan kelola seluruh reservasi camping</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari nama user, email, atau Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm font-medium"
            />
          </form>
          
          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] px-4 py-2 shadow-sm">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-sm font-black focus:ring-0 outline-none cursor-pointer pr-8"
            >
              <option value="created_at">Urutkan: Tgl Dibuat</option>
              <option value="status">Urutkan: Status</option>
              <option value="total_price">Urutkan: Harga</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide no-scrollbar">
          {['ALL', 'PENDING', 'PAID', 'CHECK_IN', 'CHECK_OUT', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                statusFilter === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-400 border border-gray-50 dark:border-gray-800 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Semua Status' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4 pb-10">
        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-20 text-center border border-gray-50 dark:border-gray-800 shadow-sm">
            <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
            <p className="text-gray-400 font-medium">Memuat data booking...</p>
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-50 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-8 items-center flex-1">
                  {/* User Info - Fixed width to align date columns */}
                  <div className="flex items-center gap-3 w-full sm:w-[280px] lg:w-[320px] flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-600 border border-orange-100 dark:border-orange-800/30 flex-shrink-0">
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-gray-900 dark:text-white leading-tight text-[13px] truncate">{booking.userEmail}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 truncate">{booking.userName}</p>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-3 w-full sm:w-[200px] flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800/30 flex-shrink-0">
                      <Calendar size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center text-[10px] font-bold text-gray-400 gap-2 whitespace-nowrap">
                        <span>{formatDate(booking.checkIn)}</span>
                        <span className="text-gray-200">{'>'}</span>
                        <span>{formatDate(booking.checkOut)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:min-w-[350px] justify-end">
                  {/* Price */}
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Total Bayar</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{formatPrice(booking.totalPrice)}</p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] ${
                      booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      booking.status === 'CHECK_IN' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'CHECK_OUT' ? 'bg-purple-100 text-purple-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </div>

                    <button
                      onClick={() => openDetail(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 font-black text-[9px] uppercase tracking-wider group-hover:-translate-y-0.5"
                    >
                      <Eye size={14} />
                      Detail Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-24 text-center border border-gray-50 dark:border-gray-800 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-gray-300 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Tidak ada booking</h3>
            <p className="text-gray-400 font-medium">Belum ada data reservasi untuk filter yang dipilih.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Booking */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" 
            onClick={closeDetail}
          ></div>

          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[32px] shadow-2xl transform transition-all border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Detail Reservasi</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest font-mono">#{selectedBooking.id}</p>
                  </div>
                </div>
                <button 
                  onClick={closeDetail} 
                  className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar no-scrollbar">
                {/* Status & Price Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-[24px] border border-gray-100 dark:border-gray-700/50">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${getStatusConfig(selectedBooking.status).color}`}>
                      {getStatusConfig(selectedBooking.status).label}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-[24px] border border-orange-100 dark:border-orange-800/30">
                    <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-lg font-black text-orange-600 tracking-tight">{formatPrice(selectedBooking.totalPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                        <User size={16} strokeWidth={2.5} />
                      </div>
                      <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">Pelanggan</h4>
                    </div>
                    <div className="bg-white dark:bg-gray-800/30 p-4 rounded-[20px] border border-gray-100 dark:border-gray-800 space-y-2">
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nama</p>
                        <p className="font-black text-gray-900 dark:text-white text-xs">{selectedBooking.userName}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                        <p className="font-bold text-gray-500 text-[10px]">{selectedBooking.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Camp Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <MapPin size={16} strokeWidth={2.5} />
                      </div>
                      <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">Lokasi</h4>
                    </div>
                    <div className="bg-white dark:bg-gray-800/30 p-4 rounded-[20px] border border-gray-100 dark:border-gray-800 space-y-2">
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tempat</p>
                        <p className="font-black text-gray-900 dark:text-white text-xs">{selectedBooking.campName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-orange-600 font-black text-[9px]">
                        <DollarSign size={12} />
                        <span>ID: {selectedBooking.public_id || selectedBooking.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                      <Calendar size={16} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">Jadwal</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-700/50">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">In</p>
                      <p className="font-black text-gray-900 dark:text-white text-sm">
                        {selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                      </p>
                    </div>
                    <div className="space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-4">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Out</p>
                      <p className="font-black text-gray-900 dark:text-white text-sm">
                        {selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                      <CreditCard size={16} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">Bukti Bayar</h4>
                  </div>
                  
                  {selectedBooking.paymentProof ? (
                    <div className="space-y-4">
                      <div className="relative group aspect-[4/3] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                        <img 
                          src={selectedBooking.paymentProof.startsWith('http') ? selectedBooking.paymentProof : `${import.meta.env.VITE_API_URL || ''}${selectedBooking.paymentProof}`} 
                          alt="Bukti Transfer" 
                          className="w-full h-full object-contain cursor-zoom-in"
                          onClick={() => window.open(selectedBooking.paymentProof.startsWith('http') ? selectedBooking.paymentProof : `${import.meta.env.VITE_API_URL || ''}${selectedBooking.paymentProof}`, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <div className="bg-white p-2 rounded-lg shadow-xl text-orange-500">
                            <Eye size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                      <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Belum ada bukti</p>
                    </div>
                  )}
                </div>

                {/* Change Status */}
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex flex-col space-y-3">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">
                      Ubah Status
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBooking.status}
                        onChange={(e) => handleUpdateStatus(selectedBooking.id, e.target.value)}
                        disabled={updatingId === selectedBooking.id}
                        className="w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-[18px] text-[11px] font-black text-gray-900 dark:text-white appearance-none outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="CHECK_IN">CHECK IN</option>
                        <option value="CHECK_OUT">CHECK OUT</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                        {updatingId === selectedBooking.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <ChevronRight className="rotate-90" size={16} strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 flex justify-end border-t border-gray-50 dark:border-gray-800">
                <button
                  onClick={closeDetail}
                  className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-black text-[9px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
