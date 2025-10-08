<template>
  <div class="uploader">
    <label class="label">Вложения</label>

    <input ref="fileEl" type="file" multiple @change="onChange"/>

    <p class="hint">
      Поддерживаются фото и документы. Файлы сохраняются локально (демо).
    </p>

    <ul v-if="pending.length" style="margin-top:6px">
      <li v-for="(f,i) in pending" :key="i">• {{ f.name }} — {{ pretty(f.size) }}</li>
    </ul>

    <div class="row" style="margin-top:8px">
      <button type="button" @click="add">Добавить к дефекту</button>
      <button class="ghost" type="button" @click="reset">Очистить</button>
    </div>
  </div>
</template>

<script setup>

import {ref} from 'vue'

const emit = defineEmits(['files'])

const fileEl = ref(null)
const pending = ref([])

function onChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) {
    pending.value = [];
    return
  }
  Promise.all(files.map(toObj)).then(list => {
    pending.value = list
  })
}

function toObj(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve({
      name: file.name,
      size: file.size,
      type: file.type || '',
      content: reader.result
    })
    reader.readAsDataURL(file)
  })
}

function add() {
  if (!pending.value.length) return
  emit('files', pending.value)
  reset()
}

function reset() {
  pending.value = []
  if (fileEl.value) fileEl.value.value = ''
}

function pretty(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

<style scoped>
.uploader {
  border: 1px solid var(--wine-200);
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.label {
  display: block;
  font-weight: 700;
  margin-bottom: 6px
}

.hint {
  color: var(--muted);
  margin: 6px 0 0
}
</style>
