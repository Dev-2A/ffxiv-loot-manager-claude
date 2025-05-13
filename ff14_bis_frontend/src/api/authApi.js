import api from './index';

// 로그인
export const login = async (userData) => {
  const response = await api.post('/auth/login/', userData);
  return response.data;
};

// 로그아웃
export const logout = async (refreshToken) => {
  const response = await api.post('/auth/logout/', { refresh_token: refreshToken });
  return response.data;
};

// 회원가입
export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = async () => {
  const response = await api.get('/auth/user/');
  return response.data;
};

// 토큰 갱신
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/login/refresh/', { refresh: refreshToken });
  return response.data;
};

// 프로필 업데이트
export const updateProfile = async (profileData) => {
  // FormData 객체 생성
  const formData = new FormData();

  // 일반 필드 추가
  if(profileData.email) {
    formData.append('email', profileData.email);
  }

  // 닉네임 추가
  if(profileData.nickname !== undefined) {
    formData.append('nickname', profileData.nickname);
  }

  // 프로필 이미지 파일 추가
  if(profileData.profile_image && profileData.profile_image instanceof File) {
    formData.append('profile_image', profileData.profile_image);
  }

  // 프로필 이미지 URL 추가
  if(profileData.profile_image_url) {
    formData.append('profile_image_url', profileData.profile_image_url);
  }

  console.log('프로필 업데이트 요청:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  try {
    const response = await api.patch('/auth/user/update-profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('프로필 업데이트 응답:', response.data)
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    console.error('오류 응답:', error.response?.data);
    throw error;
  }
};