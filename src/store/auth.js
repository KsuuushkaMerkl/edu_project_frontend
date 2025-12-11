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
                const response = await apiLogin({ email, password });

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
        }
    },
});