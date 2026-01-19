import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default {
    // Login
    async login(credentials: any) {
        const response = await apiClient.post('/login', credentials);
        // Guardamos el token en el almacenamiento del celular/navegador
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Registro
    async register(userData: any) {
        const response = await apiClient.post('/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Cerrar Sesión
    async logout() {
        try {
            // Intentamos avisar al backend
            await apiClient.post('/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (e) {
            console.error(e);
        } finally {
            // Borramos el token localmente sí o sí
            localStorage.removeItem('token');
        }
    },

    // Verificar si ya iniciamos sesión
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // Obtener el token para usarlo en otras peticiones
    getToken() {
        return localStorage.getItem('token');
    }
};