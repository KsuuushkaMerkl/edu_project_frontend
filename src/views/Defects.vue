<template>
  <div>
      <div class="row" style="align-items:center">
      <h2 class="col">Дефекты</h2>
      <div class="row" style="gap:8px">
        <button class="ghost" @click="toggleSelect">
          {{ selectionMode ? 'Выйти из выбора' : 'Выбрать' }}
        </button>
        <router-link to="/defects/new">
          <button>+ Создать дефект</button>
        </router-link>
      </div>
    </div>

    <div class="row card" style="margin-bottom:12px">
      <input
          class="col"
          v-model="query"
          placeholder="Поиск по заголовку/описанию"
          aria-label="Поиск"
      />
      <select class="col select-nudge" v-model="statusFilter" aria-label="Фильтр по статусу">
        <option value="">Все статусы</option>
        <option>Новая</option>
        <option>В работе</option>
        <option>На проверке</option>
        <option>Закрыта</option>
        <option>Отменена</option>
      </select>
      <select class="col select-nudge" v-model="sortBy" aria-label="Сортировка">
        <option value="created_desc">Сначала новые</option>
        <option value="created_asc">Сначала старые</option>
      </select>
      <div class="col" style="display:flex; gap:8px; justify-content:flex-end">
        <button class="ghost" type="button" @click="exportCSV">Экспорт CSV</button>
        <button class="ghost" type="button" @click="exportXLSX">Экспорт Excel</button>
      </div>
    </div>

    <div
        v-if="selectionMode"
        class="row card"
        style="margin-bottom:12px; align-items:center"
    >
      <div class="col">
        <template v-if="selected.size">Выбрано дефектов: <strong>{{ selected.size }}</strong></template>
        <template v-else>Режим выбора активен</template>
      </div>

      <button class="ghost" type="button" @click="selectAllFiltered" :disabled="!filtered.length">
        Выбрать всё ({{ filtered.length }})
      </button>
      <button class="ghost" type="button" @click="clearSelection" :disabled="!selected.size">
        Снять выделение
      </button>
      <button class="danger" type="button" @click="confirmOpen = true" :disabled="!selected.size">
        Удалить выбранные
      </button>
    </div>

    <div v-if="filtered.length === 0" class="card">
      <small>По заданным условиям ничего не найдено.</small>
    </div>

    <div v-for="d in filtered" :key="d.id" class="card defect-row">
      <input
          v-if="selectionMode"
          type="checkbox"
          class="row-check-left"
          :checked="selected.has(d.id)"
          @change="onSelect(d.id, $event.target.checked)"
          :aria-label="`Выбрать дефект ${d.title}`"
          style="left:12px; top:12px"
      />

      <div
          class="left clickable"
          @click="selectionMode ? toggleSelectItem(d.id) : open(d.id)"
      >
        <div class="row" style="align-items:flex-start">
          <img v-if="firstImage(d)" class="thumb-xs" :src="firstImage(d)" alt="превью"/>
          <div class="col">
            <div class="title">{{ d.title }}</div>
            <div class="desc">{{ d.desc || '—' }}</div>
            <div class="meta">
              <span class="badge">Приоритет: {{ d.priority }}</span>
              <span class="badge" v-if="d.assignee">Исполнитель: {{ d.assignee }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <label class="muted">Статус</label>
        <select
            class="select-nudge"
            v-model="d.status"
            @change="store.updateStatus(d.id, d.status)"
        >
          <option>Новая</option>
          <option>В работе</option>
          <option>На проверке</option>
          <option>Закрыта</option>
          <option>Отменена</option>
        </select>
      </div>
    </div>

    <ConfirmModal
        :open="confirmOpen"
        title="Удалить выбранные дефекты?"
        :message="`Будет удалено: ${selected.size}. Это действие необратимо.`"
        ok-text="Удалить"
        @cancel="confirmOpen = false"
        @ok="deleteSelected"
    />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue'
import {useRouter} from 'vue-router'

import {useDefectsStore} from '../store/defects'
import {downloadCSV} from '../utils/csv'
import {downloadXLSX} from '../utils/excel'

import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const store = useDefectsStore()

const query = ref('')
const statusFilter = ref('')
const sortBy = ref('created_desc')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = (store.defects || []).filter(d => {
    const okText = q ? (d.title + ' ' + (d.desc || '')).toLowerCase().includes(q) : true
    const okStatus = statusFilter.value ? d.status === statusFilter.value : true
    return okText && okStatus
  })
  switch (sortBy.value) {
    case 'created_asc':
      list.sort((a, b) => a.id - b.id);
      break
    case 'created_desc':
      list.sort((a, b) => b.id - a.id);
      break
  }
  return list
})

function firstImage(d) {
  const img = (d.attachments || []).find(a => (a.type || '').startsWith('image/'))
  return img ? img.content : ''
}

function exportCSV() {
  const rows = (store.defects || []).map(d => ({
    id: d.id,
    title: d.title,
    desc: d.desc,
    status: d.status,
    priority: d.priority,
    assignee: d.assignee,
    due: d.due,
    attachments: d.attachments?.length || 0
  }))
  downloadCSV('defects.csv', rows)
}

function exportXLSX() {
  const rows = (store.defects || []).map(d => ({
    id: d.id,
    title: d.title,
    desc: d.desc,
    status: d.status,
    priority: d.priority,
    assignee: d.assignee,
    due: d.due,
    attachments: d.attachments?.length || 0
  }))
  downloadXLSX('defects.xlsx', rows)
}

function open(id) {
  router.push(`/defects/${id}`)
}

const selectionMode = ref(false)
const selected = ref(new Set())
const confirmOpen = ref(false)

function toggleSelect() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selected.value.clear() // выходим — снимаем выбор
    confirmOpen.value = false
  }
}

function onSelect(id, checked) {
  checked ? selected.value.add(id) : selected.value.delete(id)
}

function toggleSelectItem(id) {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
}

function clearSelection() {
  selected.value.clear()
}

function selectAllFiltered() {
  selected.value.clear()
  filtered.value.forEach(d => selected.value.add(d.id))
}

function deleteSelected() {
  selected.value.forEach(id => {
    if (typeof store.removeDefect === 'function') store.removeDefect(id)
    else if (typeof store.deleteDefect === 'function') store.deleteDefect(id)
    else store.defects = (store.defects || []).filter(x => x.id !== id)
  })
  selected.value.clear()
  confirmOpen.value = false
  selectionMode.value = false
}

function onKeyDown(e) {
  if (selectionMode.value && e.key === 'Escape') {
    e.preventDefault()
    selectionMode.value = false
    selected.value.clear()
    return
  }
  const isSelectAll = (e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')
  if (selectionMode.value && isSelectAll) {
    e.preventDefault()
    selectAllFiltered()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.defect-row {
  position: relative;
  display: flex;
  gap: 18px;
  align-items: stretch;
  justify-content: space-between;
}

.left {
  flex: 1;
  min-width: 0;
  padding-left: 6px
}

.right {
  width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start
}

.clickable {
  cursor: pointer
}

.title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 1.05rem
}

.desc {
  color: var(--muted);
  margin-bottom: 6px
}

.meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px
}

.thumb-xs {
  width: 84px;
  height: 84px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--wine-200)
}
</style>
