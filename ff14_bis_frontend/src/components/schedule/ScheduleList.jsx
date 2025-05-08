import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider,
  Chip,
  Tooltip,
  Avatar
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useAuth } from '../../contexts/AuthContext';

const ScheduleList = ({
  schedules = [],
  selectedDate,
  onEditSchedule,
  onDeleteSchedule
}) => {
  const { currentUser, isAdmin } = useAuth();

  // 반복 유형을 한글로 변환
  const getRepeatTypeLabel = (repeatType) => {
    switch (repeatType) {
      case 'daily': return '매일';
      case 'weekly': return '매주';
      case 'monthly': return '매월';
      default: return '반복 없음';
    }
  };

  // 요일 번호를 한글로 변환
  const getDayLabel = (dayNum) => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return days[dayNum - 1] || '';
  };

  // 반복 일정의 요일 표시 생성
  const getRepeatDaysLabel = (repeatDays) => {
    if (!repeatDays) return '';

    return repeatDays.split(',')
      .map(d => getDayLabel(parseInt(d)))
      .join(', ');
  };

  if (schedules.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <EventIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
        <Typography variant='body1' color="text.secondary">
          선택하신 날짜에 일정이 없습니다.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2 }}>
      <List sx={{ width: '100%', bgcolor: 'background.paper', py: 0 }}>
        {schedules.map((schedule, index) => {
          const isOwner = currentUser && schedule.creator === currentUser.id;
          const canEdit = isOwner || (isAdmin && schedule.is_admin_schedule);
          const startTime = parseISO(schedule.start_time);
          const endTime = parseISO(schedule.end_time);

          return (
            <React.Fragment key={schedule.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems='flex-start'
                secondaryAction={canEdit && (
                  <Box>
                    <Tooltip title="수정">
                      <IconButton edge="end" aria-label='edit' onClick={() => onEditSchedule(schedule)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton edge="end" aria-label="delete" onClick={() => onDeleteSchedule(schedule)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                sx={{ py: 2 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      size='small'
                      label={schedule.is_admin_schedule ? "공대장 일정" : "공대원 일정"}
                      color={schedule.is_admin_schedule ? "secondary" : "primary"}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant='body2' color="text.secondary">
                      {format(startTime, 'a h:mm', { locale: ko })} = {format(endTime, 'a h:mm', { locale: ko })}
                    </Typography>

                    {schedule.repeat_type !== 'none' && (
                      <Tooltip title={`${getRepeatTypeLabel(schedule.repeat_type)} ${getRepeatDaysLabel(schedule.repeat_days)}`}>
                        <RepeatIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                      </Tooltip>
                    )}
                  </Box>

                  <Typography variant='subtitle1' fontWeight="medium" gutterBottom>
                    {schedule.title}
                  </Typography>

                  {schedule.description && (
                    <Typography variant='body2' color="text.secondary" sx={{ mb: 1 }}>
                      {schedule.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={schedule.creator_details?.profile_image}
                      alt={schedule.creator_username}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {schedule.creator_username?.[0]}
                    </Avatar>
                    <Typography variant='caption' color='text.secondary'>
                      {schedule.creator_username}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default ScheduleList;