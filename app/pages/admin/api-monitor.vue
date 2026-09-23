<template>
<div class="admin-api-monitor">
  <div class="ambient-grid"></div>
  <div class="ambient-scan"></div>
  <header class="hud-header page-enter">
    <div>
      <p class="eyebrow">06 / API MONITORING</p>
      <h1>API監視</h1>
      <p class="description">フロントエンドから各API・バックエンド・データベースの稼働状況を監視します</p>
    </div>
    <div class="header-actions">
      <div class="monitor-live">
        <span></span>
        LIVE MONITOR / 10s
      </div>
      <button class="refresh-button" :disabled="isLoading" type="button" @click="fetchMonitor">
        <span class="refresh-icon" :class="{ spinning: isLoading }">
          ↻
        </span>
        {{ isLoading ? 'CHECKING...' : '再チェック' }}
      </button>
    </div>
  </header>
  <section class="status-banner page-enter delay-1" :class="statusClass">
    <div class="status-indicator"></div>
    <div class="status-main">
      <span class="status-label">
        API SYSTEM STATUS
      </span>
      <strong>{{ overallStatusLabel }}</strong>
      <p>{{ statusMessage }}</p>
    </div>
    <div class="status-pulse-line"></div>
    <div class="last-check">
      <span>
        LAST CHECK
      </span>
      <strong>{{ monitor?.generated_at ? formatDateTime(monitor.generated_at) : '-' }}</strong>
    </div>
  </section>
  <section class="hud-panel page-enter delay-2">
    <div class="panel-header">
      <div>
        <p class="panel-eyebrow">COMMUNICATION TOPOLOGY</p>
        <h2>Frontend → API Services</h2>
      </div>
      <div class="panel-live">
        <span></span>
        {{ apiCount }} SERVICES / MONITOR ACTIVE
      </div>
    </div>
    <div class="hud-stage">
      <div class="stage-grid"></div>
      <div class="stage-vignette"></div>
      <svg class="topology-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        <line v-for="(api, index) in monitor?.apis ?? []" :key="`base-${api.name}`" class="hud-line base" x1="500" y1="350" :x2="hudNodeX(index)" :y2="hudNodeY(index)" />
        <line v-for="(api, index) in monitor?.apis ?? []" :key="`flow-${api.name}`" class="hud-line" :class="`status-${apiDisplayStatus(api)}`" x1="500" y1="350" :x2="hudNodeX(index)" :y2="hudNodeY(index)" />
      </svg>
      <div class="system-core" :class="statusClass">
        <div class="core-ring ring-outer"></div>
        <div class="core-ring ring-middle"></div>
        <div class="core-ring ring-inner"></div>
        <div class="core-orbit orbit-a"></div>
        <div class="core-orbit orbit-b"></div>
        <div class="core-content">
          <span class="core-kicker">
            SYSTEM CORE
          </span>
          <div class="core-mark">
            <span></span>
            <b>◉</b>
          </div>
          <strong>{{ overallStatusLabel }}</strong>
          <small>NUXT / VUE</small>
          <div class="core-metrics">
            <span>
              API
              <b>{{ apiCount }}</b>
            </span>
            <span>
              AVG
              <b>{{ averageApiResponse }}ms</b>
            </span>
          </div>
        </div>
      </div>
      <button v-for="(api, index) in monitor?.apis ?? []" :key="api.name" class="hud-api-node" :class="`status-${apiDisplayStatus(api)}`" :style="hudNodeStyle(index)" type="button" @click="openDetail(api)">
        <span class="node-corner tl"></span>
        <span class="node-corner tr"></span>
        <span class="node-corner bl"></span>
        <span class="node-corner br"></span>
        <div class="node-top">
          <span class="node-index">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span class="node-state">
            <i>
            </i>
            {{ statusLabel(apiDisplayStatus(api)) }}
          </span>
        </div>
        <strong>{{ apiShortLabel(api.name) }}</strong>
        <span class="node-full-name">
          {{ api.name?.replace(' API', '') ?? 'UNKNOWN API' }}
        </span>
        <div class="node-response">
          <span>
            RESPONSE
          </span>
          <b>{{ api.response_time_ms.toFixed(2) }} ms</b>
        </div>
      </button>
      <div class="scan-sweep"></div>
      <div class="stage-axis axis-x"></div>
      <div class="stage-axis axis-y"></div>
    </div>
  </section>
  <section class="readout-grid page-enter delay-3">
    <div class="readout-card">
      <span>
        API SERVICES
      </span>
      <strong>{{ apiCount }}</strong>
      <small>MONITORED</small>
    </div>
    <div class="readout-card normal">
      <span>
        NORMAL
      </span>
      <strong>{{ normalCount }}</strong>
      <small>ONLINE</small>
    </div>
    <div class="readout-card warning">
      <span>
        WARNING
      </span>
      <strong>{{ warningCount }}</strong>
      <small>DEGRADED</small>
    </div>
    <div class="readout-card maintenance">
      <span>
        MAINTENANCE
      </span>
      <strong>{{ maintenanceCount }}</strong>
      <small>OFFLINE BY ADMIN</small>
    </div>
    <div class="readout-card error">
      <span>
        ERROR
      </span>
      <strong>{{ errorCount }}</strong>
      <small>FAILED</small>
    </div>
  </section>
  <section class="hud-panel infrastructure-panel page-enter delay-4">
    <div class="panel-header">
      <div>
        <p class="panel-eyebrow">INFRASTRUCTURE PATH</p>
        <h2>Backend → Database</h2>
      </div>
      <div class="panel-live">
        <span></span>
        LIVE
      </div>
    </div>
    <div class="infra-path">
      <div class="infra-node" :class="backendStatusClass">
        <div class="infra-index">
          01
        </div>
        <div class="infra-info">
          <span>
            BACKEND
          </span>
          <strong>Rails 8.1.1</strong>
        </div>
        <div class="infra-state">
          <i>
          </i>
          {{ backendStatusLabel }}
        </div>
        <div class="infra-time">
          {{ backendResponseTime }}
        </div>
      </div>
      <div class="infra-connection" :class="{ active: monitor?.database.status === 'normal' }">
        <span></span>
      </div>
      <div class="infra-node" :class="databaseStateClass">
        <div class="infra-index">
          02
        </div>
        <div class="infra-info">
          <span>
            DATABASE
          </span>
          <strong>MySQL</strong>
        </div>
        <div class="infra-state">
          <i>
          </i>
          {{ databaseStatusLabel }}
        </div>
        <div class="infra-time">
          {{ databaseResponseTime }}
        </div>
      </div>
    </div>
  </section>
  <section class="hud-panel api-list-panel page-enter delay-5">
    <div class="panel-header">
      <div>
        <p class="panel-eyebrow">SERVICE MATRIX</p>
        <h2>API一覧</h2>
      </div>
      <div class="service-count">
        {{ apiCount }} SERVICES
      </div>
    </div>
    <div class="api-list">
      <div v-for="(api, index) in monitor?.apis ?? []" :key="api.name" class="api-list-row" :class="`status-${apiDisplayStatus(api)}`" role="button" tabindex="0" @click="openDetail(api)" @keydown.enter="openDetail(api)" @keydown.space.prevent="openDetail(api)">
        <span class="api-list-index">
          {{ String(index + 1).padStart(2, '0') }}
        </span>
        <span class="api-list-indicator">
          <i>
          </i>
        </span>
        <span class="api-list-name">
          <strong>{{ api.name }}</strong>
          <small>{{ apiDefinitions[api.name]?.description ?? 'API service' }}</small>
        </span>
        <span class="api-list-response">
          <small>RESPONSE</small>
          <strong>{{ api.enabled === false ? '—' : `${api.response_time_ms.toFixed(2)} ms` }}</strong>
        </span>
        <span class="api-list-state">
          {{ statusLabel(apiDisplayStatus(api)) }}
        </span>
        <button type="button" class="api-switch" :class="{ active: api.enabled !== false, maintenance: api.enabled === false }" :disabled="updatingApiName === api.name" :aria-pressed="api.enabled !== false" :aria-label="`${api.name} を${api.enabled === false ? 'ONに戻す' : 'メンテナンスにする'}`" @click.stop="toggleApiMaintenance(api)">
          <span class="api-switch-track">
            <span class="api-switch-thumb"></span>
          </span>
          <span class="api-switch-label">
            {{ api.enabled === false ? 'OFF' : 'ON' }}
          </span>
        </button>
        <span class="api-list-arrow">
          →
        </span>
      </div>
    </div>
  </section>
  <Transition name="modal">
    <div v-if="isDetailOpen && selectedApi" class="modal-overlay" @click.self="closeDetail">
      <div class="api-detail-modal">
        <div class="modal-header">
          <div>
            <p class="modal-eyebrow">API DETAIL / NODE {{ String((monitor?.apis ?? []).findIndex(api => api.name === selectedApi?.name) + 1).padStart(2, '0') }}</p>
            <h2>{{ selectedApi.name }}</h2>
          </div>
          <button class="close-button" type="button" @click="closeDetail">×</button>
        </div>
        <div class="modal-status-row">
          <div class="modal-status" :class="`status-${apiDisplayStatus(selectedApi)}`">
            <span></span>
            {{ statusLabel(apiDisplayStatus(selectedApi)) }}
          </div>
          <div class="modal-response">
            {{ selectedApi.enabled === false ? 'MAINTENANCE' : `${selectedApi.response_time_ms.toFixed(2)} ms` }}
          </div>
        </div>
        <div class="modal-maintenance-section">
          <div>
            <span class="modal-section-label">SERVICE CONTROL</span>
            <p>このAPIを一時停止してメンテナンス状態にします。</p>
          </div>
          <button type="button" class="api-switch modal-switch" :class="{ active: selectedApi.enabled !== false, maintenance: selectedApi.enabled === false }" :disabled="updatingApiName === selectedApi.name" :aria-pressed="selectedApi.enabled !== false" @click="toggleApiMaintenance(selectedApi)">
            <span class="api-switch-track">
              <span class="api-switch-thumb"></span>
            </span>
            <span class="api-switch-label">
              {{ selectedApi.enabled === false ? 'OFF / MAINTENANCE' : 'ON / ONLINE' }}
            </span>
          </button>
        </div>
        <div v-if="selectedApiDefinition" class="modal-section">
          <span class="modal-section-label">
            DESCRIPTION
          </span>
          <p>{{ selectedApiDefinition.description }}</p>
        </div>
        <div v-if="selectedApiDefinition" class="modal-section">
          <span class="modal-section-label">
            ENDPOINTS
          </span>
          <div class="endpoint-list">
            <div v-for="endpoint in selectedApiDefinition.endpoints" :key="endpoint" class="endpoint-item">
              {{ endpoint }}
            </div>
          </div>
        </div>
        <div v-if="selectedApi.error" class="modal-section modal-error">
          <span class="modal-section-label">
            ERROR
          </span>
          <div class="error-detail">
            <div>
              <span>
                CLASS
              </span>
              <strong>{{ selectedApi.error.class }}</strong>
            </div>
            <div>
              <span>
                MESSAGE
              </span>
              <strong>{{ selectedApi.error.message }}</strong>
            </div>
            <div v-if="selectedApi.error.status_code">
              <span>
                HTTP STATUS
              </span>
              <strong>{{ selectedApi.error.status_code }}</strong>
            </div>
            <div v-if="selectedApi.error.missing_models">
              <span>
                MISSING MODELS
              </span>
              <strong>{{ selectedApi.error.missing_models.join(', ') }}</strong>
            </div>
          </div>
        </div>
        <div v-else class="modal-ok">
          <span>
            ✓
          </span>
          <strong>現在エラーは検出されていません</strong>
        </div>
      </div>
    </div>
  </Transition>
  <Transition name="floating-error">
    <div v-if="loadError" class="floating-error">
      <span>
        !
      </span>
      {{ loadError }}
    </div>
  </Transition>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

