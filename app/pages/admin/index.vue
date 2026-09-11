<template>
  <div class="admin-page">
    <div
      v-if="isBooting"
      class="boot-screen"
    >
      <div class="boot-grid"></div>
      <div class="boot-scanline"></div>
      <div class="boot-glow"></div>

      <div class="boot-panel">
        <div class="boot-top">
          <span>SYSTEM CONTROL</span>
          <span>SECURE CONNECTION</span>
        </div>

        <div class="boot-main">
          <div class="boot-symbol-wrap">
            <div class="boot-symbol">◆</div>
          </div>

          <h1>SYSTEM INITIALIZATION</h1>

          <p class="boot-description">
            管理システムの起動確認を実行しています
          </p>
        </div>

        <div class="boot-checks">
          <div
            class="boot-check"
            :class="{ complete: bootStep >= 1 }"
          >
            <span class="check-index">01</span>
            <span class="check-name">NETWORK</span>

            <span
              class="check-status"
              :class="{
                ready: bootStep >= 1 && !bootFailed,
                error: bootFailed && bootStep >= 1
              }"
            >
              {{
                bootFailed && bootStep >= 1
                  ? 'ERROR'
                  : bootStep >= 1
                    ? 'ONLINE'
                    : 'CHECKING'
              }}
            </span>
          </div>

          <div
            class="boot-check"
            :class="{ complete: bootStep >= 2 }"
          >
            <span class="check-index">02</span>
            <span class="check-name">BACKEND API</span>

            <span
              class="check-status"
              :class="{
                ready:
                  bootStep >= 2 &&
                  healthStatus?.backend === 'ok',
                error:
                  bootStep >= 2 &&
                  healthStatus?.backend !== 'ok'
              }"
            >
              {{
                bootStep < 2
                  ? 'CHECKING'
                  : healthStatus?.backend === 'ok'
                    ? 'ONLINE'
                    : 'ERROR'
              }}
            </span>
          </div>

          <div
            class="boot-check"
            :class="{ complete: bootStep >= 3 }"
          >
            <span class="check-index">03</span>
            <span class="check-name">DATABASE</span>

            <span
              class="check-status"
              :class="{
                ready:
                  bootStep >= 3 &&
                  healthStatus?.database === 'ok',
                error:
                  bootStep >= 3 &&
                  healthStatus?.database !== 'ok'
              }"
            >
              {{
                bootStep < 3
                  ? 'CHECKING'
                  : healthStatus?.database === 'ok'
                    ? 'CONNECTED'
                    : 'ERROR'
              }}
            </span>
          </div>

          <div
            class="boot-check"
            :class="{ complete: bootStep >= 4 }"
          >
            <span class="check-index">04</span>
            <span class="check-name">AUTHENTICATION</span>

            <span
              class="check-status"
              :class="{
                ready:
                  bootStep >= 4 &&
                  !bootFailed,
                error: bootFailed
              }"
            >
              {{
                bootFailed
                  ? 'BLOCKED'
                  : bootStep >= 4
                    ? 'NORMAL'
                    : 'CHECKING'
              }}
            </span>
          </div>
        </div>

        <div class="boot-progress">
          <div class="boot-progress-header">
            <span>SYSTEM STATUS</span>
            <span>{{ bootProgress }}%</span>
          </div>

          <div class="boot-progress-track">
            <div
              class="boot-progress-bar"
              :style="{
                width: `${bootProgress}%`
              }"
            ></div>

            <div class="boot-progress-glow"></div>
          </div>
        </div>

        <div
          class="boot-message"
          :class="{
            ready:
              bootProgress === 100 &&
              !bootFailed,
            error: bootFailed
          }"
        >
          <span class="boot-message-prefix">›</span>
          {{ bootMessage }}
        </div>

        <div class="boot-footer">
          <span>ADMINISTRATOR ACCESS</span>
          <span>LEVEL 01</span>
        </div>
      </div>
    </div>

    <main
      v-else
      class="console-main"
    >
      <div class="main-scanline"></div>

      <header class="console-header section-appear">
        <div>
          <div class="header-kicker">
            ADMINISTRATOR / SYSTEM CONTROL
          </div>

          <h1>システムダッシュボード</h1>

          <p>
            サービス全体の状態を監視・管理します
          </p>
        </div>

        <div class="header-meta">
          <div
            class="header-status"
            :class="{
              error:
                healthStatus?.status !== 'ok'
            }"
          >
            <span
              class="status-dot"
              :class="{
                offline:
                  healthStatus?.status !== 'ok'
              }"
            ></span>

            {{
              healthStatus?.status === 'ok'
                ? 'ONLINE'
                : 'WARNING'
            }}
          </div>

          <div class="header-time">
            {{ lastHealthCheck }}
          </div>
        </div>
      </header>

      <section
        class="section-block section-appear section-delay-1"
      >
        <div class="section-heading">
          <div class="section-heading-main">
            <span class="section-index">01</span>

            <div>
              <h2>システム状態</h2>
              <p>
                各システムモジュールの稼働状況
              </p>
            </div>
          </div>

          <span
            class="section-state"
            :class="{
              error:
                healthStatus?.status !== 'ok'
            }"
          >
            {{
              healthStatus?.status === 'ok'
                ? 'NORMAL'
                : 'WARNING'
            }}
          </span>
        </div>

        <div class="status-grid">
          <div class="status-card status-card-1">
            <div class="status-card-top">
              <span class="status-card-index">
                SYS-01
              </span>

              <span
                class="status-indicator online"
              >
                ●
              </span>
            </div>

            <div class="status-card-body">
              <span class="status-card-label">
                FRONTEND
              </span>

              <strong class="state-online">
                ONLINE
              </strong>

              <p>Nuxt 4 / Vue 3</p>
            </div>

            <div class="status-card-bottom">
              CLIENT SYSTEM
            </div>

            <div class="card-scan"></div>
          </div>

          <div class="status-card status-card-2">
            <div class="status-card-top">
              <span class="status-card-index">
                SYS-02
              </span>

              <span
                class="status-indicator"
                :class="
                  healthStatus?.backend === 'ok'
                    ? 'online'
                    : 'warning'
                "
              >
                ●
              </span>
            </div>

            <div class="status-card-body">
              <span class="status-card-label">
                BACKEND API
              </span>

              <strong
                :class="
                  healthStatus?.backend === 'ok'
                    ? 'state-online'
                    : 'state-error'
                "
              >
                {{
                  healthStatus?.backend === 'ok'
                    ? 'ONLINE'
                    : 'OFFLINE'
                }}
              </strong>

              <p>Ruby on Rails</p>
            </div>

            <div class="status-card-bottom">
              SERVER SYSTEM
            </div>

            <div class="card-scan"></div>
          </div>

          <div class="status-card status-card-3">
            <div class="status-card-top">
              <span class="status-card-index">
                SYS-03
              </span>

              <span
                class="status-indicator"
                :class="
                  healthStatus?.database === 'ok'
                    ? 'online'
                    : 'warning'
                "
              >
                ●
              </span>
            </div>

            <div class="status-card-body">
              <span class="status-card-label">
                DATABASE
              </span>

              <strong
                :class="
                  healthStatus?.database === 'ok'
                    ? 'state-online'
                    : 'state-error'
                "
              >
                {{
                  healthStatus?.database === 'ok'
                    ? 'CONNECTED'
                    : 'ERROR'
                }}
              </strong>

              <p>MySQL</p>
            </div>

            <div class="status-card-bottom">
              DATA SYSTEM
            </div>

            <div class="card-scan"></div>
          </div>

          <div
            class="status-card maintenance-card status-card-4"
            :class="{
              active:
                healthStatus?.maintenance
            }"
          >
            <div class="status-card-top">
              <span class="status-card-index">
                SYS-04
              </span>

              <span
                class="status-indicator"
                :class="
                  healthStatus?.maintenance
                    ? 'warning'
                    : 'online'
                "
              >
                ●
              </span>
            </div>

            <div class="status-card-body">
              <span class="status-card-label">
                MAINTENANCE
              </span>

              <strong
                :class="
                  healthStatus?.maintenance
                    ? 'state-maintenance'
                    : 'state-online'
                "
              >
                {{
                  healthStatus?.maintenance
                    ? 'ON'
                    : 'OFF'
                }}
              </strong>

              <p>
                {{
                  healthStatus?.maintenance
                    ? 'SERVICES RESTRICTED'
                    : 'ALL SERVICES ACTIVE'
                }}
              </p>
            </div>

            <div class="status-card-bottom">
              SERVICE CONTROL
            </div>

            <div class="card-scan maintenance-scan"></div>
          </div>
        </div>
      </section>

      <section
        class="section-block section-appear section-delay-2"
      >
        <div class="section-heading">
          <div class="section-heading-main">
            <span class="section-index">02</span>

            <div>
              <h2>サービス統計</h2>

              <p>
                現在のサービス利用状況
              </p>
            </div>
          </div>
        </div>

        <div class="metric-grid">
          <div class="metric-card">
            <span class="metric-label">
              TOTAL USERS
            </span>

            <strong>
              {{
                dashboardStatus?.users.total ??
                '---'
              }}
            </strong>

            <span class="metric-sub">
              本日 +{{
                dashboardStatus?.users.today ??
                '---'
              }} /
              登録ユーザー
            </span>

            <div class="metric-line"></div>
          </div>

          <div class="metric-card">
            <span class="metric-label">
              ORGANIZATIONS
            </span>

            <strong>
              {{
                dashboardStatus?.organizations.total ??
                '---'
              }}
            </strong>

            <span class="metric-sub">
              本日 +{{
                dashboardStatus?.organizations.today ??
                '---'
              }} /
              登録組織
            </span>

            <div class="metric-line"></div>
          </div>

          <div class="metric-card">
            <span class="metric-label">
              TRANSACTIONS
            </span>

            <strong>
              {{
                dashboardStatus?.transactions.total ??
                '---'
              }}
            </strong>

            <span class="metric-sub">
              本日 +{{
                dashboardStatus?.transactions.today ??
                '---'
              }} /
              総取引件数
            </span>

            <div class="metric-line"></div>
          </div>

          <div class="metric-card">
            <span class="metric-label">
              ACTIVE SESSION
            </span>

            <strong>---</strong>

            <span class="metric-sub">
              セッション管理未実装
            </span>

            <div class="metric-line"></div>
          </div>
        </div>
      </section>

      <section
        class="section-block section-appear section-delay-3"
      >
        <div class="section-heading">
          <div class="section-heading-main">
            <span class="section-index">03</span>

            <div>
              <h2>SYSTEM LOG</h2>

              <p>
                システムイベントをリアルタイムで確認します
              </p>
            </div>
          </div>

          <span class="live-badge">
            <span class="live-dot"></span>
            LIVE
          </span>
        </div>

        <div class="log-panel">
          <div class="log-panel-header">
            <span>EVENT STREAM</span>
            <span>{{ lastHealthCheck }}</span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [SYSTEM]
            </span>

            <span class="log-message">
              管理者コンソールを初期化しました
            </span>

            <span class="log-state">
              OK
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [NETWORK]
            </span>

            <span class="log-message">
              フロントエンド接続を確認しました
            </span>

            <span class="log-state">
              OK
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [API]
            </span>

            <span class="log-message">
              Rails APIとの通信を確認しました
            </span>

            <span
              class="log-state"
              :class="{
                'log-error':
                  healthStatus?.backend !== 'ok'
              }"
            >
              {{
                healthStatus?.backend === 'ok'
                  ? 'OK'
                  : 'ERROR'
              }}
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [DATABASE]
            </span>

            <span class="log-message">
              MySQLデータベース接続を確認しました
            </span>

            <span
              class="log-state"
              :class="{
                'log-error':
                  healthStatus?.database !== 'ok'
              }"
            >
              {{
                healthStatus?.database === 'ok'
                  ? 'OK'
                  : 'ERROR'
              }}
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [DASHBOARD]
            </span>

            <span class="log-message">
              サービス統計データを取得しました
            </span>

            <span
              class="log-state"
              :class="{
                'log-error':
                  !dashboardStatus
              }"
            >
              {{
                dashboardStatus
                  ? 'OK'
                  : 'ERROR'
              }}
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [MAINTENANCE]
            </span>

            <span class="log-message">
              {{
                healthStatus?.maintenance
                  ? 'メンテナンスモードが有効です'
                  : 'メンテナンスモードは無効です'
              }}
            </span>

            <span
              class="log-state"
              :class="{
                'log-maintenance':
                  healthStatus?.maintenance
              }"
            >
              {{
                healthStatus?.maintenance
                  ? 'ON'
                  : 'OFF'
              }}
            </span>
          </div>

          <div class="log-row">
            <span class="log-time">
              [SYSTEM]
            </span>

            <span class="log-message">
              最終ヘルスチェック
              {{ lastHealthCheck }}
            </span>

            <span class="log-state">
              {{
                healthStatus?.status === 'ok'
                  ? 'READY'
                  : 'WARNING'
              }}
            </span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

