import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const AdminLayout = ({ children }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<Box sx={{ display: 'flex' }}>
			<Header toggleSidebar={isMobile ? handleDrawerToggle : undefined} />

			{isMobile ? (
				<Sidebar
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					isAdmin={true}
				/>
			) : (
				<Sidebar variant="permanent" open={true} isAdmin={true} />
			)}

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${isMobile ? 0 : 240}px)` },
					ml: { sm: isMobile ? 0 : `240px` },
				}}
			>
				<Toolbar /> {/* 공간 확보를 위한 도구 모음 */}
				{children}
			</Box>
		</Box>
	);
};

export default AdminLayout;