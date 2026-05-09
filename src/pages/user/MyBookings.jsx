import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  MessageSquare, 
  Loader2, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, pendingRes] = await Promise.all([
        api.get('/api/dashboard/history'),
        api.get('/api/reviews/pending').catch(() => ({ data: [] }))
      ]);

      // Ekstraksi data history (booking)
      const historyData = historyRes.data?.data || historyRes.data || [];
      
      // Ekstraksi data pending reviews (Ulasan yang ditunggu)
      const pendingData = pendingRes.data?.data || pendingRes.data || [];
      
      console.log('DEBUG DASHBOARD - DAFTAR PENDING REVIEW (ARRAY):', pendingData);

      // PERBAIKAN BUG: Hanya tampilkan booking yang sudah upload bukti pembayaran.
      // Booking dengan status PENDING yang TIDAK memiliki payment_proof disembunyikan,
      // karena artinya user belum menyelesaikan proses pembayaran.
      // Booking dengan status VERIFYING, PAID, CHECK_IN, CHECK_OUT, CANCELLED selalu ditampilkan.
      const filteredHistoryData = (Array.isArray(historyData) ? historyData : []).filter(item => {
        // Jika status PENDING, hanya tampilkan jika sudah ada bukti bayar
        if (item.status === 'PENDING') {
          const hasBukti = !!(item.payment_proof || item.paymentProof);
          return hasBukti;
        }
        // Status lainnya (VERIFYING, PAID, CHECK_IN, CHECK_OUT, CANCELLED) selalu tampil
        return true;
      });

      setBookings(filteredHistoryData);
      setPendingReviews(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPendingReview = (booking) => {
    if (!booking) return false;

    // 1. Ambil semua kemungkinan ID dari objek booking saat ini
    const currentId = booking.id?.toString();
    const currentPublicId = (booking.public_id || booking.uuid)?.toString();
    
    // 2. Filter status: Hanya booking SELESAI yang bisa diulas
    const status = (booking.status || '').toUpperCase();
    if (status !== 'CHECK_OUT' && status !== 'CHECKOUT') return false;
    
    // 3. Cek apakah ID booking ini ada dalam daftar pending dari backend
    // Jika ada di daftar pending, berarti BELUM diulas
    const isStillInPendingList = pendingReviews.some(pb => {
      const pbId = (typeof pb === 'object' ? (pb.booking_id || pb.id || pb.public_id || pb.uuid) : pb)?.toString();
      return pbId && (pbId === currentId || pbId === currentPublicId);
    });

    return isStillInPendingList;
  };

  const handleReviewClick = (booking) => {
    const bId = booking.public_id || booking.uuid || booking.id;
    navigate(`/review/${bId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PAID': return 'Lunas';
      case 'PENDING': return 'Menunggu Verifikasi';
      case 'VERIFYING': return 'Sedang Diverifikasi';
      case 'CANCELLED': return 'Dibatalkan';
      case 'CHECK_IN': return 'Check-In';
      case 'CHECK_OUT': 
      case 'CHECKOUT': return 'Selesai';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'VERIFYING': return 'bg-orange-100 text-orange-700';
      case 'CHECK_IN': return 'bg-blue-100 text-blue-700';
      case 'CHECK_OUT': 
      case 'CHECKOUT': return 'bg-purple-100 text-purple-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Memuat riwayat booking...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Booking <span className="text-orange-500">Saya</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Kelola reservasi dan berikan ulasan pengalaman berkemah Anda</p>
        </div>
      </div>

      {/* Booking History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
          <Calendar className="text-orange-500" size={24} />
          Riwayat Booking
        </h2>

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, idx) => (
              <div 
                key={booking.public_id || booking.uuid || booking.id || idx} 
                className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Info Area */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                          <MapPin className="text-blue-500" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {booking.camp?.name || 'Potrobayan River Camp'}
                          </h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {booking.public_id || booking.uuid || booking.id}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-In</p>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-sm">
                          <Calendar size={14} className="text-orange-500" />
                          {formatDate(booking.start_date)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-Out</p>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-sm">
                          <Clock size={14} className="text-orange-500" />
                          {formatDate(booking.end_date)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bayar</p>
                        <p className="text-sm font-black text-orange-500">
                          Rp {(booking.total_price || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-end">
                        {(booking.status === 'CHECK_OUT' || booking.status === 'CHECKOUT') && (
                          <button
                            onClick={() => handleReviewClick(booking)}
                            disabled={!isPendingReview(booking)}
                            className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                              isPendingReview(booking)
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-95'
                                : 'bg-green-50 text-green-600 border border-green-100 cursor-not-allowed'
                            }`}
                          >
                            <Star size={12} fill={isPendingReview(booking) ? "white" : "currentColor"} />
                            {isPendingReview(booking) ? 'Beri Ulasan' : 'Sudah Diulas'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-24 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
            <AlertCircle size={64} className="mx-auto text-gray-200 dark:text-gray-800 mb-6" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Belum Ada Booking</h3>
            <p className="text-gray-400 font-medium">Anda belum pernah melakukan pemesanan camp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
