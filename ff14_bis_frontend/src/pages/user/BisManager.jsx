// ff14_bis_frontend/src/pages/user/BisManager.jsx
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
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Snackbar,
  Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import { getPlayers } from '../../api/playersApi';
import { getBisSets, createBisSet, getBisSet, addItemToBisSet, deleteBisSet } from '../../api/bisApi';
import { getSeasons } from '../../api/seasonsApi';
import { getItems } from '../../api/itemsApi';
import { calculatePlayerResources, getResources } from '../../api/resourcesApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';
import { calculateBisProgress } from '../../utils/helpers';
import JobIcon from '../../components/common/JobIcon';
import ResourceDisplay from '../../components/bis/ResourceDisplay';
import { useAuth } from '../../contexts/AuthContext';

const BisManager = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: 출발 비스, 1: 최종 비스
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBisSet, setSelectedBisSet] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [resourcesCalculated, setResourcesCalculated] = useState(false);

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

  // 선택한 시즌과 플레이어의 비스 세트 가져오기
  const {
    data: bisSetsData,
    isLoading: isLoadingBisSets,
    error: bisSetsError,
    refetch: refetchBisSets
  } = useQuery({
    queryKey: ['bisSets', selectedSeason, selectedPlayer],
    queryFn: () => getBisSets({
      season: selectedSeason,
      player: selectedPlayer
    }),
    enabled: !!selectedSeason && !!selectedPlayer
  });

  // 선택한 플레이어와 시즌에 맞는 자원 정보 가져오기
  const {
    data: resourcesData,
    isLoading: isLoadingResources,
    refetch: refetchResources
  } = useQuery({
    queryKey: ['resources', selectedPlayer, selectedSeason],
    queryFn: () => getResources({ 
      player: selectedPlayer,
      season: selectedSeason
    }),
    enabled: !!selectedPlayer && !!selectedSeason && resourcesCalculated
  });

  // 사용자 닉네임과 일치하는 플레이어를 자동으로 선택
  useEffect(() => {
    if (currentUser?.nickname && playersData?.results?.length > 0) {
      const userPlayer = playersData.results.find(player => player.nickname === currentUser.nickname);
      if (userPlayer && !selectedPlayer) {
        setSelectedPlayer(userPlayer.id);
      }
    }
  }, [currentUser, playersData, selectedPlayer]);

  // 비스 세트 데이터가 로드되면 현재 탭에 맞는 비스 세트 ID 설정
  useEffect(() => {
    if (bisSetsData?.results && bisSetsData.results.length > 0) {
      const startBisSet = bisSetsData.results.find(set => set.bis_type === '출발');
      const finalBisSet = bisSetsData.results.find(set => set.bis_type === '최종');
      
      if (tabValue === 0 && startBisSet) {
        setSelectedBisSet(startBisSet.id);
      } else if (tabValue === 1 && finalBisSet) {
        setSelectedBisSet(finalBisSet.id);
      }
    } else {
      // 비스 세트가 없는 경우 선택 초기화
      setSelectedBisSet(null);
    }
  }, [bisSetsData, tabValue]);

  // 현재 선택된 비스 세트의 상세 정보 가져오기
  const {
    data: bisSetDetail,
    isLoading: isLoadingBisDetail,
    error: bisDetailError,
    refetch: refetchBisDetail
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
      type: selectedSlot
    }),
    enabled: !!selectedSeason && !!selectedSlot
  });

  // 비스 세트 생성 mutation
  const createBisSetMutation = useMutation({
    mutationFn: createBisSet,
    onSuccess: () => {
      refetchBisSets();
      showAlert('비스 세트가 성공적으로 생성되었습니다.', 'success');
    },
    onError: (error) => {
      // 권한 오류(403)인 경우 더 명확한 메시지 표시
      if (error.response && error.response.status === 403) {
        if (currentUser && currentUser.nickname) {
          const selectedPlayerData = playersData?.results?.find(p => p.id === selectedPlayer);
          if (selectedPlayerData && selectedPlayerData.nickname !== currentUser.nickname) {
            showAlert(
              `본인의 캐릭터(${currentUser.nickname})만 비스 세트를 관리할 수 있습니다. 프로필에서 닉네임을 확인해주세요.`, 
              'error'
            );
          } else {
            showAlert('이 작업을 수행할 수 있는 권한이 없습니다.', 'error');
          }
        } else {
          showAlert('캐릭터 닉네임을 설정해야 비스 세트를 관리할 수 있습니다. 프로필에서 닉네임을 설정해주세요.', 'error');
        }
      } else {
        showAlert(`비스 세트 생성 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    }
  });

  // 아이템 추가 mutation
  const addItemToBisSetMutation = useMutation({
    mutationFn: ({ bisSetId, itemId, slot }) => {
      return addItemToBisSet(bisSetId, { item_id: itemId, slot });
    },
    onSuccess: (data, variables) => {
      // 특정 비스 세트만 갱신
      queryClient.invalidateQueries(['bisSet', variables.bisSetId]);
      handleCloseDialog();
      showAlert('아이템이 성공적으로 추가되었습니다.', 'success');
    },
    onError: (error) => {
      if (error.response && error.response.status === 403) {
        showAlert('비스 세트를 수정할 권한이 없습니다. 본인의 캐릭터만 수정 가능합니다.', 'error');
      } else {
        showAlert(`아이템 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
      handleCloseDialog();
    }
  });

  // 비스 세트 삭제 mutation
  const deleteBisSetMutation = useMutation({
    mutationFn: deleteBisSet,
    onSuccess: () => {
      refetchBisSets();
      setDeleteDialogOpen(false);
      showAlert('비스 세트가 성공적으로 삭제되었습니다.', 'success');
    },
    onError: (error) => {
      setDeleteDialogOpen(false);
      if (error.response && error.response.status === 403) {
        showAlert('비스 세트를 삭제할 권한이 없습니다. 본인의 캐릭터만 삭제 가능합니다.', 'error');
      } else {
        showAlert(`비스 세트 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    }
  });

  // 자원 계산 mutation
  const calculateResourcesMutation = useMutation({
    mutationFn: ({ playerId, seasonId }) => calculatePlayerResources(playerId, seasonId),
    onSuccess: (data) => {
      setResourcesCalculated(true);
      queryClient.invalidateQueries(['resources', selectedPlayer, selectedSeason]);
      refetchResources();
      showAlert('필요 자원 계산이 완료되었습니다.', 'success');
    },
    onError: (error) => {
      showAlert(`자원 계산 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // 알림 메시지 표시 함수
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // 알림 닫기 핸들러
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // 탭이 변경되면 그에 맞는 비스 세트로 선택 변경
    if (bisSetsData?.results && bisSetsData.results.length > 0) {
      const startBisSet = bisSetsData.results.find(set => set.bis_type === '출발');
      const finalBisSet = bisSetsData.results.find(set => set.bis_type === '최종');
      
      if (newValue === 0 && startBisSet) {
        setSelectedBisSet(startBisSet.id);
      } else if (newValue === 1 && finalBisSet) {
        setSelectedBisSet(finalBisSet.id);
      }
    }
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

  // 삭제 다이얼로그 열기 핸들러
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // 삭제 다이얼로그 닫기 핸들러
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
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
      showAlert('플레이어와 시즌을 선택해주세요.', 'warning');
      return;
    }

    // 로그인 상태 확인
    if (!currentUser) {
      showAlert('비스 세트를 생성하려면 로그인이 필요합니다.', 'warning');
      navigate('/login', { state: { returnUrl: '/bis' } });
      return;
    }

    // 닉네임 확인 (관리자가 아닌 경우)
    if (!isAdmin && (!currentUser.nickname || currentUser.nickname.trim() === '')) {
      showAlert('비스 세트를 생성하려면 프로필에서 게임 캐릭터 닉네임을 설정해야 합니다.', 'warning');
      navigate('/profile');
      return;
    }

    createBisSetMutation.mutate({
      player: selectedPlayer,
      season: selectedSeason,
      bis_type: bisType
    });
  };

  // 비스 세트 삭제 핸들러
  const handleDeleteBisSet = () => {
    const currentBisSet = tabValue === 0 ? 
      bisSetsData?.results?.find(set => set.bis_type === '출발') : 
      bisSetsData?.results?.find(set => set.bis_type === '최종');
    
    if (currentBisSet) {
      deleteBisSetMutation.mutate(currentBisSet.id);
    }
  };

  // 자원 계산 핸들러
  const handleCalculateResources = () => {
    if (!selectedPlayer || !selectedSeason) {
      showAlert('플레이어와 시즌을 선택해주세요.', 'warning');
      return;
    }

    // 최종 비스 세트가 존재하는지 확인
    const finalBisSet = bisSetsData?.results?.find(set => set.bis_type === '최종');
    if (!finalBisSet) {
      showAlert('최종 비스 세트가 없습니다. 먼저 최종 비스 세트를 생성해주세요.', 'warning');
      return;
    }

    calculateResourcesMutation.mutate({
      playerId: selectedPlayer,
      seasonId: selectedSeason
    });
  };

  // 닉네임 설정 권장 버튼 핸들러
  const handleGoToProfile = () => {
    navigate('/profile');
  };

  // 사용자 닉네임과 일치하는 플레이어 확인
  const isCurrentUserPlayer = (player) => {
    return currentUser && currentUser.nickname === player.nickname;
  };

  // 플레이어 수정 권한 확인
  const canModifyPlayer = (playerId) => {
    if (isAdmin) return true;
    
    const player = playersData?.results?.find(p => p.id === playerId);
    return player && currentUser && player.nickname === currentUser.nickname;
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
  const resources = resourcesData?.results || [];
  
  // 선택한 플레이어의 비스 세트 필터링
  const startBisSet = bisSets.find(set => set.bis_type === '출발');
  const finalBisSet = bisSets.find(set => set.bis_type === '최종');
  
  // 현재 선택된 비스 세트
  const currentBisSet = tabValue === 0 ? startBisSet : finalBisSet;
  
  // 선택된 플레이어 정보
  const selectedPlayerData = players.find(p => p.id === selectedPlayer);
  
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

      {/* 현재 사용자 정보 */}
      {currentUser ? (
        currentUser.nickname ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography>
              현재 <strong>{currentUser.username}</strong> 계정으로 로그인되어 있습니다. 게임 닉네임: <strong>{currentUser.nickname}</strong>
              {!isAdmin && (
                <span>
                  {" "}- 본인 캐릭터의 비스 세트만 관리할 수 있습니다.
                </span>
              )}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>
                게임 캐릭터 닉네임을 설정하지 않았습니다. 본인 캐릭터의 비스 세트를 관리하려면 프로필에서 닉네임을 설정하세요.
              </Typography>
              <Button variant="outlined" size="small" onClick={handleGoToProfile}>
                프로필 설정
              </Button>
            </Box>
          </Alert>
        )
      ) : (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              로그인하지 않은 상태에서는 비스 세트를 볼 수만 있고 생성하거나 수정할 수 없습니다.
            </Typography>
            <Button variant="outlined" size="small" onClick={() => navigate('/login')}>
              로그인
            </Button>
          </Box>
        </Alert>
      )}

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
                  <MenuItem 
                    key={player.id} 
                    value={player.id}
                    sx={{ 
                      bgcolor: isCurrentUserPlayer(player) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      fontWeight: isCurrentUserPlayer(player) ? 600 : 400
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                      <JobIcon job={player.job} size={24} />
                      <Typography sx={{ ml: 1.5 }}>
                        {player.nickname} ({player.job_display})
                        {isCurrentUserPlayer(player) && (
                          <Typography component="span" color="primary.main" sx={{ ml: 1, fontWeight: 600 }}>
                            (내 캐릭터)
                          </Typography>
                        )}
                      </Typography>
                      {!isCurrentUserPlayer(player) && !isAdmin && (
                        <Tooltip title="본인 캐릭터만 비스 세트를 관리할 수 있습니다">
                          <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                      )}
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

      {/* 본인 캐릭터가 아닌 경우 경고 */}
      {selectedPlayer && currentUser && currentUser.nickname && !isAdmin && 
       selectedPlayerData && selectedPlayerData.nickname !== currentUser.nickname && (
        <Alert severity='warning' sx={{ mb: 4 }}>
          <Typography>
            현재 <strong>{selectedPlayerData.nickname}</strong> 플레이어를 선택했습니다. 본인 캐릭터가 아니므로 비스 세트를 관리할 수 없습니다.
          </Typography>
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
                  {(isAdmin || (currentUser && currentUser.nickname === selectedPlayerData?.nickname)) ? (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateBisSet(tabValue === 0 ? '출발' : '최종')}
                    >
                      {tabValue === 0 ? '출발 비스' : '최종 비스'} 세트 생성
                    </Button>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
                      이 플레이어의 비스 세트를 생성할 권한이 없습니다. 본인 캐릭터만 비스 세트를 관리할 수 있습니다.
                    </Alert>
                  )}
                </Box>
              )}

              {/* 비스 세트가 있는 경우 */}
              {currentBisSet && (
                <Box>
                  {/* 진행률 표시 및 삭제 버튼 */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
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
                    
                    {/* 삭제 버튼 - 관리자 또는 본인 캐릭터만 표시 */}
                    {canModifyPlayer(selectedPlayer) && (
                      <Box sx={{ ml: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleOpenDeleteDialog}
                          size="small"
                        >
                          삭제
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* 슬롯별 아이템 목록 */}
                  {isLoadingBisDetail ? (
                    <Loading message="비스 세트 정보 로딩 중..." />
                  ) : bisDetailError ? (
                    <ErrorMessage error={bisDetailError} retry={() => refetchBisDetail()} />
                  ) : (
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
                                {canModifyPlayer(selectedPlayer) ? (
                                  <Button
                                    size='small'
                                    startIcon={slotItem ? <EditIcon /> : <AddIcon />}
                                    onClick={() => handleOpenDialog(currentBisSet.id, slotConfig.slot)}
                                  >
                                    {slotItem ? '변경' : '추가'}
                                  </Button>
                                ) : (
                                  <Button
                                    size='small'
                                    disabled
                                    startIcon={<InfoIcon />}
                                    title="본인 캐릭터만 수정 가능합니다"
                                  >
                                    수정 불가
                                  </Button>
                                )}
                              </CardActions>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}

                  {/* 자원 계산 버튼 */}
                  {tabValue === 1 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                          variant='contained'
                          color='secondary'
                          onClick={handleCalculateResources}
                          disabled={calculateResourcesMutation.isLoading}
                        >
                          {calculateResourcesMutation.isLoading ? '계산 중...' : '필요 자원 계산하기'}
                        </Button>
                      </Box>
                      
                      {/* 자원 정보 표시 */}
                      {resourcesCalculated && !isLoadingResources && (
                        <Box sx={{ mt: 4 }}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              필요 자원 현황
                            </Typography>
                            {resources.length > 0 ? (
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
                                          <TableCell>{resource.resource_type_display || resource.resource_type}</TableCell>
                                          <TableCell align="right">{resource.current_amount}</TableCell>
                                          <TableCell align="right">{resource.total_needed}</TableCell>
                                          <TableCell align="right" sx={{ width: '30%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <Box sx={{ width: '100%', mr: 1 }}>
                                                <LinearProgress variant="determinate" value={progressPercent} />
                                              </Box>
                                              <Box sx={{ minWidth: 35 }}>
                                                <Typography variant="body2" color="text.secondary">
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
                            ) : (
                              <Typography variant='body2' align='center' color='text.secondary'>
                                계산된 자원 정보가 없습니다.
                              </Typography>
                            )}
                          </Paper>
                        </Box>
                      )}
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
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease'
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

      {/* 비스 세트 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          {tabValue === 0 ? '출발 비스' : '최종 비스'} 세트 삭제
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 {tabValue === 0 ? '출발 비스' : '최종 비스'} 세트를 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>취소</Button>
          <Button onClick={handleDeleteBisSet} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BisManager;