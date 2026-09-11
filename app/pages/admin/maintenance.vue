<template>
  <div class="maintenance-page">
    <div class="ambient-grid"></div>
    <div class="ambient-scan"></div>

    <div class="page-header page-enter">
      <div>
        <p class="page-eyebrow">SYSTEM CONTROL / MAINTENANCE</p>
        <h1>メンテナンス管理</h1>
        <p class="page-description">システムおよび各機能の稼働状態を管理します</p>
      </div>

      <div class="connection-status" :class="connectionState">
        <span class="status-dot"></span>
        <span>{{ connectionState === 'connected' ? 'LIVE' : 'OFFLINE' }}</span>
      </div>
    </div>

    <Transition name="notification">
      <div
        v-if="notification"
        class="notification"
        :class="notification.type"
      >
        <span class="notification-line"></span>
        <span>{{ notification.message }}</span>
      </div>
    </Transition>

    <div class="maintenance-grid">
      <section class="control-panel panel-enter panel-enter-1">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">SYSTEM CONTROL</p>
            <h2>システム設定</h2>
          </div>

          <span
            class="panel-status"
            :class="{ danger: systemMaintenance }"
          >
            {{ systemMaintenance ? 'MAINTENANCE' : 'NORMAL' }}
          </span>
        </div>

        <div class="control-list">
          <div
            class="control-card system-control"
            :class="{ active: systemMaintenance }"
          >
            <div class="control-info">
              <div class="control-icon system">!</div>

              <div>
                <h3>システムメンテナンス</h3>
                <p>システム全体をメンテナンスモードにします</p>
              </div>
            </div>

            <button
              type="button"
              class="switch"
              :class="{ active: systemMaintenance }"
              :disabled="isUpdating"
              @click="toggleSystemMaintenance"
            >
              <span></span>
            </button>
          </div>

          <div
            class="control-card"
            :class="{ active: blockLogin }"
          >
            <div class="control-info">
              <div class="control-icon warning">L</div>

              <div>
                <h3>新規ログイン停止</h3>
                <p>一般ユーザーの新規ログインを停止します</p>
              </div>
            </div>

            <button
              type="button"
              class="switch"
              :class="{ active: blockLogin }"
              :disabled="isUpdating"
              @click="toggleBlockLogin"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div class="message-section">
          <div class="section-title">
            <div>
              <p class="panel-eyebrow">MESSAGE</p>
              <h3>メンテナンスメッセージ</h3>
            </div>
          </div>

          <textarea
            v-model="maintenanceMessage"
            maxlength="500"
            placeholder="ユーザーに表示するメッセージを入力"
          ></textarea>

          <div class="message-footer">
            <span>{{ maintenanceMessage.length }} / 500</span>

            <button
              type="button"
              class="save-button"
              :disabled="isUpdating"
              @click="saveMessage"
            >
              保存
            </button>
          </div>
        </div>

        <div class="feature-section">
          <div class="section-title">
            <div>
              <p class="panel-eyebrow">PANEL CONTROL</p>
              <h3>パネル別メンテナンス</h3>
            </div>

            <span class="section-hint">
              各パネルを個別に停止できます
            </span>
          </div>

          <div class="feature-grid">
            <div
              v-for="(feature, index) in panelFeatures"
              :key="feature.key"
              class="feature-panel"
              :class="{ disabled: !features[feature.key] }"
              :style="{ '--delay': `${index * 45}ms` }"
            >
              <div class="feature-panel-header">
                <div class="feature-main">
                  <div
                    class="feature-icon"
                    :class="feature.key"
                  >
                    {{ feature.icon }}
                  </div>

                  <div class="feature-text">
                    <p>{{ feature.code }}</p>
                    <h3>{{ feature.label }}</h3>
                    <span>{{ feature.description }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="switch small"
                  :class="{ active: features[feature.key] }"
                  :disabled="isUpdating"
                  @click="toggleFeature(feature.key)"
                >
                  <span></span>
                </button>
              </div>

              <div class="feature-panel-status">
                <span
                  class="feature-status-dot"
                  :class="{ maintenance: !features[feature.key] }"
                ></span>

                {{
                  features[feature.key]
                    ? 'SYSTEM ONLINE'
                    : 'MAINTENANCE MODE'
                }}
              </div>

              <div class="feature-scan"></div>
            </div>
          </div>
        </div>

        <div class="feature-section secondary-features">
          <div class="section-title">
            <div>
              <p class="panel-eyebrow">OTHER FEATURES</p>
              <h3>その他の機能</h3>
            </div>
          </div>

          <div class="feature-grid">
            <div
              v-for="(feature, index) in otherFeatures"
              :key="feature.key"
              class="feature-panel"
              :class="{ disabled: !features[feature.key] }"
              :style="{ '--delay': `${index * 45}ms` }"
            >
              <div class="feature-panel-header">
                <div class="feature-main">
                  <div
                    class="feature-icon"
                    :class="feature.key"
                  >
                    {{ feature.icon }}
                  </div>

                  <div class="feature-text">
                    <p>{{ feature.code }}</p>
                    <h3>{{ feature.label }}</h3>
                    <span>{{ feature.description }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="switch small"
                  :class="{ active: features[feature.key] }"
                  :disabled="isUpdating"
                  @click="toggleFeature(feature.key)"
                >
                  <span></span>
                </button>
              </div>

              <div class="feature-panel-status">
                <span
                  class="feature-status-dot"
                  :class="{ maintenance: !features[feature.key] }"
                ></span>

                {{
                  features[feature.key]
                    ? 'SYSTEM ONLINE'
                    : 'MAINTENANCE MODE'
                }}
              </div>

              <div class="feature-scan"></div>
            </div>
          </div>
        </div>

        <div class="danger-section">
          <div>
            <p class="panel-eyebrow danger-eyebrow">FORCE ACTION</p>
            <h3>一般ユーザーを強制ログアウト</h3>
            <p>
              現在ログイン中の一般ユーザーのセッションをすべて無効化します。
            </p>
          </div>

          <button
            type="button"
            class="danger-button"
            :disabled="isUpdating"
            @click="logoutAllUsers"
          >
            強制ログアウト
          </button>
        </div>
      </section>

      <section class="preview-panel panel-enter panel-enter-2">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">CURRENT PREVIEW</p>
            <h2>現在のプレビュー</h2>
          </div>

          <span class="live-label">LIVE PREVIEW</span>
        </div>

        <div class="preview-monitor">
          <div class="monitor-header">
            <div class="monitor-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span>USER INTERFACE PREVIEW</span>

            <span class="monitor-time">
              {{ formattedPreviewTime }}
            </span>
          </div>

          <div class="preview-body">
            <div class="preview-tabs">
              <button
                v-for="feature in previewFeatures"
                :key="feature.key"
                type="button"
                :class="{ active: previewFeature === feature.key }"
                :disabled="isPreviewTransitioning"
                @click="switchPreviewFeature(feature.key)"
              >
                {{ feature.label }}
              </button>
            </div>

            <div
              class="preview-screen"
              :class="{ 'is-transitioning': isPreviewTransitioning }"
            >
              <div class="screen-scanline"></div>
              <div class="scanline"></div>
              <div class="scanline-fast"></div>

              <div class="screen-corner top-left"></div>
              <div class="screen-corner top-right"></div>
              <div class="screen-corner bottom-left"></div>
              <div class="screen-corner bottom-right"></div>

              <Transition
                name="preview-switch"
                mode="out-in"
              >
                <div
                  :key="`${previewFeature}-${features[previewFeature]}`"
                  class="preview-content"
                >
                  <template v-if="features[previewFeature]">
                    <div class="normal-preview">
                      <div class="preview-status">
                        <span class="status-indicator"></span>
                        SYSTEM ONLINE
                      </div>

                      <div
                        class="preview-feature-icon"
                        :class="previewFeature"
                      >
                        {{ currentPreviewDefinition.icon }}
                      </div>

                      <p class="preview-code">
                        {{ currentPreviewDefinition.code }}
                      </p>

                      <h3>
                        {{ currentPreviewDefinition.label }}
                      </h3>

                      <p>
                        {{ currentPreviewDefinition.normalPreview }}
                      </p>

                      <div
                        v-if="isChartPreview(previewFeature)"
                        class="mock-chart"
                      >
                        <div class="mock-chart-lines">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>

                        <div class="mock-chart-bars">
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                        </div>

                        <div class="mock-chart-line">
                          <span></span>
                        </div>
                      </div>

                      <div
                        v-else-if="previewFeature === 'calendar'"
                        class="mock-calendar"
                      >
                        <div
                          v-for="n in 21"
                          :key="n"
                          class="mock-calendar-cell"
                          :class="{
                            today: n === 12,
                            event: [4, 8, 15, 19].includes(n)
                          }"
                        >
                          {{ n }}
                        </div>
                      </div>

                      <div
                        v-else
                        class="preview-data-grid"
                      >
                        <div>
                          <span>STATUS</span>
                          <strong>ACTIVE</strong>
                        </div>

                        <div>
                          <span>RESPONSE</span>
                          <strong>12ms</strong>
                        </div>

                        <div>
                          <span>ACCESS</span>
                          <strong>READY</strong>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="maintenance-preview">
                      <div class="preview-warning-ring">
                        <div class="preview-warning-ring-inner">
                          <div class="preview-warning-icon">!</div>
                        </div>
                      </div>

                      <p class="preview-code">
                        {{ currentPreviewDefinition.code }}
                      </p>

                      <h3>メンテナンス中です</h3>

                      <p>
                        現在{{ currentPreviewDefinition.label }}をメンテナンスしています。
                      </p>

                      <span>
                        復旧までしばらくお待ちください。
                      </span>

                      <div class="preview-maintenance-badge">
                        <span></span>
                        MAINTENANCE
                      </div>
                    </div>
                  </template>
                </div>
              </Transition>

              <Transition name="system-transition">
                <div
                  v-if="isPreviewTransitioning"
                  class="system-transition-overlay"
                  :class="`phase-${previewTransitionPhase}`"
                >
                  <div class="transition-grid"></div>
                  <div class="transition-scanline"></div>

                  <div class="transition-content">
                    <div class="transition-icon">
                      <span></span>
                    </div>

                    <div class="transition-label">
                      SYSTEM CHECK
                    </div>

                    <div class="transition-status">
                      {{
                        previewTransitionPhase === 'checking'
                          ? 'ANALYZING DISPLAY STATE...'
                          : 'SWITCHING DISPLAY MODE...'
                      }}
                    </div>

                    <div class="transition-progress">
                      <span></span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div class="preview-description">
          <div class="preview-description-icon">i</div>

          <div>
            <strong>ユーザー画面プレビュー</strong>

            <p>
              各パネルのスイッチを変更すると、このプレビューも即座に切り替わります。
            </p>
          </div>
        </div>

        <div class="preview-summary">
          <div class="summary-title">
            <p class="panel-eyebrow">PANEL STATUS</p>
            <span>現在の稼働状況</span>
          </div>

          <div class="summary-list">
            <div
              v-for="feature in previewFeatures"
              :key="feature.key"
              class="summary-item"
            >
              <button
                type="button"
                class="summary-name"
                :disabled="isPreviewTransitioning"
                @click="switchPreviewFeature(feature.key)"
              >
                <span
                  class="summary-icon"
                  :class="feature.key"
                >
                  {{ feature.icon }}
                </span>

                {{ feature.label }}
              </button>

              <span
                class="summary-status"
                :class="{ maintenance: !features[feature.key] }"
              >
                <span></span>
                {{ features[feature.key] ? '正常' : '停止中' }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="footer-info">
      <span>LAST UPDATE</span>
      <strong>{{ formattedUpdatedAt }}</strong>

      <span class="separator">/</span>

      <span>CONTROL CHANNEL</span>
      <strong>{{ connectionState.toUpperCase() }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

definePageMeta({
  layout: 'admin'
})

type FeatureKey =
  | 'calendar'
  | 'personal_balance_chart'
  | 'personal_category_chart'
  | 'organization_balance_chart'
  | 'organization_personal_balance_chart'
  | 'organization_category_chart'
  | 'organization_user_balance_chart'
  | 'accounts'
  | 'organization'
  | 'ai'

interface MaintenanceFeatures {
  calendar: boolean
  personal_balance_chart: boolean
  personal_category_chart: boolean
  organization_balance_chart: boolean
  organization_personal_balance_chart: boolean
  organization_category_chart: boolean
  organization_user_balance_chart: boolean
  accounts: boolean
  organization: boolean
  ai: boolean
}

interface MaintenanceSettings {
  system_maintenance: boolean
  block_login: boolean
  maintenance_message: string | null
  features: MaintenanceFeatures
  updated_at: string | null
}

interface MaintenanceUpdate {
  type: string
  maintenance?: MaintenanceSettings
}

interface FeatureDefinition {
  key: FeatureKey
  label: string
  description: string
  icon: string
  code: string
  normalPreview: string
}

const { $api, $cable } = useNuxtApp()

const systemMaintenance = ref(false)
const blockLogin = ref(false)
const maintenanceMessage = ref('')

const features = ref<MaintenanceFeatures>({
  calendar: true,
  personal_balance_chart: true,
  personal_category_chart: true,
  organization_balance_chart: true,
  organization_personal_balance_chart: true,
  organization_category_chart: true,
  organization_user_balance_chart: true,
  accounts: true,
  organization: true,
  ai: true
})

const updatedAt = ref<string | null>(null)

const connectionState = ref<
  'connected' | 'disconnected'
>('disconnected')

const isUpdating = ref(false)

const previewFeature = ref<FeatureKey>('calendar')
const previewTime = ref(new Date())

const isPreviewTransitioning = ref(false)

const previewTransitionPhase = ref<
  'idle' | 'checking' | 'switching'
>('idle')

const notification = ref<{
  type: 'success' | 'error'
  message: string
} | null>(null)

let maintenanceSubscription: any = null
let previewTimer: ReturnType<typeof setInterval> | null = null
let notificationTimer: ReturnType<typeof setTimeout> | null = null
let previewTransitionTimer: ReturnType<typeof setTimeout> | null = null

const featureDefinitions: FeatureDefinition[] = [
  {
    key: 'calendar',
    label: 'カレンダー',
    description: '取引カレンダーと日付ベースの記録',
    icon: 'C',
    code: 'CALENDAR / 01',
    normalPreview: '取引データをカレンダー形式で表示しています。'
  },
  {
    key: 'personal_balance_chart',
    label: '自分の収支推移',
    description: '個人画面の収入・支出・収支グラフ',
    icon: 'PB',
    code: 'PERSONAL BALANCE / 02',
    normalPreview: '自分の月ごとの収入・支出・収支を確認できます。'
  },
  {
    key: 'personal_category_chart',
    label: '自分の支出カテゴリ',
    description: '個人画面のカテゴリ別支出グラフ',
    icon: 'PC',
    code: 'PERSONAL CATEGORY / 03',
    normalPreview: '自分の支出をカテゴリごとに分析しています。'
  },
  {
    key: 'organization_balance_chart',
    label: '組織の収支推移',
    description: '組織全体の収入・支出・収支グラフ',
    icon: 'OB',
    code: 'ORGANIZATION BALANCE / 04',
    normalPreview: '組織全体の月別収支を分析しています。'
  },
  {
    key: 'organization_personal_balance_chart',
    label: '自分の収支推移',
    description: '組織家計簿における自分の収支グラフ',
    icon: 'MB',
    code: 'MEMBER BALANCE / 05',
    normalPreview: '組織家計簿における自分の収支を分析しています。'
  },
  {
    key: 'organization_category_chart',
    label: '支出カテゴリ',
    description: '組織のカテゴリ別支出グラフ',
    icon: 'OC',
    code: 'CATEGORY ANALYSIS / 06',
    normalPreview: '組織の支出をカテゴリごとに分析しています。'
  },
  {
    key: 'organization_user_balance_chart',
    label: 'ユーザごとの収支推移',
    description: '組織内ユーザーごとの収支グラフ',
    icon: 'UB',
    code: 'USER BALANCE / 07',
    normalPreview: 'ユーザーごとの収支を比較しています。'
  }
]

const otherFeatureDefinitions: FeatureDefinition[] = [
  {
    key: 'accounts',
    label: '口座',
    description: '銀行口座・残高管理',
    icon: 'A',
    code: 'ACCOUNTS / 08',
    normalPreview: '登録された口座と残高を確認できます。'
  },
  {
    key: 'organization',
    label: '組織',
    description: '組織・メンバー共有機能',
    icon: 'O',
    code: 'ORGANIZATION / 09',
    normalPreview: '組織情報とメンバーを管理しています。'
  },
  {
    key: 'ai',
    label: 'AI',
    description: '家計簿AIアシスタント',
    icon: 'AI',
    code: 'AI ASSISTANT / 10',
    normalPreview: 'AIアシスタントが家計データを分析しています。'
  }
]

const panelFeatures = featureDefinitions
const otherFeatures = otherFeatureDefinitions

const previewFeatures = [
  ...featureDefinitions,
  ...otherFeatureDefinitions
]

const currentPreviewDefinition = computed<FeatureDefinition>(() => {
  const found = previewFeatures.find(
    feature => feature.key === previewFeature.value
  )

  return found || previewFeatures[0]!
})

const formattedPreviewTime = computed(() => {
  return previewTime.value.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formattedUpdatedAt = computed(() => {
  if (!updatedAt.value) {
    return '--'
  }

  return new Date(
    updatedAt.value
  ).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const isChartPreview = (key: FeatureKey) => {
  return key.includes('chart')
}

const switchPreviewFeature = (feature: FeatureKey) => {
  if (
    feature === previewFeature.value ||
    isPreviewTransitioning.value
  ) {
    return
  }

  if (previewTransitionTimer) {
    clearTimeout(previewTransitionTimer)
  }

  isPreviewTransitioning.value = true
  previewTransitionPhase.value = 'checking'

  previewTransitionTimer = setTimeout(() => {
    previewTransitionPhase.value = 'switching'
    previewFeature.value = feature

    previewTransitionTimer = setTimeout(() => {
      previewTransitionPhase.value = 'idle'
      isPreviewTransitioning.value = false
      previewTransitionTimer = null
    }, 450)
  }, 550)
}

const applyMaintenance = (
  maintenance: MaintenanceSettings
) => {
  systemMaintenance.value =
    maintenance.system_maintenance

  blockLogin.value =
    maintenance.block_login

  maintenanceMessage.value =
    maintenance.maintenance_message || ''

  features.value = {
    calendar: maintenance.features?.calendar ?? true,
    personal_balance_chart:
      maintenance.features?.personal_balance_chart ?? true,
    personal_category_chart:
      maintenance.features?.personal_category_chart ?? true,
    organization_balance_chart:
      maintenance.features?.organization_balance_chart ?? true,
    organization_personal_balance_chart:
      maintenance.features?.organization_personal_balance_chart ?? true,
    organization_category_chart:
      maintenance.features?.organization_category_chart ?? true,
    organization_user_balance_chart:
      maintenance.features?.organization_user_balance_chart ?? true,
    accounts:
      maintenance.features?.accounts ?? true,
    organization:
      maintenance.features?.organization ?? true,
    ai:
      maintenance.features?.ai ?? true
  }

  updatedAt.value = maintenance.updated_at
}

const showNotification = (
  type: 'success' | 'error',
  message: string
) => {
  notification.value = {
    type,
    message
  }

  if (notificationTimer) {
    clearTimeout(notificationTimer)
  }

  notificationTimer = setTimeout(() => {
    notification.value = null
  }, 3000)
}

const fetchMaintenance = async () => {
  try {
    const response =
      await $api.get<MaintenanceSettings>(
        '/admin/maintenance'
      )

    applyMaintenance(response.data)
  } catch (error) {
    console.error(
      'メンテナンス設定の取得に失敗しました:',
      error
    )

    showNotification(
      'error',
      'メンテナンス設定の取得に失敗しました'
    )
  }
}

const saveMaintenance = async (
  changes: Record<string, unknown>
) => {
  isUpdating.value = true

  try {
    const response =
      await $api.patch<{
        message: string
        maintenance: MaintenanceSettings
      }>(
        '/admin/maintenance',
        {
          maintenance: changes
        }
      )

    applyMaintenance(response.data.maintenance)

    showNotification(
      'success',
      '設定を更新しました'
    )
  } catch (error) {
    console.error(
      'メンテナンス設定の更新に失敗しました:',
      error
    )

    await fetchMaintenance()

    showNotification(
      'error',
      '設定の更新に失敗しました'
    )
  } finally {
    isUpdating.value = false
  }
}

const buildMaintenancePayload = () => {
  return {
    system_maintenance:
      systemMaintenance.value,
    block_login:
      blockLogin.value,
    maintenance_message:
      maintenanceMessage.value,
    calendar_enabled:
      features.value.calendar,
    charts_enabled: true,
    accounts_enabled:
      features.value.accounts,
    organization_enabled:
      features.value.organization,
    ai_enabled:
      features.value.ai,
    personal_balance_chart_enabled:
      features.value.personal_balance_chart,
    personal_category_chart_enabled:
      features.value.personal_category_chart,
    organization_balance_chart_enabled:
      features.value.organization_balance_chart,
    organization_personal_balance_chart_enabled:
      features.value.organization_personal_balance_chart,
    organization_category_chart_enabled:
      features.value.organization_category_chart,
    organization_user_balance_chart_enabled:
      features.value.organization_user_balance_chart
  }
}

const toggleSystemMaintenance = async () => {
  systemMaintenance.value =
    !systemMaintenance.value

  await saveMaintenance(
    buildMaintenancePayload()
  )
}

const toggleBlockLogin = async () => {
  blockLogin.value =
    !blockLogin.value

  await saveMaintenance(
    buildMaintenancePayload()
  )
}

const saveMessage = async () => {
  await saveMaintenance(
    buildMaintenancePayload()
  )
}

const toggleFeature = async (
  feature: FeatureKey
) => {
  features.value = {
    ...features.value,
    [feature]:
      !features.value[feature]
  }

  await saveMaintenance(
    buildMaintenancePayload()
  )
}

const logoutAllUsers = async () => {
  if (
    !window.confirm(
      '一般ユーザーをすべて強制ログアウトしますか？'
    )
  ) {
    return
  }

  isUpdating.value = true

  try {
    const response =
      await $api.post<{
        message: string
        count: number
      }>(
        '/admin/maintenance/logout_all'
      )

    showNotification(
      'success',
      `${response.data.count}人を強制ログアウトしました`
    )
  } catch (error) {
    console.error(
      '強制ログアウトに失敗しました:',
      error
    )

    showNotification(
      'error',
      '強制ログアウトに失敗しました'
    )
  } finally {
    isUpdating.value = false
  }
}

const connectActionCable = () => {
  if (!$cable) {
    return
  }

  maintenanceSubscription =
    $cable.subscriptions.create(
      {
        channel: 'AdminChannel'
      },
      {
        connected() {
          connectionState.value =
            'connected'
        },

        disconnected() {
          connectionState.value =
            'disconnected'
        },

        rejected() {
          connectionState.value =
            'disconnected'
        },

        received(
          data: MaintenanceUpdate
        ) {
          if (
            data?.type !==
            'maintenance_updated'
          ) {
            return
          }

          if (data.maintenance) {
            applyMaintenance(
              data.maintenance
            )

            showNotification(
              'success',
              '設定がリアルタイムで更新されました'
            )
          }
        }
      }
    )
}

onMounted(async () => {
  await fetchMaintenance()

  connectActionCable()

  previewTimer = setInterval(() => {
    previewTime.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  maintenanceSubscription?.unsubscribe?.()
  maintenanceSubscription = null

  if (previewTimer) {
    clearInterval(previewTimer)
    previewTimer = null
  }

  if (notificationTimer) {
    clearTimeout(notificationTimer)
    notificationTimer = null
  }

  if (previewTransitionTimer) {
    clearTimeout(
      previewTransitionTimer
    )

    previewTransitionTimer = null
  }
})
</script>

<style scoped>
.maintenance-page {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 8%,
      rgba(34, 211, 238, 0.11),
      transparent 24%
    ),
    radial-gradient(
      circle at 12% 88%,
      rgba(59, 130, 246, 0.07),
      transparent 22%
    ),
    linear-gradient(
      135deg,
      #020617,
      #07111f 52%,
      #020617
    );
  color: #e2e8f0;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  opacity: 0.22;
  background-image:
    linear-gradient(
      rgba(34, 211, 238, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 211, 238, 0.03) 1px,
      transparent 1px
    );
  background-size: 36px 36px;
  mask-image: linear-gradient(
    to bottom,
    black,
    transparent 90%
  );
}

.ambient-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -25%;
  height: 20%;
  z-index: -1;
  pointer-events: none;
  opacity: 0.12;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34, 211, 238, 0.08),
    transparent
  );
  filter: blur(14px);
  animation: ambient-scan 9s linear infinite;
}

.page-header,
.notification,
.maintenance-grid,
.footer-info {
  width: min(100%, 1500px);
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-eyebrow,
.panel-eyebrow {
  margin: 0;
  color: #22d3ee;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.page-header h1 {
  margin: 10px 0 0;
  color: #f8fafc;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-description {
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  border: 1px solid #1e293b;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.01),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.connection-status.connected {
  border-color: rgba(34, 211, 238, 0.35);
  color: #67e8f9;
  box-shadow:
    0 0 20px rgba(34, 211, 238, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #475569;
}

.connection-status.connected .status-dot {
  background: #22d3ee;
  box-shadow:
    0 0 8px rgba(34, 211, 238, 0.9),
    0 0 18px rgba(34, 211, 238, 0.45);
  animation: live-pulse 1.8s ease-in-out infinite;
}

.notification {
  position: relative;
  margin-bottom: 18px;
  padding: 14px 16px 14px 19px;
  display: flex;
  align-items: center;
  gap: 11px;
  box-sizing: border-box;
  border: 1px solid;
  border-radius: 11px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
}

.notification-line {
  width: 4px;
  align-self: stretch;
  border-radius: 999px;
}

.notification.success {
  border-color: rgba(34, 211, 238, 0.28);
  background: linear-gradient(
    90deg,
    rgba(8, 47, 73, 0.72),
    rgba(8, 47, 73, 0.38)
  );
  color: #a5f3fc;
}

.notification.success .notification-line {
  background: #22d3ee;
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.7);
}

.notification.error {
  border-color: rgba(248, 113, 113, 0.3);
  background: linear-gradient(
    90deg,
    rgba(69, 10, 10, 0.7),
    rgba(69, 10, 10, 0.35)
  );
  color: #fecaca;
}

.notification.error .notification-line {
  background: #f87171;
  box-shadow: 0 0 16px rgba(248, 113, 113, 0.7);
}

.maintenance-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.1fr)
    minmax(420px, 0.9fr);
  gap: 20px;
  align-items: start;
}

.control-panel,
.preview-panel {
  border: 1px solid #1e293b;
  background:
    linear-gradient(
      180deg,
      rgba(2, 6, 23, 0.88),
      rgba(2, 6, 23, 0.74)
    );
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.control-panel {
  border-radius: 18px;
}

.preview-panel {
  position: sticky;
  top: 20px;
  border-radius: 18px;
  overflow: hidden;
}

.panel-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border-bottom: 1px solid #172033;
  overflow: hidden;
}

.panel-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 211, 238, 0.5),
      transparent
    );
  transform: translateX(-100%);
  animation: header-scan 5s linear infinite;
}

.panel-header h2 {
  margin: 7px 0 0;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.panel-status,
.live-label {
  padding: 7px 10px;
  border: 1px solid #164e63;
  border-radius: 999px;
  background: rgba(8, 47, 73, 0.45);
  color: #67e8f9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.panel-status.danger {
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(69, 10, 10, 0.45);
  color: #fca5a5;
  animation: danger-glow 1.8s ease-in-out infinite;
}

.control-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-card,
.feature-panel {
  position: relative;
  border: 1px solid #172033;
  background:
    linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.74),
      rgba(15, 23, 42, 0.45)
    );
  border-radius: 13px;
  overflow: hidden;
}

