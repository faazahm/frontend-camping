import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, Filter, ChevronRight, X, Info, CreditCard, ShoppingBag, DollarSign, Star, MessageSquare, Loader2, Save, Tent, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [rating, setRating] = useState(5);
  const [answers, setAnswers] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch history and pending reviews in parallel
      const [historyRes, pendingRes] = await Promise.all([
        api.get(`/api/dashboard/history`, { params: statusFilter !== 'ALL' ? { status: statusFilter } : {} }),
        api.get('/api/reviews/pending').catch(err => {
          console.warn('Pending reviews fetch failed:', err);
          return { data: { data: [] } };
        })
      ]);

      const historyData = historyRes.data?.data || historyRes.data || [];
      const pendingData = pendingRes.data?.data || [];
      const questionsData = pendingRes.data?.questions || [];

      // Filter out bookings that are PENDING but have no payment_proof
      const filteredHistoryData = (Array.isArray(historyData) ? historyData : []).filter(item => {
        if (item.status === 'PENDING') {
          if (item.payment_proof || item.paymentProof) return true;
          try {
            const submittedIds = JSON.parse(sessionStorage.getItem('submitted_booking_ids') || '[]');
            const bookingId = item.public_id || item.uuid || String(item.id);
            if (submittedIds.some(sid => String(sid) === String(bookingId))) return true;
          } catch (_) {}
          return false;
        }
        return true;
      });

      setBookings(filteredHistoryData);
      setPendingReviews(pendingData);
      setReviewQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Review logic
  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    const initialAnswers = {};
    reviewQuestions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewBooking(null);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    const unanswered = reviewQuestions.some(q => !answers[q.id]);
    if (unanswered) {
      alert('Harap jawab semua pertanyaan evaluasi sebelum mengirim ulasan.');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        bookingId: reviewBooking.public_id || reviewBooking.uuid,
        rating: rating,
        answers: answers
      };

      await api.post('/api/reviews', payload);
      alert('Terima kasih! Ulasan Anda telah berhasil dikirim.');
      closeReviewModal();
      fetchHistory(); // Refresh to update buttons
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Gagal mengirim ulasan: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isPendingReview = (booking) => {
    const bId = booking.public_id || booking.uuid || booking.id;
    return pendingReviews.some(pb => (pb.public_id || pb.uuid || pb.id) === bId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'VERIFYING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'CHECK_IN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CHECK_OUT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'CHECKOUT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (booking) => {
    if (booking.status === 'PENDING' && booking.payment_proof) {
      return 'Sedang Diverifikasi';
    }
    switch (booking.status) {
      case 'PAID': return 'Lunas';
      case 'PENDING': return 'Menunggu';
      case 'VERIFYING': return 'Diverifikasi';
      case 'CANCELLED': return 'Dibatalkan';
      case 'CHECK_IN': return 'Check-In';
      case 'CHECK_OUT': return 'Selesai';
      case 'CHECKOUT': return 'Selesai';
      default: return booking.status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Riwayat Booking</h1>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={20} className="text-gray-500 mr-2 flex-shrink-0" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-orange-500 focus:border-orange-500 p-2.5 border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Lunas</option>
            <option value="CHECK_IN">Check-In</option>
            <option value="CHECK_OUT">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Memuat riwayat...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all group">
              <div className="md:flex">
                <div className="md:w-64 h-52 md:h-auto relative overflow-hidden">
                  <img 
                    src={booking.camp?.image_url || booking.image || "https://images.unsplash.com/photo-1517824806704-9040b037703b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} 
                    alt={booking.camp?.name || booking.campingName} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 md:hidden">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking)}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-[#1A202C] dark:text-white mb-1.5 tracking-tight">
                          {booking.camp?.name || booking.campingName}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm font-medium">
                          <MapPin size={16} className="mr-1.5 text-orange-500" />
                          {booking.camp?.location || booking.location}
                        </div>
                      </div>
                      <span className={`hidden md:inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar size={20} className="mr-3 text-orange-500/50" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-in</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(booking.start_date || booking.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock size={20} className="mr-3 text-orange-500/50" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-out</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(booking.end_date || booking.checkOut)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bayar</p>
                      <p className="text-2xl font-black text-orange-600">
                        {formatPrice(booking.total_price || booking.totalPrice)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {isPendingReview(booking) && (
                        <button 
                          onClick={() => openReviewModal(booking)}
                          className="px-6 py-3 bg-orange-500 text-white text-sm font-black rounded-2xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20 flex items-center gap-2"
                        >
                          <Star size={16} fill="white" />
                          Beri Ulasan
                        </button>
                      )}
                      <button 
                        onClick={() => openDetail(booking)}
                        className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-20 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="mx-auto h-20 w-20 text-gray-200 dark:text-gray-800 mb-6 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-3xl">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Tidak ada riwayat booking</h3>
          <p className="text-gray-500 font-medium">Belum ada booking dengan status ini.</p>
        </div>
      )}

      {/* Modal Detail Booking */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeDetail}></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl transform transition-all border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Reservasi</h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono">#{selectedBooking.id}</p>
                </div>
                <button onClick={closeDetail} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {/* Status Section */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
                    <p className="text-xl font-black text-orange-600">{formatPrice(selectedBooking.total_price || selectedBooking.totalPrice)}</p>
                  </div>
                </div>

                {/* Detail Biaya */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                      <DollarSign size={16} />
                    </div>
                    Rincian Biaya
                  </h4>
                  <div className="bg-white dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                    {/* Camp Fee */}
                    <div className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{selectedBooking.camp?.name || selectedBooking.campingName}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {selectedBooking.people_count || selectedBooking.peopleCount || 0} Orang × {selectedBooking.nights || 1} Malam
                        </p>
                      </div>
                      <p className="font-black text-gray-900 dark:text-white">
                        {formatPrice((selectedBooking.nights || 1) * 10000 * (selectedBooking.people_count || selectedBooking.peopleCount || 0))}
                      </p>
                    </div>

                    {/* Equipments */}
                    {(selectedBooking.equipments || selectedBooking.addons || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm pt-4 border-t border-gray-50 dark:border-gray-800">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.equipment?.name || item.name}</p>
                          <p className="text-xs text-gray-500 font-medium">
                            {item.quantity || item.qty} Unit × {item.nights || selectedBooking.nights || 1} Malam
                          </p>
                        </div>
                        <p className="font-black text-gray-900 dark:text-white">
                          {formatPrice(item.total_price || item.total || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bukti Pembayaran */}
                {selectedBooking.payment_proof && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <CreditCard size={16} />
                      </div>
                      Bukti Pembayaran
                    </h4>
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <img src={selectedBooking.payment_proof} alt="Bukti Transfer" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end border-t border-gray-100 dark:border-gray-800">
                <button onClick={closeDetail} className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Review Booking */}
      {isReviewModalOpen && reviewBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeReviewModal}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 bg-[length:200%_auto] animate-gradient-x"></div>
            
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-[30px] flex items-center justify-center text-orange-600 mb-6">
                  <Star size={40} className="fill-orange-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">
                  Berikan <span className="text-orange-500">Ulasanmu!</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Pengalamanmu di <span className="font-bold text-gray-900 dark:text-white">{reviewBooking.camp?.name || reviewBooking.campingName}</span> sangat berarti bagi kami.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-10">
                {/* Rating Section */}
                <div className="space-y-6 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Seberapa puas pengalamanmu?</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-125 active:scale-90 group"
                      >
                        <Star 
                          size={48} 
                          className={`${star <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200 dark:text-gray-800'} transition-all duration-300`}
                          strokeWidth={star <= rating ? 0 : 1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 py-3 px-6 rounded-2xl">
                    <span className="text-lg">
                      {rating === 5 ? '😍' : rating === 4 ? '🙂' : rating === 3 ? '😐' : rating === 2 ? '☹️' : '😡'}
                    </span>
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                      {rating === 5 ? 'Sangat Puas!' : 
                       rating === 4 ? 'Puas' : 
                       rating === 3 ? 'Cukup' : 
                       rating === 2 ? 'Kurang' : 'Sangat Kurang'}
                    </p>
                  </div>
                </div>

                {/* Dynamic Questions */}
                {reviewQuestions.length > 0 && (
                  <div className="space-y-10 pt-4 border-t border-gray-50 dark:border-gray-800">
                    {reviewQuestions.map((q) => (
                      <div key={q.id} className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0">
                            ?
                          </div>
                          <label className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight pt-1">
                            {q.question}
                          </label>
                        </div>
                        
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, opt)}
                                className={`px-6 py-4 rounded-[24px] text-xs font-black transition-all text-left border-2 ${
                                  answers[q.id] === opt
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/30'
                                    : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:border-orange-200'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            required
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-[24px] focus:bg-white dark:focus:bg-gray-900 focus:border-orange-500 outline-none transition-all resize-none text-base font-bold text-gray-900 dark:text-white shadow-inner"
                            placeholder="Tuliskan jawaban Anda di sini..."
                            rows="4"
                          ></textarea>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="flex-1 px-8 py-5 border-2 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-black text-sm uppercase tracking-widest rounded-[28px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-[2] flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-5 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Save size={24} strokeWidth={2.5} />
                        Kirim Ulasan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
