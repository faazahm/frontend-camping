import React, { useState, useEffect } from 'react';
import { Tent, Users, Star, Check, ArrowRight, Info, Calendar, CreditCard, ChevronRight, Plus, Minus, ShoppingBag, Loader2, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import api from '../../services/api';

const CHECK_IN_TIME = '14.00 WIB';
const CHECK_OUT_TIME = '11.00 WIB';

const toLocalDateOnly = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatYmdLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysYmd = (ymd, days) => {
  const base = toLocalDateOnly(ymd);
  if (!base) return '';
  base.setDate(base.getDate() + days);
  return formatYmdLocal(base);
};

const diffNights = (checkInYmd, checkOutYmd) => {
  const inDate = toLocalDateOnly(checkInYmd);
  const outDate = toLocalDateOnly(checkOutYmd);
  if (!inDate || !outDate) return 0;
  const ms = outDate.getTime() - inDate.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

const BookCamp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEquips, setLoadingEquips] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [visitors, setVisitors] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({}); // { id: quantity }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null); // Menyimpan hasil POST booking (payment_instructions)
  const [paymentProof, setPaymentProof] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Detail Pembayaran DANA
  const DANA_NUMBER = "083867128869";
  const DANA_NAME = "Potrobayan River Camp";
  const DANA_LOGO_URL = "https://arfkxqnuczyrbkizvsqv.supabase.co/storage/v1/object/public/bookings/Logo_dana_blue.svg.webp";

  useEffect(() => {
    fetchData();
    // Ambil campId dari URL jika ada
    const params = new URLSearchParams(window.location.search);
    const campId = params.get('campId');
    if (campId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const fetchEquipmentsByDate = async () => {
    if (!checkIn || !checkOut) return;
    
    try {
      setLoadingEquips(true);
      console.log(`DEBUG: Fetching equipments for dates ${checkIn} to ${checkOut}`);
      
      const res = await api.get(`/api/booking/equipments?startDate=${checkIn}&endDate=${checkOut}`);
      
      let extracted = [];
      if (Array.isArray(res.data)) {
        extracted = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        extracted = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        const possibleArray = Object.values(res.data).find(val => Array.isArray(val));
        if (possibleArray) extracted = possibleArray;
      }

      const mappedEquips = extracted
        .filter(item => {
          const stock = Number(item.availableStock !== undefined ? item.availableStock : (item.stock || 0));
          return stock > 0;
        })
        .map(item => {
          // Prioritaskan public_id atau UUID string untuk pengiriman data
          const foundUuid = Object.values(item).find(val => 
            typeof val === 'string' && val.length > 30 && val.includes('-')
          );

          return {
            ...item,
            id: item.public_id || foundUuid || item.uuid || item.id, 
            name: item.name || 'Tanpa Nama',
            price: Number(item.price || 0),
            availableStock: Number(item.availableStock !== undefined ? item.availableStock : (item.stock || 0)),
            image_url: item.photo_url_full || item.image_url || item.photo_url || item.image
          };
        });

      setEquipments(mappedEquips);
      
      // Bersihkan pilihan addon yang stoknya sudah tidak tersedia atau melebihi stok baru
      setSelectedAddons(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const equip = mappedEquips.find(e => String(e.id) === String(id));
          if (!equip) {
            delete updated[id];
          } else if (updated[id] > equip.availableStock) {
            updated[id] = equip.availableStock;
          }
        });
        return updated;
      });
    } catch (err) {
      console.error('DEBUG: Error fetchEquipmentsByDate:', err);
    } finally {
      setLoadingEquips(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      fetchEquipmentsByDate();
    }
  }, [currentStep, checkIn, checkOut]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const axiosPublic = (await import('axios')).default.create({
        baseURL: import.meta.env.VITE_API_URL || 'https://backend-camping-production.up.railway.app'
      });

      // 1. Fetch Camps menggunakan endpoint publik
      let campsData = [];
      const publicEndpoints = ['/api/booking/camps', '/api/camps', '/camps'];
      
      for (const endpoint of publicEndpoints) {
        try {
          const res = await axiosPublic.get(endpoint);
          let extracted = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          if (extracted.length > 0) {
            campsData = extracted;
            break;
          }
        } catch (err) {}
      }

      const mappedCamps = campsData.map(item => {
        // Robust UUID detection
        const foundUuid = Object.values(item).find(val => 
          typeof val === 'string' && val.length > 30 && val.includes('-')
        );

        const rawCapacity = item.dailyCapacity || item.capacity || 0;
        const rawPrice = item.nightlyPrice || item.price || 0;
        
        const capacity = Math.round(Number(rawCapacity));
        const price = Math.round(Number(rawPrice));
        const finalImageUrl = item.image_url || item.photo_url_full || item.photo_url || item.image;
        
        return {
          ...item,
          id: foundUuid || item.id || item._id || item.uuid,
          name: item.name || 'Tanpa Nama',
          location: item.location || 'Lokasi tidak diketahui',
          nightlyPrice: price,
          dailyCapacity: capacity,
          image_url: finalImageUrl,
          description: item.description || ''
        };
      });

      setCamps(mappedCamps);
      
      const params = new URLSearchParams(window.location.search);
      const urlCampId = params.get('campId');
      
      if (urlCampId) {
        const target = mappedCamps.find(c => String(c.id) === String(urlCampId));
        if (target) setSelectedCamp(target);
        else if (mappedCamps.length > 0) setSelectedCamp(mappedCamps[0]);
      } else if (mappedCamps.length > 0) {
        setSelectedCamp(mappedCamps[0]);
      }
    } catch (err) {
      console.error('DEBUG: Error total fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const PRICE_PER_PERSON = selectedCamp?.nightlyPrice || 10000;

  const filteredCamps = camps.filter(camp => 
    camp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (camp.location && camp.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCheckInSelection = (date) => {
    if (!date) return;
    const nextCheckIn = format(date, 'yyyy-MM-dd');
    setCheckIn(nextCheckIn);

    // If checkout is empty or no longer valid, auto-set to +1 day
    if (!checkOut) {
      setCheckOut(addDaysYmd(nextCheckIn, 1));
    } else {
      const inDate = date;
      const outDate = toLocalDateOnly(checkOut);
      if (outDate <= inDate) {
        setCheckOut(addDaysYmd(nextCheckIn, 1));
      }
    }
  };

  const handleCheckOutSelection = (date) => {
    if (!date) return;
    setCheckOut(format(date, 'yyyy-MM-dd'));
  };

  const handleVisitorsChange = (e) => {
    const value = e.target.value;
    // Izinkan input kosong, tapi jika ada nilai, pastikan > 0
    if (value === '') {
      setVisitors(''); // Set ke string kosong agar input bisa dihapus
    } else {
      const numValue = parseInt(value);
      if (numValue > 0) {
        setVisitors(numValue);
      }
    }
  };

  const handleAddAddon = (id) => {
    const item = equipments.find(e => String(e.id) === String(id));
    if (!item) return;

    setSelectedAddons(prev => {
      const currentQty = prev[id] || 0;
      if (currentQty >= item.availableStock) {
        return prev;
      }
      return {
        ...prev,
        [id]: currentQty + 1
      };
    });
  };

  const handleRemoveAddon = (id) => {
    setSelectedAddons(prev => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const nextStep = () => {
    // Validasi Step 1: Lokasi
    if (currentStep === 1 && !selectedCamp) {
      alert("Silakan pilih lokasi camping terlebih dahulu.");
      return;
    }

    // Validasi Step 2: Jadwal
    if (currentStep === 2) {
      const token = localStorage.getItem('token');
      if (!token) {
        const confirmLogin = window.confirm("Anda harus login terlebih dahulu untuk melanjutkan pemesanan. Ingin login sekarang?");
        if (confirmLogin) navigate('/login');
        return;
      }
      if (!checkIn || !checkOut || visitors < 1) {
        alert("Harap lengkapi tanggal dan jumlah pengunjung.");
        return;
      }
    }

    // Validasi Step 3: Alat (Opsional, tapi pastikan loading selesai)
    if (currentStep === 3 && loadingEquips) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nights = checkIn && checkOut ? Math.max(1, diffNights(checkIn, checkOut)) : 0;
  const datesValid = nights > 0;

  // Kalkulasi Harga Camp: (Jumlah Malam * 10.000 * Jumlah Orang)
  const ticketPrice = nights * 10000 * visitors;
  
  // Kalkulasi Harga Alat: (Harga Per Alat * Jumlah Alat * Malam Sewa)
  const addonsTotal = Object.entries(selectedAddons).reduce((total, [id, qty]) => {
    const item = equipments.find(e => String(e.id) === String(id));
    return total + (item ? item.price * qty * nights : 0);
  }, 0);

  const grandTotal = ticketPrice + addonsTotal;

  // Fungsi Gabungan: Buat Booking + Upload Bukti (Agar tidak muncul di history sebelum bayar)
  const handleFinalSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan booking.");
      navigate('/login');
      return;
    }

    if (!selectedCamp) {
      alert("Pilih lokasi camp terlebih dahulu.");
      return;
    }

    if (!paymentProof) {
      alert("Harap unggah bukti pembayaran terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Buat Booking Terlebih Dahulu
      const bookingEquipments = Object.entries(selectedAddons)
        .map(([id, quantity]) => {
          const item = equipments.find(e => String(e.id) === String(id));
          if (!item) return null;
          return {
            equipmentId: item.id,
            quantity: quantity,
            nights: nights
          };
        })
        .filter(Boolean);

      const bookingPayload = {
        campId: selectedCamp.id,
        startDate: checkIn,
        endDate: checkOut,
        peopleCount: visitors,
        equipments: bookingEquipments
      };

      console.log('DEBUG: Creating booking...', bookingPayload);
      const bookingResponse = await api.post('/api/booking', bookingPayload);
      
      // Ambil ID dari berbagai kemungkinan struktur response
      const newBookingId = bookingResponse.data?.data?.id || bookingResponse.data?.id;

      if (!newBookingId) {
        console.error('Full response:', bookingResponse.data);
        throw new Error("Gagal mendapatkan ID booking dari server.");
      }

      // 2. Langsung Upload Bukti Pembayaran ke ID yang baru dibuat
      const formData = new FormData();
      formData.append('payment_proof', paymentProof);

      console.log('DEBUG: Uploading proof for booking ID:', newBookingId);
      await api.post(`/api/booking/${newBookingId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Pemesanan dan pembayaran berhasil dikirim. Menunggu verifikasi admin.");
      navigate('/dashboard');
    } catch (err) {
      console.error('Final submission failed:', err);
      alert(err.response?.data?.message || err.message || "Terjadi kesalahan saat memproses pemesanan.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Booking Camping
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Amankan spot camping impianmu sekarang hanya dalam beberapa langkah mudah.
            </p>
        </div>

        {/* Stepper */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-12 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                {/* Connector Lines */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#FF7F50] transition-all duration-500 -z-0"
                    style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                ></div>

                {/* Steps */}
                {[
                    { step: 1, label: "Lokasi", icon: MapPin },
                    { step: 2, label: "Jadwal", icon: Calendar },
                    { step: 3, label: "Alat", icon: Tent },
                    { step: 4, label: "Review", icon: Check },
                    { step: 5, label: "Bayar", icon: CreditCard }
                ].map((item) => (
                    <div key={item.step} className="relative z-10 flex flex-col items-center bg-white dark:bg-gray-800 px-2 md:px-4">
                        <div 
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                currentStep >= item.step 
                                ? 'bg-[#FF7F50] border-[#FF7F50] text-white' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400'
                            }`}
                        >
                            <item.icon size={18} />
                        </div>
                        <span className={`mt-2 md:mt-3 text-[10px] md:text-xs font-bold ${currentStep >= item.step ? 'text-[#FF7F50]' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Content Steps */}
        <div className="transition-all duration-500 ease-in-out">
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-[#FF7F50] mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Memuat data...</p>
                </div>
            ) : currentStep === 5 ? (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-2xl border border-gray-50 dark:border-gray-700">
                    <div className="bg-[#FF7F50] p-10 text-white text-center">
                      <h2 className="text-3xl font-black mb-2">Instruksi Pembayaran</h2>
                      <p className="text-white/80 font-medium">Transfer via DANA</p>
                    </div>
                    
                    <div className="p-10 space-y-8">
                      {/* DANA Info Section */}
                      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-[32px] border border-gray-100 dark:border-gray-700">
                        <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center mb-6 overflow-hidden border border-gray-50 dark:border-gray-700">
                          <img 
                            src={DANA_LOGO_URL} 
                            alt="DANA Logo" 
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">Nomor DANA</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight select-all">{DANA_NUMBER}</h3>
                        <p className="text-sm font-bold text-[#FF7F50] uppercase tracking-wider">{DANA_NAME}</p>
                        
                        <div className="mt-6 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <p className="text-[10px] text-gray-400 font-bold text-center italic leading-relaxed">
                            Silakan transfer total tagihan ke nomor di atas.<br/>Simpan bukti transfer untuk diunggah di bawah.
                          </p>
                        </div>
                      </div>

                      {/* Amount Summary */}
                      <div className="text-center space-y-2">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Tagihan</p>
                        <p className="text-4xl font-black text-[#FF7F50]">
                          Rp {grandTotal.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Harap transfer sesuai nominal di atas.</p>
                      </div>

                      {/* Upload Section */}
                      <div className="pt-8 border-t border-gray-100 dark:border-gray-700 space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
                            Upload Bukti Pembayaran
                          </label>
                          <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => setPaymentProof(e.target.files[0])}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`w-full py-10 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center transition-all
                              ${paymentProof ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 group-hover:border-[#FF7F50] bg-gray-50 dark:bg-gray-800/50'}`}>
                              {paymentProof ? (
                                <>
                                  <Check className="text-green-500 mb-2" size={32} />
                                  <p className="text-green-600 font-bold text-sm">{paymentProof.name}</p>
                                  <p className="text-gray-400 text-[10px]">Klik untuk ganti file</p>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="text-gray-300 mb-2 group-hover:text-[#FF7F50] transition-colors" size={32} />
                                  <p className="text-gray-500 dark:text-gray-400 font-medium">Pilih Foto Bukti Transfer</p>
                                  <p className="text-gray-400 text-[10px]">Format JPG/PNG, Maksimal 2MB</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleFinalSubmit}
                          disabled={!paymentProof || isUploading}
                          className="w-full py-6 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-[24px] font-black text-xl hover:bg-[#FF7F50] dark:hover:bg-[#FF7F50] dark:hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Mengirim Bukti...
                            </>
                          ) : (
                            <>Kirim Bukti Pembayaran <ArrowRight size={24} /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            ) : currentStep === 1 ? (
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        {selectedCamp ? (
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="relative h-64 md:h-full overflow-hidden">
                                    <img 
                                        src={selectedCamp.image_url || "https://images.unsplash.com/photo-1517824806704-9040b037703b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} 
                                        alt={selectedCamp.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-8 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedCamp.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                            {selectedCamp.description || "Nikmati sensasi camping di tepi Sungai Opak dengan suasana alam yang asri dan menenangkan. Fasilitas lengkap: toilet bersih, mushola, listrik, dan warung makan."}
                                        </p>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                <MapPin className="text-[#FF7F50] mr-3" size={20} />
                                                <span>{selectedCamp.location}</span>
                                            </div>
                                    
                                            <div className="flex items-center text-[#FF7F50] font-bold text-2xl">
                                                Rp {selectedCamp.nightlyPrice.toLocaleString('id-ID')} <span className="text-gray-400 text-sm font-normal ml-1">/ orang / malam</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={nextStep}
                                        className="w-full py-4 bg-[#FF7F50] hover:bg-[#ff6b3d] text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center"
                                    >
                                        Lanjutkan <ArrowRight size={20} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <Tent size={64} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500">Silakan pilih lokasi camping dari daftar.</p>
                            </div>
                        )}
                    </div>

                    {camps.length > 1 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Lokasi Lainnya</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {camps.map(camp => (
                                    <button
                                        key={camp.id}
                                        onClick={() => {
                                            setSelectedCamp(camp);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border transition-all duration-300 text-left shadow-sm hover:shadow-md ${
                                            selectedCamp?.id === camp.id 
                                            ? 'border-[#FF7F50] ring-2 ring-[#FF7F50] ring-opacity-50' 
                                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="h-32 overflow-hidden">
                                            <img 
                                                src={camp.image_url} 
                                                alt={camp.name} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{camp.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{camp.location}</p>
                                            <p className="text-[#FF7F50] font-bold text-sm">Rp {camp.nightlyPrice.toLocaleString('id-ID')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : currentStep === 2 ? (
                <div className="max-w-2xl mx-auto animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-[#FF7F50]">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tentukan Jadwal</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Atur tanggal camping dan jumlah pengunjung</p>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Tanggal Check-in
                                    </label>
                                    <div className="relative custom-datepicker">
                                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF7F50] z-10 pointer-events-none" size={20} />
                                        <DatePicker
                                            selected={checkIn ? toLocalDateOnly(checkIn) : null}
                                            onChange={handleCheckInSelection}
                                            minDate={new Date()}
                                            dateFormat="dd MMMM yyyy"
                                            placeholderText="Pilih tanggal"
                                            className="w-full pl-12 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF7F50] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        Masuk: <span className="text-gray-600 dark:text-gray-300">{CHECK_IN_TIME}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                        Tanggal Check-out
                                    </label>
                                    <div className="relative custom-datepicker">
                                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF7F50] z-10 pointer-events-none" size={20} />
                                        <DatePicker
                                            selected={checkOut ? toLocalDateOnly(checkOut) : null}
                                            onChange={handleCheckOutSelection}
                                            minDate={checkIn ? addDays(toLocalDateOnly(checkIn), 1) : addDays(new Date(), 1)}
                                            dateFormat="dd MMMM yyyy"
                                            placeholderText="Pilih tanggal"
                                            className="w-full pl-12 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF7F50] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        Keluar: <span className="text-gray-600 dark:text-gray-300">{CHECK_OUT_TIME}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    Jumlah Pengunjung
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full pl-12 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF7F50] focus:border-transparent outline-none transition-all"
                                        onChange={handleVisitorsChange}
                                        value={visitors}
                                    />
                                </div>
                            </div>

                            {datesValid && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total Tiket</span>
                                        <span className="text-2xl font-bold text-[#FF7F50]">
                                            Rp {ticketPrice.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{visitors} orang × {nights} malam</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={prevStep}
                                    className="flex-1 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Kembali
                                </button>
                                <button 
                                    onClick={nextStep}
                                    disabled={!datesValid || visitors < 1}
                                    className={`flex-[2] py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center ${
                                        datesValid && visitors > 0 
                                        ? 'bg-[#FF7F50] hover:bg-[#ff6b3d] shadow-lg shadow-orange-500/30' 
                                        : 'bg-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    Lanjut ke Peralatan <ArrowRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : currentStep === 3 ? (
                <div className="max-w-5xl mx-auto animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sewa Peralatan Camping</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Tidak punya alat? Sewa di sini agar campingmu lebih praktis. Harga sewa dihitung per malam (durasi: <span className="font-semibold">{nights} malam</span>).
                        </p>
                        
                        {/* Note about H-3 Booking */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-full text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm">
                            <Info size={14} />
                            Booking peralatan paling lambat H-3 (Tidak bisa sewa di tempat)
                        </div>
                    </div>

                    {loadingEquips ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="animate-spin text-[#FF7F50] mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Mengecek ketersediaan stok alat...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {equipments.length > 0 ? equipments.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-all hover:shadow-md">
                                    <div className="h-48 overflow-hidden relative group">
                                        <img 
                                            src={item.image_url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=2070"} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg">
                                            Stok: {item.availableStock}
                                        </div>
                                        {selectedAddons[item.id] > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#FF7F50] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in duration-300">
                                                {selectedAddons[item.id]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                                            <p className="text-[#FF7F50] font-semibold text-sm">
                                                Rp {item.price.toLocaleString('id-ID')} <span className="text-gray-400 text-[10px] font-normal">/ unit / malam</span>
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
                                            <button 
                                                onClick={() => handleRemoveAddon(item.id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    !selectedAddons[item.id] 
                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-100'
                                                }`}
                                                disabled={!selectedAddons[item.id]}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-bold text-gray-900 dark:text-white w-8 text-center">
                                                {selectedAddons[item.id] || 0}
                                            </span>
                                            <button 
                                                onClick={() => handleAddAddon(item.id)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    (selectedAddons[item.id] || 0) >= item.availableStock
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[#FF7F50] text-white shadow-lg shadow-orange-500/30 hover:bg-[#ff6b3d]'
                                                }`}
                                                disabled={(selectedAddons[item.id] || 0) >= item.availableStock}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {(selectedAddons[item.id] || 0) >= item.availableStock && (
                                            <p className="text-[9px] text-red-500 mt-1 text-center font-medium">Stok Maksimal Tercapai</p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-10 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">Peralatan tidak tersedia pada tanggal yang dipilih.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 sticky bottom-4 z-20">
                        <div className="hidden md:block">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tambahan</p>
                            <p className="text-2xl font-bold text-[#FF7F50]">Rp {addonsTotal.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button 
                                onClick={prevStep}
                                className="flex-1 md:flex-none px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Kembali
                            </button>
                            <button 
                                onClick={nextStep}
                                className="flex-1 md:flex-none px-8 py-4 bg-[#FF7F50] hover:bg-[#ff6b3d] text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center"
                            >
                                Lanjut ke Konfirmasi <ArrowRight size={20} className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : currentStep === 4 ? (
                <div className="max-w-2xl mx-auto animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="bg-[#FF7F50] p-6 text-white text-center">
                            <h2 className="text-2xl font-bold">Konfirmasi Booking</h2>
                            <p className="opacity-90">Periksa kembali detail pesananmu</p>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCamp?.name}</h3>
                                        <p className="text-xs text-gray-400 flex items-center mt-1">
                                            <MapPin size={12} className="mr-1" />
                                            {selectedCamp?.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Check-in</p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {new Date(checkIn).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} <span className="text-gray-400 font-semibold">({CHECK_IN_TIME})</span>
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Check-out</p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {new Date(checkOut).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} <span className="text-gray-400 font-semibold">({CHECK_OUT_TIME})</span>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Durasi: <span className="font-semibold">{nights} malam</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tiket Masuk</p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{visitors} Orang</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rp {ticketPrice.toLocaleString('id-ID')}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{visitors} orang × {nights} malam</p>
                                    </div>
                                </div>

                                {/* Selected Addons Summary */}
                                {Object.keys(selectedAddons).length > 0 && (
                                    <div className="pb-6 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Add-ons (Sewa Alat)</p>
                                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                            {Object.entries(selectedAddons).map(([id, qty]) => {
                                                const item = equipments.find(e => String(e.id) === String(id));
                                                if (!item) return null;
                                                return (
                                                    <div key={id} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {item.name} <span className="text-gray-400">x{qty}</span> <span className="text-gray-400">× {nights} malam</span>
                                                        </span>
                                                        <span className="font-semibold text-gray-900 dark:text-white">Rp {(item.price * qty * nights).toLocaleString('id-ID')}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                                <span className="font-medium text-gray-600 dark:text-gray-400">Subtotal Alat</span>
                                                <span className="font-bold text-[#FF7F50]">Rp {addonsTotal.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">Total Pembayaran</span>
                                    <span className="text-2xl font-extrabold text-[#FF7F50]">
                                        Rp {grandTotal.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-4">
                                    <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Pastikan data sudah benar. Tiket ini hanya untuk akses masuk area camping (Ground Fee). Perlengkapan camping tidak termasuk kecuali yang Anda sewa di halaman sebelumnya.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button 
                                    onClick={prevStep}
                                    className="flex-1 py-4 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Kembali
                                </button>
                                <button 
                                    onClick={() => setCurrentStep(5)}
                                    className="flex-1 py-4 bg-[#FF7F50] hover:bg-[#ff6b3d] text-white rounded-xl font-bold text-center shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    Lanjut ke Pembayaran <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

        </div>
      </div>
    </div>
  );
};

export default BookCamp;
