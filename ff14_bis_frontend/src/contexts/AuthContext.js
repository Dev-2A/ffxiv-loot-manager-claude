// ff14_bis_frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, refreshToken } from '../api/authApi';

// 인증 컨텍스트 생성
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // 현재 사용자 정보 가져오기
          const userData = await getCurrentUser();
          setCurrentUser(userData);
          
          // 관리자 여부 확인
          setIsAdmin(userData.user_type === 'admin' || userData.is_staff);
        } catch (error) {
          // 토큰이 만료되었거나 유효하지 않은 경우
          const refreshTokenValue = localStorage.getItem('refreshToken');
          
          if (refreshTokenValue) {
            try {
              // 토큰 갱신 시도
              const response = await refreshToken(refreshTokenValue);
              localStorage.setItem('accessToken', response.access);
              
              // 갱신 후 사용자 정보 다시 가져오기
              const userData = await getCurrentUser();
              setCurrentUser(userData);
              setIsAdmin(userData.user_type === 'admin' || userData.is_staff);
            } catch (refreshError) {
              // 토큰 갱신 실패 시 로그아웃 처리
              logout();
            }
          } else {
            // 리프레시 토큰이 없는 경우 로그아웃 처리
            logout();
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // 로그인 처리
  const login = (accessToken, refreshTokenValue, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshTokenValue);
    setCurrentUser(user);
    setIsAdmin(user.user_type === 'admin' || user.is_staff);
  };

  // 로그아웃 처리
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const value = {
    currentUser,
    isAdmin,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};