import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

const StatusBadge = ({
  label,
  color = 'primary',
  size = 'small',
  icon,
  variant = 'filled',
  sx = {}
}) => {
  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 500,
        ...sx
      }}
    />
  );
};

const StatusIcons = {
  success: '✓',
  error: '✗',
  warning: '!',
  info: 'i',
}

// 프리셋 상태 뱃지
export const StatusBadges = {
  active: <StatusBadge label="활성" color="success" />,
  inactive: <StatusBadge label="비활성" color='default' variant='outlined' />,
  pending: <StatusBadge label="대기중" color='warning' />,
  completed: <StatusBadge label="완료" color='success' />,
  failed: <StatusBadge label="실패" color='error' />,
};

export default StatusBadge;