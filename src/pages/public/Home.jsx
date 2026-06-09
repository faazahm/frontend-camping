import { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Star, Shield, Clock, Flame, Ticket, FileText, Fish, Trees, Trash2, VolumeX, Camera, AlertTriangle, ChevronDown, Loader2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import potroImg from '../../assets/potro1.png';
import FadeIn from '../../components/animations/FadeIn';
import ReviewCard from '../../components/ui/ReviewCard';
import api from '../../services/api';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await api.get('/reviews/public');
      console.log('Raw API Response:', res);
      const data = res.data?.data || res.data || [];
      console.log('Processed Reviews Data:', data);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <section className="relative min-h-[85vh] md:min-h-screen flex flex-col justify-center pt-24 md:pt-0">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[40px] md:rounded-b-[70px] shadow-2xl">
          <img
            src={potroImg}
            alt="Camping Background"
            className="w-full h-full object-cover scale-110" 
            style={{ transform: `translateY(${scrollY * 0.5}px) scale(1.1)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8"
             style={{ transform: `translateY(${-scrollY * 0.2}px)` }}>
          <div className="space-y-4">
            <FadeIn delay={200}>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl">
                Potrobayan River Camp <br />
              </h1>
            </FadeIn>
            <FadeIn delay={400}>
              <p className="text-xs md:text-sm lg:text-base text-gray-100 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-lg opacity-90">
                The best camping spot to enjoy nature and the river.
              </p>
            </FadeIn>
          </div>
          
          <FadeIn delay={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/book-camp"
                className="px-8 py-3 md:px-10 md:py-4 bg-[#FF7F50] hover:bg-[#ff6b3d] text-white font-bold rounded-full transition-all transform hover:scale-105 hover:shadow-orange-500/50 shadow-xl flex items-center gap-2 text-base md:text-lg group"
              >
                Booking Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="relative md:absolute md:bottom-0 md:left-0 md:right-0 z-20 px-4 md:translate-y-1/2 mt-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { 
                icon: Trees, 
                label: 'Nature View', 
                desc: 'Pemandangan sungai & hutan alami'
              },
              { 
                icon: Ticket, 
                label: 'Easy Booking', 
                desc: 'Booking tempat camping secara online'
              },
              { 
                icon: Shield, 
                label: 'Safe & Clean', 
                desc: 'Lingkungan bersih dan aman'
              },
              { 
                icon: Camera, 
                label: 'Best Photo Spot', 
                desc: 'Abadikan momen terbaikmu disini'
              }
            ].map((item, index) => (
              <FadeIn key={index} delay={800 + (index * 150)} className="h-full">
                <div 
                  className="bg-white dark:bg-gray-800 rounded-[30px] p-4 sm:p-5 md:p-6 shadow-xl hover:shadow-2xl flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px] relative overflow-hidden cursor-default"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF7F50] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="mb-4 p-3.5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl group-hover:bg-[#FF7F50] group-hover:text-white transition-all duration-300 shadow-sm">
                    <item.icon className="w-7 h-7 md:w-8 md:h-8 text-[#FF7F50] group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg tracking-wide mb-2">{item.label}</h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="h-8 sm:h-12 md:h-40 lg:h-80 bg-white dark:bg-gray-900"></div>

      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Kami menyediakan fasilitas dan pelayanan terbaik untuk memastikan pengalaman camping yang tak terlupakan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={200} className="h-full">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lokasi Strategis</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Terletak di pinggir sungai yang asri, mudah diakses namun tetap memberikan ketenangan alam yang Anda cari.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={400} className="h-full">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:-rotate-6 transition-transform">
                  <Shield size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Aman & Nyaman</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Area camping dijaga 24 jam dengan fasilitas sanitasi bersih dan penerangan yang memadai.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={600} className="h-full">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center border border-gray-100 dark:border-gray-700 h-full">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reservasi Mudah</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sistem booking online yang cepat dan mudah. Pesan tempat favorit Anda kapan saja dan di mana saja.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section id="rules" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Camp Rules</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Demi kenyamanan dan keamanan bersama, harap patuhi peraturan berikut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FadeIn delay={200} className="h-full">
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sopan & Santun</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Wajib menjaga sopan dan santun selama berada di area camping.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={300} className="h-full">
              <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Bawa Trashbag</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Setiap pengunjung wajib membawa kantong sampah (trashbag) sendiri.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={400} className="h-full">
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dilarang Buang Sampah</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Dilarang keras membuang sampah sembarangan di area camp.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={500} className="h-full">
              <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dilarang Api Unggun</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Dilarang keras menyalakan api unggun di area camping.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={600} className="h-full">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dilarang Mandi di Sungai</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Demi keselamatan, dilarang mandi atau berenang di area sungai.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={700} className="h-full">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex items-start hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full cursor-default">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mr-4 font-bold">
                  6
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Jam Tenang</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Mulai pukul 23:00 WIB dilarang membuat kegaduhan atau memainkan alat musik.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Apa Kata Mereka?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Pengalaman nyata dari para camper yang sudah berkunjung ke Potrobayan River Camp.
            </p>
          </div>

          {loadingReviews ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative overflow-hidden py-4">
              <div className="flex gap-6 animate-marquee">
                {[...reviews.slice(0, 10), ...reviews.slice(0, 10)].map((review, index) => (
                  <div key={`${review.id || index}-${index}`} className="flex-shrink-0 w-80 md:w-96">
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Ulasan</h3>
              <p className="text-gray-500">Jadilah yang pertama memberikan ulasan tentang pengalaman campingmu!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