interface HealthStatus {
  status: 'ok' | 'degraded'
  backend: 'ok' | 'error'
  database: 'ok' | 'error'
  maintenance: boolean
  timestamp: string
}

interface DashboardStatus {
  users: {
    total: number
    today: number
  }
  organizations: {
    total: number
    today: number
  }
  transactions: {
    total: number
    today: number
  }
  system: {
    status: string
  }
  generated_at: string
}

const { $api } = useNuxtApp()

const isBooting = ref(true)
const bootStep = ref(0)
const bootProgress = ref(0)
const bootMessage = ref(
  'SYSTEM INITIALIZING...'
)
const bootFailed = ref(false)

const healthStatus =
  ref<HealthStatus | null>(null)

const dashboardStatus =
  ref<DashboardStatus | null>(null)

const isCheckingHealth = ref(false)
const lastHealthCheck =
  ref('NOT CHECKED')

const formatTime = (
  timestamp: string
) => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return 'UNKNOWN'
  }

  return date.toLocaleTimeString(
    'ja-JP',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  )
}

const checkHealth = async () => {
  isCheckingHealth.value = true

  try {
    const response =
      await $api.get<HealthStatus>(
        '/health',
        {
          timeout: 5000
        }
      )

    healthStatus.value =
      response.data

    lastHealthCheck.value =
      formatTime(
        response.data.timestamp
      )

    return response.data
  } catch (error) {
    console.error(
      'Health check failed:',
      error
    )

    healthStatus.value = {
      status: 'degraded',
      backend: 'error',
      database: 'error',
      maintenance: false,
      timestamp:
        new Date().toISOString()
    }

    lastHealthCheck.value =
      formatTime(
        healthStatus.value.timestamp
      )

    return null
  } finally {
    isCheckingHealth.value = false
  }
}

