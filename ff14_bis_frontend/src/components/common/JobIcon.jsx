import React from "react";
import { Box, Tooltip, useTheme } from '@mui/material';

const JobIcon = ({ 
  job, 
  size = 40, 
  withBg = true,
  tooltip = true, 
  showName = false,
  sx = {}
}) => {
  const theme = useTheme();
  
  // 직업 이름 매핑
  const jobNameMap = {
    '전사': '전사 (탱커)',
    '나이트': '나이트 (탱커)',
    '암흑기사': '암흑기사 (탱커)',
    '건브레이커': '건브레이커 (탱커)',
    '몽크': '몽크 (딜러)',
    '용기사': '용기사 (딜러)',
    '닌자': '닌자 (딜러)',
    '사무라이': '사무라이 (딜러)',
    '리퍼': '리퍼 (딜러)',
    '바이퍼': '바이퍼 (딜러)',
    '음유시인': '음유시인 (딜러)',
    '기공사': '기공사 (딜러)',
    '무도가': '무도가 (딜러)',
    '흑마도사': '흑마도사 (딜러)',
    '소환사': '소환사 (딜러)',
    '적마도사': '적마도사 (딜러)',
    '픽토맨서': '픽토맨서 (딜러)',
    '백마도사': '백마도사 (힐러)',
    '학자': '학자 (힐러)',
    '점성술사': '점성술사 (힐러)',
    '현자': '현자 (힐러)',
  };

  // 직업 색상 매핑
  const getJobColor = (job) => {
    if (!job) return 'grey.400';
    
    // 테마에 저장된 직업별 색상 사용
    const jobColorMap = {
      '전사': theme.palette.job.warrior,
      '나이트': theme.palette.job.paladin,
      '암흑기사': theme.palette.job.darkknight,
      '건브레이커': theme.palette.job.gunbreaker,
      '몽크': theme.palette.job.monk,
      '용기사': theme.palette.job.dragoon,
      '닌자': theme.palette.job.ninja,
      '사무라이': theme.palette.job.samurai,
      '리퍼': theme.palette.job.reaper,
      '바이퍼': theme.palette.job.viper,
      '음유시인': theme.palette.job.bard,
      '기공사': theme.palette.job.machinist,
      '무도가': theme.palette.job.dancer,
      '흑마도사': theme.palette.job.blackmage,
      '소환사': theme.palette.job.summoner,
      '적마도사': theme.palette.job.redmage,
      '픽토맨서': theme.palette.job.pictomancer,
      '백마도사': theme.palette.job.whitemage,
      '학자': theme.palette.job.scholar,
      '점성술사': theme.palette.job.astrologian,
      '현자': theme.palette.job.sage,
    };
    
    return jobColorMap[job] || 'grey.400';
  };

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
    fontSize: size * 0.4,
    ...sx
  };

  // 직업명이 없으면 기본 아이콘 표시
  if(!job) {
    return <Box sx={defaultStyle}>?</Box>
  }

  const icon = (
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
        border: `2px solid ${getJobColor(job)}`,
        boxShadow: withBg ? `0 0 10px ${getJobColor(job)}40` : 'none',
        ...sx,
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
          // 이미지 로드 실패 시 직업명의 첫 글자로 대체
          e.target.style.display = 'none';
          e.target.parentNode.textContent = job ? job.charAt(0) : '?';
        }}
      />
    </Box>
  );
  
  const displayIcon = tooltip ? (
    <Tooltip title={jobNameMap[job] || job}>
      {icon}
    </Tooltip>
  ) : icon;

  return showName ? (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayIcon}
      <Box sx={{ ml: 1 }}>{job}</Box>
    </Box>
  ) : displayIcon;
};

export default JobIcon;