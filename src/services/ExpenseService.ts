import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default {
    getExpenses() {
        return apiClient.get('/expenses');
    },

    // Agregamos ': any' para que TS sepa que puede recibir cualquier cosa
    createExpense(expenseData: any) {
        return apiClient.post('/expenses', expenseData);
    },

    // El ID puede ser número o texto
    deleteExpense(id: number | string) {
        return apiClient.delete(`/expenses/${id}`);
    }
};