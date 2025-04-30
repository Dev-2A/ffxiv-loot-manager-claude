import React from "react";
import { Box } from '@mui/material';

const JobIcon = ({ job, size = 40, withBg = true }) => {
  // 아이콘이 없는 경우를 대비한 기본 스타일
  const defaultStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withBg ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
    color: '#666',
    fontWeight: 'bold',
    fontSize: size * 0.4
  };

  // 직업명이 없으면 기본 아이콘 표시
  if(!job) {
    return <Box sx={defaultStyle}>?</Box>
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: withBg ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        '& img': {
          width: '90%',
          height: '90%',
          objectFit: 'contain'
        }
      }}
    >
      <img
        src={`/images/jobs/${job}.png`}
        alt={job || '기본'}
        onError={(e) => {
          // 이미지 로드 실패 시 직업명의 첫 글자로 대체하지 않고, 기본 직업 아이콘을 표시하거나 로딩 실패 시 처리
          e.target.src = '/images/jobs/기본.png';
        }}
      />
    </Box>
  );
};

export default JobIcon;