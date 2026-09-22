<template>
  <div class="admin-system">
    <div class="ambient-grid"></div>
    <div class="ambient-scan"></div>
    <div class="page-heading page-enter">
      <div>
        <p class="eyebrow">05 / SYSTEM MONITORING</p>
        <h1>システム監視</h1>
        <p class="description">
          フロントエンド・API・データベースの稼働状況を監視します
        </p>
      </div>
      <button
        class="refresh-button"
        :disabled="isLoading || isRestarting"
        @click="refreshSystemMonitor"
      >
        <span
          class="refresh-icon"
          :class="{ spinning: isLoading }"
        >
          ↻
        </span>
        {{ isLoading ? 'CHECKING...' : '再チェック' }}
      </button>
    </div>
    <section
      class="status-banner page-enter delay-1"
      :class="statusClass"
    >
      <div class="status-indicator"></div>
      <div class="status-main">
        <span class="status-label">SYSTEM STATUS</span>
        <strong>{{ overallStatusLabel }}</strong>
        <p>{{ statusMessage }}</p>
      </div>
      <div class="status-pulse-line"></div>
      <div class="last-check">
        <span>LAST CHECK</span>
        <strong>
          {{
            systemStatus?.generated_at
              ? formatDateTime(systemStatus.generated_at)
              : '-'
          }}
        </strong>
      </div>
    </section>
    <section class="monitor-grid">
      <div class="monitor-card monitor-card-1">
        <div class="card-glow"></div>
        <div class="card-scan"></div>
        <div class="card-header">
          <div>
            <p class="card-eyebrow">01 / FRONTEND</p>
            <h2>Frontend</h2>
          </div>
          <span class="state-badge normal">
            <span></span>
            ONLINE
          </span>
        </div>
        <div class="monitor-body">
          <div class="state-row">
            <span>STATUS</span>
            <strong class="normal-text">正常稼働</strong>
          </div>
          <div class="state-row">
            <span>CLIENT</span>
            <strong>Nuxt / Vue</strong>
          </div>
          <div class="state-row">
            <span>MONITOR</span>
            <strong>ACTIVE</strong>
          </div>
        </div>
        <div class="card-footer-line"></div>
      </div>
      <div class="monitor-card monitor-card-2">
        <div class="card-glow"></div>
        <div class="card-scan"></div>
        <div class="card-header">
          <div>
            <p class="card-eyebrow">02 / BACKEND API</p>
            <h2>Backend API</h2>
          </div>
          <span
            class="state-badge"
            :class="backendStatusClass"
          >
            <span></span>
            {{ backendStatusLabel }}
          </span>
        </div>
        <div class="monitor-body">
          <div class="state-row">
            <span>STATUS</span>
            <strong :class="backendTextClass">
              {{ backendStatusText }}
            </strong>
          </div>
          <div class="state-row">
            <span>RESPONSE</span>
            <strong>{{ backendResponseTime }}</strong>
          </div>
          <div class="state-row">
            <span>API</span>
            <strong>Rails 8.1.1</strong>
          </div>
        </div>
        <div class="card-footer-line"></div>
      </div>
      <div class="monitor-card monitor-card-3">
        <div class="card-glow"></div>
        <div class="card-scan"></div>
        <div class="card-header">
          <div>
            <p class="card-eyebrow">03 / DATABASE</p>
            <h2>Database</h2>
          </div>
          <span
            class="state-badge"
            :class="databaseStatusClass"
          >
            <span></span>
            {{ databaseStatusLabel }}
          </span>
        </div>
        <div class="monitor-body">
          <div class="state-row">
            <span>STATUS</span>
            <strong :class="databaseTextClass">
              {{ databaseStatusText }}
            </strong>
          </div>
          <div class="state-row">
            <span>RESPONSE</span>
            <strong>{{ databaseResponseTime }}</strong>
          </div>
          <div class="state-row">
            <span>DATABASE</span>
            <strong>MySQL</strong>
          </div>
        </div>
        <div class="card-footer-line"></div>
      </div>
    </section>
    <section class="metrics-grid">
      <div class="metric-card metric-card-1">
        <span class="metric-label">FRONTEND → API</span>
        <strong>{{ frontendResponseTime }}</strong>
        <span>CLIENT LATENCY</span>
        <div class="metric-scan"></div>
      </div>
      <div class="metric-card metric-card-2">
        <span class="metric-label">BACKEND PROCESS</span>
        <strong>{{ backendResponseTime }}</strong>
        <span>SERVER RESPONSE</span>
        <div class="metric-scan"></div>
      </div>
      <div class="metric-card metric-card-3">
        <span class="metric-label">DATABASE QUERY</span>
        <strong>{{ databaseResponseTime }}</strong>
        <span>SELECT 1</span>
        <div class="metric-scan"></div>
      </div>
      <div class="metric-card metric-card-4">
        <span class="metric-label">SYSTEM CHECK</span>
        <strong>{{ systemCheckCount }}</strong>
        <span>TOTAL CHECKS</span>
        <div class="metric-scan"></div>
      </div>
    </section>
    <section class="detail-panel backend-control-panel panel-enter delay-2">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">BACKEND CONTROL</p>
          <h2>Rails Backend</h2>
        </div>
        <span
          class="restart-status"
          :class="`status-${restartState}`"
        >
          <span></span>
          {{ restartMessage || 'READY' }}
        </span>
      </div>
      <div class="backend-control-body">
        <div class="backend-control-info">
          <span class="control-label">RESTART SERVICE</span>
          <strong>Rails API Backend</strong>
          <p>
            管理者権限でRailsバックエンドを再起動します。
            再起動中は一時的にAPIへ接続できなくなります。
          </p>
        </div>
        <button
          class="restart-button"
          type="button"
          :disabled="isRestarting"
          @click="restartBackend"
        >
          <span
            class="restart-icon"
            :class="{ restarting: isRestarting }"
          >
            ↻
          </span>
          <span>
            {{
              restartState === 'checking'
                ? 'SYSTEM CHECK...'
                : restartState === 'restarting'
                  ? 'RESTARTING...'
                  : restartState === 'success'
                    ? 'SYSTEM READY'
                    : restartState === 'failed'
                      ? 'RETRY RESTART'
                      : 'RESTART BACKEND'
            }}
          </span>
        </button>
      </div>
      <div class="restart-progress">
        <div
          class="restart-progress-bar"
          :class="{ active: isRestarting }"
        ></div>
      </div>
    </section>
    <section class="detail-panel communication-panel panel-enter delay-3">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">COMMUNICATION PATH</p>
          <h2>通信状態</h2>
        </div>
        <span class="panel-live">
          <span></span>
          MONITOR ACTIVE
        </span>
      </div>
      <div class="communication-path">
        <div class="path-node normal">
          <span class="node-number">01</span>
          <div>
            <strong>FRONTEND</strong>
            <small>Nuxt / Vue</small>
          </div>
          <span class="node-state">ONLINE</span>
        </div>
        <div
          class="path-line"
          :class="{
            active: systemStatus?.backend.status === 'normal'
          }"
        >
          <div class="path-flow"></div>
          <span>{{ frontendResponseTime }}</span>
        </div>
        <div
          class="path-node"
          :class="backendStateClass"
        >
          <span class="node-number">02</span>
          <div>
            <strong>BACKEND API</strong>
            <small>Rails API</small>
          </div>
          <span class="node-state">
            {{ backendStatusLabel }}
          </span>
        </div>
        <div
          class="path-line"
          :class="{
            active: systemStatus?.database.status === 'normal'
          }"
        >
          <div class="path-flow"></div>
          <span>{{ databaseResponseTime }}</span>
        </div>
        <div
          class="path-node"
          :class="databaseStateClass"
        >
          <span class="node-number">03</span>
          <div>
            <strong>DATABASE</strong>
            <small>MySQL</small>
          </div>
          <span class="node-state">
            {{ databaseStatusLabel }}
          </span>
        </div>
      </div>
    </section>
    <section class="detail-grid">
      <div class="detail-panel panel-enter delay-4">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">SYSTEM INFORMATION</p>
            <h2>システム情報</h2>
          </div>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span>ENVIRONMENT</span>
            <strong>development</strong>
          </div>
          <div class="info-row">
            <span>FRONTEND</span>
            <strong>Nuxt 4 / Vue 3</strong>
          </div>
          <div class="info-row">
            <span>BACKEND</span>
            <strong>Rails 8.1.1 / Ruby</strong>
          </div>
          <div class="info-row">
            <span>DATABASE</span>
            <strong>MySQL</strong>
          </div>
          <div class="info-row">
            <span>MONITOR ENDPOINT</span>
            <strong>/admin/system/status</strong>
          </div>
        </div>
      </div>
      <div class="detail-panel panel-enter delay-5">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">MONITOR INFORMATION</p>
            <h2>監視情報</h2>
          </div>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span>CHECK COUNT</span>
            <strong>{{ systemCheckCount }}</strong>
          </div>
          <div class="info-row">
            <span>LAST CHECK</span>
            <strong>
              {{
                systemStatus?.generated_at
                  ? formatDateTime(systemStatus.generated_at)
                  : '-'
              }}
            </strong>
          </div>
          <div class="info-row">
            <span>FRONTEND LATENCY</span>
            <strong>{{ frontendResponseTime }}</strong>
          </div>
          <div class="info-row">
            <span>BACKEND LATENCY</span>
            <strong>{{ backendResponseTime }}</strong>
          </div>
          <div class="info-row">
            <span>DATABASE LATENCY</span>
            <strong>{{ databaseResponseTime }}</strong>
          </div>
        </div>
      </div>
    </section>
    <section class="error-panel panel-enter delay-6">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">RECENT ERRORS</p>
          <h2>最近のエラー</h2>
        </div>
        <span
          class="error-count"
          :class="{ 'has-errors': recentErrors.length > 0 }"
        >
          <span></span>{{ recentErrors.length }} ERRORS
        </span>
      </div>
      <div v-if="isLoadingErrors" class="no-errors">
        <div class="no-error-icon">...</div>
        <strong>エラーログを取得しています</strong>
        <span>SYSTEM ERROR LOG / LOADING</span>
      </div>
      <div v-else-if="recentErrors.length === 0" class="no-errors">
        <div class="no-error-icon">✓</div>
        <strong>現在記録されているエラーはありません</strong>
        <span>SYSTEM ERROR LOG / CLEAR</span>
      </div>
      <div v-else class="error-list">
        <button
          v-for="error in recentErrors"
          :key="error.id"
          type="button"
          class="error-row"
          @click="openErrorModal(error)"
        >
          <div class="error-row-top">
            <span class="error-status">{{ error.status_code }}</span>
            <span class="error-code">{{ error.error_code }}</span>
            <span class="error-time">{{ formatDateTime(error.occurred_at) }}</span>
          </div>
          <strong class="error-message">{{ error.message }}</strong>
          <div class="error-request">{{ error.request_method }} {{ error.path }}</div>
          <div v-if="error.exception_class" class="error-exception">{{ error.exception_class }}</div>
          <span class="error-detail-link">詳細を見る <span>→</span></span>
        </button>
      </div>
    </section>
    <Transition name="error-modal">
      <div
        v-if="selectedError"
        class="error-modal-backdrop"
        @click.self="closeErrorModal"
      >
        <div
          class="error-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-modal-title"
        >
          <div class="error-modal-header">
            <div>
              <p class="panel-eyebrow">ERROR DETAIL / ID {{ selectedError.id }}</p>
              <h2 id="error-modal-title">エラー詳細</h2>
            </div>
            <button
              type="button"
              class="error-modal-close"
              aria-label="エラー詳細を閉じる"
              @click="closeErrorModal"
            >
              ×
            </button>
          </div>
          <div class="error-modal-summary">
            <div class="error-summary-status">
              <span class="error-status large">{{ selectedError.status_code }}</span>
              <div>
                <span class="error-summary-label">STATUS</span>
                <strong>{{ getErrorStatusLabel(selectedError.status_code) }}</strong>
              </div>
            </div>
            <div class="error-summary-code">
              <span>ERROR CODE</span>
              <strong>{{ selectedError.error_code }}</strong>
            </div>
          </div>
          <div class="error-modal-section">
            <div class="error-section-title">
              <span>01</span>
              <strong>エラー概要</strong>
            </div>
            <div class="error-explanation">
              {{ getErrorStatusDescription(selectedError.status_code) }}
            </div>
            <div class="error-message-box">
              <span>MESSAGE</span>
              <p>{{ selectedError.message }}</p>
            </div>
          </div>
          <div class="error-modal-grid">
            <div class="error-modal-section">
              <div class="error-section-title">
                <span>02</span>
                <strong>リクエスト情報</strong>
              </div>
              <div class="error-detail-list">
                <div class="error-detail-row">
                  <span>METHOD</span>
                  <strong class="mono">{{ selectedError.request_method }}</strong>
                </div>
                <div class="error-detail-row">
                  <span>PATH</span>
                  <strong class="mono wrap">{{ selectedError.path }}</strong>
                </div>
                <div class="error-detail-row">
                  <span>CONTROLLER</span>
                  <strong class="mono">{{ selectedError.controller_name || '-' }}</strong>
                </div>
                <div class="error-detail-row">
                  <span>ACTION</span>
                  <strong class="mono">{{ selectedError.action_name || '-' }}</strong>
                </div>
              </div>
            </div>
            <div class="error-modal-section">
              <div class="error-section-title">
                <span>03</span>
                <strong>発生情報</strong>
              </div>
              <div class="error-detail-list">
                <div class="error-detail-row">
                  <span>OCCURRED AT</span>
                  <strong>{{ formatDateTime(selectedError.occurred_at) }}</strong>
                </div>
                <div class="error-detail-row">
                  <span>USER ID</span>
                  <strong class="mono">{{ selectedError.user_id ?? '未ログイン' }}</strong>
                </div>
                <div class="error-detail-row">
                  <span>EXCEPTION</span>
                  <strong class="mono wrap">{{ selectedError.exception_class || 'HTTPレスポンスエラー' }}</strong>
                </div>
              </div>
            </div>
          </div>
          <div class="error-modal-footer">
            <span>BACKTRACE</span>
            <strong>詳細なスタックトレースはサーバー側ログに保存されています</strong>
            <button type="button" class="error-close-button" @click="closeErrorModal">閉じる</button>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="floating-error">
      <div
        v-if="loadError"
        class="floating-error"
      >
        <span>!</span>
        {{ loadError }}
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
interface BackendStatus {
  status: string
  response_time_ms: number
}
interface DatabaseStatus {
  status: string
  response_time_ms: number
  error: string | null
}
interface SystemErrorLog {
  id: number
  error_code: string
  status_code: number
  exception_class: string | null
  request_method: string
  path: string
  controller_name: string | null
  action_name: string | null
  message: string
  user_id: number | null
  occurred_at: string
}
interface SystemStatus {
  status: string
  backend: BackendStatus
  database: DatabaseStatus
  generated_at: string
}
type RestartState =
  | 'idle'
  | 'checking'
  | 'restarting'
  | 'success'
  | 'failed'
