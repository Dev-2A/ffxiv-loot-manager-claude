import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// 레이아웃
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// 사용자 페이지
import Home from './pages/user/Home';
import BisManager from './pages/user/BisManager';
import RaidProgress from './pages/user/RaidProgress';
import Distribution from './pages/user/Distribution';

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

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 사용자 페이지 */}
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/bis" element={<UserLayout><BisManager /></UserLayout>} />
          <Route path="/raid" element={<UserLayout><RaidProgress /></UserLayout>} />
          <Route path="/distribution" element={<UserLayout><Distribution /></UserLayout>} />
          
          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/players" element={<AdminLayout><PlayerManagement /></AdminLayout>} />
          <Route path="/admin/players/new" element={<AdminLayout><PlayerCreate /></AdminLayout>} />
          <Route path="/admin/players/:id" element={<AdminLayout><PlayerDetail /></AdminLayout>} />
          <Route path="/admin/items" element={<AdminLayout><ItemManagement /></AdminLayout>} />
          <Route path="/admin/items/new" element={<AdminLayout><ItemCreate /></AdminLayout>} />
          <Route path="/admin/items/:id" element={<AdminLayout><ItemDetail /></AdminLayout>} />
          <Route path="/admin/seasons" element={<AdminLayout><SeasonManagement /></AdminLayout>} />
          <Route path="/admin/seasons/new" element={<AdminLayout><SeasonCreate /></AdminLayout>} />
          <Route path="/admin/seasons/:id" element={<AdminLayout><SeasonDetail /></AdminLayout>} />
          
          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;