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
import { ITEM_TYPES, ITEM_SOURCES } from '../../utils/constants';
import SeasonSelector from '../common/SeasonSelector';
import { source } from 'framer-motion/client';

// 유효성 검증 스키마
const validationSchema = yup.object({
	name: yup
		.string()
		.required('아이템 이름을 입력해주세요')
		.max(100, '이름은 최대 100자까지 입력 가능합니다'),
	type: yup
		.string()
		.required('아이템 종류를 선택해주세요'),
	source: yup
		.string()
		.required('아이템 출처를 선택해주세요'),
	item_level: yup
		.number()
		.required('아이템 레벨을 입력해주세요')
		.positive('아이템 레벨은 양수여야 합니다'),
	season: yup
		.number()
		.required('시즌을 선택해주세요'),
});

const ItemForm = ({
	initialValues = {name: '', type: '', source: '', item_level: '', season: ''},
	onSubmit,
	isEdit = false
}) => {
	const formik = useFormik({
		initialValues,
		validationSchema,
		onSubmit: values => {
			onSubmit(values);
		},
	});

	return (
		<Paper sx={{ p: 3 }}>
			<Box component="form" onSubmit={formik.handleSubmit} noValidate>
				<Typography variant='h6' gutterBottom>
					{isEdit ? '아이템 정보 수정' : '새 아이템 추가'}
				</Typography>

				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							id="name"
							name="name"
							label="아이템 이름"
							value={formik.values.name}
							onChange={formik.handleChange}
							error={formik.touched.name && Boolean(formik.errors.name)}
							helperText={formik.touched.name && formik.errors.name}
							margin='normal'
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<FormControl fullWidth margin='normal'>
							<InputLabel id="type-label">아이템 종류</InputLabel>
							<Select
								labelId="type-label"
								id="type"
								name="type"
								value={formik.values.type}
								onChange={formik.handleChange}
								error={formik.touched.type && Boolean(formik.errors.type)}
								label="아이템 종류"
							>
								<MenuItem value="" disabled>아이템 종류 선택</MenuItem>
								<MenuItem value="" disabled>- 방어구 -</MenuItem>
                {ITEM_TYPES.filter(type => ['모자', '상의', '장갑', '하의', '신발'].includes(type.value)).map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
                <MenuItem value="" disabled>- 장신구 -</MenuItem>
                {ITEM_TYPES.filter(type => ['귀걸이', '목걸이', '팔찌', '반지1', '반지2'].includes(type.value)).map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
                <MenuItem value="" disabled>- 무기 -</MenuItem>
                {ITEM_TYPES.filter(type => type.value === '무기').map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12} md={6}>
						<FormControl fullWidth margin='normal'>
							<InputLabel id="source-label">아이템 출처</InputLabel>
							<Select
								labelId="source-label"
								id="source"
								name="source"
								value={formik.values.source}
								onChange={formik.handleChange}
								error={formik.touched.source && Boolean(formik.errors.source)}
								label="아이템 출처"
							>
								<MenuItem value="" disabled>아이템 출처 선택</MenuItem>
								{ITEM_SOURCES.map(source => (
									<MenuItem key={source.value} value={source.value}>{source.label}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							id="item_level"
							name="item_level"
							label="아이템 레벨"
							type="number"
							value={formik.values.item_level}
							onChange={formik.handleChange}
							error={formik.touched.item_level && Boolean(formik.errors.item_level)}
							helperText={formik.touched.item_level && formik.errors.item_level}
							margin='normal'
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<Box sx={{ mt: 2 }}>
							<SeasonSelector
								value={formik.values.season}
								onChange={(value) => formik.setFieldValue('season', value)}
								fullWidth
							/>
							{formik.touched.season && formik.errors.season && (
								<Typography color='error' variant='caption'>
									{formik.errors.season}
								</Typography>
							)}
						</Box>
					</Grid>
				</Grid>

				<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
					<Button
						type="submit"
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

export default ItemForm;