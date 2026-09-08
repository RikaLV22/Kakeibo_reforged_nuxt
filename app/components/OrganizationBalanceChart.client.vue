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
  chartMode?: 'bar' | 'line'
}>()

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    'ja-JP'
  ).format(
    value || 0
  )
}

const chartSeries = computed(() => {
  if (props.chartMode === 'bar') {
    return [
      {
        name: '収入',
        type: 'column' as const,
        data: props.data.map(
          item => Number(item.income)
        )
      },
      {
        name: '支出',
        type: 'column' as const,
        data: props.data.map(
          item => -Math.abs(
            Number(item.expense)
          )
        )
      },
      {
        name: '収支',
        type: 'column' as const,
        data: props.data.map(
          item => Number(item.balance)
        )
      }
    ]
  }

  return [
    {
      name: '収入',
      type: 'line' as const,
      data: props.data.map(
        item => Number(item.income)
      )
    },
    {
      name: '支出',
      type: 'line' as const,
      data: props.data.map(
        item => -Math.abs(
          Number(item.expense)
        )
      )
    },
    {
      name: '収支',
      type: 'line' as const,
      data: props.data.map(
        item => Number(item.balance)
      )
    }
  ]
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

  colors: [
    '#22C55E',
    '#EF4444',
    '#3B82F6'
  ],

  stroke: {
    curve: 'smooth' as const,
    width:
      props.chartMode === 'bar'
        ? 0
        : 3
  },

  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 5
    }
  },

  markers: {
    size:
      props.chartMode === 'bar'
        ? 0
        : 0,
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

      formatter: (
        value: number
      ) => {
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
    shared: true,
    intersect: false,

    y: {
      formatter: (
        value: number
      ) => {
        return `¥${formatNumber(
          Math.abs(value)
        )}`
      }
    }
  },

  dataLabels: {
    enabled: false
  }
}))
</script>

<style scoped>
.balance-chart {
  width: 100%;
  padding: 0 18px 18px;
  box-sizing: border-box;
}

@media (max-width: 700px) {
  .balance-chart {
    padding: 0 10px 14px;
  }
}
</style>