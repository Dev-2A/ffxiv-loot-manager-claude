import api from './index';

// 일정 목록 가져오기
export const getSchedules = async (params = {}) => {
  const response = await api.get('/schedules/', { params });
  return response.data;
};

// 내 일정 가져오기
export const getMySchedules = async (params = {}) => {
  const response = await api.get('/schedules/my_schedules/', { params });
  return response.data;
};

// 특정 기간 일정 가져오기
export const getSchedulesByDateRange = async (startDate, endDate) => {
  const params = {
    start_date: startDate,
    end_date: endDate
  };
  const response = await api.get('/schedules/', { params });
  return response.data;
};

// 단일 일정 가져오기
export const getSchedule = async (id) => {
  const response = await api.get(`/schedules/${id}/`);
  return response.data;
};

// 일정 생성
export const createSchedule = async (scheduleData) => {
  const response = await api.post('/schedules/', scheduleData);
  return response.data;
};

// 일정 수정
export const updateSchedule = async (id, scheduleData) => {
  const response = await api.put(`/schedules/${id}/`, scheduleData);
  return response.data;
};

// 일정 삭제
export const deleteSchedule = async (id) => {
  const response = await api.delete(`/schedules/${id}/`);
  return response.data;
};