const fetchDashboard = async () => {
  try {
    const response =
      await $api.get<DashboardStatus>(
        '/admin/dashboard',
        {
          timeout: 5000
        }
      )

    dashboardStatus.value =
      response.data
  } catch (error) {
    console.error(
      'Dashboard data fetch failed:',
      error
    )

    dashboardStatus.value = null
  }
}

const wait = (
  milliseconds: number
) =>
  new Promise(resolve => {
    setTimeout(
      resolve,
      milliseconds
    )
  })

const runBootSequence =
  async () => {
    isBooting.value = true
    bootFailed.value = false
    bootStep.value = 0
    bootProgress.value = 0

    bootMessage.value =
      'SYSTEM INITIALIZING...'

    await wait(500)

    bootStep.value = 1
    bootProgress.value = 20
    bootMessage.value =
      'NETWORK CHECK...'

    await wait(500)

    const health =
      await checkHealth()

    if (!health) {
      bootFailed.value = true
      bootMessage.value =
        'NETWORK CONNECTION FAILED'
      return
    }

    bootStep.value = 2
    bootProgress.value = 45
    bootMessage.value =
      'BACKEND API CHECK...'

    await wait(500)

    if (health.backend !== 'ok') {
      bootFailed.value = true
      bootMessage.value =
        'BACKEND API CHECK FAILED'
      return
    }

    bootStep.value = 3
    bootProgress.value = 70
    bootMessage.value =
      'DATABASE CHECK...'

    await wait(500)

    if (health.database !== 'ok') {
      bootFailed.value = true
      bootMessage.value =
        'DATABASE CHECK FAILED'
      return
    }

    bootStep.value = 4
    bootProgress.value = 90
    bootMessage.value =
      'AUTHENTICATION CHECK...'

    await wait(500)

    bootProgress.value = 100
    bootMessage.value =
      'SYSTEM READY'

    await wait(700)

    isBooting.value = false

    await fetchDashboard()
  }