.control-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.control-card:hover {
  transform: translateY(-2px);
  border-color: #29415b;
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.12),
    0 0 20px rgba(34, 211, 238, 0.025);
}

.control-card.active {
  border-color: rgba(34, 211, 238, 0.3);
  box-shadow:
    inset 0 0 24px rgba(34, 211, 238, 0.025),
    0 0 24px rgba(34, 211, 238, 0.025);
}

.control-card.system-control {
  border-color: rgba(248, 113, 113, 0.2);
  background:
    linear-gradient(
      135deg,
      rgba(69, 10, 10, 0.2),
      rgba(69, 10, 10, 0.08)
    );
}

.control-info,
.feature-main {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.control-icon,
.feature-icon,
.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #26364d;
  background: #0f172a;
  color: #67e8f9;
  font-weight: 800;
}

.control-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  font-size: 15px;
}

.control-icon.system {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.28);
}

.control-icon.warning {
  color: #fcd34d;
  border-color: rgba(252, 211, 77, 0.22);
}

.control-card h3,
.message-section h3,
.feature-section h3,
.danger-section h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 800;
}

.control-card p,
.danger-section p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.switch {
  position: relative;
  width: 50px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  border: 1px solid #334155;
  border-radius: 999px;
  background: #0f172a;
  cursor: pointer;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.switch:hover:not(:disabled) {
  transform: scale(1.03);
  border-color: #475569;
}

.switch span {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #64748b;
  transition:
    left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.switch.active {
  border-color: rgba(34, 211, 238, 0.48);
  background: rgba(8, 47, 73, 0.88);
  box-shadow:
    inset 0 0 14px rgba(34, 211, 238, 0.07),
    0 0 14px rgba(34, 211, 238, 0.05);
}

.switch.active span {
  left: 27px;
  background: #22d3ee;
  box-shadow:
    0 0 10px rgba(34, 211, 238, 0.65),
    0 0 20px rgba(34, 211, 238, 0.2);
}

.switch.small {
  width: 46px;
  height: 26px;
}

.switch.small span {
  width: 16px;
  height: 16px;
}

.switch.small.active span {
  left: 25px;
}

.switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-section,
.feature-section,
.danger-section {
  margin: 0 16px 16px;
  padding: 17px;
  border: 1px solid #172033;
  border-radius: 13px;
  background:
    linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.52),
      rgba(15, 23, 42, 0.28)
    );
}

