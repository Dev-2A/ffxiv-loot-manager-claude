import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile } from '../../api/authApi';
import ProfileImageUploader from '../../components/profile/ProfileImageUploader';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState(currentUser?.email || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.profile_image_url || '');
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });

  // 사용자 정보 쿼리
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    initialData: currentUser,
    onSuccess: (data) => {
      // 데이터가 로드되면 폼 상태 업데이트
      setEmail(data.email || '');
      setNickname(data.nickname || '');
      setProfileImageUrl(data.profile_image_url || '');
    }
  });

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // 쿼리 캐시 업데이트
      queryClient.invalidateQueries(['currentUser']);
      // 현재 사용자 상태 업데이트
      if (setCurrentUser) {
        setCurrentUser(data);
      }

      // 성공 알림
      setAlertInfo({
        open: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        severity: 'success'
      });
    },
    onError: (error) => {
      // 오류 알림
      setAlertInfo({
        open: true,
        message: `프로필 업데이트 중 오류가 발생했습니다: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // 프로필 이미지 변경 핸들러
  const handleImageChange = (imageData) => {
    if (imageData.type === 'file') {
      setProfileImage(imageData.file);
      setProfileImageUrl(null);
    } else if (imageData.type === 'url') {
      setProfileImageUrl(imageData.url);
      setProfileImage(null);
    } else if (imageData.type === 'remove') {
      setProfileImage(null);
      setProfileImageUrl(null);
    }
  };

  // 프로필 업데이트 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      email,
      nickname: nickname || ''
    };

    if (profileImage) {
      profileData.profile_image = profileImage;
    }

    if (profileImageUrl) {
      profileData.profile_image_url = profileImageUrl;
    }

    console.log('제출할 프로필 데이터:', profileData);

    updateProfileMutation.mutate(profileData);
  };

  // 알림 닫기 핸들러
  const handleCloseAlert = () => {
    setAlertInfo(prev => ({ ...prev, open: false }));
  };

  if (isLoading) return <Loading message='프로필 정보를 불러오는 중...' />;
  if (error) return <ErrorMessage error={error} retry={refetch} />

  return (
    <Box>
      <PageHeader
        title="내 프로필"
        description="개인 정보와 프로필 이미지를 관리하세요."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ProfileImageUploader
            currentImage={user?.profile_image_url || user?.profile_image}
            onImageChange={handleImageChange}
            loading={updateProfileMutation.isLoading}
            error={updateProfileMutation.error?.message}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='h6' gutterBottom fontWeight="bold">
              계정 정보
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="사용자 이름"
                    value={user?.username || ''}
                    disabled
                    margin='normal'
                    helperText="사용자 이름은 변경할 수 없습니다"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="이메일"
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin='normal'
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="회원 유형"
                    value={user?.user_type === 'admin' ? '공대장' : '공대원'}
                    disabled
                    margin='normal'
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="인게임 캐릭터 이름"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  margin='normal'
                  helperText="인게임 캐릭터 이름과 일치하게 설정해야 본인 비스를 관리할 수 있습니다."
                />
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant='contained'
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? '저장 중...' : '변경사항 저장'}
                </Button>
              </Box>
            </Box>
          </Paper>

          <Card variant='outlined' sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom fontWeight="bold" color='primary'>
                비밀번호 변경
              </Typography>
              <Typography variant='body2' paragraph>
                보안을 위해 정기적으로 비밀번호를 변경하는 것이 좋습니다.
              </Typography>
              <Button
                variant='outlined'
                //TODO - 비밀번호 변경 페이지로 이동 또는 다이얼로그 표시
              >
                비밀번호 변경
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={alertInfo.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          elevation={6}
          variant="filled"
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;