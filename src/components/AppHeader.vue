<!-- src/components/AppHeader.vue -->
<template>
  <header class="header">
    <h1>Центр дефектов</h1>
    <nav>
      <router-link to="/dashboard">Главная</router-link>
      <router-link to="/projects">Проекты</router-link>
      <router-link to="/defects">Дефекты</router-link>
      <router-link to="/board">Канбан</router-link>
      <router-link to="/reports">Отчёты</router-link>
      <router-link to="/profile">Профиль</router-link> <!-- ← это -->
    </nav>
  </header>
</template>

<style scoped>
.header {
  background: var(--wine-500);
  color: var(--text-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1.2rem;
}

nav a {
  color: var(--text-light);
  margin-left: 1rem;
}

nav a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
