// This works now!
import api from '../../../config/api'; 

export const fetchItems = async () => {
    // This effectively calls: http://127.0.0.1:8000/test-crud/
    const response = await api.get('/test-crud/'); 
    return response.data;
};