<template>
  <div>
    <h2>Отчётность</h2>
    <div class="row">
      <div class="card col">
        <strong>Всего дефектов</strong>
        <p style="font-size:1.6rem">{{ stats.total }}</p>
      </div>
      <div class="card col">
        <strong>Закрыто</strong>
        <p style="font-size:1.6rem;color:var(--ok)">{{ stats.closed }}</p>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <strong>Распределение по статусам</strong>
      <div style="overflow-x:auto">
        <svg :width="svgW" :height="svgH" role="img" aria-label="Диаграмма по статусам">
          <g v-for="(s, i) in series" :key="s.label">
            <rect
                :x="barX(i)" :y="barY(s.value)"
                :width="barW" :height="barH(s.value)"
                style="fill:var(--wine-500)"/>
            <text :x="barX(i)+barW/2" :y="svgH-5" text-anchor="middle" font-size="12">{{ s.label }}</text>
            <text :x="barX(i)+barW/2" :y="barY(s.value)-4" text-anchor="middle" font-size="12">{{ s.value }}</text>
          </g>
          <line x1="40" :y1="svgH-24" :x2="svgW-10" :y2="svgH-24" stroke="#ddd"/>
        </svg>
      </div>
      <small>Простая SVG-гистограмма без зависимостей.</small>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useDefectsStore} from '../store/defects'

const store = useDefectsStore()
const stats = store.stats

const counts = computed(() => {
  const labels = ['Новая', 'В работе', 'На проверке', 'Закрыта', 'Отменена']
  const map = Object.fromEntries(labels.map(l => [l, 0]))
  store.defects.forEach(d => {
    map[d.status] = (map[d.status] || 0) + 1
  })
  return labels.map(l => ({label: l, value: map[l] || 0}))
})

const svgW = 520, svgH = 220, barW = 70, gap = 20, topPad = 20, bottomPad = 30
const max = computed(() => Math.max(1, ...counts.value.map(s => s.value)))
const series = counts

function barX(i) {
  return 40 + i * (barW + gap)
}

function barH(v) {
  return (svgH - topPad - bottomPad) * (v / max.value)
}

function barY(v) {
  return svgH - bottomPad - barH(v)
}
</script>
