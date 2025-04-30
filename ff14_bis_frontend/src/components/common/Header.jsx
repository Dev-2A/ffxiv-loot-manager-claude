import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Box,
	Menu,
	MenuItem,
	useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const location = useLocation();
	const [anchorEl, setAnchorEl] = useState(null);

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const isActive = (path) => {
		return location.pathname === path;
	};

	return (
		<AppBar position='fixed' color="inherit">
			<Toolbar>
				{toggleSidebar && (
					<IconButton
						color="inherit"
						aria-label='open drawer'
						onClick={toggleSidebar}
						edge="start"
						sx={{ mr: 2, display: { md: 'none' } }}
					>
						<MenuIcon />
					</IconButton>
				)}

				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					<Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
						FF14 비스 관리자
					</Link>
				</Typography>

				{isMobile ? (
					<>
						<IconButton
							color='inherit'
							aria-label='menu'
							onClick={handleMenuClick}
						>
							<MenuIcon />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							<MenuItem
								component={Link}
								to="/"
								onClick={handleMenuClose}
								selected={isActive('/')}
							>
								홈
							</MenuItem>
							<MenuItem
								component={Link}
								to="/bis"
								onClick={handleMenuClose}
								selected={isActive('/bis')}
							>
								비스 관리
							</MenuItem>
							<MenuItem
								component={Link}
								to="/raid"
								onClick={handleMenuClose}
								selected={isActive('/raid')}
							>
								레이드 진행
							</MenuItem>
							<MenuItem
								component={Link}
								to="/distribution"
								onClick={handleMenuClose}
								selected={isActive('/distribution')}
							>
								아이템 분배
							</MenuItem>
							<MenuItem
								component={Link}
								to="/admin"
								onClick={handleMenuClose}
								selected={isActive('/admin')}
							>
								관리자
							</MenuItem>
						</Menu>
					</>
				): (
					<Box sx={{ display: 'flex' }}>
						<Button
							color="inherit"
							component={Link}
							to="/"
							sx={{
								mx: 1,
								fontWeight: isActive('/') ? 'bold' : 'normal',
								borderBottom: isActive('/') ? `2px solid ${theme.palette.primary.main}` : 'none'
							}}
						>
							홈
						</Button>
						<Button
							color='inherit'
							component={Link}
							to="/bis"
							sx={{
								mx: 1,
								fontWeight: isActive('/bis') ? 'bold' : 'normal',
								borderBottom: isActive('/bis') ? `2px solid ${theme.palette.primary.main}` : 'none'
							}}
						>
							비스 관리
						</Button>
						<Button
							
							color='inherit'
							component={Link}
							to="/raid"
							sx={{
								mx: 1,
								fontWeight: isActive('/raid') ? 'bold' : 'normal',
								borderBottom: isActive('/raid') ? `2px solid ${theme.palette.primary.main}` : 'none'
							}}
						>
							레이드 진행
						</Button>
						<Button
							
							color='inherit'
							component={Link}
							to="/distribution"
							sx={{
								mx: 1,
								fontWeight: isActive('/distribution') ? 'bold' : 'normal',
								borderBottom: isActive('/distribution') ? `2px solid ${theme.palette.primary.main}` : 'none'
							}}
						>
							아이템 분배
						</Button>
						<Button
							color="primary"
							variant="contained"
							component={Link}
							to="/admin"
							sx={{ ml: 2 }}
						>
							관리자
						</Button>
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
};

export default Header;