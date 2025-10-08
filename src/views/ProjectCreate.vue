<template>
  <div>
    <h2>Создать проект</h2>

    <form class="card" @submit.prevent="create">
      <input v-model="name" placeholder="Название проекта" required/>

      <textarea v-model="desc" placeholder="Описание"></textarea>

      <div class="row" style="align-items:center">
        <select class="col select-nudge" v-model="stageToAdd" aria-label="Этап">
          <option disabled value="">Выбрать этап</option>
          <option v-for="opt in settings.stageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <button class="ghost" type="button" @click="addStage">Добавить этап</button>
      </div>

      <ul class="stages-list">
        <li v-for="(s,i) in preStages" :key="i" class="stage-pill">
          • {{ s }}
          <button class="chip-x" type="button" @click="removeStage(i)" title="Удалить">×</button>
        </li>
      </ul>

      <div class="card" style="margin-top:12px">
        <h3>Вложения</h3>
        <AttachmentUploader @files="onFiles"/>
        <div v-if="images.length" class="thumbs" style="margin-top:10px">
          <figure v-for="(img,i) in images" :key="i" class="thumb">
            <img :src="img.content" :alt="'Фото '+(i+1)"/>
            <figcaption class="thumb-bar">
              <a class="btn-ghost" :href="img.content" :download="img.name">Скачать</a>
              <button class="btn-ghost" type="button" @click="removeAttachment(img.name)">Удалить</button>
            </figcaption>
          </figure>
        </div>
        <ul v-if="other.length" class="files">
          <li v-for="(f,i) in other" :key="i">
            <a :href="f.content" :download="f.name">{{ f.name }}</a> — {{ pretty(f.size) }}
            <button class="btn-ghost" type="button" @click="removeAttachment(f.name)">Удалить</button>
          </li>
        </ul>
      </div>

      <div class="row" style="margin-top:12px">
        <button>Создать</button>
        <router-link to="/projects">
          <button class="ghost" type="button">Отмена</button>
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {useProjectsStore} from '../store/projects'
import {useSettingsStore} from '../store/settings'
import AttachmentUploader from '../components/AttachmentUploader.vue'

const router = useRouter()
const store = useProjectsStore()
const settings = useSettingsStore()

const name = ref('')
const desc = ref('')
const stageToAdd = ref('')
const preStages = ref([])

function addStage() {
  if (!stageToAdd.value) return
  if (!preStages.value.includes(stageToAdd.value)) {
    preStages.value.push(stageToAdd.value)
  }
  stageToAdd.value = ''
}

function removeStage(i) {
  preStages.value.splice(i, 1)
}

const pending = ref([])
function onFiles(files) {
  pending.value.push(...files)
}

function removeAttachment(name) {
  pending.value = pending.value.filter(f => f.name !== name)
}

const images = computed(() => pending.value.filter(f => (f.type || '').startsWith('image/')))
const other = computed(() => pending.value.filter(f => !(f.type || '').startsWith('image/')))

function pretty(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function create() {
  const id = store.addProject(name.value.trim(), desc.value.trim())
  preStages.value.forEach(title => store.addStage(id, title))
  if (pending.value.length) store.attachFiles(id, pending.value)
  router.push(`/projects/${id}`)
}
</script>

<style scoped>
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
  gap: 10px;
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
