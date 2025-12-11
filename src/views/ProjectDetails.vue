<template>
  <div v-if="p" class="details">
    <div class="row" style="align-items:center">
      <h2 class="col">Проект: {{ p.name }}</h2>
      <div class="row" style="gap:8px; justify-content:flex-end">
        <router-link to="/projects">
          <button class="ghost">← Ко всем проектам</button>
        </router-link>
        <button v-if="!isEditing" class="ghost" @click="startEdit">Редактировать</button>
        <button v-if="isEditing" class="ghost" @click="cancelEdit">Отмена</button>
        <button v-if="isEditing" @click="save">Сохранить</button>
        <button v-if="isEditing" class="danger" @click="remove">Удалить проект</button>
      </div>
    </div>

    <div class="row">
      <div class="card col">
        <h3>Основное</h3>

        <template v-if="!isEditing">
          <div class="kv">
            <div class="k">Название</div>
            <div class="v">{{ p.name }}</div>
            <div class="k">Описание</div>
            <div class="v">{{ p.description || '—' }}</div>
            <div class="k">Этапов</div>
            <div class="v">{{ (p.stages?.length || 0) }}</div>
          </div>
        </template>

        <template v-else>
          <input v-model="form.name" placeholder="Название"/>
          <textarea v-model="form.description" placeholder="Описание"></textarea>

          <label class="muted" style="margin-top:8px">Добавить этап</label>
          <div class="row">
            <select class="col select-nudge" v-model="stageToAdd" aria-label="Этап">
              <option disabled value="">Выбрать этап</option>
              <option v-for="opt in settings.stageOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <button class="ghost" type="button" @click="addStage">Добавить</button>
          </div>

          <ul class="stages-list">
            <li v-for="s in (p.stages || [])" :key="s.id" class="stage-pill">
              • {{ s.title }}
              <button class="chip-x" type="button" @click="store.removeStage(p.id, s.id)">×</button>
            </li>
          </ul>
        </template>
      </div>

      <div class="card col">
        <h3>Вложения</h3>

        <AttachmentUploader v-if="isEditing" @files="files => store.attachFiles(p.id, files)"/>

        <div v-if="imageFiles.length" class="thumbs" style="margin-top:10px">
          <figure v-for="(img,i) in imageFiles" :key="i" class="thumb">
            <img :src="img.content" :alt="'Фото '+(i+1)"/>
            <figcaption class="thumb-bar">
              <a class="btn-ghost" :href="img.content" :download="img.name">Скачать</a>
              <button v-if="isEditing" class="btn-ghost" @click="store.removeAttachment(p.id, img.name)">Удалить
              </button>
            </figcaption>
          </figure>
        </div>

        <ul v-if="otherFiles.length" class="files">
          <li v-for="(f,i) in otherFiles" :key="i">
            <a :href="f.content" :download="f.name">{{ f.name }}</a> — {{ pretty(f.size) }}
            <button v-if="isEditing" class="btn-ghost" @click="store.removeAttachment(p.id, f.name)">Удалить</button>
          </li>
        </ul>

        <div v-if="!p.attachments.length" class="muted"><small>Нет вложений</small></div>
      </div>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="card col">
        <h3>История изменений</h3>
        <ul>
          <li v-for="(h,i) in (p.history || [])" :key="i">
            {{ fmt(h.ts) }} — <strong>{{ label(h.action) }}</strong>
            <template v-if="h.action==='stage_add'">: {{ h.payload.title }}</template>
            <template v-else-if="h.action==='stage_remove'">: {{ h.payload.title }}</template>
            <template v-else-if="h.action==='attach'">: добавлено файлов — {{ h.payload.count }}</template>
            <template v-else-if="h.action==='detach'">: удалено — {{ h.payload.name }}</template>
            <template v-else-if="h.action==='create'">: создан</template>
            <template v-else-if="h.action==='update'">: изменён</template>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="card"><small>Проект не найден.</small></div>
</template>

<script setup>
import {reactive, ref, computed, watchEffect} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useProjectsStore} from '../store/projects'
import {useSettingsStore} from '../store/settings'
import AttachmentUploader from '../components/AttachmentUploader.vue'

const route = useRoute()
const router = useRouter()
const store = useProjectsStore()
const settings = useSettingsStore()

const p = store.getById(route.params.id)

const isEditing = ref(false)
const form = reactive({name: p?.name || '', description: p?.description || ''})

function startEdit() {
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  const cur = store.getById(route.params.id)
  form.name = cur.name;
  form.description = cur.description || ''
}

function save() {
  store.updateProject(p.id, {name: form.name.trim(), description: form.description.trim()});
  isEditing.value = false
}

function remove() {
  if (confirm('Удалить проект безвозвратно?')) {
    store.deleteProject(p.id)
    router.push('/projects')
  }
}

const stageToAdd = ref('')

function addStage() {
  if (!stageToAdd.value) return;
  store.addStage(p.id, stageToAdd.value);
  stageToAdd.value = ''
}

const imageFiles = computed(() => (p?.attachments || []).filter(a => (a.type || '').startsWith('image/')))
const otherFiles = computed(() => (p?.attachments || []).filter(a => !(a.type || '').startsWith('image/')))

function pretty(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

watchEffect(() => {
  const cur = store.getById(route.params.id)
  if (cur && !isEditing.value) {
    form.name = cur.name;
    form.description = cur.description || ''
  }
})

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

function label(a) {
  return ({
    create: 'создание',
    update: 'изменение',
    attach: 'вложения',
    detach: 'удаление файла',
    stage_add: 'добавлен этап',
    stage_remove: 'удалён этап'
  })[a] || a
}
</script>

<style scoped>
.details h3 {
  margin-top: 0
}

.kv {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 8px 12px
}

.kv .k {
  color: var(--muted)
}

.stages-list {
  margin-top: 8px;
  padding-left: 0;
  list-style: none;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stage-pill {
  background: var(--wine-100);
  border: 1px solid var(--wine-200);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chip-x {
  border: none;
  background: transparent;
  color: var(--wine-700);
  cursor: pointer;
  line-height: 1;
  font-size: 1rem;
  padding: 0 2px;
}

.chip-x:hover {
  color: var(--wine-800)
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px
}

.thumb {
  margin: 0;
  border: 1px solid var(--wine-200);
  border-radius: 12px;
  overflow: hidden;
  background: #fff
}

.thumb img {
  display: block;
  width: 100%;
  height: 140px;
  object-fit: cover
}

.thumb-bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 6px 8px
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: .85rem;
  border: 1px solid var(--wine-300);
  background: transparent;
  color: var(--wine-600);
  text-decoration: none;
  cursor: pointer;
}

.btn-ghost:hover {
  background: var(--wine-100)
}

.files {
  margin-top: 8px
}

.files li {
  margin: 4px 0
}
</style>
