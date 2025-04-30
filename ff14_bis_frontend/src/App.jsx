import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 테마 토글 함수
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 테마 생성
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#5b7ce3',  // FF14 UI 파랑색
            light: darkMode ? '#8aa8ff' : '#8aa8ff',
            dark: darkMode ? '#3254b0' : '#3254b0',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#cb3c56',  // FF14 포인트 적색
            light: darkMode ? '#ff6f85' : '#ff6f85',
            dark: darkMode ? '#95002b' : '#95002b',
            contrastText: '#ffffff',
          },
          tank: {
            main: '#3d6ec9',  // 탱커 파랑색
            dark: '#26499a',
            light: '#639eff',
            contrastText: '#ffffff',
          },
          healer: {
            main: '#3e9a54',  // 힐러 초록색
            dark: '#276b39',
            light: '#64cb7b',
            contrastText: '#ffffff',
          },
          dps: {
            main: '#b93c3e',  // 딜러 빨강색
            dark: '#86191c',
            light: '#ee6a6d',
            contrastText: '#ffffff',
          },
          background: {
            default: darkMode ? '#121212' : '#f8f9fd',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#e0e0e0' : '#333644',
            secondary: darkMode ? '#aaaaaa' : '#6d7187',
          },
          divider: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        typography: {
          fontFamily: [
            'Noto Sans KR',
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 500,
          },
          h6: {
            fontWeight: 500,
          },
          button: {
            fontWeight: 500,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 10,
        },
        shadows: [
          'none',
          '0px 2px 4px rgba(0, 0, 0, 0.05)',
          '0px 4px 6px rgba(0, 0, 0, 0.07)',
          '0px 6px 12px rgba(0, 0, 0, 0.08)',
          '0px 8px 16px rgba(0, 0, 0, 0.09)',
          '0px 10px 20px rgba(0, 0, 0, 0.1)',
          ...Array(19).fill('none'),
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 16px',
                fontWeight: 500,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                },
              },
              containedPrimary: {
                background: 'linear-gradient(45deg, #5b7ce3 30%, #6f8ff5 90%)',
              },
              containedSecondary: {
                background: 'linear-gradient(45deg, #cb3c56 30%, #e45a72 90%)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)',
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)',
                backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                backgroundColor: darkMode ? 'rgba(40, 42, 55, 0.7)' : 'rgba(240, 242, 255, 0.7)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#5b7ce3',
                  fontWeight: 600,
                },
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRight: 'none',
                boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.05)',
                background: darkMode 
                  ? 'linear-gradient(180deg, #1e1e1e 0%, #121212 100%)' 
                  : 'linear-gradient(180deg, #f8f9fd 0%, #ffffff 100%)',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 사용자 페이지 */}
          <Route path="/" element={<UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Home /></UserLayout>} />
          <Route path="/bis" element={<UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><BisManager /></UserLayout>} />
          <Route path="/raid" element={<UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><RaidProgress /></UserLayout>} />
          <Route path="/distribution" element={<UserLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Distribution /></UserLayout>} />

          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Dashboard /></AdminLayout>} />
          <Route path="/admin/players" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><PlayerManagement /></AdminLayout>} />
          <Route path="/admin/players/new" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><PlayerCreate /></AdminLayout>} />
          <Route path="/admin/players/:id" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><PlayerDetail /></AdminLayout>} />
          <Route path="/admin/items" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ItemManagement /></AdminLayout>} />
          <Route path="/admin/items/new" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ItemCreate /></AdminLayout>} />
          <Route path="/admin/items/:id" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ItemDetail /></AdminLayout>} />
          <Route path="/admin/seasons" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><SeasonManagement /></AdminLayout>} />
          <Route path="/admin/seasons/new" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><SeasonCreate /></AdminLayout>} />
          <Route path="/admin/seasons/:id" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}><SeasonDetail /></AdminLayout>} />
        
         {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;