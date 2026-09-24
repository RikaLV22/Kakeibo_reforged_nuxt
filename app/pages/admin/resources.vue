<template>
  <div class="resources-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">SYSTEM CONTROL / RESOURCES</p>
        <h1>リソース管理</h1>
        <p class="description">PrometheusからシステムおよびAPIの稼働状況を取得します</p>
      </div>

      <div class="header-status" :class="prometheusStatusClass">
        <span class="status-dot"></span>
        {{ prometheusStatusLabel }}
      </div>
    </header>

    <section class="summary-grid">
      <div class="metric-card">
        <span class="metric-label">CPU USAGE</span>
        <strong>{{ formatPercent(resources?.system.cpu_usage_percent) }}</strong>
        <small>NODE EXPORTER</small>
      </div>

      <div class="metric-card">
        <span class="metric-label">MEMORY USAGE</span>
        <strong>{{ formatPercent(resources?.system.memory_usage_percent) }}</strong>
        <small>NODE EXPORTER</small>
      </div>

      <div class="metric-card">
        <span class="metric-label">MONITORED TARGETS</span>
        <strong>{{ onlineTargetCount }} / {{ resources?.targets.length ?? 0 }}</strong>
        <small>PROMETHEUS TARGETS</small>
      </div>

      <div class="metric-card">
        <span class="metric-label">API FEATURES</span>
        <strong>{{ resources?.api_requests_per_second.length ?? 0 }}</strong>
        <small>ACTIVE SERIES</small>
      </div>
    </section>

    <section class="history-section">
      <div class="history-header">
        <div>
          <p class="panel-eyebrow">RESOURCE HISTORY</p>
          <h2>過去1時間のリソース推移</h2>
          <p class="history-description">
            Prometheusのquery_rangeから取得した履歴を表示します
          </p>
        </div>

        <div class="history-period">LAST 1 HOUR</div>
      </div>

      <div v-if="!hasHistoryData" class="panel empty-history">
        <span>現在、表示可能な履歴データがありません</span>
      </div>

      <template v-else>
        <div class="chart-grid">
          <div class="chart-panel">
            <div class="chart-header">
              <div>
                <p class="chart-eyebrow">SYSTEM RESOURCE</p>
                <h3>CPU使用率</h3>
              </div>

              <span class="chart-unit">%</span>
            </div>

            <ClientOnly>
              <VueApexCharts
                type="area"
                height="320"
                :options="cpuChartOptions"
                :series="cpuChartSeries"
              />

              <template #fallback>
                <div class="chart-loading">グラフを読み込んでいます...</div>
              </template>
            </ClientOnly>
          </div>

          <div class="chart-panel">
            <div class="chart-header">
              <div>
                <p class="chart-eyebrow">SYSTEM RESOURCE</p>
                <h3>メモリ使用率</h3>
              </div>

              <span class="chart-unit">%</span>
            </div>

            <ClientOnly>
              <VueApexCharts
                type="area"
                height="320"
                :options="memoryChartOptions"
                :series="memoryChartSeries"
              />

              <template #fallback>
                <div class="chart-loading">グラフを読み込んでいます...</div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <div class="chart-panel chart-panel-wide">
          <div class="chart-header">
            <div>
              <p class="chart-eyebrow">API LOAD</p>
              <h3>APIリクエスト速度の推移</h3>
            </div>

            <span class="chart-unit">req/s</span>
          </div>

          <ClientOnly>
            <VueApexCharts
              type="line"
              height="380"
              :options="apiRequestChartOptions"
              :series="apiRequestChartSeries"
            />

            <template #fallback>
              <div class="chart-loading">グラフを読み込んでいます...</div>
            </template>
          </ClientOnly>
        </div>

        <div class="chart-panel chart-panel-wide">
          <div class="chart-header">
            <div>
              <p class="chart-eyebrow">RESPONSE TIME</p>
              <h3>API平均応答時間の推移</h3>
            </div>

            <span class="chart-unit">ms</span>
          </div>

          <ClientOnly>
            <VueApexCharts
              type="line"
              height="380"
              :options="apiResponseChartOptions"
              :series="apiResponseChartSeries"
            />

            <template #fallback>
              <div class="chart-loading">グラフを読み込んでいます...</div>
            </template>
          </ClientOnly>
        </div>

        <div class="chart-panel chart-panel-wide">
          <div class="chart-header">
            <div>
              <p class="chart-eyebrow">API LOAD / 5 SEC</p>
              <h3>APIごとの5秒間リクエスト数の推移</h3>
            </div>

            <span class="chart-unit">requests / 5s</span>
          </div>

          <ClientOnly>
            <VueApexCharts
              type="line"
              height="380"
              :options="apiRequests5sChartOptions"
              :series="apiRequests5sChartSeries"
            />

            <template #fallback>
              <div class="chart-loading">グラフを読み込んでいます...</div>
            </template>
          </ClientOnly>
        </div>
      </template>
    </section>

    <section class="history-section mysql-section">
      <div class="history-header">
        <div>
          <p class="panel-eyebrow">MYSQL MONITORING</p>
          <h2>MySQLリソース推移</h2>
          <p class="history-description">
            mysqld_exporterから取得したMySQLの稼働状況を表示します
          </p>
        </div>

        <div class="history-period">MYSQL :3306</div>
      </div>

      <div class="chart-grid">
        <div class="chart-panel">
          <div class="chart-header">
            <div>
              <p class="chart-eyebrow">MYSQL CONNECTIONS</p>
              <h3>MySQL接続数</h3>
            </div>

            <span class="chart-unit">connections</span>
          </div>

          <ClientOnly>
            <VueApexCharts
              type="area"
              height="320"
              :options="mysqlConnectionsChartOptions"
              :series="mysqlConnectionsChartSeries"
            />

            <template #fallback>
              <div class="chart-loading">グラフを読み込んでいます...</div>
            </template>
          </ClientOnly>
        </div>

        <div class="chart-panel">
          <div class="chart-header">
            <div>
              <p class="chart-eyebrow">MYSQL QUERIES</p>
              <h3>クエリ処理速度</h3>
            </div>

            <span class="chart-unit">queries / sec</span>
          </div>

          <ClientOnly>
            <VueApexCharts
              type="area"
              height="320"
              :options="mysqlQueriesChartOptions"
              :series="mysqlQueriesChartSeries"
            />

            <template #fallback>
              <div class="chart-loading">グラフを読み込んでいます...</div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="chart-panel chart-panel-wide">
        <div class="chart-header">
          <div>
            <p class="chart-eyebrow">INNODB BUFFER POOL</p>
            <h3>InnoDB Buffer Pool Pages</h3>
          </div>

          <span class="chart-unit">pages</span>
        </div>

        <ClientOnly>
          <VueApexCharts
            type="line"
            height="380"
            :options="mysqlInnoDBBufferPoolChartOptions"
            :series="mysqlInnoDBBufferPoolChartSeries"
          />

          <template #fallback>
            <div class="chart-loading">グラフを読み込んでいます...</div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">INFRASTRUCTURE</p>
          <h2>監視対象</h2>
        </div>

        <button
          type="button"
          class="refresh-button"
          :disabled="isLoading"
          @click="fetchResources"
        >
          {{ isLoading ? '更新中...' : '更新' }}
        </button>
      </div>

      <div v-if="loadError" class="error-state">
        <strong>RESOURCE MONITOR ERROR</strong>
        <span>{{ loadError }}</span>
      </div>

      <div v-else class="target-list">
        <div
          v-for="target in resources?.targets ?? []"
          :key="`${target.job}-${target.instance}`"
          class="target-row"
        >
          <div class="target-main">
            <span
              class="target-indicator"
              :class="{ online: target.up }"
            ></span>

            <div>
              <strong>{{ target.job }}</strong>
              <small>{{ target.instance }}</small>
            </div>
          </div>

          <span
            class="target-status"
            :class="{ online: target.up }"
          >
            {{ target.up ? 'UP' : 'DOWN' }}
          </span>
        </div>
      </div>
    </section>

    <section class="two-column">
      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">API LOAD</p>
            <h2>APIリクエスト速度</h2>
          </div>
        </div>

        <div
          v-if="apiRequestRows.length === 0"
          class="empty-state"
        >
          <span>現在、表示可能なAPIデータがありません</span>
        </div>

        <div v-else class="api-list">
          <div
            v-for="item in apiRequestRows"
            :key="item.feature"
            class="api-row"
          >
            <div>
              <strong>{{ item.feature }}</strong>
              <small>REQUEST RATE</small>
            </div>

            <strong class="api-value">
              {{ item.requests_per_second.toFixed(3) }}
              <span>req/s</span>
            </strong>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">RESPONSE TIME</p>
            <h2>API平均応答時間</h2>
          </div>
        </div>

        <div
          v-if="apiResponseRows.length === 0"
          class="empty-state"
        >
          <span>現在、表示可能なAPIデータがありません</span>
        </div>

        <div v-else class="api-list">
          <div
            v-for="item in apiResponseRows"
            :key="item.feature"
            class="api-row"
          >
            <div>
              <strong>{{ item.feature }}</strong>
              <small>AVERAGE RESPONSE</small>
            </div>

            <strong class="api-value">
              {{ item.response_time_ms.toFixed(2) }}
              <span>ms</span>
            </strong>
          </div>
        </div>
      </div>
    </section>

    <section class="panel api-in-progress-panel">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">API CONCURRENCY</p>
          <h2>APIごとの処理中リクエスト数</h2>
        </div>

        <span class="history-period">CURRENT</span>
      </div>

      <div
        v-if="apiInProgressRows.length === 0"
        class="empty-state"
      >
        <span>現在、表示可能な処理中リクエストがありません</span>
      </div>

      <div v-else class="api-list">
        <div
          v-for="item in apiInProgressRows"
          :key="item.feature"
          class="api-row"
        >
          <div>
            <strong>{{ item.feature }}</strong>
            <small>REQUESTS IN PROGRESS</small>
          </div>

          <strong
            class="api-value"
            :class="{ active: item.requests_in_progress > 0 }"
          >
            {{ item.requests_in_progress.toFixed(0) }}
            <span>requests</span>
          </strong>
        </div>
      </div>
    </section>

    <footer class="page-footer">
      <span>LAST UPDATE</span>
      <strong>{{ formattedUpdatedAt }}</strong>

      <span class="separator">/</span>

      <span>AUTO REFRESH</span>
      <strong>10s</strong>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

