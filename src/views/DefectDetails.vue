<template>
  <div v-if="d" class="details">
    <div class="row" style="align-items:center">
      <h2 class="col">Дефект: {{ d.title }}</h2>
      <div class="row" style="gap:8px; justify-content:flex-end">
        <router-link to="/defects">
          <button class="ghost">← Ко всем дефектам</button>
        </router-link>
        <button v-if="!isEditing" class="ghost" @click="startEdit">Редактировать</button>
        <button v-if="isEditing" class="ghost" @click="cancelEdit">Отмена</button>
        <button v-if="isEditing" @click="save">Сохранить</button>
        <button v-if="isEditing" class="danger" @click="remove">Удалить дефект</button>
      </div>
    </div>

    <div class="row">
      <div class="card col">
        <h3>Основное</h3>

        <template v-if="!isEditing">
          <div class="kv">
            <div class="k">Заголовок</div>
            <div class="v">{{ d.title }}</div>
            <div class="k">Приоритет</div>
            <div class="v">{{ d.priority }}</div>
            <div class="k">Описание</div>
            <div class="v">{{ d.desc || '—' }}</div>
            <div class="k">Исполнитель</div>
            <div class="v">{{ d.assignee || '—' }}</div>
            <div class="k">Срок</div>
            <div class="v">{{ d.due || '—' }}</div>
            <div class="k">Статус</div>
            <div class="v">{{ d.status }}</div>
          </div>
        </template>

        <template v-else>
          <div class="row">
            <input class="col" v-model="form.title" placeholder="Заголовок"/>
            <select class="col" v-model="form.priority">
              <option>Низкий</option>
              <option>Средний</option>
              <option>Высокий</option>
              <option>Критический</option>
            </select>
          </div>
          <textarea v-model="form.desc" placeholder="Описание"></textarea>
          <div class="row">
            <input class="col" v-model="form.assignee" placeholder="Исполнитель (ФИО/Email)"/>
            <input class="col" type="date" v-model="form.due"/>
          </div>
          <label>Статус</label>
          <select v-model="form.status">
            <option>Новая</option>
            <option>В работе</option>
            <option>На проверке</option>
            <option>Закрыта</option>
            <option>Отменена</option>
          </select>
        </template>
      </div>

      <div class="card col">
        <h3>Вложения</h3>

        <AttachmentUploader v-if="isEditing" @files="files => store.attachFiles(d.id, files)"/>

        <div v-if="imageFiles.length" class="thumbs">
          <figure v-for="(img,i) in imageFiles" :key="i" class="thumb">
            <img :src="img.content" :alt="'Фото '+(i+1)"/>
            <figcaption class="thumb-bar">
              <a class="btn-ghost" :href="img.content" :download="img.name">Скачать</a>
              <button v-if="isEditing" class="btn-ghost" @click="store.removeAttachment(d.id, img.name)">Удалить
              </button>
            </figcaption>
          </figure>
        </div>

        <div v-if="otherFiles.length" style="margin-top:10px">
          <ul>
            <li v-for="(f, i) in otherFiles" :key="i">
              <a :href="f.content" :download="f.name">{{ f.name }}</a>
              — {{ pretty(f.size) }}
              <button v-if="isEditing" class="btn-ghost" @click="store.removeAttachment(d.id, f.name)">Удалить</button>
            </li>
          </ul>
        </div>

        <div v-if="!d.attachments.length" class="muted"><small>Нет вложений</small></div>
      </div>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="card col">
        <h3>Комментарии</h3>
        <div class="row">
          <input class="col" v-model="comment" placeholder="Новый комментарий"/>
          <button class="ghost" type="button" @click="addComment">Добавить</button>
        </div>
        <ul>
          <li v-for="c in d.comments" :key="c.id">{{ c.text }}</li>
        </ul>
      </div>

      <div class="card col">
        <h3>История изменений</h3>
        <ul>
          <li v-for="(h,i) in d.history" :key="i">
            {{ formatTs(h.ts) }} — <strong>{{ label(h.action) }}</strong>
            <template v-if="h.action==='status'">: {{ h.payload.from }} → {{ h.payload.to }}</template>
            <template v-else-if="h.action==='attach'">: добавлено файлов — {{ h.payload.count }}</template>
            <template v-else-if="h.action==='detach'">: удалено — {{ h.payload.name }}</template>
            <template v-else-if="h.action==='comment'">: {{ h.payload.text }}</template>
            <template v-else-if="h.action==='create'">: создан</template>
            <template v-else-if="h.action==='update'">: отредактирован</template>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="card"><small>Дефект не найден.</small></div>
</template>

<script setup>
import {reactive, ref, computed, watchEffect} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useDefectsStore} from '../store/defects'
import AttachmentUploader from '../components/AttachmentUploader.vue'

const router = useRouter()
const route = useRoute()
const store = useDefectsStore()
const d = store.getById(route.params.id)

const isEditing = ref(false)

function startEdit() {
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  const cur = store.getById(route.params.id)
  form.title = cur.title;
  form.desc = cur.desc
  form.priority = cur.priority;
  form.assignee = cur.assignee
  form.due = cur.due;
  form.status = cur.status
}

function save() {
  store.updateDefect(d.id, {...form});
  isEditing.value = false
}

function remove() {
  if (confirm('Удалить дефект безвозвратно?')) {
    store.deleteDefect(d.id);
    router.push('/defects')
  }
}

const form = reactive({
  title: d?.title || '', desc: d?.desc || '',
  priority: d?.priority || 'Средний',
  assignee: d?.assignee || '', due: d?.due || '',
  status: d?.status || 'Новая'
})

const comment = ref('')

function addComment() {
  if (!comment.value.trim()) return
  store.addComment(d.id, comment.value.trim());
  comment.value = ''
}

const imageFiles = computed(() => (d?.attachments || []).filter(a => (a.type || '').startsWith('image/')))
const otherFiles = computed(() => (d?.attachments || []).filter(a => !(a.type || '').startsWith('image/')))

function pretty(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

watchEffect(() => {
  const cur = store.getById(route.params.id)
  if (cur && !isEditing.value) {
    form.title = cur.title;
    form.desc = cur.desc
    form.priority = cur.priority;
    form.assignee = cur.assignee
    form.due = cur.due;
    form.status = cur.status
  }
})

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

function label(action) {
  return ({
    create: 'создание',
    status: 'смена статуса',
    attach: 'вложения',
    detach: 'удаление файла',
    comment: 'комментарий',
    update: 'редактирование'
  })[action] || action
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

.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.thumb {
  margin: 0;
  display: block;
  border: 1px solid var(--wine-200);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.thumb img {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover
}

.thumb-bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 6px 8px;
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

button.danger {
  background: var(--bad)
}

.muted {
  color: var(--muted)
}
</style>
