import api from './index';

// 레이드 진행 목록 가져오기
export const getRaidProgresses = async (params = {}) => {
    const response = await api.get('/raid-progress/', { params });
    return response.data;
};

// 단일 레이드 진행 가져오기
export const getRaidProgress = async (id) => {
    const response = await api.get(`/raid-progress/${id}/`);
    return response.data;
};

// 레이드 진행 생성
export const createRaidProgress = async (raidProgressData) => {
    const response = await api.post('/raid-progress/', raidProgressData);
    return response.data;
};

// 레이드 진행 수정
export const updateRaidProgress = async (id, raidProgressData) => {
    const response = await api.put(`/raid-progress/${id}/`, raidProgressData);
    return response.data;
};

// 레이드 진행 삭제
export const deleteRaidProgress = async (id) => {
    const response = await api.delete(`/raid-progress/${id}/`);
    return response.data;
};

// 아이템 획득 목록 가져오기
export const getItemAcquisitions = async (params = {}) => {
    const response = await api.get('/item-acquisitions/', { params });
    return response.data;
};

// 아이템 획득 생성
export const createItemAcquisition = async (itemAcquisitionData) => {
    const response = await api.post('/item-acquisitions/', itemAcquisitionData);
    return response.data;
};

// 우선순위 분배 계산
export const calculateDistributionPriority = async (seasonId) => {
    const response = await api.post('/distribution-priorities/calculate/', { season: seasonId });
    return response.data;
};

// 주간 분배 계획 생성
export const generateDistributionPlan = async (seasonId, weeks = 12) => {
    const response = await api.post('/distribution-priorites/generate_distribution_plan/', {
        season: seasonId,
        weeks
    });
    return response.data;
};

// 분배 우선순위 목록 가져오기
export const getDistributionPriorities = async (params = {}) => {
    const response = await api.get('/distribution-priorities/', { params });
    return response.data;
};