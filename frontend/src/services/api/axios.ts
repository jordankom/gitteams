import axios from 'axios';

// 🌐 Base URL de l'API (configurable via .env)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: false, // on utilise Authorization: Bearer, pas les cookies
});

// 🧩 Intercepteur de requêtes : injecte le token si présent
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🚨 Intercepteur de réponses : si 401, on peut rediriger vers /login (optionnel)
api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            window.location.href = '/login'; // à activer si tu veux forcer la reco
        }
        return Promise.reject(err);
    }
);

export default api;