const { $api } = useNuxtApp()
const systemStatus = ref<SystemStatus | null>(null)
const recentErrors = ref<SystemErrorLog[]>([])
const selectedError = ref<SystemErrorLog | null>(null)
const isLoadingErrors = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const frontendLatency = ref<number | null>(null)
const systemCheckCount = ref(0)
const restartState = ref<RestartState>('idle')
const restartMessage = ref('')
const isRestarting = computed(() => {
  return (
    restartState.value === 'checking' ||
    restartState.value === 'restarting'
  )
})
const overallStatusLabel = computed(() => {
  if (restartState.value === 'checking') {
    return 'CHECKING'
  }
  if (restartState.value === 'restarting') {
    return 'RESTARTING'
  }
  if (restartState.value === 'success') {
    return 'READY'
  }
  if (restartState.value === 'failed') {
    return 'ERROR'
  }
  if (!systemStatus.value) {
    return 'UNKNOWN'
  }
  if (systemStatus.value.status === 'error') {
    return 'ERROR'
  }
  if (systemStatus.value.status === 'warning') {
    return 'WARNING'
  }
  return 'NORMAL'
})
const statusClass = computed(() => {
  if (
    restartState.value === 'checking' ||
    restartState.value === 'restarting'
  ) {
    return 'normal'
  }
  if (restartState.value === 'failed') {
    return 'error'
  }
  if (systemStatus.value?.status === 'error') {
    return 'error'
  }
  if (systemStatus.value?.status === 'warning') {
    return 'warning'
  }
  return 'normal'
})
const statusMessage = computed(() => {
  if (restartState.value === 'checking') {
    return 'バックエンド再起動前のシステムチェックを実行しています'
  }
  if (restartState.value === 'restarting') {
    return 'Railsバックエンドを再起動しています'
  }
  if (restartState.value === 'success') {
    return 'Railsバックエンドの再起動が完了し、システムは正常稼働しています'
  }
  if (restartState.value === 'failed') {
    return 'Railsバックエンドの復旧を確認できませんでした'
  }
  if (systemStatus.value?.status === 'error') {
    return 'システムに異常が検出されています'
  }
  if (systemStatus.value?.status === 'warning') {
    return 'システム応答に遅延が発生しています'
  }
  return 'すべての監視対象が正常に稼働しています'
})
const backendStatusLabel = computed(() => {
  return systemStatus.value?.backend.status === 'normal'
    ? 'ONLINE'
    : 'ERROR'
})
const backendStatusText = computed(() => {
  return systemStatus.value?.backend.status === 'normal'
    ? '正常稼働'
    : '異常'
})
const backendStatusClass = computed(() => {
  return systemStatus.value?.backend.status === 'normal'
    ? 'normal'
    : 'error'
})
const backendTextClass = computed(() => {
  return systemStatus.value?.backend.status === 'normal'
    ? 'normal-text'
    : 'error-text'
})
const databaseStatusLabel = computed(() => {
  return systemStatus.value?.database.status === 'normal'
    ? 'ONLINE'
    : 'ERROR'
})
const databaseStatusText = computed(() => {
  return systemStatus.value?.database.status === 'normal'
    ? '接続正常'
    : '接続エラー'
})
const databaseStatusClass = computed(() => {
  return systemStatus.value?.database.status === 'normal'
    ? 'normal'
    : 'error'
})
const databaseTextClass = computed(() => {
  return systemStatus.value?.database.status === 'normal'
    ? 'normal-text'
    : 'error-text'
})
const backendStateClass = computed(() => {
  return systemStatus.value?.backend.status === 'normal'
    ? 'normal'
    : 'error'
})
const databaseStateClass = computed(() => {
  return systemStatus.value?.database.status === 'normal'
    ? 'normal'
    : 'error'
})
const frontendResponseTime = computed(() => {
  if (frontendLatency.value === null) {
    return '-'
  }
  return `${frontendLatency.value.toFixed(2)} ms`
})
const backendResponseTime = computed(() => {
  if (!systemStatus.value) {
    return '-'
  }
  return `${systemStatus.value.backend.response_time_ms.toFixed(2)} ms`
})
const databaseResponseTime = computed(() => {
  if (!systemStatus.value) {
    return '-'
  }
  return `${systemStatus.value.database.response_time_ms.toFixed(2)} ms`
})
const fetchSystemStatus = async () => {
  isLoading.value = true
  loadError.value = ''
  const startedAt = performance.now()
  try {
    const response = await $api.get<SystemStatus>(
      '/admin/system/status'
    )
    frontendLatency.value =
      performance.now() - startedAt
    systemStatus.value = response.data
    systemCheckCount.value += 1
    if (
      restartState.value === 'failed' &&
      response.data.status === 'normal'
    ) {
      restartState.value = 'idle'
      restartMessage.value = ''
    }
  } catch (error: any) {
    console.error(
      'システム監視情報の取得に失敗しました:',
      error
    )
    frontendLatency.value =
      performance.now() - startedAt
    if (error?.response?.status === 403) {
      loadError.value =
        '管理者権限が必要です。'
    } else {
      loadError.value =
        'システム監視情報の取得に失敗しました。'
    }
  } finally {
    isLoading.value = false
  }
}
const fetchRecentErrors = async () => {
  isLoadingErrors.value = true
  try {
    const response = await $api.get<SystemErrorLog[]>('/admin/system/errors')
    recentErrors.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('最近のエラー取得に失敗しました:', error)
    recentErrors.value = []
  } finally {
    isLoadingErrors.value = false
  }
}
const refreshSystemMonitor = async () => {
  await Promise.all([fetchSystemStatus(), fetchRecentErrors()])
}
const openErrorModal = (error: SystemErrorLog) => {
  selectedError.value = error
  document.body.style.overflow = 'hidden'
}
const closeErrorModal = () => {
  selectedError.value = null
  document.body.style.overflow = ''
}
const getErrorStatusLabel = (statusCode: number) => {
  const labels: Record<number, string> = {
    400: 'リクエスト不正',
    401: '認証が必要',
    403: '権限がありません',
    404: '対象が見つかりません',
    409: 'データが競合しています',
    422: '入力内容に問題があります',
    500: 'サーバー内部エラー',
    502: '上流サーバーエラー',
    503: 'サービス利用不可',
    504: 'サーバー応答タイムアウト'
  }
  return labels[statusCode] || 'HTTPエラー'
}
const getErrorStatusDescription = (statusCode: number) => {
  const descriptions: Record<number, string> = {
    400: '送信されたリクエストの内容をサーバーが正しく処理できませんでした。',
    401: 'ログイン情報がない、または認証トークンが無効です。',
    403: 'ログイン済みですが、この操作を実行する権限がありません。',
    404: '指定されたリソースやデータが存在しません。',
    409: '既存データとの重複や競合が発生したため処理できませんでした。',
    422: '入力値やモデルのバリデーションにより処理できませんでした。',
    500: 'Rails側で予期しない内部エラーが発生しました。',
    502: '連携先サーバーから正常な応答を受け取れませんでした。',
    503: 'サービスが一時的に利用できない状態です。',
    504: 'サーバーからの応答が制限時間内に返りませんでした。'
  }
  return descriptions[statusCode] || 'サーバー側でHTTPエラーが発生しました。'
}
const handleErrorModalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedError.value) {
    closeErrorModal()
  }
}
const wait = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
const restartBackend = async () => {
  if (isRestarting.value) {
    return
  }
  const confirmed = window.confirm(
    'Railsバックエンドを再起動します。\n\n' +
    '再起動中は一時的にAPIへ接続できなくなります。\n\n' +
    '再起動しますか？'
  )
  if (!confirmed) {
    return
  }
  loadError.value = ''
  restartState.value = 'checking'
  restartMessage.value = 'SYSTEM CHECK'
  try {
    const checkStartedAt = performance.now()
    const checkResponse =
      await $api.get<SystemStatus>(
        '/admin/system/status',
        {
          timeout: 5000
        }
      )
    frontendLatency.value =
      performance.now() - checkStartedAt
    systemStatus.value = checkResponse.data
    restartState.value = 'checking'
    restartMessage.value = 'RESTART REQUEST'
    await wait(500)
    await $api.post('/admin/system/restart')
    restartState.value = 'restarting'
    restartMessage.value = 'BACKEND RESTARTING'
    await wait(1200)
    const maxAttempts = 30
    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {
      try {
        const startedAt = performance.now()
        const response =
          await $api.get<SystemStatus>(
            '/admin/system/status',
            {
              timeout: 3000
            }
          )
        frontendLatency.value =
          performance.now() - startedAt
        const backendNormal =
          response.data?.backend?.status === 'normal'
        const databaseNormal =
          response.data?.database?.status === 'normal'
        const systemNormal =
          response.data?.status === 'normal'
        if (
          backendNormal &&
          databaseNormal &&
          systemNormal
        ) {
          systemStatus.value = response.data
          systemCheckCount.value += 1
          restartState.value = 'success'
          restartMessage.value = 'SYSTEM READY'
          return
        }
      } catch (error) {
        console.log(
          `Backend recovery check ${attempt + 1}/${maxAttempts}`
        )
      }
      await wait(1000)
    }
    restartState.value = 'failed'
    restartMessage.value = 'RECOVERY TIMEOUT'
    loadError.value =
      'Railsの再起動要求は受け付けられましたが、復旧を確認できませんでした。'
  } catch (error: any) {
    console.error(
      'Railsバックエンドの再起動に失敗しました:',
      error
    )
    restartState.value = 'failed'
    restartMessage.value = 'RESTART FAILED'
    if (error?.response?.status === 403) {
      loadError.value =
        '管理者権限が必要です。'
    } else {
      loadError.value =
        'Railsバックエンドの再起動要求に失敗しました。'
    }
  }
}
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString(
    'ja-JP',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  )
}
onMounted(() => {
  refreshSystemMonitor()
  window.addEventListener('keydown', handleErrorModalKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleErrorModalKeydown)
  document.body.style.overflow = ''
})
</script>
<style scoped>
.admin-system {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background: radial-gradient( circle at 82% 4%, rgba(34, 184, 223, 0.08), transparent 26% ), radial-gradient( circle at 8% 92%, rgba(49, 185, 133, 0.045), transparent 23% ), #f4f9fc;
  color: #17313d;
}
.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  opacity: 0.8;
  background-image: linear-gradient( rgba(34, 184, 223, 0.035) 1px, transparent 1px ), linear-gradient( 90deg, rgba(34, 184, 223, 0.035) 1px, transparent 1px );
  background-size: 56px 56px;
  mask-image: linear-gradient( to bottom, rgba(0, 0, 0, 0.75), transparent 92% );
  animation: grid-drift 18s linear infinite;
}
.ambient-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -20%;
  height: 18%;
  z-index: -2;
  pointer-events: none;
  opacity: 0.8;
  background: linear-gradient( to bottom, transparent, rgba(34, 184, 223, 0.08), transparent );
  filter: blur(12px);
  animation: ambient-scan 10s linear infinite;
}
.page-heading, .status-banner, .monitor-grid, .metrics-grid, .detail-panel, .error-panel {
  width: min(100%, 1400px);
  margin-left: auto;
  margin-right: auto;
}
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.eyebrow, .card-eyebrow, .panel-eyebrow {
  margin: 0 0 8px;
  color: #22b8df;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.page-heading h1 {
  margin: 0;
  color: #17313d;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.03em;
}
.description {
  margin: 8px 0 0;
  color: #6d8792;
  font-size: 13px;
}
.refresh-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #bcd8e2;
  background: #ffffff;
  color: #1598bc;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
}
.refresh-button::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background: linear-gradient( 90deg, transparent, #22b8df, transparent );
  opacity: 0;
}
.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #22b8df;
  background: #f8fdff;
  box-shadow: 0 8px 22px rgba(34, 184, 223, 0.1), 0 0 0 3px rgba(34, 184, 223, 0.035);
}
.refresh-button:hover:not(:disabled)::after {
  opacity: 1;
  animation: button-scan 0.8s ease-out;
}
.refresh-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.refresh-icon {
  display: inline-block;
  font-size: 16px;
  line-height: 1;
}
.refresh-icon.spinning {
  animation: spin 0.8s linear infinite;
}
.status-banner, .monitor-card, .metric-card, .detail-panel, .error-panel {
  border: 1px solid #cfe2e9;
  background: linear-gradient( 145deg, rgba(255, 255, 255, 0.97), rgba(248, 252, 253, 0.94) );
  box-shadow: inset 0 0 30px rgba(34, 184, 223, 0.018), 0 12px 35px rgba(47, 88, 106, 0.065);
}
.status-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 16px;
  padding: 18px 20px;
  overflow: hidden;
}
.status-banner::before {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  content: "";
  background: #22b8df;
  box-shadow: 0 0 14px rgba(34, 184, 223, 0.45);
}
.status-banner::after {
  position: absolute;
  left: -20%;
  bottom: 0;
  width: 20%;
  height: 1px;
  content: "";
  background: linear-gradient( 90deg, transparent, rgba(34, 184, 223, 0.55), transparent );
  animation: banner-scan 4s linear infinite;
}
.status-banner.normal {
  border-color: #bee1d2;
}
.status-banner.warning {
  border-color: #e4d4a5;
}
.status-banner.warning::before {
  background: #dcae38;
  box-shadow: 0 0 14px rgba(220, 174, 56, 0.4);
}
.status-banner.warning::after {
  background: linear-gradient( 90deg, transparent, rgba(220, 174, 56, 0.55), transparent );
}
.status-banner.error {
  border-color: #e5bbb5;
}
.status-banner.error::before {
  background: #e56557;
  box-shadow: 0 0 14px rgba(229, 101, 87, 0.4);
}
.status-banner.error::after {
  background: linear-gradient( 90deg, transparent, rgba(229, 101, 87, 0.55), transparent );
}
.status-indicator {
  position: relative;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #31b985;
  box-shadow: 0 0 12px rgba(49, 185, 133, 0.55);
  animation: status-pulse 1.8s ease-in-out infinite;
}
.status-indicator::after {
  position: absolute;
  inset: -6px;
  content: "";
  border: 1px solid rgba(49, 185, 133, 0.15);
  border-radius: 50%;
  animation: status-ring 1.8s ease-out infinite;
}
.status-banner.warning .status-indicator {
  background: #dcae38;
  box-shadow: 0 0 12px rgba(220, 174, 56, 0.55);
}
.status-banner.warning .status-indicator::after {
  border-color: rgba(220, 174, 56, 0.15);
}
.status-banner.error .status-indicator {
  background: #e56557;
  box-shadow: 0 0 12px rgba(229, 101, 87, 0.55);
}
.status-banner.error .status-indicator::after {
  border-color: rgba(229, 101, 87, 0.15);
}
.status-main {
  min-width: 0;
  flex: 1;
}
.status-label {
  display: block;
  color: #6d8792;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.status-main strong {
  display: block;
  margin-top: 4px;
  color: #17313d;
  font-size: 18px;
  font-weight: 800;
}
.status-main p {
  margin: 4px 0 0;
  color: #708993;
  font-size: 10px;
}
.status-pulse-line {
  width: 90px;
  height: 1px;
  background: linear-gradient( 90deg, transparent, rgba(34, 184, 223, 0.28), transparent );
  animation: pulse-line 2.2s ease-in-out infinite;
}
.last-check {
  text-align: right;
}
.last-check span {
  display: block;
  color: #6d8792;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.last-check strong {
  display: block;
  margin-top: 4px;
  color: #55717c;
  font-size: 10px;
}
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.monitor-card {
  position: relative;
  min-height: 190px;
  overflow: hidden;
  animation: card-enter 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.monitor-card-1 {
  animation-delay: 0.08s;
}
.monitor-card-2 {
  animation-delay: 0.14s;
}
.monitor-card-3 {
  animation-delay: 0.2s;
}
.monitor-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 184, 223, 0.32);
  box-shadow: inset 0 0 30px rgba(34, 184, 223, 0.03), 0 15px 35px rgba(47, 88, 106, 0.1);
}
.card-glow {
  position: absolute;
  right: -45px;
  top: -55px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(34, 184, 223, 0.035);
  filter: blur(25px);
  pointer-events: none;
  transition: background 0.25s ease;
}
.monitor-card:hover .card-glow {
  background: rgba(34, 184, 223, 0.065);
}
.card-scan {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  opacity: 0;
  background: linear-gradient( 90deg, transparent, rgba(34, 184, 223, 0.5), transparent );
}
.monitor-card:hover .card-scan {
  opacity: 1;
  animation: card-scan 1s ease-out;
}
.card-header, .panel-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 17px 18px;
  border-bottom: 1px solid #d6e7ec;
}
.card-header::after, .panel-header::after {
  position: absolute;
  left: -25%;
  bottom: -1px;
  width: 25%;
  height: 1px;
  content: "";
  background: linear-gradient( 90deg, transparent, rgba(34, 184, 223, 0.45), transparent );
  animation: header-scan 5s linear infinite;
}
.card-header h2, .panel-header h2 {
  margin: 0;
  color: #24434f;
  font-size: 16px;
  font-weight: 800;
}
.state-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 50px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid #cadde3;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.state-badge > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 7px currentColor;
  animation: status-pulse 1.7s ease-in-out infinite;
}
.state-badge.normal {
  border-color: #b9ddce;
  color: #2fa878;
}
.state-badge.error {
  border-color: #e1beb9;
  color: #d96254;
}
.monitor-body {
  padding: 14px 18px;
}
.state-row, .info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #e4eef1;
}
.state-row:last-child, .info-row:last-child {
  border-bottom: 0;
}
.state-row span, .info-row span {
  color: #738b95;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.state-row strong, .info-row strong {
  color: #365762;
  font-size: 10px;
  font-weight: 800;
  text-align: right;
}
.normal-text {
  color: #249c72 !important;
}
.error-text {
  color: #d96254 !important;
}
.card-footer-line {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 1px;
  background: linear-gradient( 90deg, rgba(34, 184, 223, 0.16), transparent );
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.metric-card {
  position: relative;
  padding: 17px;
  overflow: hidden;
  animation: metric-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.metric-card-1 {
  animation-delay: 0.1s;
}
.metric-card-2 {
  animation-delay: 0.15s;
}
.metric-card-3 {
  animation-delay: 0.2s;
}
.metric-card-4 {
  animation-delay: 0.25s;
}
.metric-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 184, 223, 0.3);
  box-shadow: inset 0 0 30px rgba(34, 184, 223, 0.025), 0 12px 28px rgba(47, 88, 106, 0.09);
}
.metric-card::before {
  position: absolute;
  left: 0;
  top: 0;
  width: 27%;
  height: 1px;
  content: "";
  background: #22b8df;
  box-shadow: 0 0 10px rgba(34, 184, 223, 0.3);
}
.metric-card:nth-child(4)::before {
  background: #31b985;
}
.metric-label {
  display: block;
  color: #6d8792;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.13em;
}
.metric-card strong {
  display: block;
  margin-top: 8px;
  color: #24434f;
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.metric-card > span:last-of-type {
  display: block;
  margin-top: 3px;
  color: #78929d;
  font-size: 9px;
}
.metric-scan {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  background: linear-gradient( 90deg, transparent, rgba(34, 184, 223, 0.45), transparent );
  animation: metric-scan 4s ease-in-out infinite;
}
.detail-panel {
  overflow: hidden;
}
.backend-control-panel {
  margin-bottom: 16px;
}
.backend-control-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 22px;
}
.backend-control-info {
  min-width: 0;
  flex: 1;
}
.control-label {
  display: block;
  margin-bottom: 7px;
  color: #22b8df;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.backend-control-info strong {
  display: block;
  color: #31525e;
  font-size: 15px;
  font-weight: 800;
}
.backend-control-info p {
  max-width: 700px;
  margin: 7px 0 0;
  color: #6d8792;
  font-size: 10px;
  line-height: 1.7;
}
.restart-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #2fa878;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.restart-status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
.restart-status.status-checking, .restart-status.status-restarting {
  color: #22a7cb;
}
.restart-status.status-checking > span, .restart-status.status-restarting > span {
  animation: status-pulse 0.8s ease-in-out infinite;
}
.restart-status.status-success {
  color: #299f77;
}
.restart-status.status-failed {
  color: #d96254;
}
.restart-button {
  position: relative;
  flex-shrink: 0;
  min-width: 220px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 18px;
  border: 1px solid #94cede;
  background: linear-gradient( 135deg, #effbfe, #f8fdfe );
  color: #238ba8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
}
.restart-button::before {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background: linear-gradient( 90deg, transparent, #22b8df, transparent );
  opacity: 0;
}
.restart-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #22b8df;
  background: linear-gradient( 135deg, #eaf9fd, #ffffff );
  box-shadow: 0 0 26px rgba(34, 184, 223, 0.1), 0 8px 22px rgba(47, 88, 106, 0.08);
}
.restart-button:hover:not(:disabled)::before {
  opacity: 1;
  animation: restart-scan 0.8s ease-out;
}
.restart-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.restart-icon {
  display: inline-block;
  font-size: 20px;
  line-height: 1;
}
.restart-icon.restarting {
  animation: spin 0.8s linear infinite;
}
.restart-progress {
  height: 1px;
  background: #e2edf1;
  overflow: hidden;
}
.restart-progress-bar {
  width: 0;
  height: 100%;
  background: linear-gradient( 90deg, transparent, #22b8df, transparent );
}
.restart-progress-bar.active {
  width: 100%;
  animation: restart-progress 1.5s linear infinite;
}
.communication-panel {
  margin-bottom: 16px;
}
.panel-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #239bbd;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.panel-live span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #31b985;
  box-shadow: 0 0 7px rgba(49, 185, 133, 0.55);
  animation: status-pulse 1.3s ease-in-out infinite;
}
.communication-path {
  display: flex;
  align-items: center;
  padding: 28px 22px;
}
.path-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
  padding: 12px;
  border: 1px solid #c9dde4;
  background: linear-gradient( 135deg, #ffffff, #f6fbfd );
  transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
}
.path-node:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 184, 223, 0.35);
  box-shadow: 0 8px 22px rgba(47, 88, 106, 0.08);
}
.path-node.normal {
  border-color: #b9dccc;
}
.path-node.error {
  border-color: #dfbdb8;
}
.node-number {
  color: #22a6ca;
  font-size: 8px;
  font-weight: 800;
}
.path-node strong {
  display: block;
  color: #31525e;
  font-size: 10px;
  font-weight: 800;
}
.path-node small {
  display: block;
  margin-top: 3px;
  color: #79939d;
  font-size: 8px;
}
.node-state {
  margin-left: auto;
  color: #7e969f;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.path-node.normal .node-state {
  color: #299d75;
}
.path-node.error .node-state {
  color: #d96254;
}
.path-line {
  position: relative;
  flex: 1;
  height: 2px;
  margin: 0 8px;
  overflow: hidden;
  background: #d4e5ea;
}
.path-line::before, .path-line::after {
  position: absolute;
  top: 50%;
  width: 5px;
  height: 5px;
  content: "";
  border: 1px solid #22b8df;
  border-radius: 50%;
  background: #f4f9fc;
  transform: translateY(-50%);
  z-index: 3;
}
.path-line::before {
  left: 0;
}
.path-line::after {
  right: 0;
}
.path-flow {
  position: absolute;
  left: -35%;
  top: 0;
  width: 35%;
  height: 100%;
  background: linear-gradient( 90deg, transparent 0%, rgba(34, 184, 223, 0.12) 15%, #22b8df 50%, rgba(34, 184, 223, 0.12) 85%, transparent 100% );
  box-shadow: 0 0 8px rgba(34, 184, 223, 0.55);
  opacity: 0;
}
.path-line.active .path-flow {
  opacity: 1;
  animation: flow-line 1.6s linear infinite;
}
.path-line span {
  position: absolute;
  left: 50%;
  top: -18px;
  transform: translateX(-50%);
  color: #6c8994;
  font-size: 8px;
  font-weight: 800;
  white-space: nowrap;
  z-index: 4;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.info-list {
  padding: 8px 18px 14px;
}
.error-panel {
  margin-bottom: 16px;
  overflow: hidden;
}
.error-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #718a94;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.error-count span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #31b985;
  box-shadow: 0 0 7px rgba(49, 185, 133, 0.5);
}
.error-count.has-errors span {
  background: #e56557;
  box-shadow: 0 0 7px rgba(229, 101, 87, 0.5);
}
.no-errors {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 7px;
  padding: 25px;
  text-align: center;
}
.no-error-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid #a9d9c5;
  color: #2da477;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 0 18px rgba(49, 185, 133, 0.035);
}
.no-error-icon::before, .no-error-icon::after {
  position: absolute;
  width: 7px;
  height: 7px;
  content: "";
  border-color: rgba(49, 185, 133, 0.35);
}
.no-error-icon::before {
  left: -1px;
  top: -1px;
  border-top: 1px solid;
  border-left: 1px solid;
}
.no-error-icon::after {
  right: -1px;
  bottom: -1px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}
