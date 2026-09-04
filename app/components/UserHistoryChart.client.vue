<template>
  <div class="user-history-chart">
    <ClientOnly>
      <ApexChart
        type="line"
        height="300"
        :options="chartOptions"
        :series="chartSeries"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const ApexChart = VueApexCharts

interface MonthlySummary {
  month: number
  income: number
  expense: number
  balance: number
}

interface UserSummary {
  user_id: number
  user_name: string
  monthly: MonthlySummary[]
}

const props = defineProps<{
  users: UserSummary[]
}>()

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

const chartSeries = computed(() => {
  return props.users.map(user => ({
    name: user.user_name,
    data: user.monthly.map(item =>
      Number(item.balance)
    )
  }))
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
    categories:
      props.users[0]?.monthly.map(
        item => `${item.month}月`
      ) || [],

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
        return `¥${new Intl.NumberFormat(
          'ja-JP'
        ).format(value || 0)}`
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
    fontSize: '11px'
  },

  tooltip: {
    shared: true,
    intersect: false,

    y: {
      formatter: (value: number) => {
        return `¥${new Intl.NumberFormat(
          'ja-JP'
        ).format(value || 0)}`
      }
    }
  }
}))
</script>

<style scoped>
.user-history-chart {
  width: 100%;
  padding: 0 18px 18px;
  box-sizing: border-box;
}
</style>