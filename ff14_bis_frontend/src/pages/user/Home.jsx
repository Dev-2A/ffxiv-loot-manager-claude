import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	Divider,
	Paper,
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getSeasons } from '../../api/seasonsApi';
import { getPlayers } from '../../api/playersApi';
import { getBisSets } from '../../api/bisApi';
import { getRaidProgresses } from '../../api/raidsApi';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import SeasonSelector from '../../components/common/SeasonSelector';

const Home = () => {
	const [selectedSeason, setSelectedSeason] = useState(null);

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
		isLoading: isLoadingPlayers
	} = useQuery({
		queryKey: ['players'],
		queryFn: () => getPlayers(),
		enabled: true
	});

	// 비스 세트 정보 가져오기
	const {
		data: bisSetsData,
		isLoading: isLoadingBisSets
	} = useQuery({
		queryKey: ['bisSets', selectedSeason],
		queryFn: () => getBisSets({ sesason: selectedSeason }),
		enabled: !!selectedSeason
	});

	// 레이드 진행 정보 가져오기
	const {
		data: raidProgressData,
		isLoading: isLoadingRaidProgress
	} = useQuery({
		queryKey: ['raidProgress', selectedSeason],
		queryFn: () => getRaidProgresses({
			season: selectedSeason,
			ordering: '-raid_date'
		}),
		enabled: !!selectedSeason
	});

	// 로딩 상태 확인
	const isLoading = isLoadingSeasons || isLoadingPlayers || isLoadingBisSets || isLoadingRaidProgress;

	// 에러 처리
	if (seasonsError) return <ErrorMessage error={seasonsError} />
	if (isLoading) return <Loading message='데이터 로딩 중...' />

	// 데이터 처리
	const players = playersData?.results || [];
	const bisSets = bisSetsData?.results || [];
	const raidProgresses = raidProgressData?.results || [];

	// 필터링된 데이터 계산
	const latestRaid = raidProgresses[0];
	const playerCount = players.length;
	const bisSetCount = bisSets.length;

	return (
		<Box>
			<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant='h4' component="h1" gutterBottom>
					FF14 비스 관리 시스템
				</Typography>
				<SeasonSelector
					value={selectedSeason}
					onChange={setSelectedSeason}
				/>
			</Box>

			{/* 통계 카드 */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Box>
									<Typography color="text.secondary" gutterBottom>
										등록된 플레이어
									</Typography>
									<Typography variant='h4' component="div">
										{playerCount}명
									</Typography>
								</Box>
								<Avatar sx={{ bgcolor: 'primary.main' }}>
									<PeopleIcon />
								</Avatar>
							</Box>
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

				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Box>
									<Typography color="text.secondary" gutterBottom>
										비스 세트
									</Typography>
									<Typography variant='h4' component="div">
										{bisSetCount}개
									</Typography>
								</Box>
								<Avatar sx={{ bgcolor: 'secondary.main' }}>
									<InventoryIcon />
								</Avatar>
							</Box>
							<Button
								component={Link}
								to="/bis"
								size="small"
								sx={{ mt: 2 }}
							>
								비스 관리
							</Button>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Box>
									<Typography color="text.secondary" gutterBottom>
										최근 레이드
									</Typography>
									<Typography variant="h4" component="div">
										{latestRaid ? `${latestRaid.floor_display}` : '없음'}
									</Typography>
								</Box>
								<Avatar sx={{ bgcolor: 'tank.main' }}>
									<SportsEsportsIcon />
								</Avatar>
							</Box>
							<Button
								component={Link}
								to="/raid"
								size="small"
								sx={{ mt: 2 }}
							>
								레이드 관리
							</Button>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Box>
									<Typography color='text.secondary' gutterBottom>
										활성 시즌
									</Typography>
									<Typography variant='h5' component="div">
										{seasonsData?.results?.find(s => s.is_active)?.name || '없음'}
									</Typography>
								</Box>
								<Avatar sx={{ bgcolor: 'dps.main' }}>
									<CalendarMonthIcon />
								</Avatar>
							</Box>
							<Button
								component={Link}
								to="/admin/seasons"
								size="small"
								sx={{ mt: 2 }}
							>
								시즌 관리
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
							최근 레이드 진행
						</Typography>
						<Divider sx={{ mb: 2 }} />

						{raidProgresses.length > 0 ? (
							<List>
								{raidProgresses.slice(0, 5).map((raid) => (
									<ListItem key={raid.id}>
										<ListItemAvatar>
											<Avatar>
												<SportsEsportsIcon />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary={`${raid.floor_display} (${formatDate(raid.raid_date)})`}
											secondary={raid.notes || '메모 없음'}
										/>
									</ListItem>
								))}
							</List>
						) : (
							<Typography variant="body2" color="text.secondary">
								레이드 진행 기록이 없습니다.
							</Typography>
						)}

						<Button
							component={Link}
							to="/raid"
							variant='outlined'
							fullWidth
							sx={{ mt: 2 }}
						>
							모든 레이드 보기
						</Button>
					</Paper>
				</Grid>

				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2 }}>
						<Typography variant='h6' gutterBottom>
							등록된 플레이어
						</Typography>
						<Divider sx={{ mb: 2 }} />

						{players.length > 0 ? (
							<List>
								{players.slice(0, 5).map((player) => (
									<ListItem key={player.id}>
										<ListItemAvatar>
											<Avatar>
												<PersonIcon />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary={player.nickname}
											secondary={`${player.job_display} (${player.job_type_display})`}
										/>
									</ListItem>
								))}
							</List>
						) : (
							<Typography variant='body2' color='text.secondary'>
								등록된 플레이어가 없습니다.
							</Typography>
						)}

						<Button
							component={Link}
							to="/admin/players"
							variant="outlined"
							fullWidth
							sx={{ mt: 2 }}
						>
							모든 플레이어 보기
						</Button>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Home;