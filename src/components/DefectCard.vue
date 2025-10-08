<template>
  <div class="card" style="margin-top:10px">
    <div class="row">
      <div class="col">
        <strong>{{ d.title }}</strong><br>
        <small>{{ d.desc }}</small>
      </div>
      <div class="col" style="max-width:320px">
        <label>Статус</label>
        <select v-model="local.status" @change="onStatus">
          <option>Новая</option>
          <option>В работе</option>
          <option>На проверке</option>
          <option>Закрыта</option>
          <option>Отменена</option>
        </select>
        <div class="row">
          <div class="col">
            <label>Приоритет</label>
            <select v-model="local.priority" disabled>
              <option>Низкий</option>
              <option>Средний</option>
              <option>Высокий</option>
              <option>Критический</option>
            </select>
          </div>
          <div class="col">
            <label>Срок</label>
            <input type="date" v-model="local.due" disabled/>
          </div>
        </div>
        <label>Исполнитель</label>
        <input v-model="local.assignee" placeholder="ФИО/Email" disabled/>
      </div>
    </div>

    <div style="margin-top:8px">
      <span class="badge">Вложений: {{ d.attachments.length }}</span>
      <span class="badge" style="margin-left:6px">Комментариев: {{ d.comments.length }}</span>
    </div>

    <details style="margin-top:8px">
      <summary>Показать вложения</summary>
      <ul v-if="d.attachments.length">
        <li v-for="(f, i) in d.attachments" :key="i">
          <a :href="f.content" :download="f.name">{{ f.name }}</a> — {{ pretty(f.size) }}
        </li>
      </ul>
      <div v-else><small>Нет вложений</small></div>
    </details>

    <details style="margin-top:8px">
      <summary>Комментарии</summary>
      <ul v-if="d.comments.length">
        <li v-for="c in d.comments" :key="c.id">{{ c.text }}</li>
      </ul>
      <div v-else><small>Пока пусто</small></div>
      <div class="row" style="margin-top:6px">
        <input v-model="comment" placeholder="Новый комментарий"/>
        <button class="ghost" type="button" @click="addComment">Добавить</button>
      </div>
    </details>
  </div>
</template>

<script setup>
import {ref, reactive, watch} from 'vue'

const props = defineProps({
  d: {type: Object, required: true}
})
const emit = defineEmits(['status', 'comment'])

const local = reactive({
  status: props.d.status,
  priority: props.d.priority,
  due: props.d.due,
  assignee: props.d.assignee
})

watch(() => props.d.status, (v) => local.status = v)

function onStatus() {
  emit('status', local.status)
}

const comment = ref('')

function addComment() {
  if (!comment.value.trim()) return
  emit('comment', comment.value.trim())
  comment.value = ''
}

function pretty(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>