definePageMeta({
  layout: 'admin'
})

interface ResourceSystem {
  cpu_usage_percent: number | null
  memory_usage_percent: number | null
}

interface ApiRequestRate {
  feature: string
  requests_per_second: number
}

interface ApiResponseTime {
  feature: string
  response_time_ms: number
}

interface ApiRequestsInProgress {
  feature: string
  requests_in_progress: number
}

interface ResourceTarget {
  job: string
  instance: string
  up: boolean
}

interface HistoryPoint {
  timestamp: number
  value: number
}

interface HistorySeries {
  feature?: string
  metric?: Record<string, string>
  values: HistoryPoint[]
}

interface MysqlHistorySeries {
  state?: string
  metric?: Record<string, string>
  values: HistoryPoint[]
}

interface MysqlBufferPoolPage {
  state: string
  pages: number
}

interface ResourceHistory {
  range?: {
    start: string
    end: string
    step: string
  }

  cpu?: HistoryPoint[]
  memory?: HistoryPoint[]

  api_requests?: HistorySeries[]
  api_response_time?: HistorySeries[]
  api_requests_5s?: HistorySeries[]
  api_in_progress?: HistorySeries[]

  mysql_connections?: HistoryPoint[]
  mysql_queries?: HistoryPoint[]
  mysql_innodb_buffer_pool?: MysqlHistorySeries[]
}