type ApiStatus = 'normal' | 'warning' | 'error'
type ApiDisplayStatus = ApiStatus | 'maintenance'

interface ApiError {
  class: string
  message: string
  status_code?: number
  missing_models?: string[]
}

interface ApiMonitorItem {
  name: string
  status: ApiStatus
  response_time_ms: number
  error: ApiError | null
  enabled?: boolean
}

interface BackendStatus {
  status: ApiStatus
  response_time_ms: number
}

interface DatabaseStatus {
  status: ApiStatus
  response_time_ms: number
  error: string | null
}

interface ApiMonitorResponse {
  status: ApiStatus
  backend: BackendStatus
  database: DatabaseStatus
  apis: ApiMonitorItem[]
  generated_at: string
}

interface ApiDefinition {
  endpoints: string[]
  description: string
}

const { $api } = useNuxtApp()

const monitor = ref<ApiMonitorResponse | null>(null)
const isLoading = ref(false)
const loadError = ref('')
const selectedApiName = ref<string | null>(null)
const isDetailOpen = ref(false)
const updatingApiName = ref<string | null>(null)

const selectedApi = computed<ApiMonitorItem | null>(() => {
  if (!selectedApiName.value) {
    return null
  }

  return monitor.value?.apis.find(api => api.name === selectedApiName.value) ?? null
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

const apiDefinitions: Record<string, ApiDefinition> = {
  'User API': {
    description: 'ユーザー情報を管理するAPI',
    endpoints: [
      'GET /users',
      'POST /users',
      'GET /users/:id',
      'PATCH /users/:id',
      'PUT /users/:id',
      'DELETE /users/:id',
      'GET /me'
    ]
  },
  'Organization API': {
    description: '組織情報を管理するAPI',
    endpoints: [
      'GET /organizations',
      'POST /organizations',
      'GET /organizations/:id',
      'PATCH /organizations/:id',
      'PUT /organizations/:id',
      'DELETE /organizations/:id'
    ]
  },
  'Organization User API': {
    description: '組織に所属するユーザーを管理するAPI',
    endpoints: [
      'GET /organizations/:organization_id/users'
    ]
  },
  'Personal Transaction API': {
    description: '個人家計簿の取引を管理するAPI',
    endpoints: [
      'GET /personal_transactions',
      'POST /personal_transactions',
      'GET /personal_transactions/:id',
      'PATCH /personal_transactions/:id',
      'PUT /personal_transactions/:id',
      'DELETE /personal_transactions/:id',
      'GET /personal_transactions/summary',
      'GET /personal_transactions/history_summary'
    ]
  },
  'Organization Transaction API': {
    description: '組織家計簿の取引を管理するAPI',
    endpoints: [
      'GET /organization_transactions',
      'POST /organization_transactions',
      'GET /organization_transactions/:id',
      'PATCH /organization_transactions/:id',
      'PUT /organization_transactions/:id',
      'DELETE /organization_transactions/:id',
      'GET /organization_transactions/summary',
      'GET /organization_transactions/history_summary'
    ]
  },
  'Personal Account API': {
    description: '個人家計簿の口座を管理するAPI',
    endpoints: [
      'GET /personal_accounts',
      'POST /personal_accounts',
      'GET /personal_accounts/:id',
      'POST /personal_accounts/transfer',
      'PATCH /personal_accounts/:id/add_balance',
      'PATCH /personal_accounts/:id/subtract_balance'
    ]
  },
  'Organization Account API': {
    description: '組織家計簿の口座を管理するAPI',
    endpoints: [
      'GET /organization_accounts',
      'POST /organization_accounts',
      'GET /organization_accounts/:id',
      'POST /organization_accounts/transfer',
      'PATCH /organization_accounts/:id/add_balance',
      'PATCH /organization_accounts/:id/subtract_balance'
    ]
  },
  'Bank API': {
    description: '銀行情報を取得するAPI',
    endpoints: [
      'GET /banks'
    ]
  },
  'AI API': {
    description: 'Geminiと通信するAI API',
    endpoints: [
      'POST /chat',
      'POST /personal_chat'
    ]
  }
}

const hudNodePositions = Array.from({ length: 9 }, (_, index) => {
  const angle = (-90 + index * 40) * Math.PI / 180

  return {
    x: 50 + 34 * Math.cos(angle),
    y: 50 + 34 * Math.sin(angle)
  }
})

const hudNodeStyle = (index: number) => {
  const position = hudNodePositions[index] ?? { x: 50, y: 50 }

  return {
    left: `${position.x}%`,
    top: `${position.y}%`
  }
}

const hudNodeX = (index: number) => {
  return Math.round((hudNodePositions[index]?.x ?? 50) * 10)
}

const hudNodeY = (index: number) => {
  return Math.round((hudNodePositions[index]?.y ?? 50) * 7)
}

const apiShortLabel = (name?: string) => {
  const labels: Record<string, string> = {
    'User API': 'USER',
    'Organization API': 'ORGANIZATION',
    'Organization User API': 'ORG USERS',
    'Personal Transaction API': 'PERSONAL TX',
    'Organization Transaction API': 'ORG TX',
    'Personal Account API': 'PERSONAL ACCOUNT',
    'Organization Account API': 'ORG ACCOUNT',
    'Bank API': 'BANK',
    'AI API': 'AI'
  }

  if (!name) {
    return 'UNKNOWN API'
  }

  return labels[name] ?? name.replace(/ API$/, '').toUpperCase()
}

const apiCount = computed(() => {
  return monitor.value?.apis.length ?? 0
})

const normalCount = computed(() => {
  return monitor.value?.apis.filter(api => api.enabled !== false && api.status === 'normal').length ?? 0
})

const warningCount = computed(() => {
  return monitor.value?.apis.filter(api => api.enabled !== false && api.status === 'warning').length ?? 0
})

const errorCount = computed(() => {
  return monitor.value?.apis.filter(api => api.enabled !== false && api.status === 'error').length ?? 0
})

const maintenanceCount = computed(() => {
  return monitor.value?.apis.filter(api => api.enabled === false).length ?? 0
})

const averageApiResponse = computed(() => {
  const apis = (monitor.value?.apis ?? []).filter(api => api.enabled !== false)

  if (!apis.length) {
    return '0.00'
  }

  const total = apis.reduce(
    (sum, api) => sum + api.response_time_ms,
    0
  )

  return (total / apis.length).toFixed(2)
})

const selectedApiDefinition = computed<ApiDefinition | null>(() => {
  if (!selectedApi.value) {
    return null
  }

  return apiDefinitions[selectedApi.value.name] ?? null
})

const apiDisplayStatus = (api: ApiMonitorItem): ApiDisplayStatus => {
  return api.enabled === false ? 'maintenance' : api.status
}

const overallStatusLabel = computed(() => {
  if (!monitor.value) {
    return 'UNKNOWN'
  }

  if (monitor.value.status === 'error') {
    return 'ERROR'
  }

  if (monitor.value.status === 'warning') {
    return 'WARNING'
  }

  return 'NORMAL'
})

const statusClass = computed(() => {
  if (monitor.value?.status === 'error') {
    return 'error'
  }

  if (monitor.value?.status === 'warning') {
    return 'warning'
  }

  return 'normal'
})

const statusMessage = computed(() => {
  if (!monitor.value) {
    return '監視情報を取得しています'
  }

  if (monitor.value.status === 'error') {
    return '監視対象APIに異常が検出されています'
  }

  if (monitor.value.status === 'warning') {
    return 'API応答に遅延または劣化が検出されています'
  }

  return 'すべての監視対象APIが正常に稼働しています'
})

const backendStatusLabel = computed(() => {
  if (monitor.value?.backend.status === 'normal') {
    return 'ONLINE'
  }

  if (monitor.value?.backend.status === 'warning') {
    return 'WARNING'
  }

  return 'ERROR'
})

const backendStatusClass = computed(() => {
  if (monitor.value?.backend.status === 'normal') {
    return 'normal'
  }

  if (monitor.value?.backend.status === 'warning') {
    return 'warning'
  }

  return 'error'
})

const databaseStatusLabel = computed(() => {
  if (monitor.value?.database.status === 'normal') {
    return 'ONLINE'
  }

  if (monitor.value?.database.status === 'warning') {
    return 'WARNING'
  }

  return 'ERROR'
})

const databaseStateClass = computed(() => {
  if (monitor.value?.database.status === 'normal') {
    return 'normal'
  }

  if (monitor.value?.database.status === 'warning') {
    return 'warning'
  }

  return 'error'
})

const backendResponseTime = computed(() => {
  if (!monitor.value) {
    return '-'
  }

  return `${monitor.value.backend.response_time_ms.toFixed(2)} ms`
})

const databaseResponseTime = computed(() => {
  if (!monitor.value) {
    return '-'
  }

  return `${monitor.value.database.response_time_ms.toFixed(2)} ms`
})

const statusLabel = (status: ApiDisplayStatus) => {
  if (status === 'normal') {
    return 'ONLINE'
  }

  if (status === 'warning') {
    return 'WARNING'
  }

  if (status === 'maintenance') {
    return 'MAINTENANCE'
  }

  return 'ERROR'
}

const formatDateTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const fetchMonitor = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const response = await $api.get<ApiMonitorResponse>(
      '/admin/api_monitor'
    )

    const previousEnabled = new Map(
      (monitor.value?.apis ?? []).map(api => [api.name, api.enabled])
    )

    monitor.value = {
      ...response.data,
      apis: response.data.apis.map(api => ({
        ...api,
        enabled: api.enabled ?? previousEnabled.get(api.name) ?? true
      }))
    }
  } catch (error: any) {
    console.error('API監視情報の取得に失敗しました:', error)

    if (error?.response?.status === 403) {
      loadError.value = '管理者権限が必要です。'
    } else {
      loadError.value = 'API監視情報の取得に失敗しました。'
    }
  } finally {
    isLoading.value = false
  }
}

