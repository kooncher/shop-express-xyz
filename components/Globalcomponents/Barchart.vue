<template>
  <div class="chart-wrapper">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import Chart, { type ChartConfiguration } from 'chart.js/auto'

// รับค่า Config ทั้งหมดจากตัวแม่
const props = defineProps<{
  config: ChartConfiguration
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartRef.value, props.config)
}

// Watch ข้อมูล: ถ้า data เปลี่ยน ให้ update กราฟทันทีโดยไม่ต้องวาดใหม่ทั้งหมด
watch(() => props.config.data, () => {
  if (chartInstance) {
    chartInstance.data = props.config.data
    chartInstance.update()
  } else {
    renderChart()
  }
}, { deep: true })

onMounted(() => {
  renderChart()
  // Trick Senior: บังคับ Resize เพื่อแก้ปัญหา Canvas จมหรือขนาดเป็น 0
  setTimeout(() => chartInstance?.resize(), 200)
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 300px;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}
</style>