onMounted(() => {
  runBootSequence()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 50% -10%,
      rgba(0, 210, 255, 0.08),
      transparent 35%
    ),
    radial-gradient(
      circle at 0% 100%,
      rgba(0, 229, 255, 0.035),
      transparent 28%
    ),
    #05080b;
  color: #eef8fa;
  font-family:
    Inter,
    "Noto Sans JP",
    "Yu Gothic",
    Meiryo,
    sans-serif;
}

.boot-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 24px;
  background:
    radial-gradient(
      circle at center,
      rgba(0, 229, 255, 0.08),
      transparent 38%
    ),
    #04070a;
}

.boot-screen::before {
  position: absolute;
  inset: 0;
  content: "";
  background:
    radial-gradient(
      circle at 50% 50%,
      transparent 0,
      rgba(0, 0, 0, 0.12) 52%,
      rgba(0, 0, 0, 0.5) 100%
    );
  pointer-events: none;
}

.boot-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      rgba(0, 229, 255, 0.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(0, 229, 255, 0.045) 1px,
      transparent 1px
    );
  background-size: 42px 42px;
  pointer-events: none;
  animation:
    boot-grid-move 12s
    linear infinite;
}

.boot-scanline {
  position: absolute;
  top: -30%;
  left: 0;
  width: 100%;
  height: 22%;
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(0, 229, 255, 0.07),
      transparent
    );
  filter: blur(8px);
  pointer-events: none;
  animation:
    boot-scan 6s
    linear infinite;
}

