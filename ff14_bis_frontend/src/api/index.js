import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

export default api;