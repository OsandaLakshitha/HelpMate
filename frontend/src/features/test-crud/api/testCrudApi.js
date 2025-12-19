// We import the centralized Axios instance we created earlier
import api from '../../../config/api';

// Base endpoint for this feature
const BASE_URL = '/test-crud';

export const fetchItems = async () => {
    const response = await api.get(`${BASE_URL}/`);
    return response.data;
};

export const createItem = async (data) => {
    const response = await api.post(`${BASE_URL}/`, data);
    return response.data;
};

export const updateItem = async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
};

export const deleteItem = async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};