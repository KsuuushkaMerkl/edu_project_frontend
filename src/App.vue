<template>
  <div>
    <AppHeader v-if="auth.user" />
    <router-view class="page-container" />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './store/auth'
const auth = useAuthStore()
</script>

<style scoped>
.page-container{
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  padding-top: 72px;
}
</style>
