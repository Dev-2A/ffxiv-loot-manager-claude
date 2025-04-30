import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LayersIcon from '@mui/icons-material/Layers';

const Sidebar = ({ open, onClose, variant = 'permanent', isAdmin = false, darkMode = false }) => {
  const location = useLocation();
  const theme = useTheme();
  const drawerWidth = 240;

  const userMenu = [
    { text: '홈', icon: <HomeIcon />, path: '/' },
    { text: '비스 관리', icon: <InventoryIcon />, path: '/bis' },
    { text: '레이드 진행', icon: <SportsEsportsIcon />, path: '/raid' },
    { text: '아이템 분배', icon: <PeopleIcon />, path: '/distribution' },
  ];

  const adminMenu = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/admin' },
    { text: '플레이어 관리', icon: <PeopleIcon />, path: '/admin/players' },
    { text: '아이템 관리', icon: <InventoryIcon />, path: '/admin/items' },
    { text: '시즌 관리', icon: <CalendarMonthIcon />, path: '/admin/seasons' },
    { text: '설정', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: isAdmin ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box 
          component="img"
          src={darkMode ? "/images/ff14_logo_dark.png" : "/images/ff14_logo.png"}
          alt="FF14 로고"
          sx={{ 
            width: 90, 
            height: 'auto',
            mb: 2,
            filter: darkMode ? 'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.15))' : 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.15))'
          }}
        />
        <Typography variant="h6" component="div" sx={{ 
          fontWeight: 'bold', 
          textAlign: 'center',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5
        }}>
          FF14 비스 관리자
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1, textAlign: 'center' }}>
          {isAdmin ? '관리자 모드' : '사용자 모드'}
        </Typography>
        
        {/* 버전 정보 */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          v1.0.0
        </Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {menu.map((item) => {
          const isSelected = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={isSelected}
              onClick={variant === 'temporary' ? onClose : undefined}
              sx={{
                borderRadius: 2,
                mb: 0.8,
                py: 1.2,
                backgroundColor: isSelected 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&::before': isSelected ? {
                  content: '""',
                  position: 'absolute',
                  left: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '50%',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '0 4px 4px 0'
                } : {},
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.primary
                }}
              />
              
              {/* 알림 표시 (예시) */}
              {item.text === '알림' && (
                <Box
                  sx={{
                    ml: 1,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  2
                </Box>
              )}
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2, mx: 2 }} />
      
      {!isAdmin ? (
        <Box sx={{ px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SettingsIcon />}
            component={Link}
            to="/admin"
            onClick={variant === 'temporary' ? onClose : undefined}
            sx={{
              py: 1.2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
              }
            }}
          >
            관리자 모드
          </Button>
        </Box>
      ) : (
        <Box sx={{ px: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LayersIcon />}
            component={Link}
            to="/"
            onClick={variant === 'temporary' ? onClose : undefined}
            sx={{ py: 1.2 }}
          >
            사용자 모드
          </Button>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2, textAlign: 'center', mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} FF14 BIS Manager
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.5 }}>
          파이널 판타지 14 관련 모든 콘텐츠와 <br />상표는 SQUARE ENIX에 속합니다.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;