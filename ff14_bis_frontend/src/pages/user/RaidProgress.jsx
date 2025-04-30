import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
  Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { getRaidProgresses, createRaidProgress, deleteRaidProgress } from '../../api/raidsApi';
import { getItemAcquisitions, createItemAcquisition } from '../../api/raidsApi';
import { getSeasons } from '../../api/seasonsApi';
import { getPlayers } from '../../api/playersApi';
import { getItems } from '../../api/itemsApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';
import { formatDate } from '../../utils/helpers';
import JobIcon from '../../components/common/JobIcon';

const RaidProgress = () => {
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [raidDialogOpen, setRaidDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedRaid, setSelectedRaid] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

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

  // 레이드 진행 정보 가져오기
  const {
    data: raidsData,
    isLoading: isLoadingRaids,
    error: raidsError,
    refetch: refetchRaids
  } = useQuery({
    queryKey: ['raids', selectedSeason],
    queryFn: () => getRaidProgresses({
      season: selectedSeason,
      ordering: '-raid_date,-floor'
    }),
    enabled: !!selectedSeason
  });

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

  // 아이템 정보 가져오기 (특정 층에 해당하는 아이템만)
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError
  } = useQuery({
    queryKey: ['items', selectedSeason, selectedFloor],
    queryFn: () => {
      // 층별 아이템 타입 필터링
      let itemTypes = [];
      if (selectedFloor === 1) {
        itemTypes = ['귀걸이', '목걸이', '팔찌', '반지1', '반지2'];
      } else if (selectedFloor === 2) {
        itemTypes = ['모자', '장갑', '신발'];
      } else if (selectedFloor === 3) {
        itemTypes = ['상의', '하의'];
      } else if (selectedFloor === 4) {
        itemTypes = ['무기'];
      }
      
      return getItems({ 
        season: selectedSeason,
        source: '영웅레이드템',
        type__in: itemTypes.join(',') 
      });
    },
    enabled: !!selectedSeason && !!selectedFloor
  });

  // 레이드 진행 생성 mutation
  const createRaidMutation = useMutation({
    mutationFn: createRaidProgress,
    onSuccess: () => {
      queryClient.invalidateQueries(['raids', selectedSeason]);
      setRaidDialogOpen(false);
      raidFormik.resetForm();
    }
  });

  // 아이템 획득 생성 mutation
  const createItemAcquisitionMutation = useMutation({
    mutationFn: createItemAcquisition,
    onSuccess: () => {
      queryClient.invalidateQueries(['raids', selectedSeason]);
      setItemDialogOpen(false);
      itemFormik.resetForm();
    }
  });

  // 레이드 삭제 mutation
  const deleteRaidMutation = useMutation({
    mutationFn: deleteRaidProgress,
    onSuccess: () => {
      queryClient.invalidateQueries(['raids', selectedSeason]);
    }
  });

  // 레이드 생성 폼 유효성 검증
  const raidFormik = useFormik({
    initialValues: {
      season: selectedSeason || '',
      raid_date: new Date(),
      floor: '',
      notes: ''
    },
    validationSchema: yup.object({
      season: yup.number().required('시즌을 선택해주세요'),
      raid_date: yup.date().required('레이드 날짜를 선택해주세요'),
      floor: yup.number().required('층을 선택해주세요')
    }),
    onSubmit: (values) => {
      // 날짜 형식 변환
      const formattedValues = {
        ...values,
        raid_date: values.raid_date.toISOString().split('T')[0]
      };
      createRaidMutation.mutate(formattedValues);
    },
    enableReinitialize: true
  });

  // 아이템 획득 폼 유효성 검증
  const itemFormik = useFormik({
    initialValues: {
      raid_progress: selectedRaid || '',
      player: '',
      item: ''
    },
    validationSchema: yup.object({
      raid_progress: yup.number().required('레이드 진행을 선택해주세요'),
      player: yup.number().required('플레이어를 선택해주세요'),
      item: yup.number().required('아이템을 선택해주세요')
    }),
    onSubmit: (values) => {
      createItemAcquisitionMutation.mutate(values);
    },
    enableReinitialize: true
  });

  // 레이드 다이얼로그 열기
  const handleOpenRaidDialog = () => {
    raidFormik.setFieldValue('season', selectedSeason);
    setRaidDialogOpen(true);
  }

  // 아이템 다이얼로그 열기
  const handleOpenItemDialog = (raidId, floor) => {
    setSelectedRaid(raidId);
    setSelectedFloor(floor);
    itemFormik.setFieldValue('raid_progress', raidId);
    setItemDialogOpen(true);
  };

  // 레이드 삭제 처리
  const handleDeleteRaid = (raidId) => {
    if (window.confirm('정말로 이 레이드 진행을 삭제하시겠습니까? 관련된 모든 아이템 획득 기록도 함께 삭제됩니다.')) {
      deleteRaidMutation.mutate(raidId);
    }
  };

  // 로딩 상태 확인
  const isLoading = isLoadingSeasons || isLoadingRaids || isLoadingPlayers;
  
  // 에러 처리
  if (seasonsError) return <ErrorMessage error={seasonsError} />;
  if (raidsError) return <ErrorMessage error={raidsError} retry={refetchRaids} />;
  if (playersError) return <ErrorMessage error={playersError} />;
  if (isLoading) return <Loading message="데이터 로딩 중..." />;
  
  // 데이터 처리
  const raids = raidsData?.results || [];
  const players = playersData?.results || [];
  const items = itemsData?.results || [];

  // 층별 레이드 그룹화
  const raidsByDate = raids.reduce((acc, raid) => {
    const dateKey = raid.raid_date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(raid);
    return acc;
  }, {});

  // 날짜별로 정렬
  const sortedDates = Object.keys(raidsByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component="h1" gutterBottom>
          레이드 진행 관리
        </Typography>
        <Typography color='"text.secondary' paragraph>
          레이드 진행 상황과 아이템 획득 기록을 관리하세요.
        </Typography>
      </Box>

      {/* 시즌 선택 및 레이드 추가 */}
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
              startIcon={<AddIcon />}
              onClick={handleOpenRaidDialog}
            >
              레이드 진행 추가
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 레이드 목록 */}
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <Paper key={date} sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant='h6'>{formatDate(date)}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {raidsByDate[date].map((raid) => (
                  <Grid item xs={12} sm={6} md={3} key={raid.id}>
                    <Card variant='outlined'>
                      <CardHeader
                        title={`${raid.floor_display}`}
                        action={
                          <>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleOpenItemDialog(raid.id, raid.floor)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteRaid(raid.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        }
                      />
                      <Divider />
                      <CardContent>
                        {raid.notes && (
                          <Typography variant='body2' color='text.secondary' paragraph>
                            {raid.notes}
                          </Typography>
                        )}

                        <Typography variant='subtitle2'>
                          획득 아이템
                        </Typography>

                        {raid.acquisitions && raid.acquisitions.length > 0 ? (
                          <List dense>
                            {raid.acquisitions.map((acquisition) => (
                              <ListItem key={acquisition.id}>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    {acquisition.player_nickname.chartAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={acquisition.item_name}
                                  secondary={acquisition.player_nickname}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant='body2' color="text.secondary">
                            획득한 아이템이 없습니다.
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        ))
      ) : (
        <Alert severity='info'>
          레이드 진행 기록이 없습니다. 새로운 레이드 진행을 추가해보세요.
        </Alert>
      )}

      {/* 레이드 추가 다이얼로그 */}
      <Dialog
        open={raidDialogOpen}
        onClose={() => setRaidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>레이드 진행 추가</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={raidFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <LocalizationProvider DateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="레이드 날짜"
                    value={raidFormik.values.raid_date}
                    onChange={(newValue) => {
                      raidFormik.setFieldValue('raid_date', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={raidFormik.touched.raid_date && Boolean(raidFormik.errors.raid_date)}
                        helperText={raidFormik.touched.raid_date && raidFormik.errors.raid_date}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={raidFormik.touched.floor && Boolean(raidFormik.errors.floor)}
                >
                  <InputLabel id="floor-select-label">층</InputLabel>
                  <Select
                    labelId="floor-select-label"
                    id="floor"
                    name="floor"
                    value={raidFormik.values.floor}
                    onChange={raidFormik.handleChange}
                    label="층"
                  >
                    <MenuItem value={1}>1층</MenuItem>
                    <MenuItem value={2}>2층</MenuItem>
                    <MenuItem value={3}>3층</MenuItem>
                    <MenuItem value={4}>4층</MenuItem>
                  </Select>
                  {raidFormik.touched.floor && raidFormik.errors.floor && (
                    <FormHelperText>{raidFormik.errors.floor}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="메모 (선택사항)"
                  multiline
                  rows={3}
                  value={raidFormik.values.notes}
                  onChange={raidFormik.handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRaidDialogOpen(false)}>취소</Button>
          <Button
            onClick={() => raidFormik.handleSubmit()}
            variant='contained'
            disabled={createRaidMutation.isLoading}
          >
            {createRaidMutation.isLoading ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 아이템 획득 추가 다이얼로그 */}
      <Dialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>아이템 획득 추가</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={itemFormik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={itemFormik.touched.player && Boolean(itemFormik.errors.player)}
                >
                  <InputLabel id="player-select-label">플레이어</InputLabel>
                  <Select
                    labelId="player-select-label"
                    id="player"
                    name="player"
                    value={itemFormik.values.player}
                    onChange={itemFormik.handleChange}
                    label="플레이어"
                  >
                    {players.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <JobIcon job={player.job} size={24} />
                          <Typography sx={{ ml: 1.5 }}>
                            {player.nickname} ({player.job_display})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {itemFormik.touched.player && itemFormik.errors.player && (
                    <FormHelperText>{itemFormik.errors.player}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={itemFormik.touched.item && Boolean(itemFormik.errors.item)}
                >
                  <InputLabel id="item-select-label">아이템</InputLabel>
                  <Select
                    labelId="item-select-label"
                    id="item"
                    name="item"
                    value={itemFormik.values.item}
                    onChange={itemFormik.handleChange}
                    label="아이템"
                  >
                    {isLoadingItems ? (
                      <MenuItem disabled>아이템 로딩 중...</MenuItem>
                    ) : itemsError ? (
                      <MenuItem disabled>아이템 로드 오류</MenuItem>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name} ({item.type_display})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>해당 층에 맞는 아이템이 없습니다</MenuItem>
                    )}
                  </Select>
                  {itemFormik.touched.item && itemFormik.errors.item && (
                    <FormHelperText>{itemFormik.errors.item}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>취소</Button>
          <Button
            onClick={() => itemFormik.handleSubmit()}
            variant='contained'
            disabled={createItemAcquisitionMutation.isLoading || isLoadingItems}
          >
            {createItemAcquisitionMutation.isLoading ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RaidProgress;