import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const AdminLayout = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Header 
        toggleSidebar={isMobile ? handleDrawerToggle : undefined} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {isMobile ? (
        <Sidebar
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          isAdmin={true}
          darkMode={darkMode}
        />
      ) : (
        <Sidebar 
          variant="permanent" 
          open={true} 
          isAdmin={true}
          darkMode={darkMode}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isMobile ? 0 : 240}px)` },
          ml: { sm: isMobile ? 0 : `240px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* 공간 확보를 위한 도구 모음 */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;