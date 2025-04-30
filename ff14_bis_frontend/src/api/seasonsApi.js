import api from './index';

// 시즌 목록 가져오기
export const getSeasons = async (params = {}) => {
    const response = await api.get('/seasons/', { params });
    return response.data;
};

// 단일 시즌 가져오기
export const getSeason = async (id) => {
    const response = await api.get(`/seasons/${id}/`);
    return response.data;
};

// 시즌 생성
export const createSeason = async (seasonData) => {
    const response = await api.post('/seasons/', seasonData);
    return response.data;
};

// 시즌 수정
export const updateSeason = async (id, seasonData) => {
    const response = await api.put(`/seasons/${id}/`, seasonData);
    return response.data;
};

// 시즌 삭제
export const deleteSeason = async (id) => {
    const response = await api.delete(`/seasons/${id}/`);
    return response.data;
};

// 시즌에 참여 중인 플레이어 목록 가져오기
export const getSeasonPlayers = async (id) => {
    const response = await api.get(`/seasons/${id}/active_players/`);
    return response.data;
};