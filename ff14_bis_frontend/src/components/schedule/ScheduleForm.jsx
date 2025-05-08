import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  FormGroup, 
  Checkbox,
  Typography,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addHours } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// 유효성 검증 스키마
const validationSchema = yup.object({
  title: yup
    .string()
    .required('일정 제목을 입력해주세요')
    .max(100, '제목은 최대 100자까지 입력 가능합니다'),
  start_time: yup
    .date()
    .required('시작 시간을 선택해주세요'),
  end_time: yup
    .date()
    .required('종료 시간을 선택해주세요')
    .min(
      yup.ref('start_time'),
      '종료 시간은 시작 시간보다 이후여야 합니다'
    ),
  repeat_days: yup
    .array()
    .when('repeat_type', {
      is: (value) => value === 'weekly',
      then: (schema) => schema.min(1, '최소 하나의 요일을 선택해주세요'),
      otherwise: (schema) => schema
    })
});

const ScheduleForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false
}) => {
  const { isAdmin } = useAuth();
  const [repeatDays, setRepeatDays] = useState(
    initialValues?.repeat_days
      ? initialValues.repeat_days.split(',').map(d => parseInt(d))
      : []
  );

  // 기본값 설정 (새 일정인 경우)
  const defaultValues = {
    title: '',
    description: '',
    start_time: new Date(),
    end_time: addHours(new Date(), 2),
    is_admin_schedule: false,
    repeat_type: 'none',
    repeat_days: ''
  };

  // 폼 초기화
  const formik = useFormik({
    initialValues: initialValues || defaultValues,
    validationSchema,
    onSubmit: (values) => {
      // 반복 요일 데이터 포맷 변환
      const formattedValues = { ...values };
      if (values.repeat_type === 'weekly' && repeatDays.length > 0) {
        formattedValues.repeat_days = repeatDays.join(',');
      } else {
        formattedValues.repeat_days = '';
      }

      onSubmit(formattedValues);
    },
  });

  // 요일 선택 핸들러
  const handleDayToggle = (day) => {
    setRepeatDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  // 요일 표시
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? '일정 수정' : '새 일정 추가'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="일정 제목"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                margin='normal'
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="일정 설명 (선택사항)"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                margin='normal'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="시작 시간"
                  value={formik.values.start_time}
                  onChange={(newValue) => formik.setFieldValue('start_time', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: formik.touched.start_time && Boolean(formik.errors.start_time),
                      helperText: formik.touched.start_time && formik.errors.start_time
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="종료 시간"
                  value={formik.values.end_time}
                  onChange={(newValue) => formik.setFieldValue('end_time', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: formik.touched.end_time && Boolean(formik.errors.end_time),
                      helperText: formik.touched.end_time && formik.errors.end_time
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin='normal'>
                <InputLabel id="repeat-type-label">반복 설정</InputLabel>
                <Select
                  labelId='repeat-type-label'
                  id='repeat_type'
                  name='repeat_type'
                  value={formik.values.repeat_type}
                  onChange={formik.handleChange}
                  label="반복 설정"
                >
                  <MenuItem value="none">반복 없음</MenuItem>
                  <MenuItem value="daily">매일</MenuItem>
                  <MenuItem value="weekly">매주</MenuItem>
                  <MenuItem value="monthly">매월</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formik.values.repeat_type === 'weekly' && (
              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  반복할 요일 선택
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {dayLabels.map((day, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={repeatDays.includes(index + 1)}
                        onChange={() => handleDayToggle(index + 1)}
                        sx={{ p: 0.5 }}
                      />
                      <Typography variant='caption' display="block">
                        {day}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {formik.touched.repeat_days && formik.errors.repeat_days && (
                  <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.repeat_days}
                  </Typography>
                )}
              </Grid>
            )}

            {isAdmin && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.is_admin_schedule}
                        onChange={(e) => formik.setFieldValue('is_admin_schedule', e.target.checked)}
                        name='is_admin_schedule'
                      />
                    }
                    label="공대장 일정으로 설정"
                  />
                </FormGroup>

                {formik.values.is_admin_schedule && (
                  <Alert severity='info' sx={{ mt: 1 }}>
                    공대장 일정은 모든 공대원에게 표시되며, 공대장만 수정할 수 있습니다.
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type='submit' variant='contained' color='primary'>
            {isEdit ? '저장' : '추가'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ScheduleForm;