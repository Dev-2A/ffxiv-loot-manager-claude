import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getSeasons } from '../../api/seasonsApi';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const SeasonSelector = ({ value, onChange, fullWidth = false }) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['seasons'],
		queryFn: () => getSeasons()
	});

	if (isLoading) return <Loading message="시즌 정보 로딩 중..." />;
	if (error) return <ErrorMessage error={error} />;

	const seasons = data?.results || [];

	return (
		<Box sx={{ minWidth: fullWidth ? '100%' : 200 }}>
			<FormControl fullWidth={fullWidth}>
				<InputLabel id="season-select-label">시즌</InputLabel>
				<Select
					labelId='season-select-label'
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					label="시즌"
				>
					{seasons.map((season) => (
						<MenuItem key={season.id} value={season.id}>
							{season.name} {season.is_active && '(현재 시즌)'}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	);
};

export default SeasonSelector;