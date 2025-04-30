import api from './index';

// 자원 현황 목록 가져오기
export const getResources = async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
};

// 플레이어의 필요 자원 계산
export const calculatePlayerResources = async (playerId, seasonId) => {
    const response = await api.post('resources/calculate_needs/', {
        player: playerId,
        season: seasonId
    });
    return response.data;
};

// 자원 현황 업데이트
export const updateResource = async (id, resourceData) => {
    const response = await api.put(`/resources/${id}/`, resourceData);
    return response.data;
};