import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminLayout from './components/layouts/AdminLayout';
import PublicLayout from './components/layouts/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Location from './pages/public/Location';
import BookCamp from './pages/public/BookCamp';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import CampingList from './pages/user/CampingList';
import MyBookings from './pages/user/MyBookings';
import Profile from './pages/user/Profile';
import ReviewForm from './pages/user/ReviewForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCamps from './pages/admin/AdminCamps';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEquipments from './pages/admin/AdminEquipments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminReports from './pages/admin/AdminReports';
import ScrollToHashElement from './utils/ScrollToHashElement';
import ScrollToTop from './utils/ScrollToTop';

const getUserRole = (user) => {
  if (!user) return '';
  
  // Ambil email untuk pengecekan tambahan
  const email = String(user.email || '').toLowerCase().trim();
  
  // Prioritas 1: Cek field role langsung (string atau objek)
  let role = '';
  if (user.role) {
    if (typeof user.role === 'string') {
      role = user.role.toLowerCase().trim();
    } else if (typeof user.role === 'object') {
      const roleName = user.role.name || user.role.role_name || user.role.slug || '';
      role = String(roleName).toLowerCase().trim();
    }
  }
  
  // Prioritas 2: Fallback ke email admin@gmail.com (karena kita sudah yakin di DB ini admin)
  if (!role && email === 'admin@gmail.com') {
    return 'admin';
  }
  
  return role;
};

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = getUserRole(user);
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScrollToHashElement />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/location" element={<Location />} />
          <Route path="/book-camp" element={<BookCamp />} />
        </Route>

        {/* User Dashboard Routes - Separate from PublicLayout to avoid conflicts */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <PublicLayout>
                <CampingList />
              </PublicLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/review/:bookingId"
          element={
            <RequireAuth>
              <PublicLayout>
                <ReviewForm />
              </PublicLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <PublicLayout>
                <Profile />
              </PublicLayout>
            </RequireAuth>
          }
        />
        {/* Backward-compatible routes */}
        <Route path="/camping-list" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <PublicLayout>
                <MyBookings />
              </PublicLayout>
            </RequireAuth>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="camps" element={<AdminCamps />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="equipments" element={<AdminEquipments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Fallback for 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
