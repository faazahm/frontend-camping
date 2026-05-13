import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2, 
  MessageSquare,
  Star,
  User,
  Calendar,
  Quote,
  Tent,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import api from '../../services/api';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [conclusion, setConclusion] = useState(null);
  const [activeTab, setActiveTab] = useState('conclusion'); // 'conclusion', 'reviews', or 'questions'
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [conclusionLoading, setConclusionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    aspect: 'Kebersihan',
    options: ['']
  });

  const ASPECTS = ['Kebersihan', 'Fasilitas', 'Pelayanan', 'Keamanan', 'Kepuasan'];

  const getStatusBadge = (score) => {
    const s = Number(score);
    if (s >= 86) return { label: 'SANGAT BAIK', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (s >= 71) return { label: 'BAIK', color: 'bg-green-100 text-green-700 border-green-200' };
    if (s >= 51) return { label: 'CUKUP', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'BURUK', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  useEffect(() => {
    fetchQuestions();
    fetchReviews();
    fetchSummary();
    fetchConclusion();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = [
        '/api/admin/questions',
        '/admin/questions'
      ];

      let response;
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          // continue
        }
      }

      if (response) {
        const data = response.data?.data || response.data || [];
        setQuestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      
      const endpoints = [
        '/api/admin/reviews',
        '/admin/reviews'
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!response) {
        console.error('Semua endpoint ulasan gagal dipanggil:', lastError);
        throw lastError || new Error('Gagal memuat data ulasan');
      }

      console.log('DATA ULASAN DITERIMA DARI BACKEND:', response.data);
      
      // Ekstraksi data ulasan
      let reviewList = [];
      if (Array.isArray(response.data)) {
        reviewList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        reviewList = response.data.data;
      } else if (response.data?.reviews && Array.isArray(response.data.reviews)) {
        reviewList = response.data.reviews;
      }

      // Map data sesuai spesifikasi database Postgres (total_score, user_email, created_at, comment)
      const mappedReviews = reviewList.map((review) => {
        // Log individual review untuk verifikasi field asli
        console.log('SYNC DB REVIEW ID:', review.id || review.user_id, 'DATA:', review);

        return {
          ...review,
          // EMAIL USER: Ambil dari user_email atau email (Prioritaskan email agar tidak muncul nama)
          userName: review.user_email || review.email || review.user?.email || `User #${review.user_id || '?'}`,
          
          // SKOR TOTAL: Prioritaskan total_score (snake_case) sesuai database Postgres
          displayScore: review.total_score !== undefined && review.total_score !== null 
            ? Number(review.total_score) 
            : (review.totalScore !== undefined ? Number(review.totalScore) : 0),
          
          // TANGGAL: Prioritaskan created_at sesuai database Postgres
          createdAt: review.created_at || review.createdAt,
          
          // KOMENTAR: comment
          comment: review.comment && review.comment !== 'No comment provided' ? review.comment : '-'
        };
      });

      console.log('LIST ULASAN TERKONEKSI DATABASE:', mappedReviews);

      const sortedReviews = mappedReviews.sort((a, b) => 
        new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)
      );
      
      setReviews(sortedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviewsError(err.message || 'Gagal memuat ulasan');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      
      const endpoints = [
        '/api/admin/reviews/summary',
        '/admin/reviews/summary'
      ];

      let response;
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          // continue
        }
      }

      if (response) {
        setSummary(response.data?.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchConclusion = async () => {
    try {
      setConclusionLoading(true);
      
      const endpoints = [
        '/api/admin/reviews/conclusion',
        '/admin/reviews/conclusion'
      ];

      let response;
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          // continue
        }
      }

      if (response) {
        setConclusion(response.data?.data || response.data);
      }
    } catch (err) {
      console.error('Error fetching conclusion:', err);
    } finally {
      setConclusionLoading(false);
    }
  };

  // Prepare radar chart data
  const radarData = conclusion?.aspect_averages ? 
    Object.entries(conclusion.aspect_averages).map(([aspect, score]) => ({
      subject: aspect.charAt(0).toUpperCase() + aspect.slice(1),
      A: Number(score),
      fullMark: 5
    })) : [];

  // Prepare chart data for old summary (fallback)
  const distributionData = summary?.ratingDistribution ? 
    Object.entries(summary.ratingDistribution).map(([star, count]) => ({
      name: `${star} Bintang`,
      count: Number(count),
      star: Number(star)
    })).sort((a, b) => b.star - a.star) : [];

  const COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'];

  const handleOpenModal = (question = null) => {
    if (question) {
      setCurrentQuestion(question);
      setFormData({
        question: question.question || '',
        aspect: question.aspect || 'Kebersihan',
        options: Array.isArray(question.options) ? [...question.options] : ['']
      });
    } else {
      setCurrentQuestion(null);
      setFormData({
        question: '',
        aspect: 'Kebersihan',
        options: ['']
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    setFormData({ question: '', aspect: 'Kebersihan', options: [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      question: formData.question,
      aspect: formData.aspect,
      options: formData.options.filter(opt => opt.trim() !== '')
    };

    try {
      if (currentQuestion) {
        await api.put(`/api/admin/questions/${currentQuestion.id || currentQuestion.uuid}`, payload);
      } else {
        await api.post('/api/admin/questions', payload);
      }

      alert('Pertanyaan berhasil disimpan!');
      fetchQuestions();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving question:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan pertanyaan';
      alert(`GAGAL SIMPAN: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) return;
    try {
      await api.delete(`/api/admin/questions/${id}`);
      alert('Pertanyaan berhasil dihapus.');
      fetchQuestions();
    } catch (err) {
      alert(`GAGAL MENGHAPUS: ${err.message}`);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(r => {
    const s = searchTerm.toLowerCase();
    return (
      (r.userName || '').toLowerCase().includes(s) ||
      (r.userEmail || '').toLowerCase().includes(s) ||
      (r.comment || '').toLowerCase().includes(s) ||
      (r.camp?.name || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
            <MessageSquare className="text-orange-500" size={32} />
            Analisis & Kuesioner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Pantau feedback pengguna dan kelola pertanyaan evaluasi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          {(activeTab === 'reviews' || activeTab === 'questions') && (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder={activeTab === 'reviews' ? "Cari ulasan..." : "Cari pertanyaan..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all w-64 shadow-sm"
              />
            </div>
          )}
          
          {activeTab === 'questions' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Tambah Pertanyaan
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('conclusion')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'conclusion' 
              ? 'text-orange-500' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Kesimpulan
          {activeTab === 'conclusion' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'reviews' 
              ? 'text-orange-500' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Daftar Ulasan
          {activeTab === 'reviews' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'questions' 
              ? 'text-orange-500' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Kelola Pertanyaan
          {activeTab === 'questions' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
          )}
        </button>
      </div>

      {activeTab === 'conclusion' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
          {conclusionLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-orange-500 mx-auto" size={40} />
              <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest">Menganalisis Data...</p>
            </div>
          ) : conclusion ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Rata-rata Bintang</p>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                    {Number(summary?.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < Math.round(summary?.averageRating || 0) ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
                        strokeWidth={i < Math.round(summary?.averageRating || 0) ? 0 : 2}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Ulasan</p>
                  <div className="text-4xl font-black text-gray-900 dark:text-white leading-none">
                    {conclusion.total_reviews}
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Feedback Diterima</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Skor Kepuasan</p>
                  <div className="text-4xl font-black text-orange-500 leading-none">
                    {conclusion.average_score}%
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Indeks Performa</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kategori</p>
                  <div className={`text-lg font-black uppercase tracking-tight leading-none mt-1 ${
                    conclusion.average_score >= 85 ? 'text-green-500' : 
                    conclusion.average_score >= 70 ? 'text-blue-500' : 'text-orange-500'
                  }`}>
                    {conclusion.category}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md">Best</span>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 capitalize truncate ml-2">{conclusion.best_aspect}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">Worst</span>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 capitalize truncate ml-2">{conclusion.worst_aspect}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Skor Aspek */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                  <BarChart3 size={18} className="text-orange-500" />
                  Detail Skor Aspek
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {radarData.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm font-black text-gray-400">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.subject}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={8} 
                                className={i < Math.round(item.A) ? "fill-orange-400 text-orange-400" : "text-gray-200"} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-black text-orange-500">
                        {item.A.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800">
              <BarChart3 size={64} className="mx-auto text-gray-100 dark:text-gray-800 mb-6" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data ulasan untuk dianalisis</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Email User</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Tanggal Ulasan</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Skor Total</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Status Mutu</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Komentar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {reviewsLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <Loader2 className="animate-spin text-orange-500 mx-auto" size={40} />
                        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Memuat Data...</p>
                      </td>
                    </tr>
                  ) : reviewsError ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <X size={32} className="text-red-500" />
                        </div>
                        <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{reviewsError}</p>
                        <button 
                          onClick={fetchReviews}
                          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
                        >
                          Coba Lagi
                        </button>
                      </td>
                    </tr>
                  ) : filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => {
                      const badge = getStatusBadge(review.displayScore || 0);
                      return (                        <tr key={review.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300">
                                <User size={20} strokeWidth={2.5} />
                              </div>
                              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 lowercase tracking-tight">
                                  {review.userName}
                                </p>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  {review.createdAt 
                                    ? new Date(review.createdAt).toLocaleDateString('id-ID', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric'
                                      })
                                    : '-'}
                                </span>
                              </div>
                            </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{review.displayScore || 0}</span>
                              <span className="text-[10px] font-bold text-gray-400 mb-0.5">/ 100</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                              <span className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${badge.color}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-8 py-5 max-w-[260px]">
                              {review.comment && review.comment !== '-' ? (
                                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed line-clamp-3" title={review.comment}>
                                  {review.comment}
                                </p>
                              ) : (
                                <span className="text-[10px] text-gray-300 dark:text-gray-600 italic font-medium">Tidak ada komentar</span>
                              )}
                            </td>
                          </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Star size={32} className="text-gray-200 dark:text-gray-700" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                          {searchTerm ? `Tidak ditemukan ulasan untuk "${searchTerm}"` : "Belum ada ulasan dari pengguna"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin text-orange-500 mx-auto" size={40} />
              <p className="mt-4 text-gray-500 font-medium tracking-wide">Memuat data pertanyaan...</p>
            </div>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => (
              <div key={q.id || q.uuid} className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-50 dark:border-gray-800 p-8 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                      <MessageSquare className="text-orange-500" size={20} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(q)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id || q.uuid)}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md border border-orange-100 dark:border-orange-800/30">
                      {q.aspect || 'Kebersihan'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 leading-tight">
                    {q.question}
                  </h3>
                  
                  {/* Options List Preview */}
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {q.options.map((opt, idx) => (
                        <span key={idx} className="text-[9px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white dark:bg-gray-900 rounded-[40px] border border-gray-50 dark:border-gray-800">
              <MessageSquare size={64} className="mx-auto text-gray-100 dark:text-gray-800 mb-6" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data pertanyaan</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Buat pertanyaan ulasan beserta aspek penilaiannya</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pertanyaan</label>
                <textarea
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none font-bold text-gray-900 dark:text-white"
                  placeholder="Contoh: Bagaimana kebersihan area perkemahan?"
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Aspek Penilaian</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ASPECTS.map((aspect) => (
                    <button
                      key={aspect}
                      type="button"
                      onClick={() => setFormData({ ...formData, aspect })}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.aspect === aspect 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pilihan Jawaban (Options)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, options: [...formData.options, ''] })}
                    className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 transition-colors"
                  >
                    <Plus size={14} />
                    Tambah Opsi
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formData.options];
                          newOpts[idx] = e.target.value;
                          setFormData({ ...formData, options: newOpts });
                        }}
                        className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-sm text-gray-900 dark:text-white"
                        placeholder={`Opsi ${idx + 1} (Misal: Sangat Puas)`}
                      />
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = formData.options.filter((_, i) => i !== idx);
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">
                  * Urutkan opsi dari yang terbaik ke yang terburuk (misal: Sangat Puas ke Tidak Puas).
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-8 py-4 border-2 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} />
                      Simpan Pertanyaan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
