<template>
  <div>
    <h2>Создать дефект</h2>
    <form class="card" @submit.prevent="create">
      <div class="row">
        <input class="col" v-model="title" placeholder="Заголовок" required/>
        <select class="col" v-model="priority">
          <option>Низкий</option>
          <option>Средний</option>
          <option>Высокий</option>
          <option>Критический</option>
        </select>
      </div>
      <textarea v-model="desc" placeholder="Описание"></textarea>
      <div class="row">
        <input class="col" v-model="assignee" placeholder="Исполнитель (ФИО/Email)"/>
        <input class="col" type="date" v-model="due"/>
      </div>
      <AttachmentUploader @files="onFiles"/>
      <div class="row" style="margin-top:8px">
        <button type="submit">Создать</button>
        <router-link to="/defects">
          <button class="ghost" type="button">Отмена</button>
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useDefectsStore} from '../store/defects'
import AttachmentUploader from '../components/AttachmentUploader.vue'

const router = useRouter()
const store = useDefectsStore()

const title = ref(''), desc = ref(''), priority = ref('Средний'), assignee = ref(''), due = ref('')
let pendingFiles = []

function onFiles(files) {
  pendingFiles = files
}

function create() {
  if (!title.value.trim()) return
  const id = store.addDefect(title.value.trim(), desc.value.trim(), {
    priority: priority.value, assignee: assignee.value.trim(), due: due.value
  })
  if (pendingFiles.length) store.attachFiles(id, pendingFiles)
  router.push(`/defects/${id}`)
}
</script>