.boot-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border: 1px solid
    rgba(0, 229, 255, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 50px
      rgba(0, 229, 255, 0.03),
    inset 0 0 50px
      rgba(0, 229, 255, 0.03);
  animation:
    boot-orbit 7s
    linear infinite;
  pointer-events: none;
}

.boot-panel {
  position: relative;
  z-index: 2;
  width: min(760px, 100%);
  border: 1px solid
    rgba(0, 229, 255, 0.35);
  background:
    linear-gradient(
      180deg,
      rgba(10, 19, 24, 0.98),
      rgba(5, 10, 14, 0.98)
    );
  box-shadow:
    0 0 55px
      rgba(0, 229, 255, 0.07),
    inset 0 0 40px
      rgba(0, 229, 255, 0.02);
  animation:
    boot-panel-enter 0.8s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
}

.boot-top,
.boot-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 18px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.09);
  color: #819ba3;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.boot-footer {
  border-top: 1px solid
    rgba(255, 255, 255, 0.09);
  border-bottom: none;
  color: #62777d;
}

.boot-main {
  padding: 34px 36px 28px;
}

.boot-symbol-wrap {
  position: relative;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    rgba(0, 229, 255, 0.25);
  transform: rotate(45deg);
  box-shadow:
    inset 0 0 20px
      rgba(0, 229, 255, 0.03);
  animation:
    boot-symbol-box 1.4s
    ease-in-out infinite;
}

.boot-symbol {
  color: #00e5ff;
  font-size: 22px;
  text-shadow:
    0 0 14px
    rgba(0, 229, 255, 0.7);
  transform: rotate(-45deg);
  animation:
    boot-symbol-pulse 1.2s
    ease-in-out infinite;
}

.boot-main h1 {
  margin: 20px 0 0;
  color: #f5fdff;
  font-size: 31px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.boot-description {
  margin: 9px 0 0;
  color: #8da3aa;
  font-size: 13px;
}

.boot-checks {
  margin: 0 36px;
  border-top: 1px solid
    rgba(255, 255, 255, 0.09);
}

.boot-check {
  position: relative;
  display: grid;
  grid-template-columns:
    52px minmax(0, 1fr) 120px;
  gap: 14px;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.boot-check::after {
  position: absolute;
  left: -100%;
  bottom: 0;
  width: 100%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(0, 229, 255, 0.6),
      transparent
    );
  animation:
    boot-check-scan 2.4s
    linear infinite;
}

.boot-check.complete::after {
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(0, 229, 255, 0.15),
      transparent
    );
}

.check-index {
  color: #526971;
  font-size: 11px;
  font-weight: 700;
}

.check-name {
  color: #c6d5d8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.check-status {
  color: #71848a;
  font-size: 11px;
  font-weight: 800;
  text-align: right;
  letter-spacing: 0.08em;
}

.check-status.ready {
  color: #00e5ff;
  text-shadow:
    0 0 9px
    rgba(0, 229, 255, 0.65);
  animation:
    text-flicker 1.8s
    ease-in-out infinite;
}

.check-status.error {
  color: #ff4d4d;
  text-shadow:
    0 0 9px
    rgba(255, 77, 77, 0.65);
  animation:
    error-pulse 1s
    ease-in-out infinite;
}

.boot-progress {
  padding: 24px 36px;
}

.boot-progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #6e858b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.boot-progress-track {
  position: relative;
  height: 7px;
  overflow: hidden;
  background: #0a161b;
}

.boot-progress-bar {
  position: relative;
  z-index: 2;
  height: 100%;
  background:
    linear-gradient(
      90deg,
      #008ba8,
      #00e5ff
    );
  box-shadow:
    0 0 14px
    rgba(0, 229, 255, 0.75);
  transition: width 0.5s ease;
}

.boot-progress-glow {
  position: absolute;
  top: 0;
  left: -30%;
  width: 30%;
  height: 100%;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.75),
      transparent
    );
  filter: blur(2px);
  animation:
    progress-glow 1.4s
    linear infinite;
}

.boot-message {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 36px 26px;
  color: #00e5ff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.boot-message-prefix {
  color: #4b707a;
}

.boot-message.ready {
  color: #c9fcff;
  text-shadow:
    0 0 10px
    rgba(0, 229, 255, 0.55);
}

