import { createTheme } from '@mui/material/styles';

// FF14 테마 생성 함수
const createFF14Theme = (mode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#5b7ce3',
        light: isDark ? '#8aa8ff' : '#8aa8ff',
        dark: isDark ? '#3254b0' : '#3254b0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#cb3c56',
        light: isDark ? '#ff6f85' : '#ff6f85',
        dark: isDark ? '#95002b' : '#95002b',
        contrastText: '#ffffff',
      },
      tank: {
        main: '#3d6ec9',
        dark: '#26499a',
        light: '#639eff',
        contrastText: '#ffffff',
      },
      healer: {
        main: '#3e9a54',
        dark: '#276b39',
        light: '#64cb7b',
        contrastText: '#ffffff',
      },
      dps: {
        main: '#b93c3e',
        dark: '#86191c',
        light: '#ee6a6d',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#121212' : '#f8f9fd',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e0e0e0' : '#333644',
        secondary: isDark ? '#aaaaaa' : '#6d7187',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      // FF14 주요 직업 테마 색상
      job: {
        paladin: '#aac0e2',    // 나이트
        warrior: '#cf2621',    // 전사
        darkknight: '#d126cc', // 암흑기사
        gunbreaker: '#796d30', // 건브레이커
        whitemage: '#fff0dc',  // 백마도사
        scholar: '#8657fd',    // 학자
        astrologian: '#ffe74a',// 점성술사
        sage: '#80a0c0',       // 현자
        monk: '#d69c00',       // 몽크
        dragoon: '#4164cd',    // 용기사
        ninja: '#af1c2c',      // 닌자
        samurai: '#e46d6b',    // 사무라이
        reaper: '#7e3992',     // 리퍼
        viper: '#c0e873',      // 바이퍼
        bard: '#91ba5e',       // 음유시인
        machinist: '#6ee1d6',  // 기공사
        dancer: '#e2b0af',     // 무도가
        blackmage: '#a579d6',  // 흑마도사
        summoner: '#2d9b78',   // 소환사
        redmage: '#e87b7b',    // 적마도사
        bluemage: '#183d9a',   // 청마도사
        pictomancer: '#ef7a2a' // 픽토맨서
      }
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
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
      overline: {
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: '0.75rem',
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
            overflow: 'hidden',
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
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
            backgroundColor: isDark ? 'rgba(40, 42, 55, 0.7)' : 'rgba(240, 242, 255, 0.7)',
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
            background: isDark 
              ? 'linear-gradient(180deg, #1e1e1e 0%, #121212 100%)' 
              : 'linear-gradient(180deg, #f8f9fd 0%, #ffffff 100%)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            height: 8,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
          bar: {
            borderRadius: 10,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: isDark ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};

export default createFF14Theme;