.no-errors strong {
  color: #45626d;
  font-size: 10px;
}
.no-errors > span {
  color: #8097a0;
  font-size: 9px;
}
.error-list {
  padding: 0;
}
.error-row {
  position: relative;
  display: block;
  width: 100%;
  padding: 16px 18px 15px;
  border: 0;
  border-bottom: 1px solid #e3edf1;
  background: #ffffff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: background 0.2s ease, padding-left 0.2s ease;
}
.error-row:last-child {
  border-bottom: 0;
}
.error-row::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  content: "";
  background: #e56557;
  box-shadow: 0 0 9px rgba(229, 101, 87, 0.22);
}
.error-row::after {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  content: "";
  background: #22b8df;
  transition: width 0.22s ease;
}
.error-row:hover {
  padding-left: 22px;
  background: #fbfdfe;
}
.error-row:hover::after {
  width: 100%;
}
.error-row:focus-visible {
  outline: 2px solid #22b8df;
  outline-offset: -2px;
}
.error-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.error-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  padding: 4px 6px;
  border: 1px solid #e2b8b2;
  background: #fff4f2;
  color: #cf5d51;
  font-size: 9px;
  font-weight: 800;
}
.error-status.large {
  min-width: 64px;
  min-height: 44px;
  padding: 0 10px;
  font-size: 17px;
}
.error-code {
  padding: 4px 6px;
  border: 1px solid #d8e5e9;
  background: #f8fbfc;
  color: #54727e;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 800;
}
.error-time {
  margin-left: auto;
  color: #8198a1;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 700;
}
.error-message {
  display: -webkit-box;
  margin-top: 9px;
  color: #3d5964;
  font-size: 10px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.error-request {
  margin-top: 6px;
  color: #6f8791;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  overflow-wrap: anywhere;
}
.error-exception {
  margin-top: 5px;
  color: #cf5d51;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.error-detail-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: #269bbd;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.error-detail-link span {
  font-size: 11px;
  transition: transform 0.2s ease;
}
.error-row:hover .error-detail-link span {
  transform: translateX(3px);
}
.error-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(18, 39, 48, 0.42);
  backdrop-filter: blur(5px);
}
.error-modal {
  width: min(860px, 100%);
  max-height: min(820px, calc(100vh - 48px));
  overflow: auto;
  border: 1px solid #bdd7df;
  background: #f7fbfc;
  box-shadow: 0 30px 90px rgba(23, 49, 61, 0.22), inset 0 0 40px rgba(34, 184, 223, 0.025);
}
.error-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 22px;
  border-bottom: 1px solid #d6e7ec;
  background: #ffffff;
}
.error-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid #cbdde3;
  background: #f9fcfd;
  color: #58737e;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.error-modal-close:hover {
  border-color: #22b8df;
  background: #eefafd;
  transform: rotate(4deg);
}
.error-modal-summary {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(220px, 0.7fr);
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #dfecef;
  background: linear-gradient(135deg, #ffffff, #f6fbfd);
}
.error-summary-status {
  display: flex;
  align-items: center;
  gap: 12px;
}
.error-summary-label {
  display: block;
  color: #7a929c;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.error-summary-status strong {
  display: block;
  margin-top: 4px;
  color: #365762;
  font-size: 14px;
}
.error-summary-code {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 16px;
  border-left: 1px solid #dbe8ed;
}
.error-summary-code span {
  color: #7a929c;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.error-summary-code strong {
  margin-top: 5px;
  color: #cf5d51;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.error-modal-section {
  padding: 18px 22px;
  border-bottom: 1px solid #dfecef;
}
.error-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.error-section-title span {
  color: #22a6ca;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 800;
}
.error-section-title strong {
  color: #31525e;
  font-size: 12px;
  font-weight: 800;
}
.error-explanation {
  padding: 10px 12px;
  border-left: 2px solid #22b8df;
  background: #eef9fc;
  color: #56727d;
  font-size: 10px;
  line-height: 1.7;
}
.error-message-box {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #dfebee;
  background: #ffffff;
}
.error-message-box span {
  color: #7c939c;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.error-message-box p {
  margin: 7px 0 0;
  color: #3d5964;
  font-size: 10px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.error-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.error-modal-grid .error-modal-section {
  border-bottom: 0;
}
.error-modal-grid .error-modal-section:first-child {
  border-right: 1px solid #dfecef;
}
.error-detail-list {
  border: 1px solid #dfebee;
  background: #ffffff;
}
.error-detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid #e8f0f2;
}
.error-detail-row:last-child {
  border-bottom: 0;
}
.error-detail-row > span {
  flex-shrink: 0;
  color: #7a929c;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.error-detail-row > strong {
  color: #365762;
  font-size: 9px;
  font-weight: 800;
  text-align: right;
}
.mono {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
.wrap {
  overflow-wrap: anywhere;
}
.error-modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 22px;
  background: #ffffff;
}
.error-modal-footer > span {
  color: #7a929c;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 8px;
  font-weight: 800;
}
.error-modal-footer > strong {
  flex: 1;
  color: #8097a0;
  font-size: 8px;
  font-weight: 700;
}
.error-close-button {
  flex-shrink: 0;
  min-width: 80px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #9bcfdf;
  background: #eefafd;
  color: #238ba8;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.error-close-button:hover {
  border-color: #22b8df;
  background: #e4f7fb;
}
.error-modal-enter-active, .error-modal-leave-active {
  transition: opacity 0.2s ease;
}
.error-modal-enter-active .error-modal, .error-modal-leave-active .error-modal {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.error-modal-enter-from, .error-modal-leave-to {
  opacity: 0;
}
.error-modal-enter-from .error-modal, .error-modal-leave-to .error-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.985);
}
.floating-error {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 360px;
  padding: 12px 15px;
  border: 1px solid #e0b5b0;
  background: linear-gradient( 135deg, #fff9f8, #ffffff );
  color: #cf5d51;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 16px 40px rgba(47, 88, 106, 0.14);
}
.floating-error > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #dfa59e;
  color: #cf5d51;
}
.floating-error-enter-active, .floating-error-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.floating-error-enter-from, .floating-error-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.page-enter {
  animation: page-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.delay-1 {
  animation-delay: 0.08s;
}
.delay-2 {
  animation-delay: 0.16s;
}
.delay-3 {
  animation-delay: 0.22s;
}
.delay-4 {
  animation-delay: 0.28s;
}
.delay-5 {
  animation-delay: 0.34s;
}
.delay-6 {
  animation-delay: 0.4s;
}
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.995);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes metric-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes ambient-scan {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(680%);
  }
}
@keyframes grid-drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 56px 56px;
  }
}
@keyframes banner-scan {
  0% {
    left: -20%;
  }
  55%, 100% {
    left: 110%;
  }
}
@keyframes button-scan {
  from {
    left: -30%;
  }
  to {
    left: 110%;
  }
}
@keyframes restart-scan {
  from {
    left: -30%;
  }
  to {
    left: 110%;
  }
}
@keyframes restart-progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}
@keyframes status-ring {
  0% {
    opacity: 0.6;
    transform: scale(0.75);
  }
  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}