interface ResourceResponse {
  generated_at: string

  prometheus: {
    status: string
    error?: string
  }

  system: ResourceSystem

  mysql: {
    connections: number | null
    queries_per_second: number | null
    innodb_buffer_pool_pages: MysqlBufferPoolPage[]
  }

  api_requests_per_second: ApiRequestRate[]
  api_average_response_ms: ApiResponseTime[]
  api_requests_in_progress: ApiRequestsInProgress[]
  targets: ResourceTarget[]
  history?: ResourceHistory
}

interface ChartPoint {
  x: number
  y: number
}

interface ChartSeries {
  name: string
  data: ChartPoint[]
}

const { $api } = useNuxtApp()

const resources = ref<ResourceResponse | null>(null)
const isLoading = ref(false)
const loadError = ref('')

let refreshTimer: ReturnType<typeof setInterval> | null = null

const prometheusStatusClass = computed(() => {
  return resources.value?.prometheus.status === 'online'
    ? 'online'
    : 'offline'
})

const prometheusStatusLabel = computed(() => {
  return resources.value?.prometheus.status === 'online'
    ? 'PROMETHEUS ONLINE'
    : 'PROMETHEUS OFFLINE'
})

const onlineTargetCount = computed(() => {
  return resources.value?.targets.filter(target => target.up).length ?? 0
})

