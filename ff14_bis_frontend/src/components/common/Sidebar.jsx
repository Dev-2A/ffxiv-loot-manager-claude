import React from 'react';
import {
	Drawer,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Box,
	Typography
} from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Sidebar = ({ open, onClose, variant = 'permanent', isAdmin = false }) => {
	const location = useLocation();
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
				},
			}}
		>
			<Box sx={{ p: 2 }}>
				<Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
					FF14 비스 관리자
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					{isAdmin ? '관리자 메뉴' : '사용자 메뉴'}
				</Typography>
			</Box>
			<Divider />
			<List>
				{menu.map((item) => (
					<ListItem
						button
						key={item.text}
						component={Link}
						to={item.path}
						selected={location.pathname === item.path}
						onClick={variant === 'temporary' ? onClose : undefined}
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.text} />
					</ListItem>
				))}
			</List>
			{!isAdmin && (
				<>
					<Divider />
					<List>
						<ListItem
							button
							component={Link}
							to="/admin"
							onClick={variant === 'temporary' ? onClose : undefined}
						>
							<ListItemIcon><SettingsIcon /></ListItemIcon>
							<ListItemText primary="관리자 페이지" />
						</ListItem>
					</List>
				</>
			)}
		</Drawer>
	);
};

export default Sidebar;