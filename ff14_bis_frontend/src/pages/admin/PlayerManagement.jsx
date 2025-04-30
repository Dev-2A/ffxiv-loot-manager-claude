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
  DialogTitle
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getPlayers, deletePlayer } from '../../api/playersApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getJobTypeColor } from '../../utils/helpers';
import JobIcon from '../../components/common/JobIcon';

const PlayerManagement = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState('');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [playerToDelete, setPlayerToDelete] = useState(null);

	// 플레이어 목록 조회
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['players', page, rowsPerPage, searchQuery],
		queryFn: () => getPlayers({
			page: page + 1,
			page_size: rowsPerPage,
			search: searchQuery || undefined
		})
	});

	// 플레이어 삭제 mutation
	const deleteMutation = useMutation({
		mutationFn: deletePlayer,
		onSuccess: () => {
			queryClient.invalidateQueries(['players']);
			handleCloseDeleteDialog();
		}
	});

	// 페이지 변경 핸들러
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	// 페이지당 행 수 변경 핸들러
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// 검색 핸들러
	const handleSearch = (event) => {
		event.preventDefault();
		refetch();
	};

	// 삭제 다이얼로그 열기
	const handleOpenDeleteDialog = (player) => {
		setPlayerToDelete(player);
		setDeleteDialogOpen(true);
	};

	// 삭제 다이얼로그 닫기
	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setPlayerToDelete(null);
	};

	// 플레이어 삭제 실행
	const handleDeletePlayer = () => {
		if (playerToDelete) {
			deleteMutation.mutate(playerToDelete.id);
		}
	};

	if (isLoading) return <Loading message='플레이어 목록 로딩 중...' />
	if (error) return <ErrorMessage error={error} retry={refetch} />

	const players = data?.results || [];
	const totalCount = data?.count || 0;

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant='h4' component="h1">
					플레이어 관리
				</Typography>
				<Button
					variant='contained'
					color='primary'
					startIcon={<AddIcon />}
					component={Link}
					to="/admin/players/new"
				>
					새 플레이어 추가
				</Button>
			</Box>

			{/* 검색 박스 */}
			<Paper sx={{ p: 2, mb: 3 }}>
				<Box component="form" onSubmit={handleSearch} sx={{ display: 'flex' }}>
					<TextField
						fullWidth
						placeholder='플레이어 닉네임 검색...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
					<Button type='submit' variant='contained' sx={{ ml: 2 }}>
						검색
					</Button>
				</Box>
			</Paper>

			{/* 플레이어 목록 */}
			<Paper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>닉네임</TableCell>
								<TableCell>직업</TableCell>
								<TableCell>역할군</TableCell>
								<TableCell align='right'>관리</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{players.map((player) => (
								<TableRow key={player.id}>
									<TableCell>{player.nickname}</TableCell>
									<TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <JobIcon job={player.job} size={32} />
                      <Typography sx={{ ml: 1.5 }}>{player.job_display}</Typography>
                    </Box>
                  </TableCell>
									<TableCell>
										<Chip
											label={player.job_type_display}
											size="small"
											sx={{
												bgcolor: getJobTypeColor(player.job_type),
												color: 'white',
											}}
										/>
									</TableCell>
									<TableCell align="right">
										<IconButton
											color="primary"
											onClick={() => navigate(`/admin/players/${player.id}`)}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => handleOpenDeleteDialog(player)}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{players.length === 0 && (
								<TableRow>
									<TableCell colSpan={4} align='center'>
										등록된 플레이어가 없습니다.
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
					labelDisplayedRows={({ from, to, count }) =>
						`${from}-${to} / ${count !== -1 ? count : `${to}+`}`
					}
				/>
			</Paper>

			{/* 삭제 확인 다이얼로그 */}
			<Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
				<DialogTitle>플레이어 삭제</DialogTitle>
				<DialogContent>
					<DialogContentText>
						정말로 {playerToDelete?.nickname} 플레이어를 삭제하시겠습니까?
						이 작업은 되돌릴 수 없으며, 관련된 모든 비스 세트와 아이템 획득 기록이 함께 삭제됩니다.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog}>취소</Button>
					<Button onClick={handleDeletePlayer} color='error' autoFocus>
						삭제
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default PlayerManagement;