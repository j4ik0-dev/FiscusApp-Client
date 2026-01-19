import axios from 'axios';
import AuthService from './AuthService'; // Asegúrate de importar esto para saber si hay token

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// --- INTERCEPTOR MÁGICO ---
// Antes de hacer CUALQUIER petición, inyectamos el token
apiClient.interceptors.request.use(config => {
    const token = AuthService.getToken(); // Obtenemos el token guardado
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
    getExpenses() {
        return apiClient.get('/expenses');
    },
    createExpense(expenseData: any) {
        return apiClient.post('/expenses', expenseData);
    },
    updateExpense(id: number, expenseData: any) {
        return apiClient.put(`/expenses/${id}`, expenseData);
    },
    deleteExpense(id: number | string) {
        return apiClient.delete(`/expenses/${id}`);
    }
};