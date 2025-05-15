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
        const response = await api.post('/distribution-priorities/calculate/', {
            season: seasonId,
            handle_rings: true // 반지 특별 처리 플래그
        });
        console.log('우선순위 계산 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('우선순위 계산 오류:', error);
        throw error;
    }
};

// 주간 분배 계획 생성
export const generateDistributionPlan = async (seasonId, weeks = 12) => {
    try {
        if (!seasonId) {
            console.error('시즌 ID가 없습니다');
            return { success: false, error: '시즌 ID가 필요합니다' };
        }
        
        console.log(`분배 계획 요청: seasonId=${seasonId}, weeks=${weeks}`);
        const response = await api.post('/distribution-priorities/generate_distribution_plan/', {
            season: seasonId,
            weeks
        });
        console.log('분배 계획 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('분배 계획 생성 오류:', error);
        return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다' };
    }
};

// 분배 우선순위 목록 가져오기
export const getDistributionPriorities = async (params = {}) => {
    console.log('우선순위 데이터 요청 파라미터:', params);
    try {
        const response = await api.get('/distribution-priorities/', { params });
        console.log('우선순위 데이터 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('우선순위 데이터 가져오기 실패:', error);
        throw error;
    }
};

// 분배 계획 수동 업데이트
export const updateDistributionPlan = async (seasonId, week, floor, planData) => {
    try {
        console.log(`분배 계획 수동 업데이트: seasonId=${seasonId}, week=${week}, floor=${floor}`);
        console.log('계획 데이터:', planData);

        const response = await api.post('/distribution-priorities/update_distribution_plan/', {
            season: seasonId,
            week,
            floor,
            plan_data: planData
        });

        console.log('분배 계획 업데이트 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('분배 계획 업데이트 오류:', error);
        throw error; // 에러를 throw하여 mutation에서 처리할 수 있도록 함
    }
};