.section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title h3 {
  margin-top: 6px;
}

.section-hint {
  color: #64748b;
  font-size: 11px;
}

.message-section textarea {
  width: 100%;
  min-height: 112px;
  padding: 12px 13px;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid #243244;
  border-radius: 10px;
  outline: none;
  background: #020617;
  color: #cbd5e1;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.message-section textarea:focus {
  border-color: rgba(34, 211, 238, 0.48);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.06),
    inset 0 0 16px rgba(34, 211, 238, 0.025);
}

.message-section textarea::placeholder {
  color: #475569;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.message-footer span {
  color: #64748b;
  font-size: 11px;
}

.save-button,
.danger-button {
  padding: 10px 15px;
  border: 0;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.save-button {
  background: #0891b2;
  color: #ecfeff;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #06b6d4;
  box-shadow: 0 8px 22px rgba(6, 182, 212, 0.16);
}

.save-button:disabled,
.danger-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.feature-panel {
  padding: 14px;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
  animation: panel-card-in 0.5s both;
  animation-delay: var(--delay);
}

.feature-panel:hover {
  transform: translateY(-2px);
  border-color: #29415b;
  box-shadow:
    0 12px 22px rgba(0, 0, 0, 0.13),
    0 0 24px rgba(34, 211, 238, 0.025);
}

.feature-panel.disabled {
  border-color: rgba(248, 113, 113, 0.24);
  background:
    linear-gradient(
      135deg,
      rgba(69, 10, 10, 0.2),
      rgba(69, 10, 10, 0.08)
    );
  animation:
    panel-card-in 0.5s both,
    maintenance-card-pulse 2.6s ease-in-out 1.1s;
}

.feature-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 9px;
  font-size: 10px;
}

