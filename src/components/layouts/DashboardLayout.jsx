import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tent, CalendarCheck, LogOut, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-green-600">Camping App</h1>
          <button onClick={toggleSidebar} className="md:hidden">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center p-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </Link>
          <Link
            to="/book-camp"
            className="flex items-center p-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <Tent size={20} className="mr-3" />
            Daftar Camping
          </Link>
          <Link
            to="/my-bookings"
            className="flex items-center p-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
          >
            <CalendarCheck size={20} className="mr-3" />
            Booking Saya
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button onClick={toggleSidebar} className="text-gray-700">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800">Menu</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
