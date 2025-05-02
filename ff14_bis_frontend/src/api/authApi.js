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