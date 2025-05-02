import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  Button,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import { PersonOutline } from '@mui/icons-material';

const Profile = () => {
  const { currentUser, logout } = useAuth();

  // 사용자 정보 쿼리
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    initialData: currentUser,
  });

  if (isLoading) return <CircularProgress />
  if (error) return <ErrorMessage error={error} />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant='h4' component="h1" fontWeight="bold" gutterBottom>
        내 프로필
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            <PersonOutline fontSize='inherit' />
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant='h5' fontWeight="bold">
              {user.username}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {user.email}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={user.user_type === 'admin' ? '공대장' : '공대원'}
                color={user.user_type === 'admin' ? 'secondary': 'primary'}
                size='small'
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card variant='outlined' sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' fontWeight="bold" gutterBottom>
                  계정 정보
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    아이디
                  </Typography>
                  <Typography variant='body1' fontWeight="medium">
                    {user.username}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    이메일
                  </Typography>
                  <Typography variant='body1' fontWeight="medium">
                    {user.email}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    회원 유형
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.user_type === 'admin' ? '공대장' : '공대원'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card variant='outlined' sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' fontWeight="bold" gutterBottom>
                  계정 관리
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant='outlined'
                    color="primary"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    비밀번호 변경
                  </Button>
                  <Button
                    variant='outlined'
                    color="error"
                    fullWidth
                    onClick={logout}
                  >
                    로그아웃
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;