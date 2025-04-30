import api from './index';

// 아이템 목록 가져오기
export const getItems = async (params = {}) => {
    const response = await api.get('/items/', { params });
    return response.data;
};

// 단일 아이템 가져오기
export const getItem = async (id) => {
    const response = await api.get(`/items/${id}/`);
    return response.data;
};

// 아이템 생성
export const createItem = async (itemData) => {
    const response = await api.post('/items/', itemData);
    return response.data;
};

// 아이템 수정
export const updateItem = async (id, itemData) => {
    const response = await api.put(`/items/${id}/`, itemData);
    return response.data;
};

// 아이템 삭제
export const deleteItem = async (id) => {
    const response = await api.delete(`/items/${id}/`);
    return response.data;
};