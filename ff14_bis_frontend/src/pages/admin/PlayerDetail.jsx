import React from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlayer, updatePlayer } from '../../api/playersApi';
import PlayerForm from '../../components/admin/PlayerForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import JobIcon from '../../components/common/JobIcon';

const PlayerDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// 플레이어 정보 조회
	const { data: player, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['player', id],
		queryFn: () => getPlayer(id),
	});

	// 플레이어 수정 mutation
	const { mutate, isLoading: isMutating, isError: isMutateError, error: mutateError } = useMutation({
		mutationFn: (playerData) => updatePlayer(id, playerData),
		onSuccess: () => {
			// 플레이어 목록 및 상세 정보 쿼리 무효화 (데이터 갱신)
			queryClient.invalidateQueries(['players']);
			queryClient.invalidateQueries(['player', id]);
			// 플레이어 목록으로 리다이렉트
			navigate('/admin/players');
		},
	});

	// 플레이어 수정 제출 핸들러
	const handleSubmit = (playerData) => {
		mutate(playerData);
	};

	// 취소 핸들러
	const handleCancel = () => {
		navigate('/admin/players');
	};

	if (isLoading) return <Loading message='플레이어 정보 로딩 중...' />;
	if (isError) return <ErrorMessage error={error} retry={refetch} />;

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
          <JobIcon job={player.job} size={48} />
          <Typography variant='h4' component="h1" sx={{ ml: 2 }}>
            {player.nickname} <Typography component="span" variant='subtitle1' color='text.secondary'>({player.job_display})</Typography>
          </Typography>
        </Box>
				<Button
					variant="outlined"
					onClick={handleCancel}
				>
					취소
				</Button>
			</Box>

			{isMutateError && (
				<Alert severity='error' sx={{ mb: 3 }}>
					오류가 발생했습니다: {mutateError.message}
				</Alert>
			)}

			<PlayerForm
				initialValues={player}
				onSubmit={handleSubmit}
				isLoading={isMutating}
				isEdit={true}
			/>

			{isMutating && (
				<Box sx={{ display: 'flex', justifyContent: 'center' , mt: 3 }}>
					<CircularProgress />
				</Box>
			)}
		</Box>
	);
};

export default PlayerDetail;