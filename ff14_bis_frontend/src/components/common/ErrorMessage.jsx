import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

const ErrorMessage = ({ error, retry, customMessage }) => {
  // 에러 메시지 추출
  const getErrorMessage = () => {
    if (customMessage) return customMessage;

    if (error?.response?.data) {
      // 서버에서 반환된 에러 메시지가 있는 경우
      const data = error.response.data;

      if (typeof data === 'string') {
        return data;
      }

      if (typeof data === 'object') {
        // 객체 형태의 에러 메시지를 문자열로 변환
        return Object.entries(data)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(' ')}`;
            }
            return `${key}: ${value}`;
          })
          .join('\n');
      }
    }

    // 네트워크 오류인 경우
    if (error?.message === 'Network Error') {
      return '서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.';
    }

    // 타임아웃 오류인 경우
    if (error?.code === 'ECONNABORTED') {
      return '서버 응답 시간이 초과되었습니다. 잠시 후 시도해주세요.';
    }

    return error?.message || '데이터를 불러오는 중 문제가 발생했습니다.';
  };

  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity='error'
        action={
          retry && (
            <Button
              onClick={retry}
              color="inherit"
              size="small"
              variant="outlined"
              sx={{ ml: 2 }}
            >
              다시 시도
            </Button>
          )
        }
      >
        <AlertTitle>오류가 발생했습니다</AlertTitle>
        {getErrorMessage()}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;