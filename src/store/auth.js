import {defineStore} from 'pinia'
import bcrypt from 'bcryptjs'
import {save, load, remove} from '../utils/persist'

const DEFAULT_ADMIN = {
    email: 'admin@example.com',
    name: 'Администратор',
    role: 'manager',
    passwordHash: bcrypt.hashSync('admin', 8)
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: load('user', null),
        users: load('users', [DEFAULT_ADMIN])
    }),
    actions: {
        register({email, name, role, password}) {
            if (this.users.find(u => u.email === email)) return false
            const passwordHash = bcrypt.hashSync(password, 8)
            this.users.push({email, name, role, passwordHash})
            save('users', this.users)
            return true
        },
        login(email, password) {
            const u = this.users.find(u => u.email === email)
            if (!u) return false
            if (!bcrypt.compareSync(password, u.passwordHash)) return false
            this.user = {email: u.email, role: u.role, name: u.name}
            save('user', this.user)
            return true
        },
        logout() {
            this.user = null;
            remove('user')
        },
        hasRole(...roles) {
            return this.user && roles.includes(this.user.role)
        },
        setRole(email, role) {
            const u = this.users.find(x => x.email === email)
            if (!u) return
            u.role = role
            save('users', this.users)
            if (this.user && this.user.email === email) {
                this.user.role = role
                save('user', this.user)
            }
        }
    }
})