const openDetail = (api: ApiMonitorItem) => {
  selectedApiName.value = api.name
  isDetailOpen.value = true
}

const closeDetail = () => {
  isDetailOpen.value = false
  selectedApiName.value = null
}

const toggleApiMaintenance = async (api: ApiMonitorItem) => {
  if (updatingApiName.value === api.name) {
    return
  }

  const previousEnabled = api.enabled !== false
  const nextEnabled = !previousEnabled
  updatingApiName.value = api.name
  loadError.value = ''

  if (monitor.value) {
    monitor.value = {
      ...monitor.value,
      apis: monitor.value.apis.map(item =>
        item.name === api.name
          ? { ...item, enabled: nextEnabled }
          : item
      )
    }
  }

  try {
    const response = await $api.patch<{
      message: string
      api_name: string
      enabled: boolean
    }>('/admin/api_monitor/maintenance', {
      api_name: api.name,
      enabled: nextEnabled
    })

    const confirmedEnabled =
      typeof response.data?.enabled === 'boolean'
        ? response.data.enabled
        : nextEnabled

    if (monitor.value) {
      monitor.value = {
        ...monitor.value,
        apis: monitor.value.apis.map(item =>
          item.name === api.name
            ? { ...item, enabled: confirmedEnabled }
            : item
        )
      }
    }
  } catch (error: any) {
    console.error('APIメンテナンス状態の更新に失敗しました:', error)

    if (monitor.value) {
      monitor.value = {
        ...monitor.value,
        apis: monitor.value.apis.map(item =>
          item.name === api.name
            ? { ...item, enabled: previousEnabled }
            : item
        )
      }
    }

    loadError.value =
      error?.response?.status === 403
        ? '管理者権限が必要です。'
        : `${api.name} のメンテナンス状態を更新できませんでした。`
  } finally {
    updatingApiName.value = null
  }
}

