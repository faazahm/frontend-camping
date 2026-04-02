import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Tent, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Package,
  Activity,
  Clock,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIdentity = async () => {
      try {
        const res = await api.get('/api/profile');
        const user = res.data?.data || res.data;
        const serverRole = String(user.role || '').toLowerCase().trim();
        
        console.log('IDENTITAS SAYA DI SERVER:', user);
        if (serverRole !== 'admin') {
          alert(`PERINGATAN: Di Server, Role Anda adalah "${user.role}", bukan "admin". Itulah sebabnya akses ditolak.`);
        } else {
          console.log('Role Terverifikasi: ADMIN');
        }
      } catch (err) {
        console.error('Gagal cek identitas');
      }
    };
    checkIdentity();
    fetchStats();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      
      // Ambil data bookings dan users untuk kalkulasi manual jika endpoint stats belum optimal
      const [bookingsRes, usersRes] = await Promise.all([
        api.get('/api/admin/bookings'),
        api.get('/api/admin/users')
      ]);

      const allBookings = bookingsRes.data?.data || bookingsRes.data || [];
      const allUsers = usersRes.data?.data || usersRes.data || [];

      // Kalkulasi Pendapatan (Hanya yang statusnya PAID, CHECK_IN, atau CHECK_OUT)
      const revenueStatuses = ['PAID', 'CHECK_IN', 'CHECK_OUT', 'CHECKOUT'];
      const totalRevenue = allBookings
        .filter(b => revenueStatuses.includes(b.status))
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

      setStats({
        total_bookings: allBookings.length,
        total_users: allUsers.length,
        total_revenue: totalRevenue,
        growth: 0 // Bisa dikembangkan nanti
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      console.log('Fetching recent bookings for dashboard...');
      const response = await api.get('/api/admin/bookings', { params: { limit: 5 } });
      let data = response.data?.data || response.data || [];
      
      // Sort manual untuk memastikan yang terbaru di atas
      if (Array.isArray(data)) {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
      }
      
      // Map data untuk memastikan email dan nama muncul (konsisten dengan AdminBookings)
      const mappedData = data.map(item => ({
        ...item,
        displayEmail: item.user?.email || item.userEmail || item.email || `User #${item.user_id || '?'}`,
        displayName: item.user?.full_name || item.userName || item.full_name || 'User'
      }));
      
      setRecentBookings(mappedData);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Sesuai instruksi: PUT ke /api/admin/bookings/{id}/status dengan UUID
      const response = await api.put(`/api/admin/bookings/${id}/status`, { 
        status: newStatus 
      });
      
      if (response.status === 200 || response.status === 204) {
        fetchRecentBookings();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMsg = error.response?.data?.message || 'Gagal memperbarui status';
      alert(errorMsg);
    }
  };

  const formatPrice = (price) => {
    try {
      const num = Number(price) || 0;
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    } catch (e) {
      return 'Rp 0';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Booking', 
      value: stats?.total_bookings || 0, 
      icon: CalendarCheck, 
      color: 'bg-blue-500'
    },
    { 
      label: 'Total User', 
      value: stats?.total_users || 0, 
      icon: Users, 
      color: 'bg-purple-500'
    },
    { 
      label: 'Pendapatan', 
      value: formatPrice(stats?.total_revenue || 0), 
      icon: DollarSign, 
      color: 'bg-orange-500'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Statistik performa aplikasi hari ini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} p-3 rounded-2xl text-white shadow-lg shadow-opacity-20`}>
                <card.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform">
              <card.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-orange-500" />
              Booking Terbaru
            </h3>
            <button 
              onClick={() => navigate('/admin/bookings')}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentBookings.length > 0 ? (
                  recentBookings.filter(b => b).map((booking, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 font-bold border border-orange-200 dark:border-orange-800/50 flex-shrink-0">
                            <Users size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate">
                              {booking.displayEmail}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                              {booking.displayName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(booking.total_price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">Belum ada booking terbaru</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
