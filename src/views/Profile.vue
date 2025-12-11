<template>
  <div class="col gap-16">
    <div class="card">
      <h2>Профиль пользователя</h2>
      <div v-if="error" class="text-bad" style="margin-top:8px">{{ error }}</div>
      <div v-if="success" class="text-ok" style="margin-top:8px">{{ success }}</div>

      <div class="section-title">Основные данные</div>

      <div class="field">
        <label>Email</label>
        <input type="email" v-model="email" disabled/>
      </div>

      <div class="field">
        <label>Имя</label>
        <input type="text" v-model="name" disabled/>
      </div>

      <div class="field">
        <label>Роль</label>
        <select v-model="role" :disabled="!canChangeRole">
          <option value="admin">Администратор</option>
          <option value="manager">Менеджер</option>
          <option value="engineer">Инженер</option>
          <option value="observer">Наблюдатель</option>
        </select>
      </div>

      <button
          type="button"
          class="ghost"
          @click="updateRole"
          :disabled="!canChangeRole || loading"
      >
        Сохранить профиль
      </button>

      <p v-if="!canChangeRole" class="muted" style="margin-top:8px">
        Роль может изменять только администратор.
      </p>
    </div>

    <div class="card">
      <div class="section-title">Смена пароля</div>

      <div class="field">
        <label>Текущий пароль</label>
        <input type="password" v-model="currentPassword"/>
      </div>

      <div class="field">
        <label>Новый пароль</label>
        <input type="password" v-model="newPassword"/>
      </div>

      <div class="field">
        <label>Повторите новый пароль</label>
        <input type="password" v-model="newPassword2"/>
      </div>

      <button
          type="button"
          @click="updatePassword"
          :disabled="loading"
      >
        Обновить пароль
      </button>
    </div>

    <div class="card">
      <div class="section-title">Опасная зона</div>

      <div class="row" style="gap:8px; flex-wrap:wrap">
        <button
            type="button"
            class="ghost"
            @click="logout"
        >
          Выйти из аккаунта
        </button>

        <button
            type="button"
            class="danger"
            @click="deleteAccount"
            :disabled="loading"
        >
          {{ deleteConfirm ? 'Нажмите ещё раз для удаления' : 'Удалить аккаунт' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import axios from 'axios'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../store/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref('')

const email = ref(auth.user?.email || '')
const name = ref(auth.user?.name || '')
const role = ref(auth.user?.role || '')

const currentPassword = ref('')
const newPassword = ref('')
const newPassword2 = ref('')

const deleteConfirm = ref(false)

const canChangeRole = computed(() => auth.user && auth.user.role === 'admin')

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL
})

function authHeaders() {
  return auth.token
      ? {Authorization: `Bearer ${auth.token}`}
      : {}
}

onMounted(async () => {
  if (!auth.user) {
    router.push('/login')
    return
  }
  try {
    const resp = await api.get('/auth/me', {
      headers: authHeaders()
    })
    const u = resp.data
    email.value = u.email
    name.value = u.name
    role.value = u.role
  } catch (e) {
    console.error('profile me error', e)
  }
})

async function updatePassword() {
  error.value = ''
  success.value = ''

  if (!currentPassword.value || !newPassword.value) {
    error.value = 'Введите текущий и новый пароль'
    return
  }
  if (newPassword.value !== newPassword2.value) {
    error.value = 'Новый пароль и подтверждение не совпадают'
    return
  }

  loading.value = true
  try {
    await api.post(
        '/auth/profile/password',
        {
          old_password: currentPassword.value,
          new_password: newPassword.value
        },
        {headers: authHeaders()}
    )
    success.value = 'Пароль обновлён'
    currentPassword.value = ''
    newPassword.value = ''
    newPassword2.value = ''
  } catch (e) {
    console.error('update password error', e)
    error.value = 'Не удалось обновить пароль'
  } finally {
    loading.value = false
  }
}

async function updateRole() {
  if (!canChangeRole.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const resp = await api.post(
        '/auth/profile/role',
        {role: role.value},
        {headers: authHeaders()}
    )
    const u = resp.data
    auth.user = u
    email.value = u.email
    name.value = u.name
    role.value = u.role
    success.value = 'Роль обновлена'
  } catch (e) {
    console.error('update role error', e)
    error.value = 'Не удалось обновить роль'
  } finally {
    loading.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

async function deleteAccount() {
  if (!deleteConfirm.value) {
    deleteConfirm.value = true
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await api.delete('/auth/profile', {
      headers: authHeaders()
    })
    auth.logout()
    router.push('/login')
  } catch (e) {
    console.error('delete account error', e)
    error.value = 'Не удалось удалить аккаунт'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.col {
  display: flex;
  flex-direction: column;
}

.gap-16 {
  gap: 16px;
}

.field {
  margin-top: 8px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

input,
select {
  width: 100%;
}

.section-title {
  margin-top: 4px;
  margin-bottom: 8px;
  font-weight: 700;
}

.muted {
  color: var(--muted);
  font-size: 0.9rem;
}

.text-bad {
  color: var(--bad);
}

.text-ok {
  color: var(--ok);
}
</style>
