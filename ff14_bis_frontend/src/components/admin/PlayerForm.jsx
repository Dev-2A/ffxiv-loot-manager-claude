import React from 'react';
import { 
  Box, 
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { JOB_CHOICES } from '../../utils/constants';

// 유효성 검증 스키마
const validationSchema = yup.object({
	nickname: yup
		.string()
		.required('플레이어 닉네임을 입력해주세요')
		.max(50, '닉네임은 최대 50자까지  입력 가능합니다'),
	job: yup
		.string()
		.required('직업을 선택해주세요'),
});

const PlayerForm = ({
	initialValues = { nickname: '', job: '', job_type: ''},
	onSubmit,
	isEdit = false
}) => {
	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: (values) => {
			// 직업에 따라 직업 타입 자동 설정
			const jobInfo = JOB_CHOICES.find(j => j.value === values.job);
			const jobType = jobInfo ? jobInfo.type : '';

			onSubmit({ ...values, job_type: jobType });
		},
	});

	// 직업 변경 시 직업 타입 자동 업데이트
	const handleJobChange = (event) => {
		const job = event.target.value;
		formik.setFieldValue('job', job);

		const jobInfo = JOB_CHOICES.find(j => j.value === job);
		if (jobInfo) {
			formik.setFieldValue('job_type', jobInfo.type);
		}
	};

	return (
		<Paper sx={{ p: 3 }}>
			<Box component="form" onSubmit={formik.handleSubmit} noValidate>
				<Typography variant='h6' gutterBottom>
					{isEdit ? '플레이어 정보 수정' : '새 플레이어 추가'}
				</Typography>

				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							id="nickname"
							name="nickname"
							label="플레이어 닉네임"
							value={formik.values.nickname}
							onChange={formik.handleChange}
							error={formik.touched.nickname && Boolean(formik.errors.nickname)}
							helperText={formik.touched.nickname && formik.errors.nickname}
							margin="normal"
						/>
					</Grid>

					<Grid item xs={12}>
						<FormControl fullWidth margin='normal'>
							<InputLabel id="job-label">직업</InputLabel>
							<Select
								labelId="job-label"
								id="job"
								name="job"
								value={formik.values.job}
								onChange={handleJobChange}
								error={formik.touched.job && Boolean(formik.errors.job)}
								label="직업"
							>
								<MenuItem value="" disabled>직업 선택</MenuItem>
								<MenuItem value="" disabled>- 탱커 -</MenuItem>
								{JOB_CHOICES.filter(job => job.type === '탱커').map(job => (
									<MenuItem key={job.value} value={job.value}>{job.label}</MenuItem>
								))}
								<MenuItem value="" disabled>- 힐러 -</MenuItem>
								{JOB_CHOICES.filter(job => job.type === '힐러').map(job => (
									<MenuItem key={job.value} value={job.value}>{job.label}</MenuItem>
								))}
								<MenuItem value="" disabled>- 딜러 -</MenuItem>
                {JOB_CHOICES.filter(job => job.type === '딜러').map(job => (
                  <MenuItem key={job.value} value={job.value}>{job.label}</MenuItem>
                ))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>

				<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
					<Button
						type='submit'
						variant='contained'
						color='primary'
						sx={{ ml: 1 }}
					>
						{isEdit ? '저장' : '추가'}
					</Button>
				</Box>
			</Box>
		</Paper>
	);
};

export default PlayerForm;