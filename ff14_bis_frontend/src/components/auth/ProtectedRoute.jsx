import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

// 인증된 사용자 전용 라우트
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          인증 정보 확인 중...
        </Typography>
      </Box>
    );
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 관리자 권한이 필요한 페이지인데 관리자가 아닌 경우
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  // 인증 조건 충족
  return children;
};

export default ProtectedRoute;