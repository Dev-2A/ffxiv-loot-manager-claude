// ff14_bis_frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

// 파이널 판타지 14의 색상과 분위기에 맞는 테마
const theme = createTheme({
  palette: {
    primary: {
      main: '#5b7ce3',  // FF14 UI 파랑색
      light: '#8aa8ff',
      dark: '#3254b0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#cb3c56',  // FF14 포인트 적색
      light: '#ff6f85',
      dark: '#95002b',
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
      default: '#f8f9fd',
      paper: '#ffffff',
    },
    text: {
      primary: '#333644',
      secondary: '#6d7187',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
          backgroundColor: 'rgba(240, 242, 255, 0.7)',
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
          background: 'linear-gradient(180deg, #f8f9fd 0%, #ffffff 100%)',
        },
      },
    },
  },
});

export default theme;