.feature-icon.calendar {
  color: #67e8f9;
}

.feature-icon.personal_balance_chart,
.feature-icon.organization_balance_chart,
.feature-icon.organization_personal_balance_chart,
.feature-icon.personal_category_chart,
.feature-icon.organization_category_chart,
.feature-icon.organization_user_balance_chart {
  color: #c4b5fd;
}

.feature-icon.accounts {
  color: #6ee7b7;
}

.feature-icon.organization {
  color: #fcd34d;
}

.feature-icon.ai {
  color: #f9a8d4;
}

.feature-text {
  min-width: 0;
}

.feature-text p {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.feature-text h3 {
  overflow: hidden;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-text span {
  display: block;
  overflow: hidden;
  margin-top: 5px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-panel-status {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 11px;
  padding-top: 9px;
  border-top: 1px solid #172033;
  color: #4ade80;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
}

.feature-panel-status .feature-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow:
    0 0 7px rgba(74, 222, 128, 0.7),
    0 0 14px rgba(74, 222, 128, 0.2);
}

.feature-panel-status .feature-status-dot.maintenance {
  background: #f87171;
  box-shadow:
    0 0 7px rgba(248, 113, 113, 0.7),
    0 0 14px rgba(248, 113, 113, 0.2);
  animation: status-blink 1.6s ease-in-out infinite;
}

.feature-panel.disabled .feature-panel-status {
  color: #f87171;
}

.feature-scan {
  position: absolute;
  left: -30%;
  right: -30%;
  bottom: 0;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 211, 238, 0.4),
      transparent
    );
  opacity: 0;
  transform: translateX(-30%);
  pointer-events: none;
}

