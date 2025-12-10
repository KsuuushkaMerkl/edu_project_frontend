// src/store/auth.js
import {defineStore} from 'pinia'
import {save, load, remove} from '../utils/persist'
import {
    apiLogin,
    apiRegister,
    apiGetMe,
    apiUpdateProfile,
    apiChangePassword,
    apiDeleteMe
} from '../services/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: load('user', null),
        token: load('token', null)
    }),
    actions: {
        async register({email, name, role, password}) {
            try {
                const response = await apiRegister({email, name, role, password})
                return true
            } catch (e) {
                console.error('register error', e)
                return false
            }
        },
        async login(email, password) {
            try {
                const params = new URLSearchParams()
                params.append('username', email)
                params.append('password', password)

                const response = await apiLogin({
                    email,
                    password
                })

                const data = response.data

                this.user = data.user
                this.token = data.access_token

                save('user', this.user)
                save('token', this.token)

                return true
            } catch (e) {
                console.error('login error', e)
                return false
            }
        },
        logout() {
            this.user = null
            this.token = null
            remove('user')
            remove('token')
        },
        hasRole(...roles) {
            return this.user && roles.includes(this.user.role)
        },
        async fetchProfile() {
            if (!this.token) return
            try {
                const response = await apiGetMe(this.token)
                this.user = response.data
                save('user', this.user)
            } catch (e) {
                console.error('fetchProfile error', e)
            }
        },
        async updateProfile({name, role}) {
            if (!this.token) return false
            try {
                const response = await apiUpdateProfile(this.token, {name, role})
                this.user = response.data
                save('user', this.user)
                return true
            } catch (e) {
                console.error('updateProfile error', e)
                return false
            }
        },
        async changePassword(oldPassword, newPassword) {
            if (!this.token) return false
            try {
                await apiChangePassword(this.token, {
                    old_password: oldPassword,
                    new_password: newPassword
                })
                return true
            } catch (e) {
                console.error('changePassword error', e)
                return false
            }
        },
        async deleteAccount() {
            if (!this.token) return false
            try {
                await apiDeleteMe(this.token)
                this.logout()
                return true
            } catch (e) {
                console.error('deleteAccount error', e)
                return false
            }
        }
    }
})
