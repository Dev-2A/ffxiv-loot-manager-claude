import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import ErrorMessage from './ErrorMessage';

const ApiStatus = ({
  isLoading,
  error,
  retry,
  loadingMessage = '데이터 로딩 중...',
  errorMessage,
  minHeight = 200
}) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: minHeight,
          p: 3
        }}
      >
        <LinearProgress
          sx={{ width: '80%', maxWidth: 300, mb: 2 }}
        />
        <Typography variant="body1" color="text.secondary">
          {loadingMessage}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, minHeigth: minHeight / 2 }}>
        <ErrorMessage
          error={error}
          retry={retry}
          customMessage={errorMessage}
        />
      </Box>
    );
  }

  return null;
};

export default ApiStatus;