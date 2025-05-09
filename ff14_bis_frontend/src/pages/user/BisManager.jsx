import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getPlayers } from '../../api/playersApi';
import { getBisSets, createBisSet, getBisSet, addItemToBisSet } from '../../api/bisApi';
import { getSeasons } from '../../api/seasonsApi';
import { getItems } from '../../api/itemsApi';
import { calculatePlayerResources } from '../../api/resourcesApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';
import { calculateBisProgress } from '../../utils/helpers';
import JobIcon from '../../components/common/JobIcon';

const BisManager = () => {
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: 출발 비스, 1: 최종 비스
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const[selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBisSet, setSelectedBisSet] = useState(null);

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
    queryFn: () => getPlayers()
  });

  // 선택한 시즌의 비스 세트 가져오기
  const {
    data: bisSetsData,
    isLoading: isLoadingBisSets,
    error: bisSetsError
  } = useQuery({
    queryKey: ['bisSets', selectedSeason, selectedPlayer],
    queryFn: () => getBisSets({
      season: selectedSeason,
      player: selectedPlayer || undefined
    }),
    enabled: !!selectedSeason
  });

  // 선택된 비스 세트 상세 정보 가져오기
  const {
    data: bisSetDetail,
    isLoading: isLoadingBisDetail,
    error: bisDetailError
  } = useQuery({
    queryKey: ['bisSet', selectedBisSet],
    queryFn: () => getBisSet(selectedBisSet),
    enabled: !!selectedBisSet
  });

  // 아이템 목록 가져오기 (특정 시즌 & 타입)
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError
  } = useQuery({
    queryKey: ['items', selectedSeason, selectedSlot],
    queryFn: () => getItems({
      season: selectedSeason,
      type: selectedSlot || undefined
    }),
    enabled: !!selectedSeason && !!selectedSlot
  });

  // 비스 세트 생성 mutation
  const createBisSetMutation = useMutation({
    mutationFn: createBisSet,
    onSuccess: () => {
      queryClient.invalidateQueries(['bisSets', selectedSeason, selectedPlayer]);
    }
  });

  const addItemToBisSetMutation = useMutation({
    mutationFn: ({ bisSetId, itemId, slot }) => {
      console.log(`아이템 추가 요청: bisSetId=${bisSetId}, itemId=${itemId}, slot=${slot}`);
      return addItemToBisSet(bisSetId, { item_id: itemId, slot });
    },
    onSuccess: (data, variables) => {
      console.log(`아이템 추가 성공: ${JSON.stringify(data)}, variables: ${JSON.stringify(variables)}`);
      
      // 중요: 특정 비스 세트만 무효화하여 다시 로드
      // 쿼리 키에 정확한 비스 세트 ID를 포함시켜 특정 비스 세트만 갱신
      queryClient.invalidateQueries(['bisSet', selectedBisSet]);
      
      // 전체 비스 세트 목록은 무효화하지 않음 (이것이 문제의 원인일 수 있음)
      // queryClient.invalidateQueries(['bisSets']); // 이 줄 주석 처리
      
      handleCloseDialog();
    }
  });

  // 자원 계산 mutation
  const calculateREsourcesMutation = useMutation({
    mutationFn: ({ playerId, seasonId }) => calculatePlayerResources(playerId, seasonId),
    onSuccess: () => {
      queryClient.invalidateQueries(['resources', selectedPlayer, selectedSeason]);
    }
  });

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 플레이어 선택 핸들러
  const handlePlayerChange = (event) => {
    setSelectedPlayer(event.target.value);
  };

  // 다이얼로그 열기 핸들러
  const handleOpenDialog = (bisSetId, slot) => {
    setSelectedBisSet(bisSetId);
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  // 다이얼로그 닫기 핸들러
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSlot(null);
  };

  // 아이템 추가 핸들러
  const handleAddItem = (itemId) => {
    addItemToBisSetMutation.mutate({
      bisSetId: selectedBisSet,
      itemId,
      slot: selectedSlot
    });
  };

  // 비스 세트 생성 핸들러
  const handleCreateBisSet = (bisType) => {
    if (!selectedPlayer || !selectedSeason) {
      alert('플레이어와 시즌을 선택해주세요.');
      return;
    }

    createBisSetMutation.mutate({
      player: selectedPlayer,
      season: selectedSeason,
      bis_type: bisType
    });
  };

  // 자원 계산 핸들러
  const handleCalculateResources = () => {
    if (!selectedPlayer || !selectedSeason) {
      alert('플레이어와 시즌을 선택해주세요.');
      return;
    }

    // 최종 비스 세트가 존재하는지 확인
    if (!finalBisSet) {
      alert('최종 비스 세트가 없습니다. 먼저 최종 비스 세트를 생성해주세요.');
    }

    calculateREsourcesMutation.mutate({
      playerId: selectedPlayer,
      seasonId: selectedSeason
    });
  };

  // 로딩 상태 확인
  const isLoading = isLoadingSeasons || isLoadingPlayers || isLoadingBisSets;
  
  // 에러 처리
  if (seasonsError) return <ErrorMessage error={seasonsError} />;
  if (playersError) return <ErrorMessage error={playersError} />;
  if (bisSetsError) return <ErrorMessage error={bisSetsError} />;
  if (isLoading) return <Loading message="데이터 로딩 중..." />;
  
  // 데이터 처리
  const seasons = seasonsData?.results || [];
  const players = playersData?.results || [];
  const bisSets = bisSetsData?.results || [];
  const items = itemsData?.results || [];
  
  // 선택한 플레이어의 비스 세트 필터링
  const startBisSet = bisSets.find(set => set.bis_type === '출발');
  const finalBisSet = bisSets.find(set => set.bis_type === '최종');
  
  // 현재 선택된 비스 세트
  const currentBisSet = tabValue === 0 ? startBisSet : finalBisSet;
  
  // 장비 슬롯별 아이템 분류
  const slotsConfig = [
    { id: 'weapon', label: '무기', slot: '무기' },
    { id: 'head', label: '모자', slot: '모자' },
    { id: 'body', label: '상의', slot: '상의' },
    { id: 'hands', label: '장갑', slot: '장갑' },
    { id: 'legs', label: '하의', slot: '하의' },
    { id: 'feet', label: '신발', slot: '신발' },
    { id: 'earrings', label: '귀걸이', slot: '귀걸이' },
    { id: 'necklace', label: '목걸이', slot: '목걸이' },
    { id: 'bracelet', label: '팔찌', slot: '팔찌' },
    { id: 'ring1', label: '반지1', slot: '반지1' },
    { id: 'ring2', label: '반지2', slot: '반지2' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component="h1" gutterBottom>
          비스 관리
        </Typography>
        <Typography color='text.secondary' paragraph>
          플레이어와 시즌을 선택하여 비스(Best In Slot) 장비를 관리하세요.
        </Typography>
      </Box>

      {/* 선택 영역 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="player-select-label">플레이어</InputLabel>
              <Select
                labelId="player-select-label"
                value={selectedPlayer || ''}
                onChange={handlePlayerChange}
                label="플레이어"
              >
                <MenuItem value="">플레이어 선택</MenuItem>
                {players.map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                      <JobIcon job={player.job} size={24} />
                      <Typography sx={{ ml: 1.5 }}>
                        {player.nickname} ({player.job_display})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <SeasonSelector
              value={selectedSeason}
              onChange={setSelectedSeason}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 선택된 플레이어가 없을 때 안내 메세지 */}
      {!selectedPlayer && (
        <Alert severity='info' sx={{ mb: 4 }}>
          위에서 플레이어를 선택하세요.
        </Alert>
      )}

      {/* 선택된 플레이어가 있을 때 비스 관리 UI */}
      {selectedPlayer && (
        <Box>
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="출발 비스" />
              <Tab label="최종 비스" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* 비스 세트가 없는 경우 */}
              {!currentBisSet && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography paragraph>
                    {tabValue === 0 ? '출발 비스' : '최종 비스'} 세트가 아직 생성되지 않았습니다.
                  </Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateBisSet(tabValue === 0 ? '출발' : '최종')}
                  >
                    {tabValue === 0 ? '출발 비스' : '최종 비스'} 세트 생성
                  </Button>
                </Box>
              )}

              {/* 비스 세트가 있는 경우 */}
              {currentBisSet && (
                <Box>
                  {/* 진행률 표시 */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2'>
                        {tabValue === 0 ? '출발 비스' : '최종 비스'} 완성도
                      </Typography>
                      <Typography variant='body2'>
                        {calculateBisProgress(bisSetDetail)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={calculateBisProgress(bisSetDetail)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* 슬롯별 아이템 목록 */}
                  <Grid container spacing={2}>
                    {slotsConfig.map((slotConfig) => {
                      const slotItem = bisSetDetail?.items?.find(item => item.slot === slotConfig.slot);

                      return (
                        <Grid item xs={12} sm={6} md={4} key={slotConfig.id}>
                          <Card>
                            <CardContent>
                              <Typography variant='h6' gutterBottom>
                                {slotConfig.label}
                              </Typography>

                              {slotItem ? (
                                <>
                                  <Typography variant='body1'>
                                    {slotItem.item.name}
                                  </Typography>
                                  <Typography variant='body2' color='text.secondary'>
                                    {slotItem.item.source_display} | {slotItem.item.item_level}
                                  </Typography>

                                  {/* 마테리쟈 정보 표시 */}
                                  {slotItem.materias && slotItem.materias.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant='body2'>
                                        마테리쟈:
                                      </Typography>
                                      {slotItem.materias.map((materia) => (
                                        <Chip
                                          key={materia.id}
                                          label={materia.type_display}
                                          size='small'
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </>
                              ) : (
                                <Typography variant='body2' color='text.secondary'>
                                  아직 선택된 아이템이 없습니다.
                                </Typography>
                              )}
                            </CardContent>
                            
                            <CardActions>
                              <Button
                                size='small'
                                startIcon={slotItem ? <EditIcon /> : <AddIcon />}
                                onClick={() => handleOpenDialog(currentBisSet.id, slotConfig.slot)}
                              >
                                {slotItem ? '변경' : '추가'}
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* 자원 계산 버튼 */}
                  {tabValue === 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={handleCalculateResources}
                        disabled={calculateREsourcesMutation.isLoading}
                      >
                        {calculateREsourcesMutation.isLoading ? '계산 중...' : '필요 자원 계산하기'}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* 아이템 선택 다이얼로그 */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSlot} 아이템 선택
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingItems ? (
            <Loading message='아이템 목록 로딩 중...' />
          ) : itemsError ? (
            <ErrorMessage error={itemsError} />
          ) : (
            <Grid container spacing={2}>
              {items.length > 0 ? (
                items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => handleAddItem(item.id)}
                    >
                      <CardContent>
                        <Typography variant='h6' gutterBottom noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant='body2' color="text.secondary">
                          {item.source_display} | {item.item_level}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant='body2' align='center' sx={{ px: 4 }}>
                    해당 슬롯에 맞는 아이템이 없습니다.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BisManager;