const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer = setInterval(fetchMonitor, 10000)
}

const stopAutoRefresh = () => {
  if (!refreshTimer) {
    return
  }

  clearInterval(refreshTimer)
  refreshTimer = null
}

onMounted(async () => {
  await fetchMonitor()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.admin-api-monitor {
  position:relative;
  isolation:isolate;
  min-height:100vh;
  padding:28px 30px 48px;
  box-sizing:border-box;
  overflow:hidden;
  background:radial-gradient(circle at 50% 45%,rgba(57,216,255,.055),transparent 30%),radial-gradient(circle at 88% 8%,rgba(57,216,255,.07),transparent 24%),linear-gradient(rgba(57,216,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(57,216,255,.028) 1px,transparent 1px),#04080f;
  background-size:auto,auto,34px 34px,34px 34px,auto;
  color:#e8faff;
  font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;
}

.ambient-grid {
  position:absolute;
  inset:0;
  z-index:-3;
  pointer-events:none;
  opacity:.22;
  background-image:linear-gradient(rgba(57,216,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(57,216,255,.035) 1px,transparent 1px);
  background-size:56px 56px;
  mask-image:linear-gradient(to bottom,#000,transparent 92%);
  animation:grid-drift 18s linear infinite;
}

.ambient-scan {
  position:absolute;
  left:0;
  right:0;
  top:-18%;
  height:18%;
  z-index:-2;
  pointer-events:none;
  opacity:.18;
  background:linear-gradient(to bottom,transparent,rgba(57,216,255,.1),transparent);
  filter:blur(12px);
  animation:ambient-scan 9s linear infinite;
}

.hud-header,.status-banner,.hud-panel,.readout-grid {
  width:min(100%,1420px);
  margin:0 auto;
}

.hud-header {
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:24px;
  margin-bottom:16px;
}

.eyebrow,.panel-eyebrow,.modal-eyebrow {
  margin:0 0 7px;
  color:#42d9ff;
  font-size:10px;
  font-weight:800;
  letter-spacing:.18em;
}

.hud-header h1 {
  margin:0;
  color:#ecfbff;
  font-size:31px;
  letter-spacing:.04em;
}

.description {
  margin:7px 0 0;
  color:#66828e;
  font-size:11px;
}

.header-actions {
  display:flex;
  align-items:center;
  gap:13px;
}

.monitor-live,.panel-live,.service-count {
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#5fdff4;
  font-size:8px;
  font-weight:800;
  letter-spacing:.12em;
}

.monitor-live span,.panel-live span {
  width:5px;
  height:5px;
  border-radius:50%;
  background:#54f2c0;
  box-shadow:0 0 8px rgba(84,242,192,.8);
  animation:status-pulse 1.5s ease-in-out infinite;
}

.refresh-button {
  display:flex;
  align-items:center;
  gap:7px;
  height:36px;
  padding:0 12px;
  border:1px solid #244757;
  background:rgba(5,18,28,.78);
  color:#8deaff;
  font:800 9px 'SFMono-Regular',Consolas,monospace;
  cursor:pointer;
  transition:.2s;
}

.refresh-button:hover:not(:disabled) {
  border-color:#39d8ff;
  background:rgba(8,31,44,.9);
  box-shadow:0 0 20px rgba(57,216,255,.07);
}

.refresh-button:disabled {
  opacity:.55;
  cursor:not-allowed;
}

.refresh-icon {
  display:inline-block;
  font-size:15px;
  line-height:1;
}

.refresh-icon.spinning {
  animation:spin .8s linear infinite;
}

.status-banner,.hud-panel {
  border:1px solid #173746;
  background:linear-gradient(145deg,rgba(5,18,28,.96),rgba(3,9,15,.97));
  box-shadow:inset 0 0 35px rgba(0,150,220,.025),0 16px 38px rgba(0,0,0,.14);
}

.status-banner {
  position:relative;
  display:flex;
  align-items:center;
  gap:14px;
  min-height:76px;
  padding:15px 18px;
  margin-bottom:14px;
  overflow:hidden;
}

.status-banner::before {
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:2px;
  content:"";
  background:#39d8ff;
  box-shadow:0 0 14px rgba(57,216,255,.55);
}

.status-banner.warning {
  border-color:#66532b;
}

.status-banner.warning::before {
  background:#e8ba54;
  box-shadow:0 0 14px rgba(232,186,84,.5);
}

.status-banner.error {
  border-color:#653b38;
}

.status-banner.error::before {
  background:#ff7764;
  box-shadow:0 0 14px rgba(255,119,100,.5);
}

.status-indicator {
  width:11px;
  height:11px;
  flex-shrink:0;
  border-radius:50%;
  background:#54f2c0;
  box-shadow:0 0 12px rgba(84,242,192,.8);
  animation:status-pulse 1.8s ease-in-out infinite;
}

.status-banner.warning .status-indicator {
  background:#e8ba54;
  box-shadow:0 0 12px rgba(232,186,84,.7);
}

.status-banner.error .status-indicator {
  background:#ff7764;
  box-shadow:0 0 12px rgba(255,119,100,.7);
}

.status-main {
  min-width:0;
  flex:1;
}

.status-label,.last-check span {
  display:block;
  color:#4f6f7c;
  font-size:7px;
  font-weight:800;
  letter-spacing:.15em;
}

.status-main strong {
  display:block;
  margin-top:4px;
  color:#f0fdff;
  font-size:17px;
}

.status-main p {
  margin:4px 0 0;
  color:#6d8792;
  font-size:9px;
}

.status-pulse-line {
  width:110px;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(57,216,255,.4),transparent);
  animation:pulse-line 2.4s ease-in-out infinite;
}

.last-check {
  text-align:right;
}

.last-check strong {
  display:block;
  margin-top:4px;
  color:#9cb8c3;
  font-size:9px;
}

.hud-panel {
  position:relative;
  overflow:hidden;
  margin-bottom:14px;
}

.panel-header {
  position:relative;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  padding:13px 16px;
  border-bottom:1px solid #143342;
}

.panel-header::after {
  position:absolute;
  left:-20%;
  bottom:-1px;
  width:20%;
  height:1px;
  content:"";
  background:linear-gradient(90deg,transparent,rgba(57,216,255,.65),transparent);
  animation:header-scan 5s linear infinite;
}

.panel-header h2 {
  margin:0;
  color:#e9fbff;
  font-size:14px;
  letter-spacing:.04em;
}

.panel-eyebrow {
  margin-bottom:5px;
}

.panel-live {
  white-space:nowrap;
}

.hud-stage {
  position:relative;
  min-height:700px;
  overflow:hidden;
  background:radial-gradient(circle at 50% 50%,rgba(57,216,255,.055),transparent 17%),radial-gradient(circle at 50% 50%,rgba(57,216,255,.03),transparent 38%),#02070d;
}

.stage-grid {
  position:absolute;
  inset:0;
  background:linear-gradient(rgba(57,216,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(57,216,255,.035) 1px,transparent 1px);
  background-size:40px 40px;
  mask-image:radial-gradient(circle at center,#000 12%,rgba(0,0,0,.7) 42%,transparent 82%);
  opacity:.7;
}

.stage-vignette {
  position:absolute;
  inset:0;
  background:radial-gradient(circle at center,transparent 18%,rgba(0,0,0,.16) 58%,rgba(0,0,0,.58) 100%);
}

.topology-lines {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  z-index:1;
}

.hud-line {
  fill:none;
  vector-effect:non-scaling-stroke;
}

.hud-line.base {
  stroke:#163745;
  stroke-width:1;
  opacity:.85;
}

.hud-line.status-normal {
  stroke:#39d8ff;
  stroke-width:1.35;
  stroke-dasharray:6 11;
  animation:line-flow 1.7s linear infinite;
  filter:drop-shadow(0 0 4px rgba(57,216,255,.45));
}

.hud-line.status-warning {
  stroke:#e8ba54;
  stroke-width:1.35;
  stroke-dasharray:6 11;
  animation:line-flow 1.35s linear infinite;
  filter:drop-shadow(0 0 4px rgba(232,186,84,.45));
}

.hud-line.status-error {
  stroke:#ff7764;
  stroke-width:1.5;
  stroke-dasharray:4 9;
  animation:line-flow .9s linear infinite;
  filter:drop-shadow(0 0 5px rgba(255,119,100,.55));
}

.hud-line.status-maintenance {
  stroke:#b99be8;
  stroke-width:1.15;
  stroke-dasharray:2 10;
  opacity:.75;
}

.system-core {
  position:absolute;
  left:50%;
  top:50%;
  z-index:4;
  width:230px;
  height:230px;
  transform:translate(-50%,-50%);
  border:1px solid rgba(57,216,255,.36);
  border-radius:50%;
  background:radial-gradient(circle,rgba(8,27,39,.92),rgba(2,8,13,.98) 68%);
  box-shadow:0 0 65px rgba(57,216,255,.08),inset 0 0 45px rgba(57,216,255,.045);
}

.system-core.warning {
  border-color:rgba(232,186,84,.5);
  box-shadow:0 0 70px rgba(232,186,84,.08),inset 0 0 45px rgba(232,186,84,.04);
}

.system-core.error {
  border-color:rgba(255,119,100,.55);
  box-shadow:0 0 70px rgba(255,119,100,.08),inset 0 0 45px rgba(255,119,100,.04);
}

.core-ring {
  position:absolute;
  inset:0;
  border-radius:50%;
  pointer-events:none;
}

.ring-outer {
  inset:-15px;
  border:1px solid rgba(57,216,255,.15);
  border-left-color:transparent;
  border-right-color:transparent;
  animation:ring-spin 8s linear infinite;
}

.ring-middle {
  inset:-30px;
  border:1px dashed rgba(57,216,255,.11);
  animation:ring-spin-reverse 13s linear infinite;
}

.ring-inner {
  inset:22px;
  border:1px solid rgba(57,216,255,.09);
  animation:core-breathe 2.8s ease-in-out infinite;
}

.core-orbit {
  position:absolute;
  left:50%;
  top:50%;
  border:1px solid rgba(57,216,255,.18);
  border-radius:50%;
  transform-origin:center;
}

.orbit-a {
  width:276px;
  height:108px;
  transform:translate(-50%,-50%) rotate(22deg);
  animation:orbit-a 6s linear infinite;
}

.orbit-b {
  width:108px;
  height:276px;
  transform:translate(-50%,-50%) rotate(-28deg);
  animation:orbit-b 8s linear infinite;
}

.core-content {
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
}

.core-kicker {
  color:#58818f;
  font-size:8px;
  font-weight:800;
  letter-spacing:.2em;
}

.core-mark {
  position:relative;
  width:66px;
  height:66px;
  display:grid;
  place-items:center;
  margin:10px 0 4px;
  border:1px solid rgba(57,216,255,.3);
  border-radius:50%;
  box-shadow:0 0 26px rgba(57,216,255,.08),inset 0 0 18px rgba(57,216,255,.06);
}

.core-mark::before,.core-mark::after {
  position:absolute;
  content:"";
  background:#39d8ff;
  box-shadow:0 0 8px rgba(57,216,255,.7);
}

.core-mark::before {
  width:1px;
  height:90px;
  opacity:.45;
}

.core-mark::after {
  width:90px;
  height:1px;
  opacity:.25;
}

.core-mark span {
  position:absolute;
  inset:10px;
  border:1px solid rgba(57,216,255,.28);
  border-radius:50%;
  animation:core-breathe 2s ease-in-out infinite;
}

.core-mark b {
  position:relative;
  color:#dffaff;
  font-size:23px;
}

.core-content strong {
  font-size:20px;
  letter-spacing:.1em;
  color:#dffaff;
}

.system-core.warning .core-content strong {
  color:#f3d57e;
}

.system-core.error .core-content strong {
  color:#ffab9c;
}

.core-content small {
  margin-top:4px;
  color:#5f7b86;
  font-size:7px;
  letter-spacing:.12em;
}

.core-metrics {
  display:flex;
  gap:14px;
  margin-top:13px;
  padding-top:8px;
  border-top:1px solid rgba(31,69,82,.7);
  color:#54717e;
  font-size:7px;
  letter-spacing:.1em;
}

.core-metrics b {
  margin-left:4px;
  color:#b9dae3;
  font-size:8px;
}

.hud-api-node {
  position:absolute;
  z-index:5;
  width:182px;
  min-height:124px;
  padding:13px 14px;
  transform:translate(-50%,-50%);
  border:1px solid #1a3a49;
  background:linear-gradient(145deg,rgba(6,20,30,.96),rgba(2,10,16,.98));
  color:#e5faff;
  text-align:left;
  cursor:pointer;
  transition:.2s;
  box-shadow:inset 0 0 24px rgba(57,216,255,.018),0 14px 28px rgba(0,0,0,.2);
}

.hud-api-node:hover {
  transform:translate(-50%,-50%) scale(1.035);
  border-color:#39d8ff;
  box-shadow:0 0 22px rgba(57,216,255,.08),inset 0 0 24px rgba(57,216,255,.04);
}

.hud-api-node.status-normal {
  border-color:#245444;
}

.hud-api-node.status-warning {
  border-color:#62512b;
}

.hud-api-node.status-error {
  border-color:#613a36;
}

.hud-api-node.status-maintenance {
  border-color:#5a4b72;
  opacity:.86;
}

.node-corner {
  position:absolute;
  width:8px;
  height:8px;
  border-color:#3cdcff;
}

.node-corner.tl {
  left:-1px;
  top:-1px;
  border-left:1px solid;
  border-top:1px solid;
}

.node-corner.tr {
  right:-1px;
  top:-1px;
  border-right:1px solid;
  border-top:1px solid;
}

.node-corner.bl {
  left:-1px;
  bottom:-1px;
  border-left:1px solid;
  border-bottom:1px solid;
}

.node-corner.br {
  right:-1px;
  bottom:-1px;
  border-right:1px solid;
  border-bottom:1px solid;
}

.status-warning .node-corner {
  border-color:#e8ba54;
}

.status-error .node-corner {
  border-color:#ff7764;
}

.node-top {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
}

.node-index {
  color:#3dd8ff;
  font-size:8px;
  font-weight:800;
}

.node-state {
  display:inline-flex;
  align-items:center;
  gap:5px;
  color:#79eabc;
  font-size:7px;
  font-weight:800;
  letter-spacing:.08em;
}

.node-state i,.api-list-indicator i,.infra-state i,.modal-status span {
  width:5px;
  height:5px;
  border-radius:50%;
  background:currentColor;
  box-shadow:0 0 7px currentColor;
}

.hud-api-node.status-warning .node-state {
  color:#e8ba54;
}

.hud-api-node.status-error .node-state {
  color:#ff9987;
}

.hud-api-node.status-maintenance .node-state {
  color:#b99be8;
}

.status-maintenance .node-corner {
  border-color:#b99be8;
}

.hud-api-node>strong {
  display:block;
  margin-top:15px;
  color:#eafcff;
  font-size:15px;
  letter-spacing:.05em;
}

.node-full-name {
  display:block;
  margin-top:3px;
  color:#557581;
  font-size:7px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.node-response {
  display:flex;
  justify-content:space-between;
  gap:10px;
  margin-top:11px;
  padding-top:9px;
  border-top:1px solid rgba(25,54,66,.8);
  font-size:7px;
}

.node-response span {
  color:#4f6e79;
  letter-spacing:.1em;
}

.node-response b {
  color:#a6d4df;
  font-variant-numeric:tabular-nums;
}

.scan-sweep {
  position:absolute;
  left:0;
  right:0;
  top:-10%;
  height:14%;
  z-index:3;
  pointer-events:none;
  background:linear-gradient(to bottom,transparent,rgba(57,216,255,.08),transparent);
  filter:blur(8px);
  animation:stage-scan 7s linear infinite;
}

.stage-axis {
  position:absolute;
  z-index:2;
  pointer-events:none;
  background:rgba(57,216,255,.05);
}

.axis-x {
  left:8%;
  right:8%;
  top:50%;
  height:1px;
}

.axis-y {
  top:8%;
  bottom:8%;
  left:50%;
  width:1px;
}

.readout-grid {
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:10px;
  margin-bottom:14px;
}

.readout-card {
  position:relative;
  padding:13px 15px;
  border:1px solid #173847;
  background:rgba(4,13,20,.9);
  overflow:hidden;
}

.readout-card::before {
  position:absolute;
  left:0;
  top:0;
  width:32%;
  height:1px;
  content:"";
  background:#39d8ff;
  box-shadow:0 0 10px rgba(57,216,255,.45);
}

.readout-card span {
  display:block;
  color:#52727f;
  font-size:7px;
  font-weight:800;
  letter-spacing:.14em;
}

.readout-card strong {
  display:block;
  margin-top:6px;
  color:#e8fbff;
  font-size:21px;
  font-variant-numeric:tabular-nums;
}

.readout-card small {
  display:block;
  margin-top:2px;
  color:#5d7884;
  font-size:7px;
}

.readout-card.normal::before {
  background:#79eabc;
}

.readout-card.normal strong {
  color:#79eabc;
}

.readout-card.warning::before {
  background:#e8ba54;
}

.readout-card.warning strong {
  color:#e8ba54;
}

.readout-card.error::before {
  background:#ff9987;
}

.readout-card.error strong {
  color:#ff9987;
}

.readout-card.maintenance::before {
  background:#b99be8;
}

.readout-card.maintenance strong {
  color:#b99be8;
}

.infrastructure-panel {
  margin-bottom:14px;
}

.infra-path {
  display:grid;
  grid-template-columns:minmax(0,1fr) 100px minmax(0,1fr);
  align-items:center;
  padding:19px 20px;
}

.infra-node {
  display:grid;
  grid-template-columns:38px minmax(0,1fr) auto auto;
  align-items:center;
  gap:12px;
  min-height:66px;
  padding:0 13px;
  border:1px solid #1b3c4a;
  background:rgba(4,14,21,.9);
}

.infra-node.normal {
  border-color:#245444;
}

.infra-node.error {
  border-color:#613a36;
}

.infra-index {
  color:#3bdcff;
  font-size:8px;
}

.infra-info span {
  display:block;
  color:#4f6e79;
  font-size:7px;
  letter-spacing:.12em;
}

.infra-info strong {
  display:block;
  margin-top:4px;
  color:#def9ff;
  font-size:12px;
}

.infra-state {
  display:inline-flex;
  align-items:center;
  gap:5px;
  color:#79eabc;
  font-size:7px;
  font-weight:800;
}

.infra-node.error .infra-state {
  color:#ff9987;
}

.infra-time {
  color:#9dc3cd;
  font-size:9px;
  font-variant-numeric:tabular-nums;
}

.infra-connection {
  position:relative;
  height:1px;
  background:#1e414f;
  overflow:hidden;
}

.infra-connection span {
  position:absolute;
  left:-20%;
  top:0;
  width:20%;
  height:1px;
  background:linear-gradient(90deg,transparent,#39d8ff,transparent);
  box-shadow:0 0 8px rgba(57,216,255,.8);
  animation:horizontal-flow 1.4s linear infinite;
}

.infra-connection:not(.active) span {
  background:linear-gradient(90deg,transparent,#ff7764,transparent);
  box-shadow:0 0 8px rgba(255,119,100,.65);
}

.api-list {
  display:flex;
  flex-direction:column;
}

.api-list-row {
  display:grid;
  grid-template-columns:42px 22px minmax(0,1fr) 120px 90px 84px 24px;
  align-items:center;
  gap:9px;
  min-height:64px;
  padding:0 15px;
  border:0;
  border-bottom:1px solid rgba(20,50,63,.65);
  background:transparent;
  color:#e7faff;
  text-align:left;
  cursor:pointer;
  transition:.18s;
}

.api-list-row:last-child {
  border-bottom:0;
}

.api-list-row:hover {
  background:rgba(57,216,255,.03);
}

.api-list-row.status-error {
  background:rgba(255,119,100,.018);
}

.api-list-row.status-maintenance {
  background:rgba(185,155,232,.025);
}

.api-list-index {
  color:#3dd8ff;
  font-size:8px;
}

.api-list-indicator {
  display:flex;
  align-items:center;
}

.api-list-indicator i {
  color:#79eabc;
}

.status-warning .api-list-indicator i {
  color:#e8ba54;
}

.status-error .api-list-indicator i {
  color:#ff9987;
}

.api-list-name {
  min-width:0;
}

.api-list-name strong {
  display:block;
  font-size:10px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.api-list-name small {
  display:block;
  margin-top:3px;
  color:#56727f;
  font-size:7px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.api-list-response {
  text-align:right;
}

.api-list-response small {
  display:block;
  color:#4f6d79;
  font-size:6px;
  letter-spacing:.1em;
}

.api-list-response strong {
  display:block;
  margin-top:3px;
  color:#9bc7d2;
  font-size:8px;
  font-variant-numeric:tabular-nums;
}

.api-list-state {
  color:#79eabc;
  font-size:7px;
  font-weight:800;
  text-align:center;
}

.status-warning .api-list-state {
  color:#e8ba54;
}

.status-error .api-list-state {
  color:#ff9987;
}

.status-maintenance .api-list-state {
  color:#b99be8;
}

.status-maintenance .api-list-indicator i {
  color:#b99be8;
}

.api-switch {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-width:78px;
  padding:4px 6px;
  border:1px solid #285061;
  background:rgba(4,15,23,.72);
  color:#79eabc;
  font:800 7px 'SFMono-Regular',Consolas,monospace;
  cursor:pointer;
  transition:.18s;
}

.api-switch:hover:not(:disabled) {
  border-color:#39d8ff;
  box-shadow:0 0 14px rgba(57,216,255,.08);
}

.api-switch:disabled {
  opacity:.5;
  cursor:not-allowed;
}

.api-switch-track {
  position:relative;
  width:25px;
  height:12px;
  border:1px solid currentColor;
  border-radius:8px;
  box-sizing:border-box;
}

.api-switch-thumb {
  position:absolute;
  left:2px;
  top:2px;
  width:6px;
  height:6px;
  border-radius:50%;
  background:currentColor;
  box-shadow:0 0 6px currentColor;
  transition:transform .18s ease;
}

.api-switch.active .api-switch-thumb {
  transform:translateX(13px);
}

.api-switch.active {
  color:#79eabc;
  border-color:#245444;
}

.api-switch.maintenance {
  color:#b99be8;
  border-color:#5a4b72;
}

.api-switch-label {
  min-width:42px;
  text-align:left;
  white-space:nowrap;
}

.api-list-arrow {
  color:#4b7180;
  font-size:15px;
  text-align:right;
  transition:.18s;
}

.api-list-row:hover .api-list-arrow {
  color:#39d8ff;
  transform:translateX(3px);
}

.modal-overlay {
  position:fixed;
  inset:0;
  z-index:100;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  background:rgba(1,5,9,.82);
  backdrop-filter:blur(8px);
}

.api-detail-modal {
  width:min(680px,100%);
  max-height:88vh;
  overflow:auto;
  border:1px solid #245467;
  background:linear-gradient(145deg,rgba(5,19,29,.98),rgba(2,8,13,.99));
  box-shadow:0 0 50px rgba(0,0,0,.35),inset 0 0 40px rgba(57,216,255,.025);
}

.modal-header {
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  padding:18px;
  border-bottom:1px solid #173a48;
}

.modal-header h2 {
  margin:0;
  color:#ecfbff;
  font-size:18px;
}

.close-button {
  width:30px;
  height:30px;
  border:1px solid #28495a;
  background:transparent;
  color:#7ca2ad;
  font-size:20px;
  line-height:1;
  cursor:pointer;
}

.close-button:hover {
  border-color:#39d8ff;
  color:#dffaff;
}

.modal-status-row {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 18px;
  border-bottom:1px solid #173a48;
}

.modal-status {
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#79eabc;
  font-size:8px;
  font-weight:800;
  letter-spacing:.1em;
}

.modal-status.status-warning {
  color:#e8ba54;
}

.modal-status.status-error {
  color:#ff9987;
}

.modal-status.status-maintenance {
  color:#b99be8;
}

.modal-response {
  color:#b6d9e3;
  font-size:10px;
  font-variant-numeric:tabular-nums;
}

.modal-maintenance-section {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:15px 18px;
  border-bottom:1px solid rgba(23,58,72,.7);
  background:rgba(57,216,255,.02);
}

.modal-maintenance-section p {
  margin:0;
  color:#6f8b96;
  font-size:8px;
  line-height:1.6;
}

.modal-switch {
  min-width:136px;
}

.modal-section {
  padding:15px 18px;
  border-bottom:1px solid rgba(23,58,72,.7);
}

.modal-section-label {
  display:block;
  margin-bottom:8px;
  color:#4e7080;
  font-size:7px;
  font-weight:800;
  letter-spacing:.14em;
}

.modal-section p {
  margin:0;
  color:#a4c2cc;
  font-size:9px;
  line-height:1.7;
}

.endpoint-list {
  display:grid;
  gap:6px;
}

.endpoint-item {
  padding:7px 9px;
  border:1px solid #173847;
  background:rgba(3,12,19,.8);
  color:#86b8c5;
  font-size:8px;
}

.modal-error {
  background:rgba(255,119,100,.025);
  border-bottom:0;
}

.error-detail {
  display:grid;
  gap:9px;
}

.error-detail>div {
  display:grid;
  grid-template-columns:110px minmax(0,1fr);
  gap:12px;
  padding-bottom:8px;
  border-bottom:1px solid rgba(92,47,43,.5);
}

.error-detail span {
  color:#734f49;
  font-size:7px;
}

.error-detail strong {
  color:#ffb2a4;
  font-size:8px;
  overflow-wrap:anywhere;
}

.modal-ok {
  display:flex;
  align-items:center;
  gap:9px;
  padding:15px 18px;
  color:#79eabc;
  font-size:8px;
}

.floating-error {
  position:fixed;
  right:22px;
  bottom:22px;
  z-index:110;
  display:flex;
  align-items:center;
  gap:9px;
  max-width:420px;
  padding:12px 14px;
  border:1px solid #6a4039;
  background:rgba(32,11,10,.96);
  color:#ffad9f;
  font-size:8px;
  box-shadow:0 0 28px rgba(255,119,100,.08);
}

.floating-error span {
  display:grid;
  place-items:center;
  width:17px;
  height:17px;
  border:1px solid #a3584d;
  border-radius:50%;
  font-weight:800;
}

.page-enter {
  animation:page-enter .55s cubic-bezier(.16,1,.3,1) both;
}

.delay-1 {
  animation-delay:.05s;
}

.delay-2 {
  animation-delay:.1s;
}

.delay-3 {
  animation-delay:.15s;
}

.delay-4 {
  animation-delay:.2s;
}

.delay-5 {
  animation-delay:.25s;
}

.modal-enter-active,.modal-leave-active {
  transition:.22s ease;
}

.modal-enter-from,.modal-leave-to {
  opacity:0;
}

.modal-enter-from .api-detail-modal,.modal-leave-to .api-detail-modal {
  transform:translateY(12px) scale(.98);
}

.floating-error-enter-active,.floating-error-leave-active {
  transition:.22s ease;
}

.floating-error-enter-from,.floating-error-leave-to {
  opacity:0;
  transform:translateY(10px);
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes grid-drift {
  from {
    background-position: 0 0, 0 0;
  }
  to {
    background-position: 56px 56px, 56px 56px;
  }
}

@keyframes ambient-scan {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(760%);
  }
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.78);
  }
}

@keyframes pulse-line {
  0%, 100% {
    opacity: 0.2;
    transform: scaleX(0.7);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes header-scan {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(620%);
  }
}

@keyframes stage-scan {
  from {
    transform: translateY(-200%);
  }
  to {
    transform: translateY(900%);
  }
}

@keyframes line-flow {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -34;
  }
}

@keyframes horizontal-flow {
  from {
    left: -20%;
  }
  to {
    left: 100%;
  }
}

@keyframes ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ring-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes core-breathe {
  0%, 100% {
    opacity: 0.45;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes orbit-a {
  to {
    transform: translate(-50%, -50%) rotate(382deg);
  }
}

@keyframes orbit-b {
  to {
    transform: translate(-50%, -50%) rotate(-388deg);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes vertical-flow {
  from {
    top: -25%;
  }
  to {
    top: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-grid,
  .ambient-scan,
  .refresh-icon.spinning,
  .status-indicator,
  .monitor-live span,
  .panel-live span,
  .hud-line.status-normal,
  .hud-line.status-warning,
  .hud-line.status-error,
  .ring-outer,
  .ring-middle,
  .ring-inner,
  .core-mark span,
  .orbit-a,
  .orbit-b,
  .scan-sweep,
  .infra-connection span,
  .page-enter {
    animation: none;
  }
}



.admin-api-monitor{
  background:
    radial-gradient(circle at 50% 45%,rgba(57,216,255,.08),transparent 30%),
    radial-gradient(circle at 88% 8%,rgba(57,216,255,.12),transparent 24%),
    linear-gradient(rgba(27,118,145,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(27,118,145,.045) 1px,transparent 1px),
    #f4f8fa;
  color:#18333d;
}
.admin-api-monitor .ambient-grid{
  background-image:linear-gradient(rgba(27,118,145,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(27,118,145,.055) 1px,transparent 1px);
  opacity:.55;
}
.admin-api-monitor .ambient-scan{opacity:.28}
.admin-api-monitor .eyebrow,
.admin-api-monitor .panel-eyebrow,
.admin-api-monitor .modal-eyebrow{color:#078db3}
.admin-api-monitor .hud-header h1{color:#16313b}
.admin-api-monitor .description{color:#657d86}
.admin-api-monitor .monitor-live,
.admin-api-monitor .panel-live,
.admin-api-monitor .service-count{color:#087b98}
.admin-api-monitor .refresh-button{
  border-color:#bfd4dc;
  background:rgba(255,255,255,.88);
  color:#087b98;
  box-shadow:0 5px 18px rgba(40,82,98,.06)
}
.admin-api-monitor .refresh-button:hover:not(:disabled){background:#fff;border-color:#39d8ff;box-shadow:0 0 20px rgba(57,216,255,.14)}
.admin-api-monitor .status-banner,
.admin-api-monitor .hud-panel,
.admin-api-monitor .readout-card{
  border-color:#cbdde3;
  background:rgba(255,255,255,.88);
  box-shadow:inset 0 0 30px rgba(57,216,255,.018),0 12px 28px rgba(41,79,91,.08)
}
.admin-api-monitor .status-banner.warning{border-color:#e2d29d}
.admin-api-monitor .status-banner.error{border-color:#e4b8b0}
.admin-api-monitor .status-label,
.admin-api-monitor .last-check span{color:#6b838c}
.admin-api-monitor .status-main strong{color:#16313b}
.admin-api-monitor .status-main p{color:#6a818a}
.admin-api-monitor .last-check strong{color:#365863}
.admin-api-monitor .panel-header{border-bottom-color:#d5e4e8}
.admin-api-monitor .panel-header h2{color:#183640}
.admin-api-monitor .hud-stage{
  background:
    radial-gradient(circle at 50% 50%,rgba(57,216,255,.075),transparent 17%),
    radial-gradient(circle at 50% 50%,rgba(57,216,255,.035),transparent 40%),
    #f7fbfc;
}
.admin-api-monitor .stage-grid{background-image:linear-gradient(rgba(31,117,142,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(31,117,142,.055) 1px,transparent 1px);opacity:.9}
.admin-api-monitor .stage-vignette{background:radial-gradient(circle at center,transparent 22%,rgba(230,240,244,.08) 62%,rgba(205,221,227,.34) 100%)}
.admin-api-monitor .hud-line.base{stroke:#b8d0d8}
.admin-api-monitor .hud-line.status-maintenance{stroke:#9a74c7}
.admin-api-monitor .system-core{
  background:radial-gradient(circle,rgba(255,255,255,.98),rgba(239,247,249,.98) 68%);
  border-color:rgba(38,135,160,.36);
  box-shadow:0 0 50px rgba(57,216,255,.1),inset 0 0 45px rgba(57,216,255,.04)
}
.admin-api-monitor .system-core.warning{border-color:rgba(189,148,48,.5);box-shadow:0 0 55px rgba(232,186,84,.1),inset 0 0 35px rgba(232,186,84,.05)}
.admin-api-monitor .system-core.error{border-color:rgba(192,75,58,.48);box-shadow:0 0 55px rgba(255,119,100,.1),inset 0 0 35px rgba(255,119,100,.05)}
.admin-api-monitor .core-kicker,.admin-api-monitor .core-content small{color:#66808a}
.admin-api-monitor .core-mark{border-color:rgba(38,135,160,.3);box-shadow:0 0 22px rgba(57,216,255,.08),inset 0 0 18px rgba(57,216,255,.05)}
.admin-api-monitor .core-content strong{color:#173844}
.admin-api-monitor .core-metrics{border-top-color:#d4e4e8;color:#65808a}
.admin-api-monitor .core-metrics b{color:#335764}
.admin-api-monitor .hud-api-node{
  border-color:#c7dce2;
  background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(244,249,251,.98));
  color:#173844;
  box-shadow:inset 0 0 24px rgba(57,216,255,.015),0 10px 22px rgba(42,78,91,.08)
}
.admin-api-monitor .hud-api-node:hover{border-color:#39d8ff;box-shadow:0 0 22px rgba(57,216,255,.1),inset 0 0 24px rgba(57,216,255,.035)}
.admin-api-monitor .hud-api-node.status-normal{border-color:#a9d5c8}
.admin-api-monitor .hud-api-node.status-warning{border-color:#dfcea0}
.admin-api-monitor .hud-api-node.status-error{border-color:#e2b9b1}
.admin-api-monitor .node-index{color:#078db3}
.admin-api-monitor .node-state{color:#168a67}
.admin-api-monitor .hud-api-node.status-warning .node-state{color:#a47712}
.admin-api-monitor .hud-api-node.status-error .node-state{color:#c45846}
.admin-api-monitor .hud-api-node>strong{color:#173844}
.admin-api-monitor .node-full-name{color:#69818a}
.admin-api-monitor .node-response{border-top-color:#d9e7eb}
.admin-api-monitor .node-response span{color:#6b848d}
.admin-api-monitor .node-response b{color:#355d68}
.admin-api-monitor .stage-axis{background:rgba(31,117,142,.08)}
.admin-api-monitor .readout-card span{color:#687f88}
.admin-api-monitor .readout-card strong{color:#183640}
.admin-api-monitor .readout-card small{color:#70878f}
.admin-api-monitor .infra-node{
  border-color:#c8dce2;
  background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(244,249,251,.98))
}
.admin-api-monitor .infra-node.normal{border-color:#a9d5c8}
.admin-api-monitor .infra-node.error{border-color:#e2b9b1}
.admin-api-monitor .infra-index{color:#078db3}
.admin-api-monitor .infra-info span{color:#6a828b}
.admin-api-monitor .infra-info strong{color:#183640}
.admin-api-monitor .infra-state{color:#168a67}
.admin-api-monitor .infra-node.error .infra-state{color:#c45846}
.admin-api-monitor .infra-time{color:#426571}
.admin-api-monitor .infra-connection{background:#b9d0d7}
.admin-api-monitor .api-list-row{border-bottom-color:#dbe8ec;color:#183640}
.admin-api-monitor .api-list-row:hover{background:linear-gradient(90deg,rgba(57,216,255,.055),transparent)}
.admin-api-monitor .api-list-index{color:#078db3}
.admin-api-monitor .api-list-name strong{color:#183640}
.admin-api-monitor .api-list-name small{color:#6a828b}
.admin-api-monitor .api-list-response small{color:#6b838c}
.admin-api-monitor .api-list-response strong{color:#406571}
.admin-api-monitor .api-list-state{color:#168a67}
.admin-api-monitor .api-list-row.status-warning .api-list-state{color:#a47712}
.admin-api-monitor .api-list-row.status-error .api-list-state{color:#c45846}
.admin-api-monitor .api-list-row.status-maintenance{background:rgba(145,112,190,.04)}
.admin-api-monitor .status-maintenance .api-list-state{color:#7754a8}
.admin-api-monitor .api-switch{border-color:#c8b8dd;background:#fbf9fe;color:#168a67}
.admin-api-monitor .api-switch.active{border-color:#a9d5c8;color:#168a67}
.admin-api-monitor .api-switch.maintenance{border-color:#cdbfe0;color:#7754a8;background:#faf8fd}
.admin-api-monitor .hud-api-node.status-maintenance{border-color:#cdbfe0}
.admin-api-monitor .hud-api-node.status-maintenance .node-state{color:#7754a8}
.admin-api-monitor .status-maintenance .node-corner{border-color:#7754a8}
.admin-api-monitor .status-maintenance .api-list-indicator i{color:#7754a8}
.admin-api-monitor .readout-card.maintenance::before{background:#9a74c7}
.admin-api-monitor .readout-card.maintenance strong{color:#7754a8}
.admin-api-monitor .modal-status.status-maintenance{color:#7754a8}
.admin-api-monitor .modal-maintenance-section{background:rgba(145,112,190,.025)}

.admin-api-monitor .api-list-arrow{color:#66828c}
.admin-api-monitor .modal-overlay{background:rgba(236,244,247,.78)}
.admin-api-monitor .api-detail-modal{
  border-color:#bfd7de;
  background:linear-gradient(145deg,rgba(255,255,255,.99),rgba(246,250,251,.99));
  box-shadow:0 30px 80px rgba(43,76,89,.18),inset 0 0 35px rgba(57,216,255,.02)
}
.admin-api-monitor .modal-header,.admin-api-monitor .modal-status-row{border-bottom-color:#d5e4e8}
.admin-api-monitor .modal-header h2{color:#183640}
.admin-api-monitor .close-button{border-color:#bfd4dc;background:#f8fbfc;color:#5f7d87}
.admin-api-monitor .close-button:hover{border-color:#39d8ff;color:#078db3}
.admin-api-monitor .modal-response{color:#456874}
.admin-api-monitor .modal-section{border-bottom-color:#dbe8ec}
.admin-api-monitor .modal-section-label{color:#647f89}
.admin-api-monitor .modal-section p{color:#476873}
.admin-api-monitor .endpoint-item{border-color:#d8e6ea;background:#f7fafb;color:#426873}
.admin-api-monitor .modal-ok{color:#168a67}
.admin-api-monitor .floating-error{background:rgba(255,248,247,.98);border-color:#e2b9b1;color:#ba5140;box-shadow:0 0 28px rgba(255,119,100,.1)}

</style>
