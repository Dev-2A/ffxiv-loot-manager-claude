import api from './index';

// 플레이어 목록 가져오기
export const getPlayers = async (params = {}) => {
    const response = await api.get('/players/', { params });
    return response.data;
};

// 단일 플레이어 가져오기
export const getPlayer = async (id) => {
    const response = await api.get(`/players/${id}/`);
    return response.data;
};

// 플레이어 생성
export const createPlayer = async (playerData) => {
    const response = await api.post('/players/', playerData);
    return response.data;
};

// 플레이어 수정
export const updatePlayer = async (id, playerData) => {
    const response = await api.put(`/players/${id}/`, playerData);
    return response.data;
};

// 플레이어 삭제
export const deletePlayer = async (id) => {
    const response = await api.delete(`/players/${id}/`);
    return response.data;
};

// 플레이어의 비스 세트 가져오기
export const getPlayerBisSets = async (id, params = {}) => {
    const response = await api.get(`/players/${id}/bis_sets/`, { params });
    return response.data;
};