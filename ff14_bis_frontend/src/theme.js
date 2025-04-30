import { createTheme } from '@mui/material/styles';

// MUI 테마 커스터마이징
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // 인디고
    },
		secondary: {
			main: '#f32f5e', // 로즈
		},
		tank: {
			main: '#3b82f6', // 파랑
		},
		healer: {
			main: '#22c55e', // 초록
		},
		dps: {
			main: '#ef4444', // 빨강
		},
		background: {
			default: '#f9fafb',
			paper: '#ffffff',
		},
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
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 8,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				},
			},
		},
	},
});

export default theme;