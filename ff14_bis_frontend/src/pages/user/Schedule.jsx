import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Alert, 
  Snackbar, 
  useMediaQuery,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, isValid, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CalendarIcon from '@mui/icons-material/CalendarMonth';

import Calendar from '../../components/schedule/Calendar';
import ScheduleList from '../../components/schedule/ScheduleList';
import ScheduleForm from '../../components/schedule/ScheduleForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import { getSchedulesByDateRange, createSchedule, updateSchedule, deleteSchedule } from '../../api/scheduleApi';
import { useAuth } from '../../contexts/AuthContext';

const Schedule = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const { currentUser, isAdmin } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'success' });

  // 선택된 날짜 문자열
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // 1개월 범위의 일정 가져오기
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  const {
    data: schedulesData,
    isLoading: isLoadingSchedules,
    isError: isSchedulesError,
    error: schedulesError,
    refetch: refetchSchedules
  } = useQuery({
    queryKey: ['schedules', format(startOfMonth, 'yyyy-MM-dd'), format(endOfMonth, 'yyyy-MM-dd')],
    queryFn: () => getSchedulesByDateRange(
      format(startOfMonth, 'yyyy-MM-dd'),
      format(endOfMonth, 'yyyy-MM-dd')
    )
  });

  // 선택된 날짜의 일정 필터링
  const daySchedules = (schedulesData?.results || [])
    .filter(schedule => {
      const scheduleDate = parseISO(schedule.start_time);
      return isValid(scheduleDate) && isSameDay(scheduleDate, selectedDate);
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  // 일정 생성 mutation
  const createScheduleMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      // 일정 목록 갱신
      queryClient.invalidateQueries(['schedules']);
      setScheduleDialogOpen(false);
      setAlertInfo({
        show: true,
        message: '일정이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    },
    onError: (error) => {
      setAlertInfo({
        show: true,
        message: `일정 추가 중 오류가 발생했습니다: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // 일정 수정 mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }) => updateSchedule(id, data),
    onSuccess: () => {
      // 일정 목록 갱신
      queryClient.invalidateQueries(['schedules']);
      setScheduleDialogOpen(false);
      setSelectedSchedule(null);
      setAlertInfo({
        show: true,
        message: '일정이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    },
    onError: (error) => {
      setAlertInfo({
        show: true,
        message: `일정 수정 중 오류가 발생했습니다: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // 일정 삭제 mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      // 일정 목록 갱신
      queryClient.invalidateQueries(['schedules']);
      setAlertInfo({
        show: true,
        message: '일정이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    },
    onError: (error) => {
      setAlertInfo({
        show: true,
        message: `일정 삭제 중 오류가 발생했습니다: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // 알림 닫기 핸들러
  const handleCloseAlert = () => {
    setAlertInfo(prev => ({ ...prev, show: false }));
  };

  // 일정 추가 다이얼로그 열기
  const handleOpenAddDialog = () => {
    // 새 일정은 선택된 날짜로 초기화
    const today = new Date(selectedDate);
    const startTime = new Date(today.setHours(9, 0, 0));
    const endTime = new Date(today.setHours(11, 0, 0));

    setSelectedSchedule(null);
    setScheduleDialogOpen(true);
  };

  // 일정 수정 다이얼로그 열기
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleDialogOpen(true);
  };

  // 일정 삭제 확인
  const handleDeleteSchedule = (schedule) => {
    if (window.confirm(`정말로 "${schedule.title}" 일정을 삭제하시겠습니까?`)) {
      deleteScheduleMutation.mutate(schedule.id);
    }
  };

  // 일정 추가/수정 제출
  const handleScheduleSubmit = (scheduleData) => {
    if (selectedSchedule) {
      // 기존 일정 수정
      updateScheduleMutation.mutate({
        id: selectedSchedule.id,
        data: scheduleData
      });
    } else {
      // 새 일정 추가
      createScheduleMutation.mutate(scheduleData);
    }
  };

  // 로딩 상태
  if (isLoadingSchedules) {
    return <Loading message='일정 데이터 로딩 중...' />;
  }

  // 에러 상태
  if (isSchedulesError) {
    return <ErrorMessage error={schedulesError} retry={refetchSchedules} />;
  }

  const schedules = schedulesData?.results || [];

  return (
    <Box>
      <PageHeader
        title="레이드 일정"
        description="FF14 레이드 일정을 관리하고 공유하세요."
        action={
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            새 일정 추가
          </Button>
        }
      />

      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item xs={12} md={4}>
            <Calendar
              schedules={schedules}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Grid>
        )}

        <Grid item xs={12} md={isMobile ? 12 : 8}>
          {isMobile && (
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant='h6' fontWeight="medium">
                    {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {daySchedules.length > 0
                      ? `${daySchedules.length}개의 일정이 있습니다.`
                      : '일정이 없습니다.'
                    }
                  </Typography>
                </Box>
                <Button
                  startIcon={<CalendarIcon />}
                  onClick={() => setSelectedDate(new Date())}
                >
                  오늘
                </Button>
              </Box>
            </Paper>
          )}

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {!isMobile && (
                <Typography variant='h6' fontWeight="bold">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                </Typography>
              )}
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                일정 추가
              </Button>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                fullWidth
                sx={{ display: { xs: 'flex', md: 'none' }, mt: 2 }}
              >
                일정 추가
              </Button>
            </Box>

            {/* 일정 목록 */}
            <ScheduleList
              schedules={daySchedules}
              selectedDate={selectedDate}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </Box>
        </Grid>
      </Grid>

      {/* 일정 추가/수정 다이얼로그 */}
      <ScheduleForm
        open={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false);
          setSelectedSchedule(null);
        }}
        onSubmit={handleScheduleSubmit}
        initialValues={selectedSchedule}
        isEdit={!!selectedSchedule}
      />

      {/* 알림 스낵바 */}
      <Snackbar
        open={alertInfo.show}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          elevation={6}
          variant='filled'
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Schedule;