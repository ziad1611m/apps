import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'https://email-sender.wuaze.com/api', // Change this to your live server API URL
    headers: {
        'Accept': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            const sessionToken = localStorage.getItem('session_token');

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            if (sessionToken) {
                config.headers['X-Session-Token'] = sessionToken;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error code
            const status = error.response.status;

            // Unauthorized - clear auth and redirect to login
            if (status === 401) {
                if (typeof window !== 'undefined') {
                    // Only redirect if not already on auth pages
                    const path = window.location.pathname;
                    if (!path.includes('/login') && !path.includes('/register') && !path.includes('/activation')) {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_data');
                        window.location.href = '/login';
                    }
                }
            }
        } else if (error.request) {
            // No response received (network error or server down)
            console.error('Network Error:', error.request);
            error.message = 'Unable to connect to server. Please check your internet connection.';
        }

        return Promise.reject(error);
    }
);

/**
 * API Helper Functions
 */
export const authAPI = {
    activate: (key) => api.post('/activate.php', { activation_key: key }),
    register: (data) => api.post('/register.php', data),
    verifyEmail: (data) => api.post('/verify-email.php', data),
    login: (data) => api.post('/login.php', data),
    forgotPassword: (data) => api.post('/forgot-password.php', data),
    resendCode: (email) => api.post('/resend-code.php', { email }),
};

export const userAPI = {
    getProfile: () => api.get('/user.php'),
    updateProfile: (data) => api.post('/user.php', { action: 'update_profile', ...data }),

    changePassword: (data) => api.post('/change-password.php', data),
    getNotifications: () => api.get('/notifications.php'),
    deleteNotification: (id) => api.post('/notifications.php', { action: 'delete', id }),
    clearNotifications: () => api.post('/notifications.php', { action: 'clear_all' }),
    getStats: (period) => api.get(`/statistics.php?period=${period}`),
    getSessions: () => api.get('/sessions.php'),
    deleteSession: (id) => api.delete('/sessions.php', { data: { session_id: id } }),
    logout: () => api.delete('/sessions.php', { data: { logout_all: false } }),
};

export const emailAPI = {
    getAccounts: () => api.get('/email-accounts.php'),
    addAccount: (data) => api.post('/email-accounts.php', data),
    updateAccount: (data) => api.put('/email-accounts.php', data),
    deleteAccount: (id) => api.delete(`/email-accounts.php?id=${id}`),
    sendEmail: (data) => api.post('/send-email.php', data),
};

export const templateAPI = {
    getAll: (category, search) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        return api.get(`/templates.php?${params.toString()}`);
    },
    getUserTemplates: () => api.get('/user-templates.php'),
    createTemplate: (data) => api.post('/user-templates.php', data),
    updateTemplate: (data) => api.put('/user-templates.php', data),
    deleteTemplate: (id) => api.delete(`/user-templates.php?id=${id}`),
};

export const settingsAPI = {
    getSocialIcons: () => api.get(`/get-social-icons.php?t=${Date.now()}`),
};

export default api;
