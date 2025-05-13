import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSeasons } from '../../api/seasonsApi';
import { getPlayers } from '../../api/playersApi';
import { getItems } from '../../api/itemsApi';
import { getItemCount } from '../../api/itemsApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';
import { getJobTypeColor } from '../../utils/helpers';

const Dashboard = () => {
	const [selectedSeason, setSelectedSeason] = useState(null);

	// 시즌 정보 가져오기
	const {
		data: seasonsData,
		isLoading: isLoadingSeasons,
		error: seasonsError
	} = useQuery({
		queryKey: ['seasons'],
		queryFn: () => getSeasons()
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
		enabled: true
	});

	// 아이템 정보 가져오기
	const {
		data: itemsData,
		isLoading: isLoadingItems,
		error: itemsError
	} = useQuery({
		queryKey: ['items', selectedSeason],
		queryFn: () => getItems({
			season: selectedSeason,
			page_size: 1000
		}),
		enabled: !!selectedSeason
	});

	// 아이템 개수 가져오기
	const {
		data: itemCountData,
		isLoading: isLoadingItemCount
	} = useQuery({
		queryKey: ['itemCount', selectedSeason],
		queryFn: () => getItemCount(selectedSeason),
		enabled: !!selectedSeason
	});

	// 로딩 상태 확인
	const isLoading = isLoadingSeasons || isLoadingPlayers || isLoadingItems;

	// 아이템 개수 확인
	const itemCount = itemCountData?.count || 0;

	// 에러 처리
  if (seasonsError) return <ErrorMessage error={seasonsError} />;
  if (playersError) return <ErrorMessage error={playersError} />;
  if (itemsError) return <ErrorMessage error={itemsError} />;
  if (isLoading) return <Loading message="데이터 로딩 중..." />;
  
  // 데이터 처리
  const seasons = seasonsData?.results || [];
  const players = playersData?.results || [];
  const items = itemsData?.results || [];

	// 직업 타입별 플레이어 분류
	const playersByType = players.reduce((acc, player) => {
		if (!acc[player.job_type]) {
			acc[player.job_type] = 0;
		}
		acc[player.job_type]++;
		return acc;
	}, {});

	// 아이템 출처별 분류
	const itemsBySource = items.reduce((acc, item) => {
		if (!acc[item.source]) {
			acc[item.source] = 0;
		}
		acc[item.source]++;
		return acc;
	}, {});

	return (
		<Box>
			<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="h4" component="h1" gutterButton>
					관리자 대시보드
				</Typography>
				<SeasonSelector
					value={selectedSeason}
					onChange={setSelectedSeason}
				/>
			</Box>

			{/* 통계 카드 */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={4}>
					<Card>
						<CardContent>
							<Typography color="text.secondary" gutterBottom>
								등록된 시즌
							</Typography>
							<Typography variant='h4' component="div">
								{seasons.length}개
							</Typography>
							<Button
								component={Link}
								to="admin/seasons"
								size="small"
								sx={{ mt: 2 }}
							>
								시즌 관리
							</Button>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} sm={4}>
					<Card>
						<CardContent>
							<Typography color="text.secondary" gutterBottom>
								등록된 플레이어
							</Typography>
							<Typography variant='h4' component="div">
								{players.length}명
							</Typography>
							<Button
								component={Link}
								to="/admin/players"
								size="small"
								sx={{ mt: 2 }}
							>
								플레이어 관리
							</Button>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} sm={4}>
					<Card>
						<CardContent>
							<Typography color="text.secondary" gutterBottom>
								등록된 아이템
							</Typography>
							<Typography variant='h4' component="div">
								{itemCount}개
							</Typography>
							<Button
								component={Link}
								to="/admin/items"
								size="small"
								sx={{ mt: 2 }}
							>
								아이템 관리
							</Button>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* 상세 정보 */}
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2 }}>
						<Typography variant='h6' gutterBottom>
							직업 타입별 플레이어
						</Typography>

						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>직업 타입</TableCell>
										<TableCell align='right'>인원</TableCell>
										<TableCell align='right'>비율</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{Object.entries(playersByType).map(([type, count]) => (
										<TableRow key={type}>
											<TableCell>
												<Chip
													label={type}
													size="small"
													sx={{
														bgcolor: getJobTypeColor(type),
														color: 'white'
													}}
												/>
											</TableCell>
											<TableCell align='right'>{count}명</TableCell>
											<TableCell align="right">
												{`${Math.round((count / players.length) * 100)}%`}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						<Button
							component={Link}
							to="/admin/players"
							variant="outlined"
							fullWidth
							sx={{ mt: 2 }}
						>
							플레이어 관리
						</Button>
					</Paper>
				</Grid>

				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2 }}>
						<Typography variant='h6' gutterBottom>
							출처별 아이템
						</Typography>

						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>아이템 출처</TableCell>
										<TableCell align='right'>개수</TableCell>
										<TableCell align='right'>비율</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{Object.entries(itemsBySource).map(([source, count]) => (
										<TableRow key={source}>
											<TableCell>{source}</TableCell>
											<TableCell align='right'>{count}개</TableCell>
											<TableCell align='right'>
												{`${Math.round((count / items.length) * 100)}%`}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						<Button
							component={Link}
							to="/admin/items"
							variant='outlined'
							fullWidth
							sx={{ mt: 2 }}
						>
							아이템 관리
						</Button>
					</Paper>
				</Grid>
			</Grid>

			{/* 시즌 정보 */}
			<Paper sx={{ p: 2, mt: 3 }}>
				<Typography variant='h6' gutterBottom>
					등록된 시즌
				</Typography>

				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>시즌 이름</TableCell>
								<TableCell>시작일</TableCell>
								<TableCell>종료일</TableCell>
								<TableCell>분배 방식</TableCell>
								<TableCell>상태</TableCell>
								<TableCell align='right'>관리</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{seasons.map((season) => (
								<TableRow key={season.id}>
									<TableCell>{season.name}</TableCell>
									<TableCell>{season.start_date}</TableCell>
									<TableCell>{season.end_date}</TableCell>
									<TableCell>{season.end_date || '진행 중'}</TableCell>
									<TableCell>{season.distribution_method}</TableCell>
									<TableCell>
										<Chip
											label={season.is_active ? '활성' : '비활성'}
											color={season.is_active ? 'success' : 'default'}
											size="small"
										/>
									</TableCell>
									<TableCell align='right'>
										<Button
											component={Link}
											to={`/admin/seasons/${season.id}`}
											size="small"
										>
											관리
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				<Button
					component={Link}
					to="/admin/seasons/new"
					variant="contained"
					sx={{ mt: 2 }}
				>
					새 시즌 추가
				</Button>
			</Paper>
		</Box>
	);
};

export default Dashboard;