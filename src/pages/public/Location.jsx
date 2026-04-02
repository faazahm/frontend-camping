import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  MapPin, Phone, Mail, ArrowRight, Clock, Navigation, 
  Car, Store, Fuel, CreditCard, Tent, Droplet, 
  Zap, Utensils, Copy, Check, ExternalLink, Info,
  Camera, Coffee, Mountain
} from 'lucide-react';

const Location = () => {
  const [copied, setCopied] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const nearbyPlaces = [
    { name: 'Jembatan Gantung Pundong', distance: '1.2 km', type: 'Spot Foto', icon: <Camera size={20} /> },
    { name: 'Pantai Parangtritis', distance: '12 km', type: 'Wisata Alam', icon: <Mountain size={20} /> },
    { name: 'Pusat Kuliner Pundong', distance: '3 km', type: 'Kuliner', icon: <Coffee size={20} /> },
  ];

  return (
    <div className="pt-32 pb-24 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300 overflow-x-hidden">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-[#FF7F50] uppercase bg-orange-50 dark:bg-orange-900/20 rounded-full">
            Lokasi Strategis
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Jejak <span className="text-[#FF7F50]">Alam</span> Potrobayan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Potrobayan River Camp menanti Anda di tepi Sungai Opak yang asri. Akses mudah, pemandangan indah.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          {/* Map Section */}
          <div className={`lg:col-span-7 group relative transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7F50] to-orange-400 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-[30px] overflow-hidden shadow-2xl h-[400px] md:h-[550px] border-4 border-white dark:border-gray-800">
              <iframe 
                src="https://maps.google.com/maps?q=Potrobayan%20River%20Camp&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Potrobayan Location"
                className="grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              ></iframe>
              
              {/* Floating Map Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Potrobayan+River+Camp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pointer-events-auto bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center space-x-3 hover:scale-105 transition-transform active:scale-95 group/btn"
                >
                  <div className="bg-[#FF7F50] p-2 rounded-xl text-white">
                    <Navigation size={18} className="group-hover/btn:rotate-12 transition-transform" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Petunjuk Arah</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className={`lg:col-span-5 space-y-6 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Address Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7F50]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-start space-x-5">
                  <div className="p-4 bg-[#FF7F50] text-white rounded-2xl shrink-0 shadow-lg shadow-orange-500/30 group-hover:rotate-6 transition-transform">
                    <MapPin size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Alamat Kami</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                      Potrobayan River Camp,<br/>
                      Srihardono, Kec. Pundong, Kab. Bantul,<br/>
                      DI Yogyakarta 55771
                    </p>
                    <button 
                      onClick={() => copyToClipboard('Potrobayan River Camp, Srihardono, Kec. Pundong, Kab. Bantul, DI Yogyakarta 55771', 'address')}
                      className="inline-flex items-center space-x-2 text-sm font-bold text-[#FF7F50] hover:text-orange-600 transition-colors"
                    >
                      {copied === 'address' ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copied === 'address' ? 'Tersalin!' : 'Salin Alamat'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <button 
                onClick={() => copyToClipboard('+6283867128869', 'phone')}
                className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">WhatsApp</h3>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                      +62 838-6712-8869
                      {copied === 'phone' && <Check size={16} className="ml-2 text-green-500" />}
                    </p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => copyToClipboard('thomead@gmail.com', 'email')}
                className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-50 dark:bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Email</h3>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                      thomead@gmail.com
                      {copied === 'email' && <Check size={16} className="ml-2 text-green-500" />}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {/* Jam Operasional */}
          <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-700 delay-[700ms] group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Waktu Kunjungan</h3>
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-orange-200 dark:border-orange-800">
                <p className="text-sm font-bold text-orange-500 uppercase mb-1">Camping</p>
                <div className="flex flex-col text-gray-900 dark:text-white font-bold">
                  <span>Masuk: 14.00 WIB</span>
                  <span>Keluar: 11.00 WIB</span>
                </div>
              </div>
              <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Wisata Biasa</p>
                <p className="text-gray-900 dark:text-white font-bold">07.00 - 18.00 WIB</p>
              </div>
            </div>
          </div>

          {/* Akses Jalan */}
          <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-700 delay-[900ms] group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Car size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Akses Kendaraan</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="font-bold text-gray-700 dark:text-gray-300">Mobil & Motor</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="font-bold text-gray-700 dark:text-gray-300">Parkir Luas & Aman</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="font-bold text-gray-700 dark:text-gray-300">Jalan Beraspal</span>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-700 delay-[1100ms] group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Tent size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Fasilitas Terdekat</h3>
            <div className="space-y-3">
              {[
                { icon: <Droplet size={18} />, label: 'Toilet & Air', color: 'text-blue-500' },
                { icon: <Zap size={18} />, label: 'Listrik (PLN)', color: 'text-yellow-500' },
                { icon: <Utensils size={18} />, label: 'Warung', color: 'text-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center font-bold">
                    <span className={`${item.color} mr-3 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm`}>{item.icon}</span>
                    {item.label}
                  </span>
                  <Check size={18} className="text-[#FF7F50]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
