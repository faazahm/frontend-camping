import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tent, 
  CalendarCheck, 
  Package, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronDown,
  User as UserIcon,
  MessageSquare,
  BarChart3
} from 'lucide-react';

const AdminLayout = () => {
  console.log('AdminLayout rendering...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  let user = {};
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: CalendarCheck, label: 'Manajemen Booking' },
    { path: '/admin/camps', icon: Tent, label: 'Manajemen Camp' },
    { path: '/admin/equipments', icon: Package, label: 'Manajemen Peralatan' },
    { path: '/admin/users', icon: Users, label: 'Manajemen User' },
    { path: '/admin/questions', icon: MessageSquare, label: 'Pertanyaan & Ulasan' },
        { path: '/admin/reports', icon: BarChart3, label: 'Laporan Pemasukan' },
    // { path: '/admin/reports', icon: BarChart3, label: 'Laporan' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <Link to="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="bg-orange-500 p-1.5 rounded-lg transition-transform group-hover:scale-110">
                <Tent className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Admin Panel<span className="text-orange-500">.</span>
              </span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Main Menu
            </p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                <item.icon size={20} className={`${location.pathname === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="ml-3 font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200 group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="ml-3 font-medium text-sm">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden ${isSidebarOpen ? 'hidden' : ''}`}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-8 w-[1px] bg-gray-200 dark:border-gray-700 mx-1"></div>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800/50">
                  {user.full_name?.charAt(0) || <UserIcon size={18} />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1">
                    {user.full_name || 'Admin'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                    Administrator
                  </p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-[60] animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 mb-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Akun Saya</p>
                  </div>
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <UserIcon size={16} className="mr-3 text-gray-400" />
                    Profil
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} className="mr-3" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