const apiRequestRows = computed(() => {
  return [...(resources.value?.api_requests_per_second ?? [])].sort(
    (a, b) => b.requests_per_second - a.requests_per_second
  )
})

const apiResponseRows = computed(() => {
  return [...(resources.value?.api_average_response_ms ?? [])].sort(
    (a, b) => b.response_time_ms - a.response_time_ms
  )
})

const apiInProgressRows = computed(() => {
  return [...(resources.value?.api_requests_in_progress ?? [])].sort(
    (a, b) => b.requests_in_progress - a.requests_in_progress
  )
})

const formattedUpdatedAt = computed(() => {
  const value = resources.value?.generated_at

  if (!value) return '--'

  return new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formatPercent = (value: number | null | undefined) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '--'
  }

  return `${value.toFixed(1)}%`
}

const resourceHistory = computed(() => {
  return resources.value?.history ?? {}
})

const cpuHistory = computed(() => {
  return resourceHistory.value.cpu ?? []
})

const memoryHistory = computed(() => {
  return resourceHistory.value.memory ?? []
})

const apiRequestHistory = computed(() => {
  return resourceHistory.value.api_requests ?? []
})

const apiResponseHistory = computed(() => {
  return resourceHistory.value.api_response_time ?? []
})

const apiRequests5sHistory = computed(() => {
  return resourceHistory.value.api_requests_5s ?? []
})

const mysqlConnectionsHistory = computed(() => {
  return resourceHistory.value.mysql_connections ?? []
})

const mysqlQueriesHistory = computed(() => {
  return resourceHistory.value.mysql_queries ?? []
})

const mysqlInnoDBBufferPoolHistory = computed(() => {
  return resourceHistory.value.mysql_innodb_buffer_pool ?? []
})

const hasHistoryData = computed(() => {
  return (
    cpuHistory.value.length > 0 ||
    memoryHistory.value.length > 0 ||
    apiRequestHistory.value.length > 0 ||
    apiResponseHistory.value.length > 0 ||
    apiRequests5sHistory.value.length > 0 ||
    mysqlConnectionsHistory.value.length > 0 ||
    mysqlQueriesHistory.value.length > 0 ||
    mysqlInnoDBBufferPoolHistory.value.length > 0
  )
})

const toChartPoints = (
  points: HistoryPoint[]
): ChartPoint[] => {
  return points
    .filter(
      point =>
        Number.isFinite(point.timestamp) &&
        Number.isFinite(point.value)
    )
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(point => {
      const timestamp =
        point.timestamp < 1_000_000_000_000
          ? point.timestamp * 1000
          : point.timestamp

      return {
        x: timestamp,
        y: point.value
      }
    })
}

const getSeriesName = (series: HistorySeries) => {
  return series.feature ?? series.metric?.feature ?? 'Other'
}

const getMysqlSeriesName = (
  series: MysqlHistorySeries
) => {
  return series.state ?? series.metric?.state ?? 'Other'
}

const cpuChartSeries = computed<ChartSeries[]>(() => {
  return [
    {
      name: 'CPU使用率',
      data: toChartPoints(cpuHistory.value)
    }
  ]
})

