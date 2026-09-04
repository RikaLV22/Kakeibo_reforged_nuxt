<template>
  <div class="balance-chart">
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

const props = defineProps<{
  data: MonthlySummary[]
}>()

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value || 0)
}

const chartSeries = computed(() => [
  {
    name: '収入',
    data: props.data.map(item => Number(item.income))
  },
  {
    name: '支出',
    data: props.data.map(item => Number(item.expense))
  },
  {
    name: '収支',
    data: props.data.map(item => Number(item.balance))
  }
])

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

  colors: [
    '#22C55E',
    '#EF4444',
    '#3B82F6'
  ],

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
    categories: props.data.map(
      item => `${item.month}月`
    ),
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
    fontSize: '11px'
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