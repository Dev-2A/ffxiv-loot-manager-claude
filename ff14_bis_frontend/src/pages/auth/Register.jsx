import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register as registerApi } from '../../api/authApi';
import { useFormik } from 'formik';
import * as yup from 'yup';

// 유효성 검증 스키마
const validationSchema = yup.object({
  username: yup
    .string()
    .required('아이디를 입력해주세요')
    .min(4, '아이디는 최소 4자 이상이어야 합니다')
    .max(30, '아이디는 최대 30자까지 입력 가능합니다'),
  email: yup
    .string()
    .email('유효한 이메일 주소를 입력해주세요')
    .required('이메일을 입력해주세요'),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  password2: yup
    .string()
    .required('비밀번호 확인을 입력해주세요')
    .oneOf([yup.ref('password'), null], '비밀번호가 일치하지 않습니다'),
  user_type: yup
    .string()
    .required('회원 유형을 선택해주세요')
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // 회원가입 mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      // 회원가입 성공 시 로그인 페이지로 리다이렉트
      navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
    },
    onError: (error) => {
      if (error.response && error.response.data) {
        // 서버에서 반환된 에러 메시지 처리
        const serverErrors = error.response.data;
        let errorMsg = '';

        // 에러 메시지 형식화
        Object.keys(serverErrors).forEach(key => {
          errorMsg += `${key}: ${serverErrors[key].join(' ')}\n`;
        });

        setError(errorMsg || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  });

  // Formik 설정
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      password2: '',
      user_type: 'regular'
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setError('');
      mutate(values);
    },
  });

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
          p: 3,
          width: '100%',
          maxWidth: 500,
          borderRadius: 3,
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            component="img"
            src="/images/ff14_logo.png"
            alt="FF14 로고"
            sx={{ width: 100, height: 'auto', mb: 2 }}
          />
          <Typography variant="h5" component="h1" fontWeight="bold">
            FF14 비스 관리 시스템
          </Typography>
          <Typography variant="body2" color="text.secondary">
            새 계정 만들기
          </Typography>
        </Box>

        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="아이디"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="이메일"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="password"
                name='password'
                label="비밀번호"
                type='password'
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id='password2'
                name='password2'
                label="비밀번호 확인"
                type='password'
                value={formik.values.password2}
                onChange={formik.handleChange}
                error={formik.touched.password2 && Boolean(formik.errors.password2)}
                helperText={formik.touched.password2 && formik.errors.password2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="user-type-label">회원 유형</InputLabel>
                <Select
                  labelId='user-type-label'
                  id="user_type"
                  name='user_type'
                  value={formik.values.user_type}
                  onChange={formik.handleChange}
                  label="회원 유형"
                >
                  <MenuItem value="regular">공대원</MenuItem>
                  <MenuItem value="admin">공대장</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : '회원가입'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant='body2'>
            이미 계정이 있으신가요?{' '}
            <Link component={RouterLink} to="/login">
              로그인
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;