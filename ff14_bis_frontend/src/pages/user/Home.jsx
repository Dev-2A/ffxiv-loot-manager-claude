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
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import ApiStatus from '../../components/common/ApiStatus';
import EnhancedCard from '../../components/common/EnhancedCard';
import JobIcon from '../../components/common/JobIcon';
import StatusBadge from '../../components/common/StatusBadge';

const Home = () => {
	const { currentUser } = useAuth();
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
		queryFn: () => getBisSets({ season: selectedSeason }),
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

	// 로딩 및 에러 상태 확인
	const isLoading = isLoadingSeasons || isLoadingPlayers || isLoadingBisSets || isLoadingRaidProgress;
	
	if (isLoading || seasonsError) {
	  return (
	    <ApiStatus 
	      isLoading={isLoading}
	      error={seasonsError}
	      loadingMessage="데이터를 불러오는 중입니다..."
	    />
    );
	}
	
	// 데이터 처리
	const seasons = seasonsData?.results || [];
	const players = playersData?.results || [];
	const bisSets = bisSetsData?.results || [];
	const raidProgresses = raidProgressData?.results || [];

	// 필터링된 데이터 계산
	const latestRaid = raidProgresses[0];
	const playerCount = players.length;
	const bisSetCount = bisSets.length;
  const activeSeason = seasons.find(s => s.is_active);

	return (
		<Box>
			<PageHeader
				title={`안녕하세요, ${currentUser?.username || '모험가'}님!`}
				description="파이널 판타지 14 비스 관리 시스템에 오신 것을 환영합니다. 현재 장비 세트를 관리하고 레이드 진행 상황을 확인하세요."
				action={
				  <Button
				    variant="contained"
				    startIcon={<InventoryIcon />}
				    component={Link}
				    to="/bis"
				  >
				    비스 관리하기
				  </Button>
				}
			/>

			{/* 통계 카드 */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<EnhancedCard
						icon={<Avatar sx={{ bgcolor: 'primary.main' }}><PeopleIcon /></Avatar>}
						title="등록된 플레이어"
						subtitle={`${playerCount}명의 플레이어`}
						footer={
							<Button
								component={Link}
								to="/admin/players"
								size="small"
								fullWidth
							>
								플레이어 관리
							</Button>
						}
					/>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<EnhancedCard
						icon={<Avatar sx={{ bgcolor: 'secondary.main' }}><InventoryIcon /></Avatar>}
						title="비스 세트"
						subtitle={`${bisSetCount}개의 비스 세트`}
						footer={
							<Button
								component={Link}
								to="/bis"
								size="small"
								fullWidth
							>
								비스 관리
							</Button>
						}
					/>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<EnhancedCard
						icon={<Avatar sx={{ bgcolor: 'tank.main' }}><SportsEsportsIcon /></Avatar>}
						title="최근 레이드"
						subtitle={latestRaid ? `${latestRaid.floor_display} (${formatDate(latestRaid.raid_date)})` : '없음'}
						footer={
							<Button
								component={Link}
								to="/raid"
								size="small"
								fullWidth
							>
								레이드 관리
							</Button>
						}
					/>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<EnhancedCard
						icon={<Avatar sx={{ bgcolor: 'dps.main' }}><CalendarMonthIcon /></Avatar>}
						title="활성 시즌"
						subtitle={activeSeason ? activeSeason.name : '없음'}
						action={activeSeason && <StatusBadge label="활성" color="success" size="small" />}
						footer={
							<Button
								component={Link}
								to="/admin/seasons"
								size="small"
								fullWidth
							>
								시즌 관리
							</Button>
						}
					/>
				</Grid>
			</Grid>

			{/* 상세 정보 */}
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<EnhancedCard
						title="최근 레이드 진행"
						headerBg="primary.main"
						headerColor="white"
						elevation={3}
					>
						{raidProgresses.length > 0 ? (
							<List>
								{raidProgresses.slice(0, 5).map((raid) => (
									<ListItem key={raid.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
										<ListItemAvatar>
											<Avatar sx={{ bgcolor: 'primary.light' }}>
												<SportsEsportsIcon />
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary={
												<Typography variant="subtitle1" fontWeight="medium">
													{raid.floor_display}
												</Typography>
											}
											secondary={
												<>
													<Typography variant="body2" component="span">
														{formatDate(raid.raid_date)}
													</Typography>
													{raid.notes && (
														<Typography 
															variant="body2" 
															color="text.secondary" 
															sx={{ display: 'block', mt: 0.5 }}
														>
															{raid.notes}
														</Typography>
													)}
												</>
											}
										/>
									</ListItem>
								))}
							</List>
						) : (
							<Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
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
					</EnhancedCard>
				</Grid>

				<Grid item xs={12} md={6}>
					<EnhancedCard
						title="등록된 플레이어"
						headerBg="secondary.main"
						headerColor="white"
						elevation={3}
					>
						{players.length > 0 ? (
							<List>
								{players.slice(0, 5).map((player) => (
									<ListItem key={player.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
										<ListItemAvatar>
											<JobIcon job={player.job} size={40} />
										</ListItemAvatar>
										<ListItemText
											primary={
												<Typography variant="subtitle1" fontWeight="medium">
													{player.nickname}
												</Typography>
											}
											secondary={
												<Typography variant="body2" color="text.secondary">
													{player.job_display} ({player.job_type_display})
												</Typography>
											}
										/>
									</ListItem>
								))}
							</List>
						) : (
							<Typography variant='body2' color='text.secondary' align="center" sx={{ py: 3 }}>
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
					</EnhancedCard>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Home;