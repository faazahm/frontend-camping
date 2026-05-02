import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, Sun, Moon, Monitor, Tent, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import api from '../../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authHover, setAuthHover] = useState(null); // 'register' | 'login' | null
  const themeDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  });

  const isLoggedIn = !!localStorage.getItem('token');
  const isHomePage = location.pathname === '/';

  const getImageUrl = (path) => {
    if (!path) return null;
    // Sesuai instruksi baru: Gunakan URL lengkap langsung dari backend (Supabase)
    return path;
  };

  // Handle Scroll for Transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={20} />;
    if (theme === 'light') return <Sun size={20} />;
    return <Monitor size={20} />;
  };

  // Determine Navbar Background and Text Color
  const navbarClasses = isHomePage && !scrolled
    ? 'bg-transparent border-transparent py-6'
    : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm py-3';
    
  const textClasses = isHomePage && !scrolled
    ? 'text-white/90 hover:text-white hover:scale-105'
    : 'text-gray-600 hover:text-[#FF7F50] dark:text-gray-300 dark:hover:text-[#FF7F50]';

  const brandClasses = isHomePage && !scrolled
    ? 'text-white'
    : 'text-gray-900 dark:text-white';
    
  const iconClasses = isHomePage && !scrolled
    ? 'text-white'
    : 'text-[#FF7F50] dark:text-[#FF7F50]'; // Use brand color for icon when scrolled
  
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser({});
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Juga listen custom event jika navigasi dalam satu tab
    window.addEventListener('userUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Ambil token sebelum dihapus
      const token = localStorage.getItem('token');
      
      if (token) {
        // 2. Panggil API logout (mencoba endpoint /api/auth/logout yang lebih umum)
        await api.post('/api/auth/logout').catch(() => {
          // Fallback jika tanpa /api gagal
          return api.post('/auth/logout');
        });
        console.log('Logout berhasil di sisi server');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 3. Apapun yang terjadi, hapus data di sisi client
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser({});
      setIsOpen(false);
      setIsProfileOpen(false);
      window.dispatchEvent(new Event('userUpdated'));
      navigate('/');
    }
  };

  const getRole = (userData) => {
    const email = String(userData?.email || '').toLowerCase().trim();
    if (email === 'admin@gmail.com') {
      console.log('Navbar: Admin detected by email');
      return 'admin';
    }
    const rawRole = userData?.role;
    if (!rawRole) return '';
    if (typeof rawRole === 'string') return rawRole.toLowerCase().trim();
    if (typeof rawRole === 'object') return (rawRole.name || rawRole.role_name || String(rawRole)).toLowerCase().trim();
    return '';
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${navbarClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer">
             <Tent className={`${iconClasses} transition-colors`} size={24} strokeWidth={2} />
            <Link to="/" className={`text-xl font-bold tracking-tight ${brandClasses}`}>
              Potrobayan<span className={`${isHomePage && !scrolled ? 'text-orange-200' : 'text-[#FF7F50]'}`}>.</span>
            </Link>
          </div>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              ...(isLoggedIn 
                ? [{ 
                    to: getRole(user) === 'admin' ? '/admin/dashboard' : '/dashboard', 
                    label: getRole(user) === 'admin' ? 'Dashboard Admin' : 'Dashboard' 
                  }] 
                : []
              ),
              { to: '/book-camp', label: 'Book Camp' },
              { to: '/about', label: 'About Us' },
              { to: '/location', label: 'Location' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold tracking-wide transition-all duration-300 ${textClasses} ${location.pathname === link.to ? 'text-[#FF7F50] dark:text-[#FF7F50]' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Auth/Profile & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Profile / Auth Buttons (Desktop & Mobile) */}
            <div className="flex items-center">
              {isLoggedIn ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden border-2 border-orange-500 relative">
                      {user?.profile_picture ? (
                        <>
                          <img 
                            src={getImageUrl(user.profile_picture)} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement.querySelector('.navbar-fallback-icon');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="navbar-fallback-icon hidden w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                        </>
                      ) : (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        {getRole(user) === 'admin' ? (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-orange-600 font-bold hover:bg-orange-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3" />
                            Dashboard Admin
                          </Link>
                        ) : (
                          <Link
                            to="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                            Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Edit Profil
                        </Link>
                      </div>

                      <div className="py-1 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  onMouseEnter={() => setAuthHover('login')}
                  onMouseLeave={() => setAuthHover(null)}
                  className={`px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-xs font-black rounded-full transition-all duration-300 flex items-center uppercase tracking-widest active:scale-95 ${
                    isHomePage && !scrolled
                      ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30'
                      : 'bg-[#FF7F50] text-white hover:bg-[#ff6b3d] shadow-lg shadow-orange-500/20'
                  }`}
                >
                  <LogIn className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 transition-transform duration-300 ${authHover === 'login' ? 'translate-x-1' : ''}`} strokeWidth={3} />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`focus:outline-none p-2 rounded-xl transition-colors ${
                  isHomePage && !scrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isLoggedIn && (
              <Link
                to={getRole(user) === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                {getRole(user) === 'admin' ? 'Dashboard Admin' : 'Dashboard'}
              </Link>
            )}
            <Link
              to="/book-camp"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Book Camp
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/location"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Location
            </Link>
            
            {/* Mobile Actions */}
            {!isLoggedIn ? (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-4 px-3 space-y-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FF7F50] text-white rounded-[18px] font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} strokeWidth={3} />
                  Masuk Sekarang
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3.5 border-2 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-[18px] font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Daftar Akun
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-4 px-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-[18px] bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                >
                  <LogOut size={18} strokeWidth={3} />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
