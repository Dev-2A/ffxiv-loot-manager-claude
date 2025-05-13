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
    console.log(`우선순위 계산 요청: seasonId=${seasonId}`);
    try {
        const response = await api.post('/distribution-priorities/calculate/', { season: seasonId });
        console.log('우선순위 계산 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('우선순위 계산 오류:', error);
        throw error;
    }
};

// 주간 분배 계획 생성
export const generateDistributionPlan = async (seasonId, weeks = 12) => {
    const response = await api.post('/distribution-priorities/generate_distribution_plan/', {
        season: seasonId,
        weeks
    });
    return response.data;
};

// 분배 우선순위 목록 가져오기
export const getDistributionPriorities = async (params = {}) => {
    console.log('우선순위 데이터 요청 파라미터:', params);
    try {
        const response = await api.get('/distribution-priorities/', { 
            params,
            // 캐싱 방지
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        console.log('우선순위 데이터 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('우선순위 데이터 가져오기 실패:', error);
        throw error;
    }
};