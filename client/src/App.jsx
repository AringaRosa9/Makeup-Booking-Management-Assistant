import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import BottomNav from './components/BottomNav';
import NoticeModal from './components/NoticeModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Prices from './pages/Prices';
import Booking from './pages/Booking';
import Income from './pages/Income';
import Profile from './pages/Profile';

function ProtectedLayout() {
  const { user, loading, isAdmin } = useAuth();
  const [noticeConfirmed, setNoticeConfirmed] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!noticeConfirmed) {
    return <NoticeModal onConfirm={() => setNoticeConfirmed(true)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Routes>
        <Route path="/prices" element={<Prices />} />
        <Route path="/booking" element={<Booking />} />
        {isAdmin && <Route path="/income" element={<Income />} />}
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/prices" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/prices" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/prices" replace /> : <Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
