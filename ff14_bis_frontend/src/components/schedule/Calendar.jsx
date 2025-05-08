import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  IconButton, 
  Tooltip,
  Badge,
  styled
} from '@mui/material';
import { 
  LocalizationProvider, 
  PickersDay, 
  DateCalendar
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isEqual, isSameMonth, isToday, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';

// 스타일이 지정된 캘린더 날짜 컴포넌트
const StyleDay = styled(PickersDay)(({ theme, isSelected, isHighlighted, hasSchedule, isAdminSchedule }) => ({
  borderRadius: '50%',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  ...(hasSchedule && {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 3,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: isAdminSchedule ? theme.palette.secondary.main : theme.palette.primary.main,
    },
  }),
}));

// 캘린더 날짜 렌더링 함수
const CustomDay = (props) => {
  const {
    day,
    selectedDay,
    scheduleDates,
    adminScheduleDates,
    ...other
  } = props;

  const hasSchedule = scheduleDates.some(date => isSameDay(date, day));
  const isAdminSchedule = adminScheduleDates.some(date => isSameDay(date, day));

  return (
    <StyleDay
      {...other}
      day={day}
      selected={isEqual(day, selectedDay)}
      hasSchedule={hasSchedule}
      isAdminSchedule={isAdminSchedule}
    />
  );
};

const Calendar = ({
  schedules = [],
  selectedDate,
  setSelectedDate,
  onDateClick
}) => {
  // 일정이 있는 날짜들 추출
  const scheduleDates = schedules
    .filter(schedule => !schedule.is_admin_schedule)
    .map(schedule => new Date(schedule.start_time));
  
  // 관리자 일정이 있는 날짜들 추출
  const adminScheduleDates = schedules
    .filter(schedule => schedule.is_admin_schedule)
    .map(schedule => new Date(schedule.start_time));
  
  // 오늘 날짜로 이동
  const handleGotoToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' fontWeight="bold">
            {format(selectedDate, 'yyyy년 M월')}
          </Typography>
          <Box>
            <Tooltip title="오늘">
              <IconButton size='small' onClick={handleGotoToday}>
                <TodayIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => {
            setSelectedDate(newDate);
            if (onDateClick) onDateClick(newDate);
          }}
          slots={{
            day: (props) => (
              <CustomDay
                {...props}
                scheduleDates={scheduleDates}
                adminScheduleDates={adminScheduleDates}
              />
            )
          }}
          sx={{
            '& .MuiPickersDay-root': {
              fontSize: '0.9rem',
              margin: '2px',
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mr: 1
              }}
            />
            <Typography variant='caption'>공대원 일정</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                mr: 1
              }}
            />
            <Typography variant='caption'>공대장 일정</Typography>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default Calendar;