.boot-message.error {
  color: #ff4d4d;
  text-shadow:
    0 0 10px
    rgba(255, 77, 77, 0.6);
}

.console-main {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding: 30px 34px 42px;
  overflow: auto;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at 30% 0%,
      rgba(0, 229, 255, 0.05),
      transparent 35%
    ),
    #03070a;
}

.main-scanline {
  position: absolute;
  top: -20%;
  left: 0;
  right: 0;
  height: 16%;
  pointer-events: none;
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(0, 229, 255, 0.035),
      transparent
    );
  filter: blur(6px);
  animation:
    main-scan 11s
    linear infinite;
}

.console-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.1);
}

.console-header::after {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 22%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      #00e5ff,
      transparent
    );
  box-shadow:
    0 0 10px
    rgba(0, 229, 255, 0.45);
  animation:
    header-line 4s
    ease-in-out infinite;
}

.header-kicker {
  color: #5e7d85;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.console-header h1 {
  margin: 8px 0 0;
  color: #f2fbfd;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.console-header p {
  margin: 8px 0 0;
  color: #84999f;
  font-size: 12px;
}

.header-meta {
  flex-shrink: 0;
  text-align: right;
}

.header-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  color: #00e5ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.header-status.error {
  color: #ff4d4d;
}

.header-time {
  margin-top: 7px;
  color: #52676e;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow:
    0 0 10px
    rgba(0, 229, 255, 0.9);
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.status-dot.offline {
  background: #ff4d4d;
  box-shadow:
    0 0 10px
    rgba(255, 77, 77, 0.8);
  animation:
    status-error-pulse 1.1s
    ease-in-out infinite;
}

.section-block {
  margin-top: 28px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.section-heading-main {
  display: flex;
  align-items: flex-start;
}

.section-index {
  width: 34px;
  flex-shrink: 0;
  padding-top: 2px;
  color: #526a71;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.section-heading h2 {
  margin: 0;
  color: #e8f5f7;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.section-heading p {
  margin: 5px 0 0;
  color: #768b91;
  font-size: 11px;
}

.section-state {
  color: #00e5ff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.section-state.error {
  color: #ff4d4d;
}

.status-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.status-card {
  position: relative;
  min-width: 0;
  border: 1px solid
    rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(
      145deg,
      #0a1217,
      #071014
    );
  overflow: hidden;
  animation:
    card-enter 0.65s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.status-card-1 {
  animation-delay: 0.1s;
}

.status-card-2 {
  animation-delay: 0.16s;
}

.status-card-3 {
  animation-delay: 0.22s;
}

.status-card-4 {
  animation-delay: 0.28s;
}

.status-card:hover {
  transform: translateY(-3px);
  border-color:
    rgba(0, 229, 255, 0.22);
  box-shadow:
    0 12px 26px
      rgba(0, 0, 0, 0.2),
    0 0 24px
      rgba(0, 229, 255, 0.03);
}

.status-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.07);
}

.status-card-index {
  color: #526970;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.status-indicator {
  font-size: 11px;
}

.status-indicator.online {
  color: #00e5ff;
  text-shadow:
    0 0 8px
    rgba(0, 229, 255, 0.75);
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.status-indicator.warning {
  color: #ffd000;
  text-shadow:
    0 0 8px
    rgba(255, 208, 0, 0.55);
  animation:
    warning-pulse 1.6s
    ease-in-out infinite;
}

.status-card-body {
  padding: 20px 16px;
}

.status-card-label {
  display: block;
  color: #668088;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.status-card-body strong {
  display: block;
  margin-top: 9px;
  color: #eefeff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.status-card-body strong.state-online {
  color: #00e5ff;
  text-shadow:
    0 0 8px
    rgba(0, 229, 255, 0.6);
}

.status-card-body strong.state-error {
  color: #ff4d4d;
  text-shadow:
    0 0 8px
    rgba(255, 77, 77, 0.55);
}

.status-card-body strong.state-maintenance {
  color: #ffd000;
  text-shadow:
    0 0 10px
    rgba(255, 208, 0, 0.6);
}

.status-card-body p {
  margin: 8px 0 0;
  color: #6a8087;
  font-size: 10px;
  font-weight: 600;
}

.status-card-bottom {
  padding: 10px 16px;
  border-top: 1px solid
    rgba(255, 255, 255, 0.07);
  color: #465c63;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.card-scan {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(0, 229, 255, 0.65),
      transparent
    );
  opacity: 0;
}

.status-card:hover .card-scan {
  opacity: 1;
  animation:
    card-scan 1s
    ease-out;
}

.maintenance-card {
  border-color:
    rgba(255, 255, 255, 0.1);
}

.maintenance-card:hover {
  border-color:
    rgba(0, 229, 255, 0.22);
}

.maintenance-card.active {
  border-color:
    rgba(255, 208, 0, 0.28);
  box-shadow:
    0 0 24px
      rgba(255, 208, 0, 0.035),
    inset 0 0 30px
      rgba(255, 208, 0, 0.02);
}

.maintenance-card.active:hover {
  border-color:
    rgba(255, 208, 0, 0.42);
  box-shadow:
    0 12px 28px
      rgba(0, 0, 0, 0.2),
    0 0 24px
      rgba(255, 208, 0, 0.05);
}

.maintenance-scan {
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255, 208, 0, 0.6),
      transparent
    );
}

