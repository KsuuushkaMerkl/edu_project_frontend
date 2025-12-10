import {defineStore} from 'pinia';
import {save, load, remove} from '../utils/persist';
import {
    apiLogin,
    apiRegister,
    apiGetMe,
    apiUpdateProfile,
    apiChangePassword,
    apiDeleteMe
} from '../services/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: load('user', null),
        token: load('token', null)
    }),
    actions: {
        async login(email, password) {
            try {
                const params = new URLSearchParams();
                params.append('username', email); // передаем как 'username'
                params.append('password', password);

                const response = await apiLogin(params); // Передаем форму, а не объект

                const data = response.data;
                this.user = data.user;
                this.token = data.access_token;

                save('user', this.user);
                save('token', this.token);

                return true;
            } catch (e) {
                console.error('login error', e);
                return false;
            }
        },
    },
});