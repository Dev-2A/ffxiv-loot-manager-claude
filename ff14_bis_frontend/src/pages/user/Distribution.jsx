import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CalculateIcon from '@mui/icons-material/Calculate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getSeasons } from '../../api/seasonsApi';
import { getPlayers } from '../../api/playersApi';
import { getDistributionPriorities, calculateDistributionPriority, generateDistributionPlan } from '../../api/raidsApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';
import { getJobTypeColor } from '../../utils/helpers';
import JobIcon from '../../components/common/JobIcon';

const Distribution = () => {
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [weeksForPlan, setWeeksForPlan] = useState(12);

  // 아이템 종류 목록 - itemTypes를 먼저 선언
  const itemTypes = [
    { value: '무기', label: '무기' },
    { value: '모자', label: '모자' },
    { value: '상의', label: '상의' },
    { value: '장갑', label: '장갑' },
    { value: '하의', label: '하의' },
    { value: '신발', label: '신발' },
    { value: '귀걸이', label: '귀걸이' },
    { value: '목걸이', label: '목걸이' },
    { value: '팔찌', label: '팔찌' },
    { value: '반지1', label: '반지1' },
    { value: '반지2', label: '반지2' },
  ];

  // 시즌 정보 가져오기
  const {
    data: seasonsData,
    isLoading: isLoadingSeasons,
    error: seasonsError
  } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => getSeasons({ is_active: true })
  });

  // 활성 시즌이 있으면 자동 선택
  useEffect(() => {
    if (seasonsData?.results?.length > 0 && !selectedSeason) {
      const activeSeason = seasonsData.results.find(s => s.is_active);
      if (activeSeason) {
        setSelectedSeason(activeSeason.id);
      } else {
        setSelectedSeason(seasonsData.results[0].id);
      }
    }
  }, [seasonsData, selectedSeason]);

  // 플레이어 정보 가져오기
  const {
    data: playersData,
    isLoading: isLoadingPlayers,
    error: playersError
  } = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
    enabled: !!selectedSeason
  });

  // 분배 우선순위 정보 가져오기
  const {
    data: prioritiesData,
    isLoading: isLoadingPriorities,
    error: prioritiesError,
    refetch: refetchPriorities
  } = useQuery({
    queryKey: ['distributionPriorities', selectedSeason],
    queryFn: async () => {
      try {
        // 페이지네이션 처리 추가
        let allData = { results: [], count: 0 };
        let nextPage = null;
        
        // 첫 페이지 데이터 로드
        const firstPageData = await getDistributionPriorities({
          season: selectedSeason,
          page_size: 100  // 한 페이지당 많은 데이터 요청
        });
        
        allData.results = [...firstPageData.results];
        allData.count = firstPageData.count;
        nextPage = firstPageData.next;
        
        // 다음 페이지가 있으면 모두 로드
        while (nextPage) {
          // URL에서 query 파라미터 추출
          const url = new URL(nextPage);
          const page = url.searchParams.get('page');
          
          const nextPageData = await getDistributionPriorities({
            season: selectedSeason,
            page: page,
            page_size: 100
          });
          
          allData.results = [...allData.results, ...nextPageData.results];
          nextPage = nextPageData.next;
        }
        
        console.log('모든 우선순위 데이터 로드 완료:', allData.results.length);
        return allData;
      } catch (error) {
        console.error('우선순위 데이터 로드 중 오류:', error);
        return { results: [], count: 0 };
      }
    },
    enabled: !!selectedSeason,
    staleTime: 0,
    refetchOnWindowFocus: false
  });
  
  // 아이템 타입별 우선순위 그룹화
  const prioritiesByType = useMemo(() => {
    if (!prioritiesData?.results) {
      console.log('우선순위 데이터 없음');
      return {};
    }
    
    console.log('우선순위 데이터 그룹화:', prioritiesData.results.length);
    
    // 모든 아이템 타입에 대해 빈 배열로 초기화
    const result = itemTypes.reduce((acc, type) => {
      acc[type.value] = [];
      return acc;
    }, {});
    
    // 데이터 분류
    prioritiesData.results.forEach(item => {
      if (result[item.item_type]) {
        result[item.item_type].push(item);
      } else {
        console.warn(`알 수 없는 아이템 타입: ${item.item_type}`);
      }
    });
    
    // 각 타입별 우선순위로 정렬
    Object.keys(result).forEach(type => {
      result[type].sort((a, b) => a.priority - b.priority);
      console.log(`타입 ${type}의 데이터:`, result[type].length);
    });
    
    return result;
  }, [prioritiesData, itemTypes]);

  // 디버깅용 useEffect
  useEffect(() => {
    if (prioritiesData) {
      console.log('로드된 우선순위 데이터:', prioritiesData);
      console.log('우선순위 목록 길이:', prioritiesData.results?.length || 0);
    }
  }, [prioritiesData]);

  // 분배 계획 가져오기
  const {
    data: planData,
    isLoading: isLoadingPlan,
    error: planError
  } = useQuery({
    queryKey: ['distributionPlan', selectedSeason, weeksForPlan],
    queryFn: async () => {
      try {
        const response = await generateDistributionPlan(selectedSeason, weeksForPlan);
        console.log('분배 계획 데이터:', response); // 데이터 확인용 로그
        return response;
      } catch (error) {
        console.error('분배 계획 로드 오류:', error);
        throw error;
      }
    },
    enabled: !!selectedSeason && tabValue === 1, // 분배 계획 탭일 때만 실행
    retry: 1 // 실패 시 1번만 재시도
  });

  // 분배 우선순위 계산 mutation
  const calculatePriorityMutation = useMutation({
    mutationFn: () => calculateDistributionPriority(selectedSeason),
    onSuccess: () => {
      console.log('우선순위 계산 성공');
      queryClient.invalidateQueries(['distributionPriorities', selectedSeason]);
      refetchPriorities(); // 즉시 다시 가져오기
      setTabValue(0); // 우선순위 목록 탭으로 전환
      alert('분배 우선순위가 성공적으로 계산되었습니다.');
    },
    onError: (error) => {
      console.error('우선순위 계산 실패:', error);
      alert(`분배 우선순위 계산 중 오류가 발생했습니다: ${error.message}`);
    }
  });

  // 주간 분배 계획 생성 mutation
  const generatePlanMutation = useMutation({
    mutationFn: () => generateDistributionPlan(selectedSeason, weeksForPlan),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['distributionPlan', selectedSeason, weeksForPlan]);
      setTabValue(1); // 분배 계획 탭으로 전환
    },
    onError: (error) => {
      alert(`분배 계획 생성 중 오류가 발생했습니다: ${error.message}`);
    }
  });

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 우선순위 계산 핸들러
  const handleCalculatePriority = () => {
    if (window.confirm('분배 우선순위를 다시 계산하시겠습니까?')) {
      console.log('우선순위 계산 시작');
      calculatePriorityMutation.mutate();
    }
  };

  // 분배 계획 생성 핸들러
  const handleGeneratePlan = () => {
    if (window.confirm(`${weeksForPlan}주 분배 계획을 생성하시겠습니까?`)) {
      generatePlanMutation.mutate();
    }
  };

  // 로딩 상태 확인
  const isLoading = isLoadingSeasons || isLoadingPlayers || isLoadingPriorities;
  
  // 에러 처리
  if (seasonsError) return <ErrorMessage error={seasonsError} />;
  if (playersError) return <ErrorMessage error={playersError} />;
  if (prioritiesError) return <ErrorMessage error={prioritiesError} retry={refetchPriorities} />;
  if (isLoading) return <Loading message="데이터 로딩 중..." />;
  
  // 데이터 처리
  const seasons = seasonsData?.results || [];
  const players = playersData?.results || [];
  const priorities = prioritiesData?.results || [];
  const selectedSeasonData = seasons.find(s => s.id === selectedSeason);
  
  // 분배 계획 데이터
  const weeklyPlan = planData && planData.weekly_plan ? planData.weekly_plan : [];
  const playerAcquisitions = planData && planData.player_acquisitions ? planData.player_acquisitions : {};

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component="h1" gutterBottom>
          아이템 분배
        </Typography>
        <Typography color='text.secondary' paragraph>
          레이드 아이템 분배 우선순위 및 계획을 관리하세요.
        </Typography>
      </Box>

      {/* 시즌 선택 및 계산 버튼 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <SeasonSelector
              value={selectedSeason}
              onChange={setSelectedSeason}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4} md={6} sx={{ display: 'flex', justifyContent: 'flex-end'}}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<CalculateIcon />}
              onClick={handleCalculatePriority}
              disabled={calculatePriorityMutation.isLoading}
              sx={{ mr: 1 }}
            >
              {calculatePriorityMutation.isLoading ? '계산 중...' : '우선순위 계산'}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<CalendarMonthIcon />}
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isLoading}
            >
              {generatePlanMutation.isLoading ? '생성 중...' : '분배 계획 생성'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 분배 방식 알림 */}
      {selectedSeasonData && (
        <Alert
          severity='info'
          sx={{ mb: 3 }}
        >
          현재 시즌의 분배 방식: <strong>{selectedSeasonData.distribution_method}</strong>
        </Alert>
      )}

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="우선순위 목록" />
          <Tab label="주간 분배 계획" />
        </Tabs>
        
        {/* 우선순위 목록 탭 */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            {!prioritiesData || !prioritiesData.results || prioritiesData.results.length === 0 ? (
              <Alert severity='warning'>
                우선순위 정보가 없습니다. '우선순위 계산' 버튼을 클릭하여 생성하세요.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {itemTypes.map((type) => (
                  <Grid item xs={12} md={6} lg={4} key={type.value}>
                    <Card variant='outlined'>
                      <CardHeader
                        title={type.label}
                        titleTypographyProps={{ variant: 'h6'}}
                      />
                      <Divider />
                      <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>순위</TableCell>
                                <TableCell>플레이어</TableCell>
                                <TableCell>직업</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {prioritiesByType[type.value]?.length > 0 ? (
                                prioritiesByType[type.value].map((priority, index) => (
                                  <TableRow key={priority.id}>
                                    <TableCell>{priority.priority}</TableCell>
                                    <TableCell>{priority.player_nickname}</TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <JobIcon job={priority.player_job} size={24} />
                                        <Chip
                                          label={priority.player_job_display}
                                          size="small"
                                          sx={{
                                            bgcolor: getJobTypeColor(priority.player_job_type),
                                            color: 'white',
                                          }}
                                        />
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align='center'>
                                    등록된 우선순위가 없습니다.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* 주간 분배 계획 탭 */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {isLoadingPlan ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : planError ? (
              <Alert severity='error' sx={{ mb: 3 }}>
              분배 계획을 불러오는 중 오류가 발생했습니다. '분배 계획 생성' 버튼을 클릭하여 다시 시도하세요.
              </Alert>
            ) : weeklyPlan.length === 0 ? (
              <Alert severity='warning'>
                분배 계획이 없습니다. '분배 계획 생성' 버튼을 클릭하여 생성하세요.
              </Alert>
            ) : (
              <>
                {/* 계획 주차 수 선택 */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center'}}>
                  <Typography variant='body1' sx={{ mr: 2 }}>
                    분배 계획 주차:
                  </Typography>
                  <FormControl sx={{ width: 120 }}>
                    <Select
                      value={weeksForPlan}
                      onChange={(e) => setWeeksForPlan(e.target.value)}
                      size="small"
                    >
                      <MenuItem value={4}>4주</MenuItem>
                      <MenuItem value={8}>8주</MenuItem>
                      <MenuItem value={12}>12주</MenuItem>
                      <MenuItem value={16}>16주</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    size='small'
                    onClick={handleGeneratePlan}
                    sx={{ ml: 2 }}
                    disabled={generatePlanMutation.isLoading}
                  >
                    {generatePlanMutation.isLoading ? '생성 중...' : '다시 생성'}
                  </Button>
                </Box>

                {/* 플레이어별 획득 요약 */}
                <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    플레이어별 아이템 획득 요약
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(playerAcquisitions).map(([playerId, count]) => {
                      const player = players.find(p => p.id === parseInt(playerId));
                      return player ? (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={playerId}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <JobIcon job={player.job} size={30} />
                            <Box sx={{ ml: 1.5 }}>
                              <Typography variant='body2' noWrap>
                                {player.nickname}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {count}개 아이템
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ) : null;
                    })}
                  </Grid>
                </Paper>

                {/* 주간 분배 계획 */}
                {weeklyPlan.map((week) => (
                  <Paper key={week.week} variant='outlined' sx={{ mb: 3 }}>
                    <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                      <Typography variant='h6'>{week.week}주차</Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>층</TableCell>
                            <TableCell>아이템</TableCell>
                            <TableCell>플레이어</TableCell>
                            <TableCell>우선순위</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(week.floors).map(([floor, items]) => (
                            items.map((item, index) => {
                              const player = players.find(p => p.id === item.player_id);
                              return (
                                <TableRow key={`${floor}-${index}`}>
                                  {index === 0 && (
                                    <TableCell
                                      rowSpan={items.length}
                                      sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: 'action.hover'
                                      }}
                                    >
                                      {floor}층
                                    </TableCell>
                                  )}
                                  <TableCell>{item.item_type}</TableCell>
                                  <TableCell>
                                    {player ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <JobIcon job={player.job} size={24} />
                                        <Typography variant='body2' sx={{ ml: 1.5 }}>
                                          {item.player_name}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      item.player_name
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${item.original_priority}순위`}
                                      size="small"
                                      color={item.original_priority <= 2 ? "primary" : "default"}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ))}
                          {Object.keys(week.floors).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align='center'>
                                이번 주에는 분배 계획이 없습니다.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                ))}
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Distribution;