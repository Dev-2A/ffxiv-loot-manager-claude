import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getSeasons, deleteSeason, updateSeason } from '../../api/seasonsApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/helpers';

const SeasonManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState(null);

  // 시즌 목록 조회
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['seasons', page, rowsPerPage, searchQuery, showOnlyActive],
    queryFn: () => getSeasons({
      page: page + 1,
      page_size: rowsPerPage,
      search: searchQuery || undefined,
      is_active: showOnlyActive ? true : undefined
    })
  });

  // 시즌 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSeason,
    onSuccess: () => {
      queryClient.invalidateQueries(['seasons']);
      handleCloseDeleteDialog();
    }
  });

  // 시즌 활성화 상태 변경 mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateSeason(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['seasons']);
    }
  });

  // 페이지 변경 핸들러
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 당 행 수 변경 핸들러
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 검색 핸들러
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
    refetch();
  };

  // 활성 시즌만 표시 토글 핸들러
  const handleToggleActiveOnly = (event) => {
    setShowOnlyActive(event.target.checked);
    setPage(0);
    refetch();
  };

  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = (season) => {
    setSeasonToDelete(season);
    setDeleteDialogOpen(true);
  };

  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSeasonToDelete(null);
  };

  // 시즌 삭제 실행
  const handleDeleteSeason = () => {
    if (seasonToDelete) {
      deleteMutation.mutate(seasonToDelete.id);
    }
  };

  // 시즌 활성화 상태 토글
  const handleToggleActive = (season) => {
    toggleActiveMutation.mutate({
      id: season.id,
      is_active: !season.is_active
    });
  };


  if (isLoading) return <Loading message='시즌 목록 로딩 중...' />
  if (error) return <ErrorMessage error={error} retry={refetch} />

  const seasons = data?.results || [];
  const totalCount = data?.count || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component="h1">
          시즌 관리
        </Typography>
        <Button
          variant='contained'
          color='primary'
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/seasons/new"
        >
          새 시즌 추가
        </Button>
      </Box>

      {/* 검색 및 필터 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder='시즌 이름 검색...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2 }}
            />
            <Button type='submit' variant='contained'>
              검색
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyActive}
                  onChange={handleToggleActiveOnly}
                  color='primary'
                />
              }
              label="활성 시즌만 표시"
            />
          </Box>
        </Box>
      </Paper>

      {/* 시즌 목록 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>시즌 이름</TableCell>
                <TableCell>시작 날짜</TableCell>
                <TableCell>종료 날짜</TableCell>
                <TableCell>분배 방식</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seasons.map((season) => (
                <TableRow key={season.id}>
                  <TableCell>{season.name}</TableCell>
                  <TableCell>{formatDate(season.start_date)}</TableCell>
                  <TableCell>{season.end_date ? formatDate(season.end_date) : '진행 중'}</TableCell>
                  <TableCell>{season.distribution_method}</TableCell>
                  <TableCell>
                    <Chip
                      label={season.is_active ? '활성' : '비활성'}
                      color={season.is_active ? 'success' : 'default'}
                      size='small'
                      onClick={() => handleToggleActive(season)}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      color='primary'
                      onClick={() => navigate(`/admin/seasons/${season.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color='error'
                      onClick={() => handleOpenDeleteDialog(season)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {seasons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    등록된 시즌이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 항목 수"
          labelDisplayedRows={({ from, to, count}) =>
            `${from}-${to} / ${count !== -1 ? count : `${to}+`}`
          }
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>시즌 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 "{seasonToDelete?.name}" 시즌을 삭제하시겠습니까?
            이 작업은 되돌릴 수 없으며, 관련된 모든 비스 세트, 아이템 획득 기록, 분배 우선순위 정보가 함께 삭제됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>취소</Button>
          <Button onClick={handleDeleteSeason} color='error' autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeasonManagement;