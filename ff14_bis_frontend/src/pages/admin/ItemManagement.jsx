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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
	Grid
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getItems, deleteItem } from '../../api/itemsApi';
import { getSeason, getSeasons } from '../../api/seasonsApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';

const ItemManagement = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSeason, setSelectedSeason] = useState('');
	const [selectedSource, setSelectedSource] = useState('');
	const [selectedType, setSelectedType] = useState('');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);

	// 시즌 목록 조회
	const { data: seasonsData, isLoading: isLoadingSeasons } = useQuery({
		queryKey: ['seasons'],
		queryFn: () => getSeasons()
	});

	// 아이템 목록 조회
	const {
		data,
		isLoading,
		error,
		refetch
	} = useQuery({
		queryKey: ['items', page, rowsPerPage, searchQuery, selectedSeason, selectedSource, selectedType],
		queryFn: () => getItems({
			page: page + 1,
			page_size: rowsPerPage,
			search: searchQuery || undefined,
			season: selectedSeason || undefined,
			source: selectedSource || undefined,
			type: selectedType || undefined
		}),
		keepPreviousData: true
	});

	// 아이템 삭제 mutation
	const deleteMutation = useMutation({
		mutationFn: deleteItem,
		onSuccess: () => {
			queryClient.invalidateQueries(['items']);
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

	// 필터 변경 핸들러
	const handleFilterChange = () => {
		setPage(0);
		refetch();
	};

	// 삭제 다이얼로그 열기
	const handleOpenDeleteDialog = (item) => {
		setItemToDelete(item);
		setDeleteDialogOpen(true);
	};

	// 삭제 다이얼로그 닫기
	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setItemToDelete(null);
	};

	// 아이템 삭제 실행
	const handleDeleteItem = () => {
		if (itemToDelete) {
			deleteMutation.mutate(itemToDelete.id);
		}
	};

	// 로딩 처리
	if (isLoading || isLoadingSeasons) return <Loading message='아이템 목록 로딩 중...' />;

	// 에러 처리
	if (error) return <ErrorMessage error={error} retry={refetch} />;

	const items = data?.results || [];
	const totalCount = data?.count || 0;
	const seasons = seasonsData?.results || [];

	// 아이템 출처 옵션
	const sourceOptions = [
    { value: '석판템', label: '석판템' },
    { value: '보강석판템', label: '보강석판템' },
    { value: '일반레이드템', label: '일반레이드템' },
    { value: '영웅레이드템', label: '영웅레이드템' },
    { value: '극만신템', label: '극만신템' },
    { value: '제작템', label: '제작템' },
  ];

  // 아이템 종류 옵션
  const typeOptions = [
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

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant='h4' component="h1">
					아이템 관리
				</Typography>
				<Button
					variant='contained'
					color='primary'
					startIcon={<AddIcon />}
					component={Link}
					to="/admin/items/new"
				>
					새 아이템 추가
				</Button>
			</Box>

			{/* 검색 및 필터 */}
			<Paper sx={{ p: 2, mb: 3 }}>
				<Box component="form" onSubmit={handleSearch}>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} md={3}>
							<TextField
								fullWidth
								placeholder='아이템 이름 검색...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>

						<Grid item xs={12} md={3}>
							<FormControl fullWidth>
								<InputLabel id="season-filter-label">시즌</InputLabel>
								<Select
									labelId="season-filter-label"
									value={selectedSeason}
									onChange={(e) => {
										setSelectedSeason(e.target.value);
										handleFilterChange();
									}}
									label="시즌"
								>
									<MenuItem value="">모든 시즌</MenuItem>
									{seasons.map((season) => (
										<MenuItem key={season.id} value={season.id}>
											{season.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={2}>
							<FormControl fullWidth>
								<InputLabel id="source-filter-label">출처</InputLabel>
								<Select
									labelId='source-filter-label'
									value={selectedSource}
									onChange={(e) => {
										setSelectedSource(e.target.value);
										handleFilterChange();
									}}
									label="출처"
								>
									<MenuItem value="">모든 출처</MenuItem>
									{sourceOptions.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={2}>
							<FormControl fullWidth>
								<InputLabel id="type-filter-label">종류</InputLabel>
								<Select
									labelId='type-filter-label'
									value={selectedType}
									onChange={(e) => {
										setSelectedType(e.target.value);
										handleFilterChange();
									}}
									label="종류"
								>
									<MenuItem value="">모든 종류</MenuItem>
									{typeOptions.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={2}>
							<Button type='submit' variant='contained' fullWidth>
								검색
							</Button>
						</Grid>
					</Grid>
				</Box>
			</Paper>

			{/* 아이템 목록 */}
			<Paper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>이름</TableCell>
								<TableCell>종류</TableCell>
								<TableCell>출처</TableCell>
								<TableCell>아이템 레벨</TableCell>
								<TableCell>시즌</TableCell>
								<TableCell align="right">관리</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.type_display}</TableCell>
									<TableCell>{item.source_display}</TableCell>
									<TableCell>{item.item_level}</TableCell>
									<TableCell>{item.season_name}</TableCell>
									<TableCell align="right">
										<IconButton
											color="primary"
											onClick={() => navigate(`/admin/items/${item.id}`)}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											color='error'
											onClick={() => handleOpenDeleteDialog(item)}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{items.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} align='center'>
										등록된 아이템이 없습니다.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25, 50]}
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
				<DialogTitle>아이템 삭제</DialogTitle>
				<DialogContent>
					<DialogContentText>
						정말로 "{itemToDelete?.name}" 아이템을 삭제하시겠습니까?
						이 작업은 되돌릴 수 없으며, 관련된 모든 비스 세트와 아이템 획득 기록에 영향을 줄 수 있습니다.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog}>취소</Button>
					<Button onClick={handleDeleteItem} color="error" autoFocus>
						삭제
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ItemManagement;