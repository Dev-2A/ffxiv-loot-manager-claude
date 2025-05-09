import React, { useState } from 'react';
import {
  Chip,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  Badge,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from './UserAvatar';

const Header = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [profileEl, setProfileEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationEl(null);
  };

  const handleProfileClick = (event) => {
    if (!currentUser) {
      // 로그인이 안 된 경우 로그인 페이지로 이동
      navigate('/login');
      return;
    }
    setProfileEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileEl(null);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return '홈';
    if (path === '/bis') return '비스 관리';
    if (path === '/raid') return '레이드 진행';
    if (path === '/distribution') return '아이템 분배';
    if (path === '/admin') return '관리자 대시보드';
    if (path.includes('/admin/players')) return '플레이어 관리';
    if (path.includes('/admin/items')) return '아이템 관리';
    if (path.includes('/admin/seasons')) return '시즌 관리';
    return 'FF14 비스 관리';
  };

  const menuItems = [
    { text: '홈', icon: <HomeIcon />, path: '/' },
    { text: '비스 관리', icon: <InventoryIcon />, path: '/bis' },
    { text: '레이드 진행', icon: <SportsEsportsIcon />, path: '/raid' },
    { text: '아이템 분배', icon: <PeopleIcon />, path: '/distribution' },
  ];

  return (
    <AppBar 
      position='fixed' 
      color="inherit" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.background.default, 0.9),
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        {toggleSidebar && (
          <IconButton
            color="inherit"
            aria-label='open drawer'
            onClick={toggleSidebar}
            edge="start"
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          component="img"
          src="/images/ff14_logo.png"
          alt="FF14"
          sx={{ 
            height: 36, 
            width: 'auto', 
            mr: 2,
            display: { xs: 'none', sm: 'block' }
          }}
        />

        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: { xs: 1, md: 0 }, 
            fontWeight: 'bold',
            textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
            mr: 4,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {getTitle()}
        </Typography>

        {/* 데스크톱 메뉴 */}
        {!isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  mx: 1,
                  py: 1,
                  fontWeight: isActive(item.path) ? 600 : 400,
                  position: 'relative',
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  },
                  '&:after': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: `0 -2px 8px ${alpha(theme.palette.primary.main, 0.4)}`
                  } : {}
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {/* 우측 아이콘 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 알림 아이콘 */}
          <Tooltip title="알림">
            <IconButton 
              color='inherit' 
              onClick={handleNotificationClick}
              sx={{ 
                mr: 1,
                backgroundColor: Boolean(notificationEl) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <Badge 
                badgeContent={2} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    boxShadow: '0 0 0 2px #fff'
                  }
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 프로필 아이콘 (데스크톱) */}
          {!isMobile && (
            <Tooltip title="프로필">
              <IconButton
                onClick={handleProfileClick}
                sx={{ 
                  ml: 1,
                  backgroundColor: Boolean(profileEl) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <UserAvatar
                  user={currentUser}
                  size={32}
                  showAdminBadge={false}
                />
              </IconButton>
            </Tooltip>
          )}

          {/* 관리자 버튼 (데스크톱) */}
          {!isMobile && (
            <Button
              color="primary"
              variant="contained"
              component={Link}
              to="/admin"
              startIcon={<SettingsIcon />}
              sx={{ 
                ml: 2,
                px: 2.5,
                py: 0.8,
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: '8px',
                fontWeight: 500,
                '&:hover': {
                  boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 10%, ${theme.palette.primary.light} 90%)`
              }}
            >
              관리자
            </Button>
          )}

          {/* 메뉴 아이콘 (모바일) */}
          {isMobile && (
            <IconButton
              color='inherit'
              aria-label='menu'
              onClick={handleMenuClick}
              sx={{ 
                backgroundColor: Boolean(anchorEl) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* 모바일 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              borderRadius: 2, 
              mt: 1.5,
              minWidth: 200,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={handleMenuClose}
              selected={isActive(item.path)}
              sx={{ 
                py: 1.2,
                borderRadius: 1,
                mx: 0.5,
                my: 0.3,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }}
              />
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />

          <MenuItem
            component={Link}
            to="/admin"
            onClick={handleMenuClose}
            selected={location.pathname.includes('/admin')}
            sx={{ 
              py: 1.2,
              borderRadius: 1,
              mx: 0.5,
              my: 0.3,
              color: 'primary.main',
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="관리자" 
              primaryTypographyProps={{ 
                fontWeight: 600,
                color: 'primary.main'
              }}
            />
          </MenuItem>

          <MenuItem 
            onClick={() => {
              if (toggleDarkMode) toggleDarkMode();
              handleMenuClose();
            }}
            sx={{ 
              py: 1.2,
              borderRadius: 1,
              mx: 0.5,
              my: 0.3
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={darkMode ? "라이트 모드" : "다크 모드"} />
          </MenuItem>
        </Menu>

        {/* 알림 메뉴 */}
        <Menu
          anchorEl={notificationEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(notificationEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              width: 320,
              maxWidth: '100%',
              borderRadius: 2, 
              mt: 1.5,
              p: 1,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              알림
            </Typography>
            <Button size="small" color="primary">
              모두 읽음
            </Button>
          </Box>
          <Divider sx={{ mb: 1 }} />
          
          <MenuItem onClick={handleNotificationClose} sx={{ borderRadius: 1.5, mb: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                새로운 레이드 진행이 추가되었습니다.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  방금 전
                </Typography>
                <Chip 
                  label="레이드" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleNotificationClose} sx={{ borderRadius: 1.5, mb: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                아이템 분배 계획이 갱신되었습니다.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  1시간 전
                </Typography>
                <Chip 
                  label="분배" 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleNotificationClose} sx={{ borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                새 시즌이 시작되었습니다: 영웅의 귀환
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  1일 전
                </Typography>
                <Chip 
                  label="시즌" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              fullWidth 
              size="small" 
              component={Link} 
              to="/notifications"
              onClick={handleNotificationClose}
            >
              모든 알림 보기
            </Button>
          </Box>
        </Menu>

        {/* 프로필 메뉴 */}
        <Menu
          anchorEl={profileEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(profileEl)}
          onClose={handleProfileClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              width: 220,
              borderRadius: 2, 
              mt: 1.5,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {currentUser ? (
            <Box>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <UserAvatar 
                  user={currentUser}
                  size={60}
                  sx={{ mx: 'auto', mb: 1, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {currentUser.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {isAdmin ? '공대장' : '공대원'}
                </Typography>
              </Box>
              
              <Divider />
              
              <MenuItem onClick={() => {
                handleProfileClose();
                navigate('/profile');
              }} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="내 프로필" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                if (toggleDarkMode) toggleDarkMode();
                handleProfileClose();
              }} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={darkMode ? "라이트 모드" : "다크 모드"} />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={() => {
                logout();
                handleProfileClose();
              }} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </ListItemIcon>
                <ListItemText primary="로그아웃" />
              </MenuItem>
            </Box>
          ) : (
            <MenuItem onClick={() => {
              handleProfileClose();
              navigate('/login');
            }} sx={{ py: 1.2 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="로그인" />
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;