const memoryChartSeries = computed<ChartSeries[]>(() => {
  return [
    {
      name: 'メモリ使用率',
      data: toChartPoints(memoryHistory.value)
    }
  ]
})

const apiRequestChartSeries = computed<ChartSeries[]>(() => {
  return apiRequestHistory.value
    .map(series => ({
      name: getSeriesName(series),
      data: toChartPoints(series.values)
    }))
    .filter(series => series.data.length > 0)
})

const apiResponseChartSeries = computed<ChartSeries[]>(() => {
  return apiResponseHistory.value
    .map(series => ({
      name: getSeriesName(series),
      data: toChartPoints(series.values)
    }))
    .filter(series => series.data.length > 0)
})

const apiRequests5sChartSeries = computed<ChartSeries[]>(() => {
  return apiRequests5sHistory.value
    .map(series => ({
      name: getSeriesName(series),
      data: toChartPoints(series.values)
    }))
    .filter(series => series.data.length > 0)
})

const mysqlConnectionsChartSeries = computed<ChartSeries[]>(() => {
  return [
    {
      name: 'MySQL接続数',
      data: toChartPoints(mysqlConnectionsHistory.value)
    }
  ]
})

const mysqlQueriesChartSeries = computed<ChartSeries[]>(() => {
  return [
    {
      name: 'MySQL Queries / Sec',
      data: toChartPoints(mysqlQueriesHistory.value)
    }
  ]
})

const mysqlInnoDBBufferPoolChartSeries =
  computed<ChartSeries[]>(() => {
    return mysqlInnoDBBufferPoolHistory.value
      .map(series => ({
        name: getMysqlSeriesName(series),
        data: toChartPoints(series.values)
      }))
      .filter(series => series.data.length > 0)
  })

const baseChartOptions = (): ApexOptions => {
  return {
    chart: {
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: false
      },
      background: 'transparent'
    },

    dataLabels: {
      enabled: false
    },

    stroke: {
      curve: 'smooth',
      width: 2
    },

    markers: {
      size: 0,
      hover: {
        size: 5
      }
    },

    grid: {
      borderColor: '#dbe8ec',
      strokeDashArray: 4
    },

    xaxis: {
      type: 'datetime',
      range: 5 * 60 * 1000,
      tickAmount: 5,
      labels: {
        datetimeUTC: false,
        format: 'HH:mm:ss',
        style: {
          colors: '#8ca1aa',
          fontSize: '9px'
        }
      },
      axisBorder: {
        color: '#dbe8ec'
      },
      axisTicks: {
        color: '#dbe8ec'
      }
    },

    tooltip: {
      x: {
        format: 'HH:mm:ss'
      }
    },

    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      fontSize: '10px',
      labels: {
        colors: '#456874'
      }
    },

    noData: {
      text: '履歴データがありません',
      style: {
        color: '#8ca1aa',
        fontSize: '12px'
      }
    }
  }
}

const cpuChartOptions = computed<ApexOptions>(() => {
  return {
    ...baseChartOptions(),

    colors: ['#22b8df'],

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 100]
      }
    },

    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: value => `${value.toFixed(0)}%`,
        style: {
          colors: '#8ca1aa',
          fontSize: '9px'
        }
      }
    }
  }
})

const memoryChartOptions = computed<ApexOptions>(() => {
  return {
    ...baseChartOptions(),

    colors: ['#1597bb'],

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 100]
      }
    },

    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: value => `${value.toFixed(0)}%`,
        style: {
          colors: '#8ca1aa',
          fontSize: '9px'
        }
      }
    }
  }
})

const apiRequestChartOptions = computed<ApexOptions>(() => {
  return {
    ...baseChartOptions(),

    colors: [
      '#22b8df',
      '#31b985',
      '#9b7ede',
      '#ed9f4c',
      '#e26d8b',
      '#6f9eb8',
      '#d2a649',
      '#4f7cac',
      '#8c6bb1'
    ],

    yaxis: {
      min: 0,
      labels: {
        formatter: value => value.toFixed(2),
        style: {
          colors: '#8ca1aa',
          fontSize: '9px'
        }
      }
    }
  }
})

