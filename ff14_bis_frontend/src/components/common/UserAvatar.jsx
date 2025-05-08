import React, { useState } from 'react';
import { Avatar, Badge, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

// 뱃지 스타일 (관리자 표시용)
const StyledBadge = styled(Badge)((({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: 16,
    height: 16,
    borderRadius: '50%',
    fontSize: '0.65rem',
    padding: 0,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '"👑"',
      fontSize: '10px',
      padding: '0',
      lineHeight: '16px',
    },
  },
})));

const UserAvartar = ({
  user,
  size = 40,
  showAdminBadge = true,
  tooltip = true,
  sx = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const isAdmin = user?.user_type === 'admin' || user?.is_staff;
  const username = user?.nsername || 'User';

  // URL 처리 로직 개선
  let profileImage = null;

  if (user?.profile_image_url && !imageError) {
    profileImage = user.profile_image_url;
  } else if (user?.profile_image && typeof user.profile_image === 'string' && !imageError) {
    // 경로가 완전하지 않으면 앞에 /media/ 추가
    profileImage = user.profile_image.startsWith('http')
      ? user.profile_image
      : (user.profile_image.startsWith('/')
          ? user.profile_image
          : `/media/${user.profile_image}`);
  }

  // 이미지 로드 오류 처리
  const handleImageError = () => {
    console.log('이미지 로드 실패:', profileImage);
    setImageError(true);
  };

  const avatarComponent = (
    <Avatar
      alt={username}
      src={profileImage}
      onError={handleImageError}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        ...sx
      }}
    >
      {(!profileImage || imageError) && username.charAt(0).toUpperCase()}
    </Avatar>
  );

  // 관리자 뱃지 표시
  if (isAdmin && showAdminBadge) {
    return (
      <Tooltip title={tooltip ? `${username} (공대장)` : ''}>
        <StyledBadge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant='dot'
        >
          {avatarComponent}
        </StyledBadge>
      </Tooltip>
    );
  }

  // 일반 사용자 아바타
  return tooltip ? (
    <Tooltip title={username}>
      {avatarComponent}
    </Tooltip>
  ) : (
    avatarComponent
  );
};

export default UserAvartar;