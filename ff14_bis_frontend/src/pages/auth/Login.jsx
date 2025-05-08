import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // 로그인 mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      try {
        // 인증 정보 저장 및 상태 업데이트
        await login(data.access, data.refresh, { username: credentials.username });
        // 홈으로 리다이렉트
        navigate('/');
      } catch (error) {
        console.error('로그인 후 처리 중 오류:', error);
        setError('로그인 후 사용자 정보 처리 중 오류가 발생했습니다.');
      }
    },
    onError: (error) => {
      if (error.response && error.response.status === 401) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  });

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutate(credentials);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        background: 'linear-gradient(45deg, #5b7ce3 30%, #6f8ff5 90%'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            component="img"
            str="/images/ff14_logo.png"
            alt="FF14 로고"
            sx={{ width: 100, height: 'auto', mb: 2 }}
          />
          <Typography variant='h5' component="h1" fontWeight="bold">
            FF14 비스 관리 시스템
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            계정에 로그인하세요
          </Typography>
        </Box>

        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="아이디"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin='normal'
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="비밀번호"
            name='password'
            type='password'
            value={credentials.password}
            onChange={handleChange}
            margin='normal'
            required
          />
          <Button
            type="submit"
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : '로그인'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant='body2'>
            계정이 없으신가요?{' '}
            <Link component={RouterLink} to="/register">
              회원가입
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;