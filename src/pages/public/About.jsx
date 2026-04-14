import { MapPin, Zap, Car, Droplets, Moon, ArrowRight, Lightbulb, Baby, Megaphone, Lock, Clock, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import potroImg from '../../assets/potrobayan2.jpg';
import FadeIn from '../../components/animations/FadeIn';

const About = () => {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Main Content */}
      <section className="pt-44 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image Side */}
            <FadeIn delay={200} direction="right">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-4 bg-[#FF7F50]/20 rounded-[30px] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                <img 
                  src={potroImg} 
                  alt="Pemandangan Potrobayan" 
                  className="relative rounded-[20px] shadow-xl w-full h-56 sm:h-72 md:h-[350px] object-cover transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 transform transition-all duration-300 group-hover:-translate-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#FF7F50] rounded-full text-white shrink-0 animate-pulse">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Lokasi Kami</p>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=Potrobayan+River+Camp" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white font-bold text-sm hover:text-[#FF7F50] transition-colors leading-tight block"
                      >
                        Srihardono, Kec. Pundong, Kab. Bantul, DIY 55771
                      </a>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=Potrobayan+River+Camp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#FF7F50] font-medium mt-0.5 inline-flex items-center hover:underline group-hover:translate-x-1 transition-transform"
                      >
                        Lihat di Google Maps <ArrowRight size={10} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Text Side */}
            <div className="space-y-5 lg:pl-10">
              <FadeIn delay={400}>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Camping Tersembunyi di <span className="text-[#FF7F50]">Potrobayan River Camp</span>
                  </h2>
                  <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-justify">
                    <p>
                      Potrobayan River Camp adalah destinasi wisata alam yang terletak di tepi Sungai Opak, Yogyakarta. 
                      Kami menawarkan pengalaman camping yang unik dengan pemandangan sungai yang asri dan udara yang sejuk.
                    </p>
                    <p>
                      Berawal dari inisiatif pemuda setempat untuk mengembangkan potensi wisata desa, Potrobayan kini telah 
                      menjadi salah satu spot camping favorit di Yogyakarta. Keindahan sunrise di pagi hari dan gemericik 
                      air sungai yang menenangkan menjadi daya tarik utama kami.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={600}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 hover:scale-105 transition-transform duration-300 hover:shadow-md cursor-default">
                    <h3 className="font-bold text-2xl text-[#FF7F50] mb-0.5">4+ Tahun</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Pengalaman Melayani</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 hover:scale-105 transition-transform duration-300 hover:shadow-md cursor-default">
                    <h3 className="font-bold text-2xl text-[#FF7F50] mb-0.5">1000+</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Wisatawan berkunjung</p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={800}>
                <Link 
                  to="/book-camp" 
                  className="inline-flex items-center px-8 py-4 bg-[#FF7F50] text-white font-bold rounded-full hover:bg-[#ff6b3d] transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/30 group text-sm"
                >
                  Booking Tempat Sekarang
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="fasilitas" className="py-20 bg-white dark:bg-gray-800/50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Fasilitas</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Kami berkomitmen memberikan pengalaman terbaik dengan fasilitas yang memadai untuk kenyamanan Anda.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Moon,
                title: "Mushola",
                desc: "Tersedia mushola yang bersih dan nyaman untuk beribadah.",
                color: "purple"
              },
              {
                icon: Car,
                title: "Parkir Luas",
                desc: "Area parkir yang luas dan aman untuk mobil maupun motor.",
                color: "blue"
              },
              {
                icon: Droplets,
                title: "Kamar Mandi",
                desc: "Fasilitas kamar mandi dan toilet yang bersih dan terawat.",
                color: "teal"
              },
              {
                icon: Zap,
                title: "Listrik",
                desc: "Tersedia akses terminal listrik di area camping.",
                color: "orange"
              }
            ].map((item, index) => (
              <FadeIn key={index} delay={index * 100} className="h-full">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 h-full group cursor-pointer">
                  <div className={`w-14 h-14 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#FF7F50] transition-colors">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Camp Information Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Header & Essential Info */}
            <div id="informasi" className="lg:col-span-5 space-y-8 scroll-mt-24">
              <FadeIn direction="right">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Informasi Penting
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Panduan lengkap untuk kenyamanan kunjungan Anda di Potrobayan River Camp.
                  </p>
                </div>
              </FadeIn>

              {/* Highlight Cards */}
              <FadeIn delay={200} direction="right">
                <div className="bg-[#FF7F50] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                      <Ticket className="w-6 h-6 text-white/80 group-hover:rotate-12 transition-transform" />
                      <span className="font-medium text-white/80">Tiket Masuk</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">Rp 10.000</div>
                    <div className="text-sm text-white/80">per orang / malam</div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={400} direction="right">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <Clock className="w-6 h-6 text-[#FF7F50] animate-spin-slow" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Waktu Operasional</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="group">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Camping</div>
                      <div className="flex justify-between items-center text-gray-900 dark:text-white font-medium p-2 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors">
                        <span>Check-in</span>
                        <span>14.00 WIB</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-900 dark:text-white font-medium p-2 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors">
                        <span>Check-out</span>
                        <span>11.00 WIB</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 group">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kunjungan Biasa</div>
                      <div className="text-gray-900 dark:text-white font-medium p-2 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors">07.00 - 18.00 WIB</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Detailed Guidelines */}
            <div id="rules" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 scroll-mt-24">
              {[
                {
                  icon: Lightbulb,
                  title: "Penerangan Terbatas",
                  desc: "Ada penerangan di area camping, namun penerangan hanya ada di pos dan area parkir.",
                  color: "yellow"
                },
                {
                  icon: Baby,
                  title: "Ramah Anak",
                  desc: "Aman bawa anak-anak. Pastikan cuaca bersahabat dan jaga mobilitas anak. Mari saling jaga keamanan bersama.",
                  color: "pink"
                },
                {
                  icon: Megaphone,
                  title: "Kegiatan Besar",
                  desc: "Kegiatan Komersial, kegiatan komunitas, atau acara partai besar wajib melakukan konfirmasi terlebih dahulu.",
                  color: "blue"
                },
                {
                  icon: Lock,
                  title: "Barang Bawaan",
                  desc: "Jaga bawaan anda dengan baik. Kelalaian barang tertinggal atau hilang bukan tanggung jawab pengelola.",
                  color: "red"
                }
              ].map((item, index) => (
                <FadeIn key={index} delay={600 + (index * 100)} className="h-full">
                  <div className="flex flex-col p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:-translate-y-2 h-full group cursor-default">
                    <div className={`w-12 h-12 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF7F50] transition-colors">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
