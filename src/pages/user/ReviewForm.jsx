import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Save, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reviews/questions');
      const data = res.data?.data || res.data || [];
      setQuestions(data);
      
      // Initialize answers
      const initialAnswers = {};
      data.forEach(q => {
        initialAnswers[q.id] = 0; // Score 1-5
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Gagal memuat pertanyaan ulasan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionIndex, totalOptions) => {
    // Menghitung skor berdasarkan urutan opsi. 
    // Jika ada 5 opsi, opsi pertama (index 0) biasanya yang terbaik (skor 5).
    // Rumus: 5 - (index) jika diasumsikan admin mengurutkan dari yang terbaik.
    // Namun agar lebih fleksibel, kita ambil skor 1-5 berdasarkan posisi.
    let score = 5;
    if (totalOptions === 5) {
      score = 5 - optionIndex;
    } else if (totalOptions === 3) {
      // Mapping 3 opsi ke skor 5, 3, 1
      const scores = [5, 3, 1];
      score = scores[optionIndex];
    } else {
      // Fallback sederhana
      score = Math.max(1, Math.round(5 - (optionIndex * (4 / (totalOptions - 1)))));
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const isFormValid = () => {
    const allAnswered = questions.every(q => answers[q.id] !== undefined && answers[q.id] > 0);
    return allAnswered;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setSubmitting(true);
    try {
      const payload = {
        booking_id: bookingId,
        answers: Object.entries(answers).map(([id, score]) => ({
          question_id: parseInt(id),
          score: score
        })),
        comment: "No comment provided" // Mengirim string default karena field dihapus dari UI
      };

      await api.post('/api/reviews', payload);
      alert('Terima kasih! Ulasan Anda telah berhasil dikirim.');
      
      // Menggunakan state untuk memberi tahu dashboard agar refresh data
      navigate('/dashboard', { state: { refresh: true } });
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(`Gagal mengirim ulasan: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Group questions by aspect
  const groupedQuestions = questions.reduce((acc, q) => {
    const aspect = q.aspect || '';
    if (!acc[aspect]) acc[aspect] = [];
    acc[aspect].push(q);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Memuat Pertanyaan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-2">Error</h2>
        <p className="text-gray-500 mb-6 text-center">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Kembali</span>
          </button>
          
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
            Berikan <span className="text-orange-500">Ulasanmu</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Bantu kami meningkatkan kualitas pelayanan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(groupedQuestions).map(([aspect, qs], aspectIdx) => (
            <div key={aspect} className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${aspectIdx * 100}ms` }}>
              {aspect && (
                <div className="flex items-center gap-3">
                  <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg border border-orange-100 dark:border-orange-800/30">
                    {aspect}
                  </h2>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800/50"></div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {qs.map((q) => (
                  <div key={q.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight leading-snug block">
                        {q.question}
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.isArray(q.options) && q.options.length > 0 ? (
                          q.options.map((option, optIdx) => {
                            const scores = q.options.length === 5 ? [5, 4, 3, 2, 1] : 
                                         q.options.length === 3 ? [5, 3, 1] : 
                                         [5, 4, 3, 2, 1];
                            const isSelected = answers[q.id] === scores[optIdx];

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, optIdx, q.options.length)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all border-2 ${
                                  isSelected
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                                    : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:border-orange-200'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })
                        ) : (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: star }))}
                                className={`p-2 rounded-lg transition-all ${
                                  answers[q.id] === star ? 'bg-orange-100 text-orange-600' : 'text-gray-300'
                                }`}
                              >
                                <Star size={20} fill={answers[q.id] === star ? "currentColor" : "none"} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}


          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting || !isFormValid()}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                isFormValid() 
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-[0.98]' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  Kirim Ulasan
                </>
              )}
            </button>
            {!isFormValid() && (
              <p className="text-center mt-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                Selesaikan semua pertanyaan untuk mengirim
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
