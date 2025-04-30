import React from 'react';
import { 
    Box, 
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Grid,
    Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { DISTRIBUTION_METHODS } from '../../utils/constants';

  // 유효성 검증 스키마
  const validationSchema = yup.object({
    name: yup
			.string()
			.required('시즌 이름을 입력해주세요')
			.max(100, '이름은 최대 100자까지 입력 가능합니다'),
    start_date: yup
			.date()
			.required('시작 날짜를 선택해주세요'),
    distribution_method: yup
			.string()
			.required('분배 방식을 선택해주세요'),
});

const SeasonForm = ({
	initialValues = {
		name: '',
		start_date: new Date(),
		end_date: null,
		is_active: true,
		distribution_method: '우선순위분배'
	},
	onSubmit,
	isEdit = false
}) => {
	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: values => {
			// 날짜 형식 변환
			const formattedValues = {
				...values,
				start_date: values.start_date.toISOString().split('T')[0],
				end_date: values.end_date ? values.end_date.toISOString().split('T')[0] : null,
			};
			onSubmit(formattedValues);
		},
	});

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Paper sx={{ p: 3 }}>
				<Box component="form" onSubmit={formik.handleSubmit} noValidate>
					<Typography variant='h6' gutterBottom>
						{isEdit ? '시즌 정보 수정' : '새 시즌 추가'}
					</Typography>

					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								id="name"
								name="name"
								label="시즌 이름"
								value={formik.values.name}
								onChange={formik.handleChange}
								error={formik.touched.name && Boolean(formik.errors.name)}
								helperText={formik.touched.name && formik.errors.name}
								margin='normal'
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<DatePicker
								label="시작 날짜"
								value={formik.values.start_date}
								onChange={(value) => formik.setFieldValue('start_date', value)}
								renderInput={(params) => (
									<TextField
										{...params}
										fullWidth
										margin='normal'
										error={formik.touched.start_date && Boolean(formik.errors.start_date)}
										helperText={formik.touched.start_date && formik.errors.start_date}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<DatePicker
								label="종료 날짜 (선택 사항)"
								value={formik.values.end_date}
								onChange={(value) => formik.setFieldValue('end_date', value)}
								renderInput={(params) => (
									<TextField {...params} fullWidth margin='normal' />
								)}
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<FormControl fullWidth margin='normal'>
								<InputLabel id="distribution-method-label">분배 방식</InputLabel>
								<Select
									labelId="distribution-method-label"
									id="distribution_method"
									name="distribution_method"
									value={formik.values.distribution_method}
									onChange={formik.handleChange}
									error={formik.touched.distribution_method && Boolean(formik.errors.distribution_method)}
									label="분배 방식"
								>
									{DISTRIBUTION_METHODS.map(method => (
										<MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={6}>
							<Box sx={{ mt: 3 }}>
								<FormControlLabel
									control={
										<Switch
											checked={formik.values.is_active}
											onChange={(event) => {
												formik.setFieldValue('is_active', event.target.checked);
											}}
											name="is_active"
											color="primary"
										/>
									}
									label="활성화 (현재 진행 중인 시즌)"
								/>
							</Box>
						</Grid>
					</Grid>

					<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
						<Button
							type="submit"
							variant="contained"
							color='primary'
							sx={{ ml: 1 }}
						>
							{isEdit ? '저장' : '추가'}
						</Button>
					</Box>
				</Box>
			</Paper>
		</LocalizationProvider>
	);
};

export default SeasonForm;