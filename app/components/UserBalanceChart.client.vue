<template>
  <div class="user-balance-chart">
    <div class="chart-controls">
      <div class="period-switch">
        <button
          class="switch-option"
          :class="{ active: period === 'week' }"
          @click="period = 'week'"
        >
          週
        </button>

        <button
          class="switch-option"
          :class="{ active: period === 'month' }"
          @click="period = 'month'"
        >
          月
        </button>

        <button
          class="switch-option"
          :class="{ active: period === 'year' }"
          @click="period = 'year'"
        >
          年
        </button>
      </div>

      <div class="income-expense-switch">
        <button
          class="switch-option"
          :class="{ active: displayMode === 'income' }"
          @click="displayMode = 'income'"
        >
          収入
        </button>

        <button
          class="switch-option"
          :class="{ active: displayMode === 'expense' }"
          @click="displayMode = 'expense'"
        >
          支出
        </button>
      </div>
    </div>

    <ClientOnly>
      <ApexChart
        v-if="hasChartData"
        type="line"
        height="300"
        :options="chartOptions"
        :series="chartSeries"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const ApexChart = VueApexCharts

interface DailySummary {
  date: string
  income: number
  expense: number
  balance: number
}

interface MonthlySummary {
  month: number
  income: number
  expense: number
  balance: number
}

interface UserTrend {
  week: DailySummary[]
  month: DailySummary[]
  year: MonthlySummary[]
}

interface UserSummary {
  user_id: number
  user_name: string
  trends: UserTrend
}

const props = defineProps<{
  users: UserSummary[]
}>()

const period = ref<'week' | 'month' | 'year'>(
  'year'
)

const displayMode = ref<'income' | 'expense'>(
  'income'
)

const chartColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#6366F1',
  '#84CC16'
]

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(
    value || 0
  )
}

const chartSeries = computed(() => {
  return props.users.map(user => {
    if (period.value === 'year') {
      return {
        name: user.user_name,
        data: user.trends.year.map(item => {
          return displayMode.value === 'income'
            ? Number(item.income)
            : Number(item.expense)
        })
      }
    }

    if (period.value === 'week') {
      return {
        name: user.user_name,
        data: user.trends.week.map(item => {
          return displayMode.value === 'income'
            ? Number(item.income)
            : Number(item.expense)
        })
      }
    }

    return {
      name: user.user_name,
      data: user.trends.month.map(item => {
        return displayMode.value === 'income'
          ? Number(item.income)
          : Number(item.expense)
      })
    }
  })
})

const chartCategories = computed(() => {
  const firstUser = props.users[0]

  if (!firstUser) {
    return []
  }

  if (period.value === 'year') {
    return firstUser.trends.year.map(item => {
      return `${item.month}月`
    })
  }

  if (period.value === 'week') {
    return firstUser.trends.week.map(item => {
      const date = new Date(
        `${item.date}T00:00:00`
      )

      return `${date.getMonth() + 1}/${date.getDate()}`
    })
  }

  return firstUser.trends.month.map(item => {
    const date = new Date(
      `${item.date}T00:00:00`
    )

    return `${date.getDate()}日`
  })
})

const hasChartData = computed(() => {
  return props.users.some(user => {
    if (period.value === 'year') {
      return user.trends.year.some(item => {
        return (
          Number(item.income) > 0 ||
          Number(item.expense) > 0
        )
      })
    }

    if (period.value === 'week') {
      return user.trends.week.some(item => {
        return (
          Number(item.income) > 0 ||
          Number(item.expense) > 0
        )
      })
    }

    return user.trends.month.some(item => {
      return (
        Number(item.income) > 0 ||
        Number(item.expense) > 0
      )
    })
  })
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line' as const,

    toolbar: {
      show: false
    },

    zoom: {
      enabled: false
    }
  },

  colors: chartColors.slice(
    0,
    props.users.length
  ),

  stroke: {
    curve: 'smooth' as const,
    width: 3
  },

  markers: {
    size: 0,

    hover: {
      size: 5
    }
  },

  xaxis: {
    categories: chartCategories.value,

    labels: {
      style: {
        colors: '#9aa3b1',
        fontSize: '11px'
      }
    },

    axisBorder: {
      show: false
    },

    axisTicks: {
      show: false
    }
  },

  yaxis: {
    labels: {
      style: {
        colors: '#9aa3b1',
        fontSize: '10px'
      },

      formatter: (value: number) => {
        return `¥${formatNumber(value)}`
      }
    }
  },

  grid: {
    borderColor: '#edf0f5',
    strokeDashArray: 4
  },

  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    fontSize: '11px',

    markers: {
      size: 6
    },

    itemMargin: {
      horizontal: 6
    },

    formatter: (
      seriesName: string,
      opts: any
    ) => {
      const seriesIndex = opts.seriesIndex

      const series =
        chartSeries.value[seriesIndex]

      if (!series) {
        return seriesName
      }

      const userTotal = series.data.reduce(
        (sum: number, value: number) =>
          sum + Number(value || 0),
        0
      )

      const total = chartSeries.value.reduce(
        (
          sum: number,
          currentSeries
        ) => {
          return (
            sum +
            currentSeries.data.reduce(
              (
                innerSum: number,
                value: number
              ) =>
                innerSum +
                Number(value || 0),
              0
            )
          )
        },
        0
      )

      const percentage = total
        ? Math.round(
            (userTotal / total) * 100
          )
        : 0

      return `${seriesName}  ${percentage}%`
    }
  },

  tooltip: {
    shared: true,
    intersect: false,

    y: {
      formatter: (value: number) => {
        return `¥${formatNumber(value)}`
      }
    }
  }
}))
</script>

<style scoped>
.user-balance-chart {
  width: 100%;
  padding: 0 18px 18px;
  box-sizing: border-box;
}

.chart-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.year-select {
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 10px;
  background: #f1f3f6;
}

.year-select select {
  height: 30px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #111827;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.period-switch,
.income-expense-switch {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: #f1f3f6;
}

.switch-option {
  min-width: 42px;
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9aa3b1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.switch-option:hover {
  color: #475569;
}

.switch-option.active {
  background: #ffffff;
  color: #111827;
  box-shadow:
    0 2px 7px rgba(15, 23, 42, 0.08);
}

.no-data {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9aa3b1;
  text-align: center;
}

.no-data-icon {
  margin-bottom: 10px;
  font-size: 28px;
  opacity: 0.7;
}

.no-data p {
  margin: 0;
  font-size: 12px;
}

@media (max-width: 700px) {
  .user-balance-chart {
    padding: 0 10px 14px;
  }

  .chart-controls {
    justify-content: space-between;
  }

  .switch-option {
    min-width: 40px;
    padding: 6px 9px;
  }
}
</style>