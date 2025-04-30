import React from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Tabs, Tab, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeason, updateSeason } from '../../api/seasonsApi';
import { getSeasonPlayers } from '../../api/seasonsApi';
import { getItems } from '../../api/itemsApi';
import { calculateDistributionPriority } from '../../api/raidsApi';
import SeasonForm from '../../components/admin/SeasonForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const SeasonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = React.useState(0);

  // 시즌 정보 조회
  const {
    data: season,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['season', id],
    queryFn: () => getSeason(id),
  });

  // 시즌에 참여 중인 플레이어 조회
  const {
    data: playersData,
    isLoading: isLoadingPlayers
  } = useQuery({
    queryKey: ['seasonPlayers', id],
    queryFn: () => getSeasonPlayers(id),
    enabled: !!id
  });

  // 시즌 아이템 조회
  const {
    data: itemsData,
    isLoading: isLoadingItems
  } = useQuery({
    queryKey: ['seasonItems', id],
    queryFn: () => getItems({ season: id }),
    enabled: !!id
  });

  // 시즌 수정 mutation
  const {
    mutate,
    isLoading: isMutating,
    isError: isMutateError,
    error: mutateError
  } = useMutation({
    mutationFn: (seasonData) => updateSeason(id, seasonData),
    onSuccess: () => {
      // 시즌 목록 및 상세 정보 쿼리 무효화 (데이터 갱신)
      queryClient.invalidateQueries(['seasons']);
      queryClient.invalidateQueries(['season', id]);
      // 시즌 목록으로 리다이렉트
      navigate('/admin/seasons');
    },
  });

  // 분배 우선순위 계산 mutation
  const {
    mutate: calculatePriority,
    isLoading: isCalculating
  } = useMutation({
    mutationFn: () => calculateDistributionPriority(id),
    onSuccess: () => {
      // 분배 우선순위 정보 갱신
      queryClient.invalidateQueries(['distributionPriorities', id]);
      alert('분배 우선순위가 성공적으로 계산되었습니다.');
    },
    onError: (error) => {
      alert(`분배 우선순위 계산 중 오류가 발생했습니다: ${error.message}`);
    }
  });

  // 시즌 수정 제출 핸들러
  const handleSubmit = (seasonData) => {
    mutate(seasonData);
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/admin/seasons');
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 분배 우선순위 계산 핸들러
  const handleCalculatePriority = () => {
    if (window.confirm('분배 우선순위를 다시 계산하시겠습니까?')) {
      calculatePriority();
    }
  };

  if (isLoading || isLoadingPlayers || isLoadingItems) {
    return <Loading message='시즌 정보 로딩 중...' />;
  }

  if (isError) return <ErrorMessage error={error} retry={refetch} />;

  const players = playersData || [];
  const items = itemsData?.results || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component="h1">
          시즌 정보: {season.name}
        </Typography>
        <Button
          variant='outlined'
          onClick={handleCancel}
        >
          목록으로 돌아가기
        </Button>
      </Box>

      {isMutateError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          오류가 발생했습니다: {mutateError.message}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="기본 정보" />
          <Tab label="참여 플레이어" />
          <Tab label="아이템 목록" />
          <Tab label="분배 관리" />
        </Tabs>

        {/* 기본 정보 탭 */}
        {tabValue === 0 && (
          <SeasonForm
            initialValues={season}
            onSubmit={handleSubmit}
            isLoading={isMutating}
            isEdit={true}
          />
        )}

        {/* 참여 플레이어 탭 */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>
                참여 플레이어 ({players.length}명)
              </Typography>
              <Button
                variant='contained'
                onClick={() => navigate('/admin/players')}
              >
                플레이어 관리
              </Button>
            </Box>

            {players.length > 0 ? (
              <Box>
                {/* 플레이어 목록 컴포넌트를 여기에 추가 */}
              </Box>
            ) : (
              <Typography color='text.secondary'>
                이 시즌에 참여 중인 플레이어가 없습니다.
              </Typography>
            )}
          </Paper>
        )}

        {/* 아이템 목록 탭 */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                시즌 아이템 ({items.length}개)
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/items')}
              >
                아이템 관리
              </Button>
            </Box>
            
            {items.length > 0 ? (
              <Box>
                {/* 아이템 목록 컴포넌트를 여기에 추가 */}
              </Box>
            ) : (
              <Typography color="text.secondary">
                이 시즌에 등록된 아이템이 없습니다.
              </Typography>
            )}
          </Paper>
        )}

        {/* 분배 관리 탭 */}
        {tabValue === 3 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                분배 우선순위 관리
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCalculatePriority}
                disabled={isCalculating}
              >
                {isCalculating ? '계산 중...' : '우선순위 다시 계산'}
              </Button>
            </Box>
            
            <Typography paragraph>
              분배 방식: <strong>{season.distribution_method}</strong>
            </Typography>
            
            <Typography paragraph>
              우선순위 계산은 각 플레이어의 최종 비스 세트에 필요한 자원을 기준으로 합니다.
              계산 결과는 아이템 분배 페이지에서 확인할 수 있습니다.
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/distribution')}
              sx={{ mt: 2 }}
            >
              아이템 분배 페이지로 이동
            </Button>
          </Paper>
        )}
      </Box>

      {isMutating && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default SeasonDetail;