.feature-panel:hover .feature-scan {
  opacity: 1;
  animation: feature-scan 1.2s ease-out;
}

.danger-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-color: rgba(248, 113, 113, 0.2);
  background:
    linear-gradient(
      135deg,
      rgba(69, 10, 10, 0.18),
      rgba(69, 10, 10, 0.07)
    );
}

.danger-eyebrow {
  color: #f87171;
}

.danger-button {
  flex-shrink: 0;
  background: #991b1b;
  color: #fee2e2;
}

.danger-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #b91c1c;
  box-shadow: 0 10px 24px rgba(185, 28, 28, 0.18);
}

.preview-panel > .panel-header {
  background: rgba(15, 23, 42, 0.7);
}

.preview-monitor {
  margin: 18px;
  border: 1px solid #23344a;
  border-radius: 13px;
  overflow: hidden;
  background: #020617;
  box-shadow:
    inset 0 0 30px rgba(34, 211, 238, 0.025),
    0 12px 30px rgba(0, 0, 0, 0.1);
}

.monitor-header {
  height: 38px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-bottom: 1px solid #172033;
  background: #07111f;
  color: #64748b;
  font-size: 10px;
  letter-spacing: 0.12em;
}

.monitor-dots {
  display: flex;
  gap: 5px;
}

