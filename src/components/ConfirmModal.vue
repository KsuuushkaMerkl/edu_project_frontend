<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal card">
      <h3 style="margin-top:0">{{ title }}</h3>
      <p v-if="message" class="muted">{{ message }}</p>
      <div class="row" style="justify-content:flex-end; gap:8px; margin-top:12px">
        <button class="ghost" @click="$emit('cancel')">Отмена</button>
        <button class="danger" @click="$emit('ok')">{{ okText || 'Удалить' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: {type: Boolean, default: false},
  title: {type: String, default: 'Подтверждение'},
  message: {type: String, default: ''},
  okText: {type: String, default: 'Удалить'}
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  max-width: 520px;
  width: calc(100% - 32px)
}
</style>
