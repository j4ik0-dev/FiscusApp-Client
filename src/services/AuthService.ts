import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// --- ESTA ES LA PARTE QUE FALTABA ---
// Interceptor para inyectar el Token en CADA petición de usuario (Login, Perfil, etc)
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// -------------------------------------

export default {
    // Login
    async login(credentials: any) {
        const response = await apiClient.post('/login', credentials);
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
            await apiClient.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
        }
    },

    // Verificar si hay sesión
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // Obtener Token (útil para otros servicios)
    getToken() {
        return localStorage.getItem('token');
    },

    // --- NUEVAS FUNCIONES DE PERFIL ---

    // Obtener mis datos (Ahora sí enviará el token)
    async getUser() {
        return apiClient.get('/user');
    },

    // Actualizar perfil (Ahora sí enviará el token + la foto)
    async updateProfile(formData: FormData) {
        return apiClient.post('/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Importante para subir archivos
            }
        });
    }
};