.monitor-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #334155;
}

.monitor-time {
  color: #94a3b8;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.preview-body {
  padding: 13px;
}

.preview-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 10px;
  scrollbar-width: thin;
}

.preview-tabs button {
  flex-shrink: 0;
  padding: 8px 11px;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #0f172a;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.preview-tabs button:hover:not(:disabled) {
  transform: translateY(-1px);
  color: #cbd5e1;
}

.preview-tabs button.active {
  border-color: rgba(34, 211, 238, 0.42);
  background:
    linear-gradient(
      180deg,
      rgba(8, 47, 73, 0.72),
      rgba(8, 47, 73, 0.48)
    );
  color: #67e8f9;
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.045);
}

.preview-tabs button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.preview-screen {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  border: 1px solid #182437;
  border-radius: 10px;
  background:
    linear-gradient(
      rgba(34, 211, 238, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 211, 238, 0.025) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at center,
      rgba(34, 211, 238, 0.07),
      transparent 58%
    ),
    #020617;
  background-size:
    26px 26px,
    26px 26px,
    auto,
    auto;
}

.preview-screen.is-transitioning {
  box-shadow:
    inset 0 0 50px rgba(34, 211, 238, 0.08),
    0 0 28px rgba(34, 211, 238, 0.06);
}

.preview-content {
  position: relative;
  min-height: 500px;
}

.screen-scanline {
  position: absolute;
  top: -5%;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: rgba(34, 211, 238, 0.75);
  box-shadow:
    0 0 10px rgba(34, 211, 238, 0.8),
    0 0 24px rgba(34, 211, 238, 0.35);
  opacity: 0;
  z-index: 20;
}

.preview-screen.is-transitioning .screen-scanline {
  opacity: 1;
  animation: preview-transition-scan 0.7s linear infinite;
}

.scanline,
.scanline-fast {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scanline {
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 5px,
      rgba(34, 211, 238, 0.035) 6px
    );
  opacity: 0.9;
}

.scanline-fast {
  top: -20%;
  bottom: auto;
  height: 18%;
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(34, 211, 238, 0.075),
      transparent
    );
  filter: blur(5px);
  opacity: 0.5;
  animation: preview-scan 4s linear infinite;
}

.screen-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: rgba(34, 211, 238, 0.28);
  pointer-events: none;
  z-index: 2;
}

.screen-corner.top-left {
  left: 10px;
  top: 10px;
  border-left: 1px solid;
  border-top: 1px solid;
}

.screen-corner.top-right {
  right: 10px;
  top: 10px;
  border-right: 1px solid;
  border-top: 1px solid;
}

.screen-corner.bottom-left {
  left: 10px;
  bottom: 10px;
  border-left: 1px solid;
  border-bottom: 1px solid;
}

.screen-corner.bottom-right {
  right: 10px;
  bottom: 10px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.normal-preview,
.maintenance-preview {
  position: relative;
  z-index: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px;
  box-sizing: border-box;
  text-align: center;
}

.preview-status {
  position: absolute;
  top: 17px;
  left: 17px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #4ade80;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow:
    0 0 9px rgba(74, 222, 128, 0.8),
    0 0 18px rgba(74, 222, 128, 0.25);
  animation: live-pulse 1.8s ease-in-out infinite;
}

.preview-feature-icon {
  width: 86px;
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 20px;
  background: rgba(8, 47, 73, 0.35);
  color: #67e8f9;
  font-size: 24px;
  font-weight: 900;
  box-shadow: 0 0 35px rgba(34, 211, 238, 0.08);
  animation: icon-float 4s ease-in-out infinite;
}

.preview-feature-icon.personal_balance_chart,
.preview-feature-icon.personal_category_chart,
.preview-feature-icon.organization_balance_chart,
.preview-feature-icon.organization_personal_balance_chart,
.preview-feature-icon.organization_category_chart,
.preview-feature-icon.organization_user_balance_chart {
  color: #c4b5fd;
  border-color: rgba(167, 139, 250, 0.28);
  background: rgba(76, 29, 149, 0.16);
}

.preview-feature-icon.accounts {
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.25);
  background: rgba(6, 78, 59, 0.16);
}

