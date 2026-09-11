<template>
  <div class="category-chart-wrapper">
    <div v-if="chartsMaintenance" class="charts-maintenance-card">
      <div class="maintenance-icon">!</div>
      <p class="maintenance-eyebrow">CHARTS MAINTENANCE</p>
      <h2>メンテナンス中です</h2>
      <p>現在グラフ機能をメンテナンスしています。</p>
      <span>復旧までしばらくお待ちください。</span>
    </div>

    <div v-else class="category-chart">
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
              :style="{
                background:
                  chartColors[
                    index % chartColors.length
                  ]
              }"
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

        <div v-if="data.length === 0" class="no-data">
          <span>データがありません</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const ApexChart = VueApexCharts

interface CategoryExpense {
  category: string
  amount: number
}

type Period =
  | 'all'
  | 'year'
  | 'month'
  | 'week'
  | 'today'

interface MaintenanceUpdate {
  type: string
  maintenance?: {
    features?: {
      charts?: boolean
    }
  }
}

const props = defineProps<{
  data: CategoryExpense[]
  modelValue?: Period
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Period): void
  (e: 'period-change', value: Period): void
}>()

const { $api, $cable } = useNuxtApp()

const chartsMaintenance = ref(false)

let maintenanceSubscription: any = null

const period = computed<Period>({
  get: () => {
    return props.modelValue || 'all'
  },
  set: value => {
    emit('update:modelValue', value)
  }
})

const periodOptions = [
  {
    label: '全期間',
    value: 'all' as const
  },
  {
    label: '今年',
    value: 'year' as const
  },
  {
    label: '今月',
    value: 'month' as const
  },
  {
    label: '今週',
    value: 'week' as const
  },
  {
    label: '今日',
    value: 'today' as const
  }
]

const changePeriod = (value: Period) => {
  period.value = value
  emit('period-change', value)
}

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

const fetchChartsMaintenance = async () => {
  try {
    const response = await $api.get<{
      charts_enabled: boolean
    }>('/maintenance/status')

    chartsMaintenance.value = !response.data.charts_enabled
  } catch (error) {
    console.error(
      'グラフメンテナンス状態の取得に失敗しました:',
      error
    )
  }
}

const applyChartsMaintenance = (enabled: boolean) => {
  chartsMaintenance.value = !enabled
}

const connectMaintenanceChannel = () => {
  if (!$cable) {
    return
  }

  maintenanceSubscription =
    $cable.subscriptions.create(
      {
        channel: 'MaintenanceChannel'
      },
      {
        connected() {
          console.log(
            '=== CHARTS MAINTENANCE CHANNEL CONNECTED ==='
          )
        },

        disconnected() {
          console.log(
            '=== CHARTS MAINTENANCE CHANNEL DISCONNECTED ==='
          )
        },

        rejected() {
          console.log(
            '=== CHARTS MAINTENANCE CHANNEL REJECTED ==='
          )
        },

        received(data: MaintenanceUpdate) {
          if (
            data?.type !==
            'maintenance_updated'
          ) {
            return
          }

          const enabled =
            data.maintenance?.features?.charts

          if (
            typeof enabled !==
            'boolean'
          ) {
            return
          }

          applyChartsMaintenance(
            enabled
          )
        }
      }
    )
}

onMounted(async () => {
  await fetchChartsMaintenance()
  connectMaintenanceChannel()
})

onBeforeUnmount(() => {
  maintenanceSubscription?.unsubscribe?.()
  maintenanceSubscription = null
})
</script>

<style scoped>
.category-chart-wrapper {
  width: 100%;
}

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
  transition: background 0.2s ease, transform 0.2s ease;
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

.no-data {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa3b1;
  font-size: 11px;
}

.charts-maintenance-card {
  width: 100%;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 40px 24px;
  border: 1px solid #1e293b;
  border-radius: 18px;
  background: linear-gradient(145deg, #0f172a, #111827);
  color: #fff;
  text-align: center;
}

.maintenance-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.5);
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.08);
  color: #38bdf8;
  font-size: 28px;
  font-weight: 800;
  animation: maintenance-pulse 1.8s ease-in-out infinite;
}

.maintenance-eyebrow {
  margin: 20px 0 0;
  color: #38bdf8;
  font-size: 10px;
  letter-spacing: 0.22em;
  font-weight: 700;
}

.charts-maintenance-card h2 {
  margin: 10px 0 0;
  font-size: 24px;
  font-weight: 800;
}

.charts-maintenance-card p:not(.maintenance-eyebrow) {
  margin: 10px 0 0;
  color: #cbd5e1;
  font-size: 13px;
}

.charts-maintenance-card span {
  margin-top: 7px;
  color: #64748b;
  font-size: 11px;
}

@keyframes maintenance-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.06);
    opacity: 0.7;
  }
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