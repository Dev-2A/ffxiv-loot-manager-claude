import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 에러인 경우(401) 및 토큰 갱신 시도가 아닌 경우
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // 로컬스토리지에 리프레시 토큰이 없으면 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 토큰 갱신 요청
        const response = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, {
          refresh: refreshToken
        });

        // 새 엑세스 토큰 저장
        localStorage.setItem('accessToken', response.data.access);

        // 갱신된 토큰으로 헤더 업데이트
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

        // 원래 요청 시도
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신에 실패한 경우 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;