.preview-feature-icon.organization {
  color: #fcd34d;
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(120, 53, 15, 0.16);
}

.preview-feature-icon.ai {
  color: #f9a8d4;
  border-color: rgba(244, 114, 182, 0.25);
  background: rgba(131, 24, 67, 0.16);
}

.preview-code {
  margin: 17px 0 0;
  color: #22d3ee;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.normal-preview h3,
.maintenance-preview h3 {
  margin: 9px 0 0;
  color: #f8fafc;
  font-size: 22px;
  font-weight: 800;
}

.normal-preview > p:not(.preview-code) {
  max-width: 340px;
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.8;
}

.mock-chart {
  position: relative;
  width: min(100%, 340px);
  height: 145px;
  margin-top: 20px;
  border: 1px solid #172033;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.55);
  overflow: hidden;
  box-shadow: inset 0 0 24px rgba(34, 211, 238, 0.02);
}

.mock-chart-lines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.mock-chart-lines span {
  width: 100%;
  border-top: 1px solid rgba(71, 85, 105, 0.25);
}

.mock-chart-bars {
  position: absolute;
  inset: 20px 22px 18px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 9px;
}

.mock-chart-bars i {
  display: block;
  width: 9%;
  border-radius: 3px 3px 0 0;
  background:
    linear-gradient(
      to top,
      rgba(34, 211, 238, 0.12),
      rgba(34, 211, 238, 0.85)
    );
  transform-origin: bottom;
  animation: bar-rise 1.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.mock-chart-bars i:nth-child(1) {
  height: 28%;
  animation-delay: 0.05s;
}

.mock-chart-bars i:nth-child(2) {
  height: 52%;
  animation-delay: 0.1s;
}

.mock-chart-bars i:nth-child(3) {
  height: 40%;
  animation-delay: 0.15s;
}

.mock-chart-bars i:nth-child(4) {
  height: 70%;
  animation-delay: 0.2s;
}

.mock-chart-bars i:nth-child(5) {
  height: 58%;
  animation-delay: 0.25s;
}

.mock-chart-bars i:nth-child(6) {
  height: 82%;
  animation-delay: 0.3s;
}

.mock-chart-line {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 42%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(167, 139, 250, 0.55),
      transparent
    );
  transform: skewY(-6deg);
  opacity: 0.6;
}

.mock-calendar {
  width: min(100%, 340px);
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  padding: 12px;
  border: 1px solid #172033;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.55);
}

.mock-calendar-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 31px;
  border: 1px solid #172033;
  border-radius: 5px;
  color: #64748b;
  font-size: 9px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.mock-calendar-cell.today {
  border-color: rgba(34, 211, 238, 0.45);
  background: rgba(8, 47, 73, 0.65);
  color: #67e8f9;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.05);
}

.mock-calendar-cell.event {
  color: #cbd5e1;
  box-shadow: inset 0 -2px 0 #22d3ee;
}

.preview-data-grid {
  width: min(100%, 340px);
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-data-grid div {
  padding: 10px;
  border: 1px solid #172033;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
}

.preview-data-grid span {
  display: block;
  color: #64748b;
  font-size: 8px;
  letter-spacing: 0.1em;
}

.preview-data-grid strong {
  display: block;
  margin-top: 5px;
  color: #67e8f9;
  font-size: 11px;
}

.maintenance-preview {
  background:
    radial-gradient(
      circle at center,
      rgba(220, 38, 38, 0.075),
      transparent 55%
    );
}

.preview-warning-ring {
  width: 108px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 113, 113, 0.32);
  border-radius: 50%;
  animation: warning-ring 2.2s ease-in-out infinite;
}

.preview-warning-ring-inner {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 113, 113, 0.24);
  border-radius: 50%;
}

.preview-warning-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 113, 113, 0.5);
  border-radius: 50%;
  background: rgba(127, 29, 29, 0.28);
  color: #f87171;
  font-size: 24px;
  font-weight: 900;
  box-shadow: 0 0 20px rgba(248, 113, 113, 0.08);
}

.maintenance-preview > p:not(.preview-code) {
  max-width: 320px;
  margin: 11px 0 0;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.8;
}

.maintenance-preview > span {
  margin-top: 6px;
  color: #64748b;
  font-size: 10px;
}

.preview-maintenance-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 22px;
  padding: 8px 12px;
  border: 1px solid rgba(248, 113, 113, 0.28);
  border-radius: 999px;
  background: rgba(69, 10, 10, 0.35);
  color: #f87171;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.preview-maintenance-badge span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f87171;
  box-shadow: 0 0 9px rgba(248, 113, 113, 0.7);
  animation: status-blink 1.4s ease-in-out infinite;
}

.preview-description {
  display: flex;
  gap: 11px;
  margin: 0 18px 18px;
  padding: 13px;
  border: 1px solid #172033;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.4);
}

.preview-description-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 50%;
  color: #67e8f9;
  font-size: 11px;
  font-weight: 800;
}

.preview-description strong {
  display: block;
  color: #cbd5e1;
  font-size: 12px;
}

.preview-description p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 10px;
  line-height: 1.6;
}

.preview-summary {
  padding: 0 18px 18px;
}

.summary-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #172033;
}

.summary-title > span {
  color: #64748b;
  font-size: 10px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 11px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #94a3b8;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.summary-name:hover:not(:disabled) {
  color: #e2e8f0;
  transform: translateX(2px);
}

.summary-name:disabled {
  cursor: wait;
  opacity: 0.7;
}

.summary-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 7px;
}

.summary-icon.calendar {
  color: #67e8f9;
}

.summary-icon.personal_balance_chart,
.summary-icon.personal_category_chart,
.summary-icon.organization_balance_chart,
.summary-icon.organization_personal_balance_chart,
.summary-icon.organization_category_chart,
.summary-icon.organization_user_balance_chart {
  color: #c4b5fd;
}

.summary-icon.accounts {
  color: #6ee7b7;
}

.summary-icon.organization {
  color: #fcd34d;
}

.summary-icon.ai {
  color: #f9a8d4;
}

.summary-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4ade80;
  font-size: 10px;
  font-weight: 800;
}

.summary-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 7px rgba(74, 222, 128, 0.7);
}

.summary-status.maintenance {
  color: #f87171;
}

.summary-status.maintenance span {
  background: #f87171;
  box-shadow: 0 0 7px rgba(248, 113, 113, 0.7);
  animation: status-blink 1.6s ease-in-out infinite;
}

