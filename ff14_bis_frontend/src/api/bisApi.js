import api from './index';

// 비스 세트 목록 가져오기
export const getBisSets = async (params = {}) => {
    const response = await api.get('/bis-sets/', { params });
    return response.data;
};

// 단일 비스 세트 가져오기
export const getBisSet = async (id) => {
    const response = await api.get(`/bis-sets/${id}/`);
    return response.data;
};

// 비스 세트 생성
export const createBisSet = async (bisSetData) => {
    const response = await api.post('/bis-sets/', bisSetData);
    return response.data;
};

// 비스 세트 수정
export const updateBisSet = async (id, bisSetData) => {
    const response = await api.put(`/bis-sets/${id}/`, bisSetData);
    return response.data;
};

// 비스 세트 삭제
export const deleteBisSet = async (id) => {
    const response = await api.delete(`/bis-sets/${id}/`);
    return response.data;
};

// 비스 세트에 아이템 추가
export const addItemToBisSet = async (bisSetId, itemData) => {
    console.log(`addItemToBisSet 호출: bisSetId=${bisSetId}, itemData=`, itemData);
    try {
        const response = await api.post(`/bis-sets/${bisSetId}/add_item/`, itemData);
        console.log('addItemToBisSet 응답:', response.data);
        return response.data;
    } catch (error) {
        console.error('addItemToBisSet 오류:', error);
        throw error;
    }
};

// 비스 아이템 목록 가져오기
export const getBisItems = async (params = {}) => {
    const response = await api.get('/bis-items/', { params });
    return response.data;
};

// 비스 아이템에 마테리쟈 추가
export const addMateriaToBisItem = async (bisItemId, materiaData) => {
    const response = await api.post(`/bis-items/${bisItemId}/add_materia/`, materiaData);
    return response.data;
};

// 비스 아이템의 모든 마테리쟈 제거
export const removeAllMaterias = async (bisItemId) => {
    const response = await api.post(`/bis-items/${bisItemId}/remove_all_materias/`);
    return response.data;
};