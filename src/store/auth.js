import { defineStore } from 'pinia';
import { apiLogin, apiRegister } from '../services/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),
    actions: {
        async login(email, password) {
            try {
                const response = await apiLogin({ email, password });
                this.user = response.data.user;
                this.token = response.data.access_token;

                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('token', this.token);

                return true;
            } catch (error) {
                console.error('Login failed', error);
                return false;
            }
        },
        async register({ email, name, role, password }) {
            try {
                const response = await apiRegister({ email, name, role, password });
                return true;
            } catch (error) {
                console.error('Registration failed', error);
                return false;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
});
