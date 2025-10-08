<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <h2>Вход</h2>
      <form @submit.prevent="onLogin">
        <input v-model="email" placeholder="Email" type="email" required/>
        <input v-model="password" placeholder="Пароль" type="password" required/>
        <button class="w-full">Войти</button>
      </form>

      <p v-if="error" class="mt-8 text-bad">Неверные данные</p>
      <p v-if="justRegistered" class="mt-8 text-ok">Регистрация успешна — войдите.</p>

      <div class="mt-12 muted-line">
        Нет аккаунта?
        <router-link to="/register">Зарегистрироваться</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useAuthStore} from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref(false)
const justRegistered = computed(() => route.query.registered === '1')

function onLogin() {
  const ok = auth.login(email.value, password.value)
  if (ok) router.push('/dashboard')
  else error.value = true
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
  width: 100%
}

.mt-8 {
  margin-top: 8px
}

.mt-12 {
  margin-top: 12px
}

.text-bad {
  color: var(--bad)
}

.text-ok {
  color: var(--ok)
}

.muted-line {
  color: var(--muted)
}
</style>