@keyframes pulse-line {
  0%, 100% {
    width: 55px;
    opacity: 0.25;
  }
  50% {
    width: 105px;
    opacity: 0.75;
  }
}
@keyframes header-scan {
  0% {
    left: -25%;
  }
  55%, 100% {
    left: 110%;
  }
}
@keyframes card-scan {
  from {
    left: -30%;
  }
  to {
    left: 110%;
  }
}
@keyframes metric-scan {
  0%, 100% {
    left: -30%;
  }
  50% {
    left: 110%;
  }
}
@keyframes flow-line {
  0% {
    left: -35%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}
@keyframes flow-line-vertical {
  0% {
    top: -35%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 1000px) {
  .monitor-grid {
    grid-template-columns: 1fr;
  }
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .communication-path {
    flex-wrap: wrap;
    gap: 12px;
  }
  .path-line {
    min-width: 80px;
  }
  .backend-control-body {
    align-items: stretch;
    flex-direction: column;
  }
  .restart-button {
    width: 100%;
  }
}
@media (max-width: 700px) {
  .admin-system {
    padding: 16px;
  }
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .refresh-button {
    align-self: flex-start;
  }
  .status-banner {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .status-pulse-line {
    display: none;
  }
  .last-check {
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid #dbe8ed;
    text-align: left;
  }
  .metrics-grid, .detail-grid {
    grid-template-columns: 1fr;
  }
  .communication-path {
    align-items: stretch;
    flex-direction: column;
  }
  .path-node {
    min-width: 0;
  }
  .path-line {
    width: 2px;
    height: 32px;
    min-width: 2px;
    margin: 0 auto;
  }
  .path-line::before, .path-line::after {
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
  }
  .path-flow {
    top: -35%;
    left: 0;
    width: 100%;
    height: 35%;
    background: linear-gradient( 180deg, transparent 0%, rgba(34, 184, 223, 0.12) 15%, #22b8df 50%, rgba(34, 184, 223, 0.12) 85%, transparent 100% );
  }
  .path-line.active .path-flow {
    animation: flow-line-vertical 1.6s linear infinite;
  }
  .path-line span {
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
  }
  .error-modal-backdrop {
    align-items: flex-end;
    padding: 12px;
  }
  .error-modal {
    max-height: calc(100vh - 24px);
  }
  .error-modal-summary {
    grid-template-columns: 1fr;
  }
  .error-summary-code {
    padding-top: 12px;
    padding-left: 0;
    border-top: 1px solid #dbe8ed;
    border-left: 0;
  }
  .error-modal-grid {
    grid-template-columns: 1fr;
  }
  .error-modal-grid .error-modal-section:first-child {
    border-right: 0;
    border-bottom: 1px solid #dfecef;
  }
  .error-modal-footer {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .error-modal-footer > strong {
    min-width: 100%;
    order: 3;
  }
  .floating-error {
    right: 16px;
    bottom: 16px;
    left: 16px;
    max-width: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ambient-grid, .ambient-scan, .refresh-icon.spinning, .restart-icon.restarting, .status-banner::after, .status-indicator, .status-indicator::after, .state-badge > span, .panel-live span, .metric-scan, .path-flow, .path-line.active .path-flow, .card-scan, .card-header::after, .panel-header::after, .restart-progress-bar.active {
    animation: none;
  }
  .page-enter, .monitor-card, .metric-card {
    animation: none;
  }
}
</style>