const apiResponseChartOptions =
  computed<ApexOptions>(() => {
    return {
      ...baseChartOptions(),

      colors: [
        '#e26d8b',
        '#22b8df',
        '#31b985',
        '#9b7ede',
        '#ed9f4c',
        '#6f9eb8',
        '#d2a649',
        '#4f7cac',
        '#8c6bb1'
      ],

      yaxis: {
        min: 0,
        labels: {
          formatter: value => value.toFixed(0),
          style: {
            colors: '#8ca1aa',
            fontSize: '9px'
          }
        }
      }
    }
  })

const apiRequests5sChartOptions =
  computed<ApexOptions>(() => {
    return {
      ...baseChartOptions(),

      colors: [
        '#22b8df',
        '#31b985',
        '#9b7ede',
        '#ed9f4c',
        '#e26d8b',
        '#6f9eb8',
        '#d2a649',
        '#4f7cac',
        '#8c6bb1'
      ],

      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: value => value.toFixed(0),
          style: {
            colors: '#8ca1aa',
            fontSize: '9px'
          }
        }
      },

      tooltip: {
        y: {
          formatter: value =>
            `${value.toFixed(0)} requests / 5s`
        }
      }
    }
  })

const mysqlConnectionsChartOptions =
  computed<ApexOptions>(() => {
    return {
      ...baseChartOptions(),

      colors: ['#22b8df'],

      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: value => value.toFixed(0),
          style: {
            colors: '#8ca1aa',
            fontSize: '9px'
          }
        }
      },

      tooltip: {
        y: {
          formatter: value =>
            `${value.toFixed(0)} connections`
        }
      }
    }
  })

const mysqlQueriesChartOptions =
  computed<ApexOptions>(() => {
    return {
      ...baseChartOptions(),

      colors: ['#31b985'],

      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: value => value.toFixed(2),
          style: {
            colors: '#8ca1aa',
            fontSize: '9px'
          }
        }
      },

      tooltip: {
        y: {
          formatter: value =>
            `${value.toFixed(2)} queries / sec`
        }
      }
    }
  })

const mysqlInnoDBBufferPoolChartOptions =
  computed<ApexOptions>(() => {
    return {
      ...baseChartOptions(),

      colors: [
        '#22b8df',
        '#31b985',
        '#9b7ede',
        '#ed9f4c',
        '#e26d8b'
      ],

      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: value => value.toFixed(0),
          style: {
            colors: '#8ca1aa',
            fontSize: '9px'
          }
        }
      },

      tooltip: {
        y: {
          formatter: value =>
            `${value.toFixed(0)} pages`
        }
      }
    }
  })

const fetchResources = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const response =
      await $api.get<ResourceResponse>('/admin/resources')

    resources.value = response.data

    if (response.data.prometheus.status !== 'online') {
      loadError.value =
        response.data.prometheus.error ||
        'Prometheusに接続できません'
    }
  } catch (error: any) {
    console.error(
      'リソース情報の取得に失敗しました:',
      error
    )

    loadError.value =
      error?.response?.data?.prometheus?.error ||
      'リソース情報を取得できませんでした'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchResources()

  refreshTimer = setInterval(() => {
    fetchResources()
  }, 10_000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  padding: 32px;

  background:
    radial-gradient(
      circle at 85% 5%,
      rgba(34, 184, 223, 0.08),
      transparent 24%
    ),
    linear-gradient(
      rgba(34, 184, 223, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.025) 1px,
      transparent 1px
    ),
    #f3f8fb;

  background-size:
    auto,
    32px 32px,
    32px 32px,
    auto;

  color: #17313d;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1500px;
  margin: 0 auto 24px;
}

.eyebrow,
.panel-eyebrow,
.metric-label {
  margin: 0;
  color: #1597bb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.page-header h1 {
  margin: 8px 0 0;
  font-size: 32px;
  font-weight: 800;
}

.description {
  margin: 8px 0 0;
  color: #6d8792;
  font-size: 12px;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.9);
  color: #718891;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.header-status.online {
  border-color: #9ed9c4;
  color: #248f6d;
}

.header-status.offline {
  border-color: #e2b9b1;
  color: #c2574b;
}

.status-dot,
.target-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9aafb6;
}

