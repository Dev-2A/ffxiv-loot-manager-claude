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
  IconButton,
  LinearProgress,
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

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateDistributionPlan } from '../../api/raidsApi';

const Distribution = () => {
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [weeksForPlan, setWeeksForPlan] = useState(12);
  const [editingWeek, setEditingWeek] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [editingPlanData, setEditingPlanData] = useState([]);
  const [selectedPlayerForItem, setSelectedPlayerForItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [planData, setPlanData] = useState(null);

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

  // 주간 획득 가능 아이템 (기본 영웅 레이드 4층 구조)
  const weekly_items = {
    1: ['귀걸이', '목걸이', '팔찌', '반지'],  // 1층 드랍
    2: ['모자', '장갑', '신발'],  // 2층 드랍
    3: ['상의', '하의'],  // 3층 드랍
    4: ['무기']  // 4층 드랍
  };

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
    data: initialPlanData,
    isLoading: isLoadingPlan,
    error: planError
  } = useQuery({
    queryKey: ['distributionPlan', selectedSeason, weeksForPlan],
    queryFn: async () => {
      try {
        const response = await generateDistributionPlan(selectedSeason, weeksForPlan);
        console.log('분배 계획 데이터:', response); // 데이터 확인용 로그
        setPlanData(response); // 상태 업데이트
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

  const updatePlanMutation = useMutation({
    mutationFn: ({ seasonId, week, floor, planData }) =>
      updateDistributionPlan(seasonId, week, floor, planData),
    onSuccess: (data) => {
      console.log('분배 계획 업데이트 성공:', data);

      // .새 데이터 상태 업데이트 (캐시 무효화 대신)
      if (data.updated_plan) {
        // 전체 계획 데이터를 직접 업데이트
        setPlanData(data.updated_plan);
      } else {
        // 캐시 무효화 후 다시 로드
        queryClient.invalidateQueries(['distributionPlan', selectedSeason, weeksForPlan])
      }

      // 편집 모드 종료
      setEditingWeek(null);
      setEditingFloor(null);
      setEditingPlanData([]);

      // 성공 메시지
      alert('분배 계획이 성공적으로 업데이트되었습니다.');
    },
    onError: (error) => {
      console.error('분배 계획 업데이트 실패:', error);
      alert(`분배 계획 업데이트 중 오류가 발생했습니다: ${error.message}`);
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

  // 플레이어 선택 핸들러
  const handlePlayerSelect = (playerId) => {
    if (!editingWeek || !editingFloor || !selectedItemType) {
      console.error('편집 정보가 없습니다:', { editingWeek, editingFloor, selectedItemType });
      return;
    }
    
    // 선택된 플레이어 찾기
    const player = players.find(p => p.id === playerId);
    if (!player) {
      console.error('선택된 플레이어를 찾을 수 없습니다:', playerId);
      return;
    }
    
    console.log('플레이어 선택:', player.nickname, '아이템:', selectedItemType);
    
    // 새 아이템 객체 생성
    const newItem = {
      item_type: selectedItemType,
      player_id: playerId,
      player_name: player.nickname,
      original_priority: 0,  // 수동 입력이므로 우선순위는 0으로 설정
      manual: true  // 수동 입력 표시
    };
    
    // 이미 해당 아이템 타입이 있는지 확인
    const existingIndex = editingPlanData.findIndex(item => item.item_type === selectedItemType);
    
    let updatedPlanData;
    if (existingIndex >= 0) {
      // 이미 있으면 해당 항목 업데이트
      updatedPlanData = [...editingPlanData];
      updatedPlanData[existingIndex] = newItem;
    } else {
      // 없으면 새로 추가
      updatedPlanData = [...editingPlanData, newItem];
    }
    
    console.log('업데이트된 계획 데이터:', updatedPlanData);
    setEditingPlanData(updatedPlanData);
    
    // 선택 초기화
    setSelectedPlayerForItem(null);
    setSelectedItemType(null);
  };
  
  // 아이템 삭제 핸들러
  const handleRemoveItem = (itemType) => {
    if (editingWeek && editingFloor) {
      const updatedPlanData = editingPlanData.filter(item => item.item_type !== itemType);
      setEditingPlanData(updatedPlanData);
    }
  };

  // 편집 모드 시작 핸들러
  const handleStartEditing = (week, floor, existingPlanData = []) => {
    setEditingWeek(week);
    setEditingFloor(floor);
    setEditingPlanData([...existingPlanData]);
  };

  // 편집 취소 핸들러
  const handleCancelEditing = () => {
    setEditingWeek(null);
    setEditingFloor(null);
    setEditingPlanData([]);
    setSelectedPlayerForItem(null);
    setSelectedItemType(null);
  };

  // 분배 계획 저장 핸들러
  const handleSavePlan = () => {
    if (!editingWeek || !editingFloor) {
      console.error('편집 정보가 없습니다:', { editingWeek, editingFloor });
      return;
    }

    if (!editingPlanData || editingPlanData.length === 0) {
      // 빈 데이터 허용 (기존 항목 삭제 가능)
      console.log('저장할 계획 데이터가 없습니다.');
    } else {
      console.log('저장할 계획 데이터:', editingPlanData);
    }

    // 저장 요청 전송
    updatePlanMutation.mutate({
      seasonId: selectedSeason,
      week: editingWeek,
      floor: editingFloor,
      planData: editingPlanData
    });
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
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: week.week <= 8 ? 'primary.main' : 'secondary.main', 
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant='h6'>
                        {week.week}주차 
                        {week.week <= 8 ? (
                          <Chip 
                            label="자동 분배 적용" 
                            size="small" 
                            sx={{ ml: 1, bgcolor: 'white', color: 'primary.main' }} 
                          />
                        ) : (
                          <Chip 
                            label="수동 입력 가능" 
                            size="small" 
                            sx={{ ml: 1, bgcolor: 'white', color: 'secondary.main' }} 
                          />
                        )}
                      </Typography>
                      {week.week > 8 && (
                        <Box>
                          <Button 
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{ bgcolor: 'white', color: 'secondary.main' }}
                            onClick={() => handleGeneratePlan()}
                          >
                            계획 갱신
                          </Button>
                        </Box>
                      )}
                    </Box>

                    {/* 각 층별 아이템 분배 */}
                    {Object.entries(week.floors).map(([floor, items]) => (
                      <Box key={floor} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mx: 2, mt: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'action.hover',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {floor}층
                          </Typography>
                          
                          {/* 9주차 이후 편집 버튼 */}
                          {week.week > 8 && (
                            editingWeek === week.week && editingFloor === floor ? (
                              <Box>
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  color="primary"
                                  startIcon={<SaveIcon />}
                                  onClick={handleSavePlan}
                                  sx={{ mr: 1 }}
                                  disabled={updatePlanMutation.isLoading}
                                >
                                  저장
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={handleCancelEditing}
                                  disabled={updatePlanMutation.isLoading}
                                >
                                  취소
                                </Button>
                              </Box>
                            ) : (
                              <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<EditIcon />}
                                onClick={() => handleStartEditing(week.week, floor, items)}
                              >
                                편집
                              </Button>
                            )
                          )}
                        </Box>

                        {/* 편집 모드일 때 */}
                        {editingWeek === week.week && editingFloor === floor ? (
                          <Box sx={{ p: 2 }}>
                            {/* 아이템 타입 선택 */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                아이템 추가
                              </Typography>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={5}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>아이템 타입</InputLabel>
                                    <Select
                                      value={selectedItemType || ''}
                                      onChange={(e) => setSelectedItemType(e.target.value)}
                                      label="아이템 타입"
                                    >
                                      {itemTypes.filter(type => {
                                        // 해당 층에 맞는 아이템 타입만 표시
                                        const floorItems = weekly_items[parseInt(floor)] || [];
                                        // 반지 아이템의 경우 특별 처리
                                        if (floorItems.includes('반지')) {
                                          return type.value === '반지1' || type.value === '반지2';
                                        }
                                        return floorItems.includes(type.value);
                                      }).map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                          {type.label}
                                          {(type.value === '반지1' || type.value === '반지2') && ' (영웅 레이드 반지)'}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                  <FormControl fullWidth size="small" disabled={!selectedItemType}>
                                    <InputLabel>플레이어</InputLabel>
                                    <Select
                                      value={selectedPlayerForItem || ''}
                                      onChange={(e) => handlePlayerSelect(e.target.value)}
                                      label="플레이어"
                                    >
                                      {players.map(player => (
                                        <MenuItem key={player.id} value={player.id}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <JobIcon job={player.job} size={20} />
                                            <Typography variant="body2" sx={{ ml: 1 }}>
                                              {player.nickname}
                                            </Typography>
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    disabled={!selectedItemType || !selectedPlayerForItem}
                                    onClick={() => handlePlayerSelect(selectedPlayerForItem)}
                                  >
                                    추가
                                  </Button>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* 현재 아이템 목록 */}
                            <Typography variant="subtitle2" gutterBottom>
                              현재 아이템 목록
                            </Typography>
                            {editingPlanData.length > 0 ? (
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>아이템</TableCell>
                                      <TableCell>플레이어</TableCell>
                                      <TableCell align="right">관리</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {editingPlanData.map((item) => {
                                      const player = players.find(p => p.id === item.player_id);
                                      return (
                                        <TableRow key={item.item_type}>
                                          <TableCell>{item.item_type}</TableCell>
                                          <TableCell>
                                            {player && (
                                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <JobIcon job={player.job} size={24} />
                                                <Typography variant='body2' sx={{ ml: 1.5 }}>
                                                  {item.player_name}
                                                </Typography>
                                              </Box>
                                            )}
                                          </TableCell>
                                          <TableCell align="right">
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() => handleRemoveItem(item.item_type)}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                아직 할당된 아이템이 없습니다. 위에서 아이템을 추가하세요.
                              </Alert>
                            )}
                          </Box>
                        ) : (
                          // 일반 모드 (보기 모드)
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell width="20%">아이템</TableCell>
                                  <TableCell width="50%">플레이어</TableCell>
                                  <TableCell width="20%">우선순위</TableCell>
                                  {week.week > 8 && <TableCell width="10%">비고</TableCell>}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {items && items.length > 0 ? (
                                  items.map((item, index) => {
                                    const player = players.find(p => p.id === item.player_id);
                                    return (
                                      <TableRow key={`${item.item_type}-${index}`}>
                                        <TableCell sx={{ width: "20%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                          {item.item_type}
                                        </TableCell>
                                        <TableCell sx={{ width: "50%" }}>
                                          {player ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <JobIcon job={player.job} size={24} />
                                              <Typography variant='body2' sx={{ ml: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.player_name}
                                              </Typography>
                                            </Box>
                                          ) : (
                                            item.player_name
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {item.manual ? (
                                            <Chip 
                                              label="수동 입력" 
                                              size="small" 
                                              color="secondary"
                                            />
                                          ) : (
                                            <Chip
                                              label={`${item.original_priority}순위`}
                                              size="small"
                                              color={item.original_priority <= 2 ? "primary" : "default"}
                                            />
                                          )}
                                        </TableCell>
                                        {week.week > 8 && (
                                          <TableCell>
                                            {item.note && (
                                              <Typography variant="caption" color="text.secondary">
                                                {item.note}
                                              </Typography>
                                            )}
                                          </TableCell>
                                        )}
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={week.week > 8 ? 4 : 3} align='center'>
                                      {week.week > 8 ? '아직 입력된 아이템이 없습니다.' : '이번 층에는 분배 계획이 없습니다.'}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>
                    ))}
                  </Paper>
                ))}

                {/* 미획득 아이템 정보 표시 */}
                {planData && planData.missing_items && Object.keys(planData.missing_items).length > 0 && (
                  <Paper variant='outlined' sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
                    <Typography variant='h6' gutterBottom>
                      8주차까지 모든 아이템을 획득하지 못한 플레이어
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      8주차까지 모든 플레이어가 모든 아이템 타입을 획득하는 것이 이상적이지만, 플레이어 수와 아이템 수의 관계로 불가능할 수 있습니다.
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(planData.missing_items).map(([playerName, missingItems]) => (
                        <Grid item xs={12} sm={6} md={4} key={playerName}>
                          <Box sx={{ border: '1px solid', borderColor: 'warning.main', p: 1.5, borderRadius: 1 }}>
                            <Typography variant='subtitle1' gutterBottom>
                              {playerName}
                            </Typography>
                            <Typography variant='body2'>
                              미획득 아이템: {missingItems.join(', ')}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}

                {/* 아이템 획득 통계 */}
                {planData && planData.player_acquisitions && (
                  <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
                    <Typography variant='h6' gutterBottom>
                      플레이어별 아이템 획득 요약
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          8주차까지는 각 플레이어가 동일한 부위의 아이템을 최대 1회만 획득할 수 있으며, 균등한 분배를 위해 노력합니다.
                          {planData.target_items_per_player && (
                            <strong> 플레이어별 목표 아이템 개수: {planData.target_items_per_player}개</strong>
                          )}
                        </Typography>
                      </Alert>
                    </Box>
                    <Grid container spacing={2}>
                      {Object.entries(planData.player_acquisitions).map(([playerId, count]) => {
                        const player = players.find(p => p.id === parseInt(playerId));
                        if (!player) return null;
                        
                        // 목표 개수에 대한 달성률 계산
                        const targetCount = planData.target_items_per_player || 11; // 모든 아이템 타입 (기본값)
                        const percentage = Math.round((count / targetCount) * 100);
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={playerId}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              p: 1.5,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}>
                              <JobIcon job={player.job} size={40} />
                              <Box sx={{ ml: 1.5, flexGrow: 1 }}>
                                <Typography variant='body1' noWrap>
                                  {player.nickname}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={percentage > 100 ? 100 : percentage} 
                                      color={percentage < 70 ? "error" : percentage < 90 ? "warning" : "success"}
                                    />
                                  </Box>
                                  <Typography variant='caption' color='text.secondary'>
                                    {count}/{targetCount} ({percentage}%)
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                )}
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Distribution;