.metric-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  position: relative;
  padding: 20px;
  border: 1px solid
    rgba(255, 255, 255, 0.09);
  background: #081015;
  overflow: hidden;
  animation:
    card-enter 0.65s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.metric-card:nth-child(1) {
  animation-delay: 0.12s;
}

.metric-card:nth-child(2) {
  animation-delay: 0.18s;
}

.metric-card:nth-child(3) {
  animation-delay: 0.24s;
}

.metric-card:nth-child(4) {
  animation-delay: 0.3s;
}

.metric-card:hover {
  transform: translateY(-3px);
  border-color:
    rgba(0, 229, 255, 0.2);
  box-shadow:
    0 12px 24px
    rgba(0, 0, 0, 0.18);
}

.metric-label {
  display: block;
  color: #607980;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  color: #f3fcfe;
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.metric-sub {
  display: block;
  margin-top: 5px;
  color: #667b81;
  font-size: 10px;
}

.metric-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 35%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      #00e5ff,
      transparent
    );
  box-shadow:
    0 0 10px
    rgba(0, 229, 255, 0.4);
  animation:
    metric-line 3.5s
    ease-in-out infinite;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border: 1px solid
    rgba(0, 229, 255, 0.18);
  color: #00e5ff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow:
    0 0 8px
    rgba(0, 229, 255, 0.75);
  animation:
    status-pulse 1.2s
    ease-in-out infinite;
}

.log-panel {
  border: 1px solid
    rgba(255, 255, 255, 0.1);
  background: #050b0f;
  overflow: hidden;
}

.log-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 18px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.07);
  color: #4d666d;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
  background:
    rgba(0, 229, 255, 0.015);
}

.log-row {
  position: relative;
  display: grid;
  grid-template-columns:
    110px minmax(0, 1fr) 60px;
  gap: 16px;
  align-items: center;
  min-height: 54px;
  padding: 0 18px;
  border-bottom: 1px solid
    rgba(255, 255, 255, 0.06);
  overflow: hidden;
  animation:
    log-enter 0.5s
    ease both;
}

.log-row:nth-child(2) {
  animation-delay: 0.1s;
}

.log-row:nth-child(3) {
  animation-delay: 0.15s;
}

.log-row:nth-child(4) {
  animation-delay: 0.2s;
}

.log-row:nth-child(5) {
  animation-delay: 0.25s;
}

.log-row:nth-child(6) {
  animation-delay: 0.3s;
}

.log-row:nth-child(7) {
  animation-delay: 0.35s;
}

.log-row:nth-child(8) {
  animation-delay: 0.4s;
}

.log-row::after {
  position: absolute;
  left: -25%;
  bottom: 0;
  width: 25%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(0, 229, 255, 0.35),
      transparent
    );
  opacity: 0;
}

.log-row:hover {
  background:
    rgba(0, 229, 255, 0.018);
}

.log-row:hover::after {
  opacity: 1;
  animation:
    log-scan 0.9s
    ease-out;
}

.log-row:last-child {
  border-bottom: none;
}

.log-time {
  color: #00bcd4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.log-message {
  color: #a9bbc0;
  font-size: 11px;
  font-weight: 600;
}

.log-state {
  color: #00e5ff;
  font-size: 9px;
  font-weight: 800;
  text-align: right;
  letter-spacing: 0.08em;
}

.log-error {
  color: #ff4d4d;
  text-shadow:
    0 0 8px
    rgba(255, 77, 77, 0.45);
}

.log-maintenance {
  color: #ffd000;
  text-shadow:
    0 0 8px
    rgba(255, 208, 0, 0.45);
}

.section-appear {
  animation:
    section-enter 0.7s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
}