.header-status.online .status-dot,
.target-indicator.online {
  background: #31b985;
  box-shadow: 0 0 8px rgba(49, 185, 133, 0.45);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  max-width: 1500px;
  margin: 0 auto 16px;
}

.metric-card,
.panel,
.chart-panel {
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 28px rgba(35, 86, 102, 0.07);
}

.metric-card {
  position: relative;
  padding: 20px;
}

.metric-card::before,
.panel::before {
  display: block;
  width: 70px;
  height: 2px;
  margin: -20px 0 18px;
  content: '';
  background: #22b8df;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  font-size: 26px;
  font-variant-numeric: tabular-nums;
}

.metric-card small {
  display: block;
  margin-top: 5px;
  color: #8ca1aa;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.panel {
  padding: 20px;
}

.target-list,
.api-list {
  display: grid;
  gap: 8px;
}

.target-row,
.api-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid #dbe8ec;
  background: #f9fcfd;
}

.target-main,
.api-row > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.target-main strong,
.api-row strong {
  display: block;
  font-size: 11px;
}

.target-main small,
.api-row small {
  display: block;
  margin-top: 2px;
  color: #8ca1aa;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.target-status {
  color: #c2574b;
  font-size: 9px;
  font-weight: 800;
}

.target-status.online {
  color: #248f6d;
}

.api-value {
  white-space: nowrap;
  color: #1597bb;
  font-variant-numeric: tabular-nums;
}

.api-value.active {
  color: #e26d8b;
}

.api-value span {
  color: #7d969f;
  font-size: 8px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #dbe8ec;
}

.panel-header h2 {
  margin: 5px 0 0;
  font-size: 15px;
}

.refresh-button {
  padding: 8px 13px;
  border: 1px solid #bfd4dc;
  background: #ffffff;
  color: #1597bb;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

.error-state,
.empty-state {
  display: grid;
  gap: 6px;
  padding: 18px;
  border: 1px solid #e2b9b1;
  background: #fff8f7;
  color: #c2574b;
}

.empty-state {
  border-color: #dbe8ec;
  background: #f9fcfd;
  color: #78919a;
}

.error-state span,
.empty-state span {
  font-size: 10px;
  line-height: 1.6;
}

.error-state strong {
  font-size: 9px;
  letter-spacing: 0.08em;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 1500px;
  margin: 16px auto 0;
}

.api-in-progress-panel {
  max-width: 1500px;
  margin: 16px auto 0;
}

.history-section {
  max-width: 1500px;
  margin: 28px auto 0;
}

.mysql-section {
  margin-top: 32px;
}

.history-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #cfe2e9;
}

.history-header h2 {
  margin: 5px 0 0;
  font-size: 17px;
}

.history-description {
  margin: 7px 0 0;
  color: #8ca1aa;
  font-size: 10px;
}

.history-period {
  padding: 7px 10px;
  border: 1px solid #cfe2e9;
  background: #ffffff;
  color: #718891;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.chart-panel {
  position: relative;
  min-width: 0;
  padding: 20px;
}

.chart-panel-wide {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #dbe8ec;
}

.chart-eyebrow {
  margin: 0;
  color: #1597bb;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.chart-header h3 {
  margin: 5px 0 0;
  font-size: 14px;
}

.chart-unit {
  padding: 5px 8px;
  border: 1px solid #dbe8ec;
  background: #f9fcfd;
  color: #718891;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.chart-loading {
  display: grid;
  place-items: center;
  height: 320px;
  color: #8ca1aa;
  font-size: 10px;
}

.empty-history {
  display: grid;
  place-items: center;
  min-height: 180px;
  color: #78919a;
  font-size: 10px;
}

.page-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1500px;
  margin: 18px auto 0;
  color: #8ca1aa;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.page-footer strong {
  color: #456874;
  font-size: 9px;
}

.separator {
  color: #bfd0d5;
}

@media (max-width: 1000px) {
  .summary-grid,
  .two-column,
  .chart-grid {
    grid-template-columns: 1fr 1fr;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 680px) {
  .resources-page {
    padding: 18px;
  }

  .summary-grid,
  .two-column,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>