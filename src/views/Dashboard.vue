<template>
  <div>
    <h2>Главная панель</h2>
    <p>Добро пожаловать в систему централизованного управления дефектами.</p>

    <div class="row">
      <div class="card col">
        <strong>Цикл дефекта</strong>
        <p>Новая → В работе → На проверке → Закрыта/Отменена</p>
        <router-link class="ghost" to="/board">Открыть канбан-доску</router-link>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <strong>Справочник этапов проектов</strong>
      <p><small>Эти этапы доступны в «Проекты» в виде выпадающего списка.</small></p>
      <div class="row">
        <input class="col" v-model="newStage" placeholder="Новый этап (например, Приёмка)"/>
        <button class="ghost" type="button" @click="addOption">Добавить в справочник</button>
      </div>
      <ul style="margin-top:8px">
        <li v-for="s in settings.stageOptions" :key="s" class="row" style="align-items:center">
          <div class="col">- {{ s }}</div>
          <button class="ghost" type="button" @click="settings.removeStageOption(s)">Удалить</button>
        </li>
      </ul>
      <button class="ghost" type="button" @click="settings.resetDefaults" style="margin-top:8px">
        Сбросить по умолчанию
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useSettingsStore} from '../store/settings'

const settings = useSettingsStore()
const newStage = ref('')

function addOption() {
  const value = newStage.value.trim()
  if (!value) return
  settings.addStageOption(value)
  newStage.value = ''
}
</script>