.section-delay-1 {
  animation-delay: 0.12s;
}

.section-delay-2 {
  animation-delay: 0.22s;
}

.section-delay-3 {
  animation-delay: 0.32s;
}

@keyframes boot-panel-enter {
  from {
    opacity: 0;
    transform:
      translateY(18px)
      scale(0.985);
    filter: blur(3px);
  }

  to {
    opacity: 1;
    transform:
      translateY(0)
      scale(1);
    filter: blur(0);
  }
}

@keyframes boot-grid-move {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 42px 42px;
  }
}

@keyframes boot-scan {
  from {
    top: -30%;
  }

  to {
    top: 120%;
  }
}

@keyframes boot-orbit {
  from {
    transform:
      rotate(0deg)
      scale(1);
  }

  to {
    transform:
      rotate(360deg)
      scale(1.02);
  }
}

@keyframes boot-symbol-box {
  0%,
  100% {
    transform:
      rotate(45deg)
      scale(0.96);
    box-shadow:
      inset 0 0 20px
        rgba(0, 229, 255, 0.03),
      0 0 0
        rgba(0, 229, 255, 0);
  }

  50% {
    transform:
      rotate(45deg)
      scale(1.04);
    box-shadow:
      inset 0 0 20px
        rgba(0, 229, 255, 0.03),
      0 0 24px
        rgba(0, 229, 255, 0.08);
  }
}

@keyframes boot-symbol-pulse {
  0%,
  100% {
    opacity: 0.7;
    transform:
      rotate(-45deg)
      scale(0.94);
  }

  50% {
    opacity: 1;
    transform:
      rotate(-45deg)
      scale(1.08);
  }
}

@keyframes boot-check-scan {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes progress-glow {
  from {
    left: -30%;
  }

  to {
    left: 100%;
  }
}

@keyframes text-flicker {
  0%,
  100% {
    opacity: 1;
  }

  46% {
    opacity: 0.75;
  }

  49% {
    opacity: 1;
  }

  52% {
    opacity: 0.5;
  }

  55% {
    opacity: 1;
  }
}

@keyframes error-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

@keyframes status-error-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.85);
  }
}

@keyframes warning-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@keyframes main-scan {
  0% {
    transform: translateY(-120%);
  }

  100% {
    transform: translateY(760%);
  }
}

@keyframes header-line {
  0%,
  100% {
    width: 18%;
    opacity: 0.45;
  }

  50% {
    width: 38%;
    opacity: 1;
  }
}

@keyframes section-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
    filter: blur(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform:
      translateY(9px)
      scale(0.985);
  }

  to {
    opacity: 1;
    transform:
      translateY(0)
      scale(1);
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

@keyframes metric-line {
  0%,
  100% {
    width: 25%;
    opacity: 0.45;
  }

  50% {
    width: 55%;
    opacity: 1;
  }
}

@keyframes log-enter {
  from {
    opacity: 0;
    transform: translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes log-scan {
  from {
    left: -25%;
  }

  to {
    left: 110%;
  }
}

@media (max-width: 1150px) {
  .status-grid,
  .metric-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .console-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-meta {
    text-align: left;
  }

  .header-status {
    justify-content: flex-start;
  }
}

@media (max-width: 650px) {
  .boot-screen {
    padding: 14px;
  }

  .boot-panel {
    width: 100%;
  }

  .boot-main {
    padding: 26px 20px 22px;
  }

  .boot-main h1 {
    font-size: 23px;
    line-height: 1.35;
  }

  .boot-checks,
  .boot-progress {
    margin-left: 20px;
    margin-right: 20px;
    padding-left: 0;
    padding-right: 0;
  }

  .boot-message {
    padding-left: 20px;
    padding-right: 20px;
  }

  .console-main {
    padding: 22px 16px 30px;
  }

  .console-header h1 {
    font-size: 23px;
  }

  .status-grid,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .log-row {
    grid-template-columns:
      90px minmax(0, 1fr);
    gap: 10px;
    padding: 12px 14px;
  }

  .log-state {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .boot-grid,
  .boot-scanline,
  .boot-glow,
  .boot-symbol-wrap,
  .boot-symbol,
  .boot-check::after,
  .boot-progress-glow,
  .check-status.ready,
  .check-status.error,
  .main-scanline,
  .card-scan,
  .metric-line,
  .live-dot,
  .section-appear,
  .status-card,
  .metric-card,
  .log-row,
  .status-dot,
  .status-indicator.online,
  .status-indicator.warning {
    animation: none;
  }
}
</style>