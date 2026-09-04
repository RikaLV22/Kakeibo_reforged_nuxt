<template>
  <div class="category-chart">
    <div class="chart-area">
      <ClientOnly>
        <ApexChart
          type="donut"
          height="280"
          :options="chartOptions"
          :series="chartSeries"
        />
      </ClientOnly>
    </div>

    <div class="category-list">
      <div
        v-for="(item, index) in data"
        :key="item.category"
        class="category-item"
      >
        <div class="category-left">
          <span
            class="category-dot"
            :style="{ background: chartColors[index % chartColors.length] }"
          ></span>

          <div class="category-info">
            <span class="category-name">
              {{ item.category }}
            </span>

            <span class="category-percent">
              {{ getPercentage(item.amount) }}%
            </span>
          </div>
        </div>

        <span class="category-amount">
          ¥{{ formatNumber(item.amount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const ApexChart = VueApexCharts

interface CategoryExpense {
  category: string
  amount: number
}

const props = defineProps<{
  data: CategoryExpense[]
}>()

const chartColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1'
]

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value || 0)
}

const totalExpense = computed(() => {
  return props.data.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  )
})

const chartSeries = computed(() => {
  return props.data.map(item => Number(item.amount))
})

const getPercentage = (amount: number) => {
  if (!totalExpense.value) {
    return 0
  }

  return Math.round(
    (Number(amount) / totalExpense.value) * 100
  )
}

const chartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    toolbar: {
      show: false
    }
  },

  labels: props.data.map(item => item.category),

  colors: chartColors,

  legend: {
    show: false
  },

  stroke: {
    width: 3,
    colors: ['#ffffff']
  },

  dataLabels: {
    enabled: false
  },

  plotOptions: {
    pie: {
      expandOnClick: false,

      donut: {
        size: '72%',

        labels: {
          show: true,

          name: {
            show: true,
            offsetY: -4,
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 600
          },

          value: {
            show: true,
            offsetY: 8,
            color: '#111827',
            fontSize: '20px',
            fontWeight: 800,

            formatter: (value: string) => {
              return `¥${formatNumber(Number(value))}`
            }
          },

          total: {
            show: true,
            showAlways: true,
            label: '総支出',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,

            formatter: () => {
              return `¥${formatNumber(totalExpense.value)}`
            }
          }
        }
      }
    }
  },

  tooltip: {
    y: {
      formatter: (value: number) => {
        return `¥${formatNumber(value)}`
      }
    }
  }
}))
</script>

<style scoped>
.category-chart {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(220px, 0.9fr);
  align-items: center;
  gap: 10px;
  padding: 4px 18px 20px;
}

.chart-area {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 11px;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  background: #fafbfc;
  transition: 0.2s ease;
}

.category-item:hover {
  background: #f4f6f9;
  transform: translateX(2px);
}

.category-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.category-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.category-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-name {
  overflow: hidden;
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-percent {
  color: #9aa3b1;
  font-size: 9px;
  font-weight: 600;
}

.category-amount {
  flex-shrink: 0;
  color: #111827;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 900px) {
  .category-chart {
    grid-template-columns: 1fr;
  }

  .category-list {
    padding: 0 8px;
  }
}
</style>