import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Shield, 
  Calendar,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = [
        '/api/admin/users',
        '/admin/users'
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(`${endpoint}?t=${new Date().getTime()}`);
          if (res.status === 200) {
            response = res;
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error('Gagal memuat data user');
      }

      const data = response.data?.data || response.data || [];
      const mappedUsers = (Array.isArray(data) ? data : []).map(user => {
        // Gunakan URL lengkap dari backend (Supabase)
        const profilePic = user.photo_url_full || user.profile_picture_url || user.profile_picture || user.photo || user.image;

        return {
          ...user,
          name: user.full_name || user.username || user.name || 'Tanpa Nama',
          phone: user.phone_number || user.phone || '-',
          profile_picture: profilePic
        };
      });
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (id) => {
    try {
      const endpoints = [
        `/api/admin/users/${id}`,
        `/admin/users/${id}`
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
        const userData = response.data?.data || response.data;
        // Gunakan URL lengkap dari backend (Supabase)
        const profilePic = userData.photo_url_full || userData.profile_picture_url || userData.profile_picture || userData.photo || userData.image;

        setSelectedUser({
          ...userData,
          name: userData.full_name || userData.username || userData.name || 'Tanpa Nama',
          phone: userData.phone_number || userData.phone || '-',
          profile_picture: profilePic
        });
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
    // Fetch fresh detail in case there's more info
    fetchUserDetail(user.uuid || user.id);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Manajemen User
          </h1>
          <p className="text-gray-500 mt-1">Kelola dan lihat data pengguna sistem</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau email user..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500 animate-pulse">Memuat data user...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium text-center">{error}</p>
              <button 
                onClick={fetchUsers}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Telepon</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uuid || user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name || 'Tanpa Nama'}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-wider">ID: {user.uuid?.substring(0, 8) || user.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{user.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleOpenDetail(user)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl w-full max-w-[440px] shadow-2xl shadow-indigo-200/50 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
            {/* Minimal Header */}
            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedUser.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {selectedUser.role || 'User'}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      ID: {selectedUser.uuid?.substring(0, 8) || selectedUser.id}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {/* Email Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email Address</p>
                    <p className="text-sm text-gray-700 font-semibold truncate">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Phone Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone Number</p>
                    <p className="text-sm text-gray-700 font-semibold">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Address Section */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Address</p>
                    <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                      {selectedUser.address || 'Address not updated yet'}
                    </p>
                  </div>
                </div>

                {/* Date Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50 group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Joined Date</p>
                    <p className="text-sm text-gray-700 font-semibold">
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCloseModal}
                className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
