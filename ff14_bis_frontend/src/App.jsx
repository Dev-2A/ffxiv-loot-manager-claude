import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createFF14Theme from './theme';

// 인증 관련
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';

// 레이아웃
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// 사용자 페이지
import Home from './pages/user/Home';
import BisManager from './pages/user/BisManager';
import RaidProgress from './pages/user/RaidProgress';
import Distribution from './pages/user/Distribution';
import Schedule from './pages/user/Schedule';

// 관리자 페이지
import Dashboard from './pages/admin/Dashboard';
import PlayerManagement from './pages/admin/PlayerManagement';
import PlayerDetail from './pages/admin/PlayerDetail';
import PlayerCreate from './pages/admin/PlayerCreate';
import ItemManagement from './pages/admin/ItemManagement';
import ItemDetail from './pages/admin/ItemDetail';
import ItemCreate from './pages/admin/ItemCreate';
import SeasonManagement from './pages/admin/SeasonManagement';
import SeasonDetail from './pages/admin/SeasonDetail';
import SeasonCreate from './pages/admin/SeasonCreate';

// 공통 페이지
import NotFound from './pages/NotFound';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 테마 토글 함수
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 테마 생성
  const theme = createFF14Theme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* 인증 페이지 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 사용자 페이지 */}
            <Route path="/" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Home />
                </UserLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Profile />
                </UserLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/bis" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <BisManager />
                </UserLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/raid" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <RaidProgress />
                </UserLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/distribution" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Distribution />
                </UserLayout>
              </ProtectedRoute>
            } />

            <Route path="/schedule" element={
              <ProtectedRoute>
                <UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Schedule />
                </UserLayout>
              </ProtectedRoute>
            } />

            {/* 관리자 페이지 */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/players" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <PlayerManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/players/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <PlayerCreate />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/players/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <PlayerDetail />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/items" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <ItemManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/items/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <ItemCreate />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/items/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <ItemDetail />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/seasons" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <SeasonManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/seasons/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <SeasonCreate />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/seasons/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <SeasonDetail />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 페이지 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;