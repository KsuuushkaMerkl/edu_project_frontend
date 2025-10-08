<template>
  <div>
    <h2>Канбан-доска</h2>
    <p><small>Перетаскивайте карточки между колонками для смены статуса.</small></p>

    <div class="kanban">
      <section
          v-for="col in columns"
          :key="col"
          class="kanban-col"
      >
        <h3>{{ col }}</h3>

        <div
            class="kanban-drop"
            :class="{ over: overCol === col }"
            @dragover.prevent="over(col)"
            @dragleave="leave"
            @drop="drop(col)"
        >
          <article
              v-for="d in byStatus(col)"
              :key="d.id"
              class="kanban-card"
              draggable="true"
              @dragstart="drag(d.id)"
              @click="open(d.id)"
          >
            <div class="title">{{ d.title }}</div>
            <div class="desc">{{ d.desc || '—' }}</div>
            <div class="meta">
              <span class="badge">Приоритет: {{ d.priority }}</span>
              <span class="badge" v-if="d.assignee" style="margin-left:6px">{{ d.assignee }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div style="margin-top:12px">
      <router-link class="ghost" to="/defects">Перейти ко всем дефектам</router-link>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useDefectsStore} from '../store/defects'

const router = useRouter()
const store = useDefectsStore()

const columns = ['Новая', 'В работе', 'На проверке', 'Закрыта', 'Отменена']

function byStatus(s) {
  return store.defects.filter(d => d.status === s)
}

let draggingId = null
const overCol = ref(null)

function drag(id) {
  draggingId = id
}

function over(col) {
  overCol.value = col
}

function leave() {
  overCol.value = null
}

function drop(col) {
  if (draggingId != null) {
    store.updateStatus(draggingId, col)
  }
  draggingId = null
  overCol.value = null
}

function open(id) {
  router.push(`/defects/${id}`)
}
</script>

<style scoped>
.kanban {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--gap);
}

.kanban-col {
  background: var(--card-bg);
  border: 1px solid var(--wine-200);
  border-radius: var(--radius);
  padding: 12px;
  box-shadow: var(--shadow);
  min-height: 320px;
}

.kanban-col h3 {
  text-align: center;
  margin: 0 0 8px;
  font-size: 1rem;
}

.kanban-drop {
  min-height: 260px;
  border-radius: 12px;
  padding: 8px;
  outline: 2px dashed transparent;
  transition: outline-color .2s ease, background .2s ease;
}

.kanban-drop.over {
  outline-color: var(--wine-300);
  background: var(--wine-50);
}

.kanban-card {
  background: #fff;
  border: 1px solid var(--wine-200);
  border-radius: 12px;
  padding: 10px;
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .04);
  cursor: grab;
  user-select: none;
}

.kanban-card .title {
  font-weight: 700;
  margin-bottom: 4px
}

.kanban-card .desc {
  color: var(--muted);
  font-size: .9rem;
  margin-bottom: 6px
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px
}

@media (max-width: 960px) {
  .kanban {
    grid-template-columns: repeat(2, 1fr)
  }
}

@media (max-width: 640px) {
  .kanban {
    grid-template-columns: 1fr
  }
}
</style>
