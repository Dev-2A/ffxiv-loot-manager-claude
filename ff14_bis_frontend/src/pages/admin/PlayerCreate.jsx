import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPlayer } from '../../api/playersApi';
import PlayerForm from '../../components/admin/PlayerForm';

const PlayerCreate = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// 플레이어 생성 mutation
	const { mutate, isLoading, isError, error }= useMutation({
		mutationFn: createPlayer,
		onSuccess: () => {
			// 플레이어 목록 쿼리 무효화 (데이터 갱신)
			queryClient.invalidateQueries(['players']);
			// 플레이어 목록으로 리다이렉트
			navigate('/admin/players');
		},
	});

	// 플레이어 생성 제출 핸들러
	const handleSubmit = (playerData) => {
		mutate(playerData);
	};

	// 취소 핸들러
	const handleCancel = () => {
		navigate('/admin/players');
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant='h4' component="h1">
					새 플레이어 추가
				</Typography>
				<Button
					variant='outlined'
					onClick={handleCancel}
				>
					취소
				</Button>
			</Box>

			{isError && (
				<Alert severity='error' sx={{ mb: 3 }}>
					오류가 발생했습니다: {error.message}
				</Alert>
			)}

			<PlayerForm
				onSubmit={handleSubmit}
				isLoading={isLoading}
			/>
		</Box>
	);
};

export default PlayerCreate;