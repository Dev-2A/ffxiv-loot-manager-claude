import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  LinearProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getResources } from '../../api/resourcesApi';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ResourceDisplay = ({ playerId, seasonId }) => {
  // 자원 데이터 조회
  const {
    data: resourcesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['resources', playerId, seasonId],
    queryFn: () => getResources({ player: playerId, season: seasonId }),
    enabled: !!playerId && !!seasonId
  });

  if (isLoading) return <Loading message='자원 정보 로딩 중...' />
  if (error) return <ErrorMessage error={error} retry={refetch} />

  const resources = resourcesData?.results || [];

  // 자원이 없는 경우
  if (resources.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant='subtitle1' align='center'>
          계산된 자원 정보가 없습니다. '필요 자원 계산하기' 버튼을 클릭하세요.
        </Typography>
      </Paper>
    );
  }

  // 자원 타입별 이름 변환
  const getResourceName = (type) => {
    const resourceNames = {
      '석판': '석판',
      '낱장_1층': '1층 낱장',
      '낱장_2층': '2층 낱장',
      '낱장_3층': '3층 낱장',
      '낱장_4층': '4층 낱장',
      '경화약': '경화약',
      '강화섬유': '강화섬유',
      '무기석판': '무기석판'
    };
    return resourceNames[type] || type;
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant='h6' gutterBottom>
        필요 자원 현황
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>자원 종류</TableCell>
              <TableCell align="right">현재 보유량</TableCell>
              <TableCell align="right">총 필요량</TableCell>
              <TableCell align="right">진행률</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => {
              const progressPercent = resource.total_needed > 0
                ? Math.min(100, Math.round((resource.current_amount / resource.total_needed) * 100))
                : 100;
              
              return (
                <TableRow key={resource.id}>
                  <TableCell>{resource.resource_type_display || getResourceName(resource.resource_type)}</TableCell>
                  <TableCell align='right'>{resource.current_amount}</TableCell>
                  <TableCell align='right'>{resource.total_needed}</TableCell>
                  <TableCell align='right' sx={{ width: '30%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant='determinate' value={progressPercent} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant='body2' color='text.secondary'>
                          {progressPercent}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResourceDisplay;