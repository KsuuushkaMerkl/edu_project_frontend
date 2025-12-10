<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <h2>Регистрация</h2>
      <form @submit.prevent="onRegister">
        <input v-model="email" type="email" placeholder="Email" required/>
        <input v-model="name" placeholder="Имя" required/>
        <select v-model="role" required>
          <option value="engineer">Инженер</option>
          <option value="manager">Менеджер</option>
          <option value="observer">Наблюдатель</option>
        </select>
        <input v-model="password" type="password" placeholder="Пароль" required/>
        <button class="w-full" :disabled="loading">
          {{ loading ? 'Регистрируем…' : 'Зарегистрироваться' }}
        </button>
      </form>

      <p v-if="err" class="mt-8 text-bad">Такой email уже существует</p>

      <div class="mt-12 muted-line">
        Уже есть аккаунт?
        <router-link to="/login">Войти</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../store/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const name = ref('')
const role = ref('engineer')
const password = ref('')
const err = ref(false)
const loading = ref(false)

async function onRegister() {
  err.value = false
  loading.value = true
  try {
    const ok = await auth.register({
      email: email.value.trim(),
      name: name.value.trim(),
      role: role.value,
      password: password.value,
    })
    if (ok) {
      router.push({path: '/login', query: {registered: '1'}})
    } else {
      err.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: calc(100vh - 48px);
  display: grid;
  place-items: start center;
  padding-top: 48px;
}

.auth-card {
  width: 100%;
  max-width: 520px;
}

.w-full {
  width: 100%;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12 {
  margin-top: 12px;
}

.text-bad {
  color: var(--bad);
}

.muted-line {
  color: var(--muted);
}
</style>
