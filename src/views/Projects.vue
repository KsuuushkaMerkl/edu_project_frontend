<template>
  <div>
    <div class="row" style="align-items:center">
      <h2 class="col">Проекты</h2>
      <div class="row" style="gap:8px">
        <button class="ghost" @click="toggleSelect">
          {{ selectionMode ? 'Выйти из выбора' : 'Выбрать' }}
        </button>
        <router-link to="/projects/new">
          <button>+ Создать проект</button>
        </router-link>
      </div>
    </div>

    <div class="row card" style="margin-bottom:12px">
      <input class="col" v-model="query" placeholder="Поиск по названию/описанию" aria-label="Поиск"/>
      <select class="col select-nudge" v-model="stageFilter" aria-label="Фильтр по этапу">
        <option value="">Все этапы</option>
        <option v-for="opt in settings.stageOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <select class="col select-nudge" v-model="sortBy" aria-label="Сортировка">
        <option value="created_desc">Сначала новые</option>
        <option value="created_asc">Сначала старые</option>
        <option value="name_asc">По названию (А→Я)</option>
        <option value="name_desc">По названию (Я→А)</option>
      </select>
      <div class="col" style="display:flex; gap:8px; justify-content:flex-end">
        <button class="ghost" type="button" @click="exportCSV">Экспорт CSV</button>
        <button class="ghost" type="button" @click="exportXLSX">Экспорт Excel</button>
      </div>
    </div>

    <div v-if="selectionMode" class="row card" style="margin-bottom:12px; align-items:center">
      <div class="col">
        <template v-if="selected.size">Выбрано проектов: <strong>{{ selected.size }}</strong></template>
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

    <div v-if="filtered.length === 0" class="card"><small>По заданным условиям ничего не найдено.</small></div>

    <div v-for="p in filtered" :key="p.id" class="card project-row">
      <input
          v-if="selectionMode"
          type="checkbox"
          class="row-check"
          :checked="selected.has(p.id)"
          @change="onSelect(p.id, $event.target.checked)"
          :aria-label="`Выбрать проект ${p.name}`"
          style="right:12px; top:12px"
      />

      <div
          class="left clickable"
          @click="selectionMode ? toggleSelectItem(p.id) : open(p.id)"
      >
        <div class="row" style="align-items:flex-start">
          <img v-if="firstImage(p)" class="thumb-xs" :src="firstImage(p)" alt="превью"/>
          <div class="col">
            <div class="title">{{ p.name }}</div>
            <div class="desc">{{ p.description || '—' }}</div>
            <div class="meta">
              <span class="badge" v-if="(p.stages?.length||0) > 0">Этапов: {{ p.stages.length }}</span>
              <span class="badge" v-if="(p.attachments?.length||0) > 0">Вложений: {{ p.attachments.length }}</span>
            </div>
            <ul class="stages-list">
              <li v-for="s in (p.stages || []).slice(0,4)" :key="s.id" class="stage-pill">• {{ s.title }}</li>
              <li v-if="(p.stages?.length||0) > 4" class="stage-pill">+{{ p.stages.length - 4 }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="right">
        <label class="muted">Добавить этап</label>
        <div class="row" style="gap:8px">
          <select
              class="select-nudge col"
              v-model="stageSelect[p.id]"
              aria-label="Этап"
          >
            <option disabled value="">Выбрать этап</option>
            <option v-for="opt in settings.stageOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
          <button
              class="ghost"
              type="button"
              title="Добавить этап в проект"
              @click.stop="addStage(p.id)"
              :disabled="!stageSelect[p.id]"
          >
            Добавить
          </button>
        </div>
        <small v-if="!stageSelect[p.id]" class="muted">Выберите этап из списка</small>
      </div>
    </div>

    <ConfirmModal
        :open="confirmOpen"
        title="Удалить выбранные проекты?"
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
import {useProjectsStore} from '../store/projects'
import {useSettingsStore} from '../store/settings'
import {downloadCSV} from '../utils/csv'
import {downloadXLSX} from '../utils/excel'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const store = useProjectsStore()
const settings = useSettingsStore()

const query = ref('')
const stageFilter = ref('')
const sortBy = ref('created_desc')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = (store.projects || []).filter(p => {
    const okText = q ? (p.name + ' ' + (p.description || '')).toLowerCase().includes(q) : true
    const okStage = stageFilter.value ? (p.stages || []).some(s => s.title === stageFilter.value) : true
    return okText && okStage
  })
  switch (sortBy.value) {
    case 'created_asc':
      list.sort((a, b) => a.id - b.id);
      break
    case 'created_desc':
      list.sort((a, b) => b.id - a.id);
      break
    case 'name_asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break
    case 'name_desc':
      list.sort((a, b) => b.name.localeCompare(a.name));
      break
  }
  return list
})

const stageSelect = ref({})

function addStage(projectId) {
  const val = stageSelect.value[projectId]
  if (!val) return

  if (typeof store.addStage === 'function') {
    store.addStage(projectId, val)
  } else {
    const p = (store.projects || []).find(x => x.id === projectId)
    if (p) {
      p.stages = p.stages || []
      p.stages.push({id: Date.now(), title: val})
    }
  }

  stageSelect.value[projectId] = ''
}

function firstImage(p) {
  const img = (p.attachments || []).find(a => (a.type || '').startsWith('image/'))
  return img ? img.content : ''
}

function exportCSV() {
  const rows = (store.projects || []).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    stages: (p.stages || []).map(s => s.title).join(' | '),
    attachments: p.attachments?.length || 0
  }))
  downloadCSV('projects.csv', rows)
}

function exportXLSX() {
  const rows = (store.projects || []).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    stages: (p.stages || []).map(s => s.title).join(' | '),
    attachments: p.attachments?.length || 0
  }))
  downloadXLSX('projects.xlsx', rows)
}

function open(id) {
  router.push(`/projects/${id}`)
}

const selectionMode = ref(false)
const selected = ref(new Set())
const confirmOpen = ref(false)

function toggleSelect() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selected.value.clear()
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
  filtered.value.forEach(p => selected.value.add(p.id))
}

function deleteSelected() {
  selected.value.forEach(id => store.deleteProject(id))
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
.project-row {
  position: relative;
  display: flex;
  gap: 18px;
  align-items: stretch;
  justify-content: space-between
}

.left {
  flex: 1;
  min-width: 0
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

.stages-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 8px;
  flex-wrap: wrap
}

.stage-pill {
  background: var(--wine-100);
  border: 1px solid var(--wine-200);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .9rem
}
</style>