.footer-info {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 9px;
  letter-spacing: 0.12em;
}

.footer-info strong {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
}

.separator {
  color: #1e293b;
}

.page-enter {
  animation: page-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.panel-enter {
  animation: panel-enter 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.panel-enter-1 {
  animation-delay: 0.08s;
}

.panel-enter-2 {
  animation-delay: 0.18s;
}

.notification-enter-active,
.notification-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}

.preview-switch-enter-active,
.preview-switch-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.preview-switch-enter-from {
  opacity: 0;
  transform: scale(0.985);
  filter: blur(2px);
}

.preview-switch-leave-to {
  opacity: 0;
  transform: scale(1.015);
  filter: blur(2px);
}

.system-transition-enter-active,
.system-transition-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.system-transition-enter-from,
.system-transition-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.system-transition-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(
      circle at center,
      rgba(0, 220, 255, 0.08),
      rgba(3, 8, 15, 0.96) 65%
    );
  border: 1px solid rgba(0, 220, 255, 0.35);
  backdrop-filter: blur(4px);
}

.transition-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      rgba(0, 220, 255, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(0, 220, 255, 0.05) 1px,
      transparent 1px
    );
  background-size: 28px 28px;
  animation: grid-move 2s linear infinite;
}

.transition-scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: -10%;
  height: 2px;
  background: rgba(0, 220, 255, 0.8);
  box-shadow:
    0 0 12px rgba(0, 220, 255, 0.8),
    0 0 30px rgba(0, 220, 255, 0.4);
  animation: transition-scan-down 1.2s linear infinite;
}

.transition-content {
  position: relative;
  z-index: 2;
  width: min(360px, 80%);
  text-align: center;
  font-family: monospace;
}

.transition-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border: 1px solid rgba(0, 220, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: 0 0 20px rgba(0, 220, 255, 0.15);
  animation: transition-icon-pulse 0.8s ease-in-out infinite;
}

.transition-icon span {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 220, 255, 0.9);
  transform: rotate(-45deg);
  border-radius: 50%;
}

.transition-label {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: #00dcff;
  text-shadow:
    0 0 8px rgba(0, 220, 255, 0.7),
    0 0 20px rgba(0, 220, 255, 0.35);
  animation: transition-text-flicker 0.8s steps(2, end) infinite;
}

.transition-status {
  margin-top: 10px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: rgba(220, 245, 255, 0.55);
}

.transition-progress {
  position: relative;
  width: 100%;
  height: 2px;
  margin-top: 22px;
  overflow: hidden;
  background: rgba(0, 220, 255, 0.12);
}

.transition-progress span {
  position: absolute;
  left: -35%;
  top: 0;
  width: 35%;
  height: 100%;
  background: #00dcff;
  box-shadow: 0 0 8px rgba(0, 220, 255, 0.8);
  animation: transition-progress 0.7s ease-in-out infinite alternate;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.995);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(18px) translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}

@keyframes header-scan {
  0% {
    transform: translateX(-100%);
  }

  55%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes ambient-scan {
  0% {
    transform: translateY(-120%);
  }

  100% {
    transform: translateY(620%);
  }
}

@keyframes preview-scan {
  0% {
    transform: translateY(-140%);
  }

  100% {
    transform: translateY(760%);
  }
}

@keyframes preview-transition-scan {
  0% {
    top: -5%;
  }

  100% {
    top: 105%;
  }
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.55;
    transform: scale(0.82);
  }
}

@keyframes status-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.42;
  }
}

@keyframes danger-glow {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
  }

  50% {
    box-shadow: 0 0 18px rgba(248, 113, 113, 0.08);
  }
}

@keyframes warning-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
  }

  50% {
    transform: scale(1.035);
    opacity: 0.84;
    box-shadow: 0 0 38px rgba(248, 113, 113, 0.08);
  }
}

@keyframes panel-card-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes maintenance-card-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
  }

  50% {
    box-shadow:
      inset 0 0 20px rgba(248, 113, 113, 0.025),
      0 0 22px rgba(248, 113, 113, 0.035);
  }
}

@keyframes feature-scan {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(120%);
  }
}

@keyframes icon-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-3px) scale(1.015);
  }
}

@keyframes bar-rise {
  from {
    transform: scaleY(0);
    opacity: 0;
  }

  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes transition-scan-down {
  from {
    top: -10%;
  }

  to {
    top: 110%;
  }
}

@keyframes grid-move {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 28px 28px;
  }
}

@keyframes transition-icon-pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: rotate(45deg) scale(0.95);
  }

  50% {
    opacity: 1;
    transform: rotate(45deg) scale(1.05);
  }
}

@keyframes transition-text-flicker {
  0%,
  100% {
    opacity: 1;
  }

  45% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }

  52% {
    opacity: 0.4;
  }

  55% {
    opacity: 1;
  }
}

@keyframes transition-progress {
  from {
    left: -35%;
  }

  to {
    left: 100%;
  }
}

@media (max-width: 1100px) {
  .maintenance-page {
    padding: 24px;
  }

  .maintenance-grid {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }
}

@media (max-width: 700px) {
  .maintenance-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .page-description {
    font-size: 13px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .danger-section {
    align-items: stretch;
    flex-direction: column;
  }

  .danger-button {
    width: 100%;
  }

  .panel-header {
    padding: 17px;
  }

  .panel-header h2 {
    font-size: 18px;
  }

  .control-list,
  .message-section,
  .feature-section,
  .danger-section {
    margin-left: 10px;
    margin-right: 10px;
  }

  .preview-monitor {
    margin: 10px;
  }

  .preview-screen,
  .preview-content {
    min-height: 390px;
  }

  .normal-preview,
  .maintenance-preview {
    min-height: 390px;
    padding: 24px 18px;
  }

  .normal-preview h3,
  .maintenance-preview h3 {
    font-size: 20px;
  }

  .normal-preview > p:not(.preview-code),
  .maintenance-preview > p:not(.preview-code) {
    font-size: 11px;
  }

  .mock-chart,
  .mock-calendar {
    width: 100%;
  }

  .footer-info {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-scan,
  .connection-status.connected .status-dot,
  .panel-status.danger,
  .feature-panel,
  .feature-panel.disabled,
  .feature-panel-status .feature-status-dot.maintenance,
  .scanline-fast,
  .preview-feature-icon,
  .status-indicator,
  .preview-warning-ring,
  .preview-maintenance-badge span,
  .transition-grid,
  .transition-scanline,
  .transition-icon,
  .transition-label,
  .transition-progress span,
  .screen-scanline {
    animation: none;
  }

  .page-enter,
  .panel-enter {
    animation: none;
  }
}
</style>