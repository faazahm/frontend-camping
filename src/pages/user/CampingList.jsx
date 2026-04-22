import { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, Clock, Search, Filter, Loader2, Star, MessageSquare, X, Save, ArrowRight, History } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ALL' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'CHECK_IN', label: 'CHECK_IN' },
  { value: 'CHECK_OUT', label: 'CHECK_OUT' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

const getStatusLabel = (status) => {
  if (status === 'CHECKOUT' || status === 'CHECK_OUT') return 'Selesai';
  const hit = STATUS_OPTIONS.find(s => s.value === status);
  return hit ? hit.label : status;
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    case 'CHECK_IN':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    case 'CHECK_OUT':
    case 'CHECKOUT':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const CampingList = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both history and pending reviews
      const [historyRes, pendingRes] = await Promise.all([
        api.get('/api/dashboard/history', { params: statusFilter !== 'ALL' ? { status: statusFilter } : {} }).catch(err => {
            console.warn('API history fetch failed:', err);
            return { data: { data: [] } };
        }),
        api.get('/api/reviews/pending').catch(err => {
            console.warn('API pending reviews fetch failed:', err);
            return { data: { data: [], questions: [] } };
        })
      ]);

      const apiDataRaw = historyRes.data?.data || historyRes.data || [];
      const apiData = Array.isArray(apiDataRaw) ? apiDataRaw : [];
      
      // Backend sekarang mengirimkan ARRAY langsung sesuai update terbaru
      const pendingDataRaw = pendingRes.data?.data || pendingRes.data || [];
      const pendingData = Array.isArray(pendingDataRaw) ? pendingDataRaw : [];

      setPendingReviews(pendingData);

      // Mapping logic (simplified from existing one but kept functionality)
      const mappedData = apiData.map(item => {
        const checkInDate = item.start_date || item.checkIn;
        const checkOutDate = item.end_date || item.checkOut;
        
        let calculatedNights = item.nights || item.duration;
        if (!calculatedNights && checkInDate && checkOutDate) {
          const start = new Date(checkInDate);
          const end = new Date(checkOutDate);
          calculatedNights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        }

        // Normalisasi status: pastikan CHECKOUT menjadi CHECK_OUT agar filter berfungsi
        const normalizedStatus = (item.status === 'CHECKOUT' || item.status === 'Selesai') ? 'CHECK_OUT' : item.status;

        return {
          ...item,
          status: normalizedStatus,
          campingName: item.camp?.name || item.campingName || 'Potrobayan River Camp',
          location: item.camp?.location || item.location || 'Bantul, Yogyakarta',
          image: item.camp?.image_url || item.image,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice: item.total_price || item.totalPrice,
          nights: calculatedNights || 0,
          visitors: item.people_count || item.visitors || item.peopleCount || 0,
          addons: item.equipments || item.addons || [],
          paymentProof: item.payment_proof || item.paymentProof
        };
      })
      .filter(item => {
        // Jangan tampilkan booking PENDING yang belum upload bukti pembayaran
        if (item.status === 'PENDING') {
          // Izinkan jika payment_proof sudah ada di data backend
          if (item.paymentProof) return true;
          // Izinkan jika ID ada di sessionStorage (baru saja disubmit)
          try {
            const submittedIds = JSON.parse(sessionStorage.getItem('submitted_booking_ids') || '[]');
            const bookingId = item.public_id || item.uuid || String(item.id);
            if (submittedIds.some(sid => String(sid) === String(bookingId))) return true;
          } catch (_) {}
          // Sembunyikan jika tidak keduanya
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setBookings(mappedData);
    } catch (err) {
      setError('Gagal memuat data riwayat booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  // Refresh data jika kembali dari halaman ulasan dengan state refresh
  useEffect(() => {
    if (location.state?.refresh) {
      fetchBookings();
      // Bersihkan state agar tidak refresh terus menerus
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Review logic functions
  const handleReviewClick = (booking) => {
    const bId = booking.public_id || booking.uuid || booking.id;
    navigate(`/review/${bId}`);
  };

  const isPendingReview = (booking) => {
    // Gunakan public_id, uuid, atau id dengan konversi ke string untuk perbandingan yang aman
    const bId = (booking.public_id || booking.uuid || booking.id)?.toString();
    if (!bId) return false;
    
    // Status harus CHECK_OUT agar tombol review muncul (sesuai normalisasi sebelumnya)
    if (booking.status !== 'CHECK_OUT') return false;

    // Jika data pendingReviews belum ditarik dari API, kembalikan true sebagai fallback
    if (pendingReviews === null || pendingReviews === undefined) return true;

    // Jika sudah ditarik (walaupun array kosong []), cek apakah booking ini ada di daftar pending
    return pendingReviews.some(pb => {
      // Handle jika pb adalah object atau langsung ID (string/number)
      const pbId = (typeof pb === 'object' ? (pb.public_id || pb.uuid || pb.id || pb.booking_id) : pb)?.toString();
      return pbId === bId;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const statusOk = statusFilter === 'ALL' ? true : b.status === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;
      const hay = `${b.campingName || ''} ${b.location || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, statusFilter, query]);

  return (
    <div className="pt-32 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Riwayat booking kamu ada di sini.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-56 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF7F50]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#FF7F50] animate-spin mb-4" />
            <p className="text-gray-400 font-medium text-sm tracking-wide">Memuat riwayat...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button 
              onClick={fetchBookings}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((booking, index) => (
              <div
                key={booking.id || `booking-${index}`}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-[#FF7F50]/30 transition-all shadow-sm group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Info Utama */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-800">
                        {booking.public_id || booking.publicId || `#${booking.id?.toString().slice(-6).toUpperCase()}`}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                      {booking.campingName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                    </div>
                  </div>

                  {/* Detail Tamu & Alat */}
                  <div className="flex flex-wrap items-center gap-6 md:px-8 md:border-x border-gray-50 dark:border-gray-700">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Durasi</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{booking.nights} Malam</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tamu</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{booking.visitors} Orang</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Alat</p>
                      <p className={`text-sm font-bold ${Array.isArray(booking.addons) && booking.addons.length > 0 ? 'text-[#FF7F50]' : 'text-gray-400'}`}>
                        {Array.isArray(booking.addons) ? booking.addons.length : 0} Item
                      </p>
                    </div>
                  </div>

                  {/* Harga & Aksi */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-8 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                      <p className="text-lg font-black text-[#FF7F50]">{formatPrice(booking.totalPrice)}</p>
                    </div>
                    
                    {(booking.status === 'CHECK_OUT') && (
                      <button 
                        onClick={() => handleReviewClick(booking)}
                        disabled={!isPendingReview(booking)}
                        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest ${
                          isPendingReview(booking) 
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 active:scale-95' 
                            : 'bg-green-50 text-green-600 border border-green-100 cursor-not-allowed'
                        }`}
                      >
                        <Star size={14} fill={isPendingReview(booking) ? "white" : "currentColor"} />
                        {isPendingReview(booking) ? 'Beri Ulasan' : 'Sudah Diulas'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Belum ada riwayat booking</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Setelah kamu booking dari menu <span className="font-semibold text-[#FF7F50]">Book Camp</span>, riwayatnya akan muncul di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampingList;
