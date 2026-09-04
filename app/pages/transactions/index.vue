<template>
  <div class="transactions-page">
    <AppNavbar />

    <div class="dashboard-grid">
      <section class="left-column">
        <div class="dashboard-card calendar-card">
          <div class="card-header">
            <div>
              <h2>家計簿カレンダー</h2>
              <p>組織の収入と支出をカレンダーで管理</p>
            </div>
          </div>

          <div class="calendar-wrapper">
            <TransactionCalendar scope="organization" />
          </div>
        </div>

        <div class="dashboard-card chat-card">
          <div class="card-header">
            <div>
              <h2>AI 家計簿アシスタント</h2>
              <p>家計についてAIに相談できます</p>
            </div>

            <span class="bot-status">
              <span class="status-dot"></span>
              ONLINE
            </span>
          </div>

          <div class="chat-body">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message-row"
              :class="message.role"
            >
              <div class="message-bubble">
                {{ message.text }}
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <input
              v-model="chatInput"
              type="text"
              placeholder="家計について質問してください..."
              @keyup.enter="sendMessage"
            />

            <button
              class="send-button"
              :disabled="isSending || !chatInput.trim()"
              @click="sendMessage"
            >
              {{ isSending ? '送信中...' : '送信' }}
            </button>
          </div>
        </div>
      </section>

      <section class="right-column">
        <div class="dashboard-card income-summary-card">
          <div class="card-header">
            <div>
              <h2>家計状況</h2>
              <p>これまでの総合計を確認できます</p>
            </div>

            <NuxtLink
              to="/transactions/history"
              class="history-button"
            >
              過去データをみる
            </NuxtLink>
          </div>

          <div class="summary-panel">
            <div class="summary-section">
              <div class="summary-title">
                <span class="summary-icon organization-icon">
                  組
                </span>

                <div>
                  <h3>組織全体</h3>
                  <span>Organization Total</span>
                </div>
              </div>

              <div class="summary-main-value">
                ¥{{ formatNumber(organization.total.balance) }}
              </div>

              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">総収入</span>
                  <span class="stat-value income">
                    +¥{{ formatNumber(organization.total.income) }}
                  </span>
                </div>

                <div class="summary-stat">
                  <span class="stat-label">総支出</span>
                  <span class="stat-value expense">
                    -¥{{ formatNumber(organization.total.expense) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-section">
              <div class="summary-title">
                <span class="summary-icon personal-icon">
                  自
                </span>

                <div>
                  <h3>自分</h3>
                  <span>Member Total</span>
                </div>
              </div>

              <div class="summary-main-value">
                ¥{{ formatNumber(organizationMember.total.balance) }}
              </div>

              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">総収入</span>
                  <span class="stat-value income">
                    +¥{{ formatNumber(organizationMember.total.income) }}
                  </span>
                </div>

                <div class="summary-stat">
                  <span class="stat-label">総支出</span>
                  <span class="stat-value expense">
                    -¥{{ formatNumber(organizationMember.total.expense) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-scroll">
          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>組織の収支推移</h2>
                <p>月ごとの組織全体の収入・支出・収支</p>
              </div>
            </div>

            <OrganizationBalanceChart
              :data="organization.monthly"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>自分の収支推移</h2>
                <p>組織家計簿における自分の収入・支出</p>
              </div>
            </div>

            <div class="graph-placeholder">
              <div class="placeholder-icon">
                📊
              </div>

              <h3>自分の収支グラフ</h3>

              <p>
                組織内で自分が登録した
                収入・支出を表示します
              </p>
            </div>
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>支出カテゴリ</h2>
                <p>組織のカテゴリ別支出</p>
              </div>
            </div>

            <ExpenseCategoryChart
              :data="organization.category_expense"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>ユーザごとの収支推移</h2>
                <p>組織家計簿におけるユーザごとの収入・支出</p>
              </div>
            </div>

            <UserBalanceChart
              :users="users"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>口座状況</h2>
                <p>登録されている口座の状況</p>
              </div>
            </div>

            <div class="graph-placeholder">
              <div class="placeholder-icon">
                💰
              </div>

              <h3>口座残高グラフ</h3>

              <p>
                登録されている口座の
                残高推移を表示します
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import TransactionCalendar from '~/components/TransactionCalendar.client.vue'
import ExpenseCategoryChart from '~/components/ExpenseCategoryChart.client.vue'
import OrganizationBalanceChart from '~/components/OrganizationBalanceChart.client.vue'
import UserBalanceChart from '~/components/UserBalanceChart.client.vue'

const { $api } = useNuxtApp()

interface PeriodSummary {
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

interface DailySummary {
  date: string
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

interface CategoryExpense {
  category: string
  amount: number
}

interface SummarySection {
  total: PeriodSummary
  current_month: PeriodSummary
  current_year: PeriodSummary
  monthly: MonthlySummary[]
  category_expense: CategoryExpense[]
}

interface SummaryResponse {
  organization: SummarySection
  organization_member: SummarySection
  personal: SummarySection
  users: UserSummary[]
}

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
}

const organization = ref<SummarySection>({
  total: {
    income: 0,
    expense: 0,
    balance: 0
  },

  current_month: {
    income: 0,
    expense: 0,
    balance: 0
  },

  current_year: {
    income: 0,
    expense: 0,
    balance: 0
  },

  monthly: [],
  category_expense: []
})

const organizationMember = ref<SummarySection>({
  total: {
    income: 0,
    expense: 0,
    balance: 0
  },

  current_month: {
    income: 0,
    expense: 0,
    balance: 0
  },

  current_year: {
    income: 0,
    expense: 0,
    balance: 0
  },

  monthly: [],
  category_expense: []
})

const users = ref<UserSummary[]>([])

const chatInput = ref('')
const isSending = ref(false)

const messages = ref<ChatMessage[]>([
  {
    role: 'bot',
    text: 'こんにちは！組織の家計について何でも相談してください。'
  }
])

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(
    value || 0
  )
}

const fetchSummary = async () => {
  try {
    const response = await $api.get(
      '/transactions/summary',
      {
        params: {
          year: new Date().getFullYear()
        }
      }
    )

    const data =
      response.data as unknown as SummaryResponse

    organization.value = data.organization

    organizationMember.value =
      data.organization_member

    users.value = data.users || []

    console.log('summary:', data)
  } catch (error) {
    console.error(
      '組織家計データの取得に失敗しました:',
      error
    )
  }
}

const sendMessage = async () => {
  const message = chatInput.value.trim()

  if (!message || isSending.value) {
    return
  }

  messages.value.push({
    role: 'user',
    text: message
  })

  chatInput.value = ''
  isSending.value = true

  try {
    const response = await $api.post('/chat', {
      message
    })

    messages.value.push({
      role: 'bot',
      text: response.data.reply
    })
  } catch (error) {
    console.error('BOTエラー:', error)

    messages.value.push({
      role: 'bot',
      text: 'エラーが発生しました。'
    })
  } finally {
    isSending.value = false
  }
}

onMounted(async () => {
  await fetchSummary()
})
</script>

<style scoped>
.transactions-page {
  width: 100%;
  min-height: calc(100vh - 48px);
  padding: 20px;
  box-sizing: border-box;
  background: #f5f7fb;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(420px, 1fr);
  gap: 16px;
  height: calc(100vh - 94px);
  min-height: 0;
}

.left-column {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.left-column::-webkit-scrollbar {
  display: none;
}

.dashboard-card {
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 17px 19px 13px;
}

.card-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-header p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 12px;
  line-height: 1.5;
}

.calendar-card {
  flex: 0 0 auto;
  min-height: 720px;
  display: flex;
  flex-direction: column;
}

.calendar-wrapper {
  flex: 1;
  min-height: 0;
  padding: 0 14px 14px;
  overflow: hidden;
}

.chat-card {
  flex: 0 0 350px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.bot-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.chat-body {
  flex: 1;
  min-height: 0;
  padding: 0 17px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
}

.chat-body::-webkit-scrollbar {
  width: 4px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #d6dce5;
  border-radius: 999px;
}

.message-row {
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 9px 12px;
  border-radius: 13px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-row.bot .message-bubble {
  background: #f2f4f8;
  color: #374151;
  border-bottom-left-radius: 5px;
}

.message-row.user .message-bubble {
  background: #111827;
  color: #fff;
  border-bottom-right-radius: 5px;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 11px 14px 14px;
  border-top: 1px solid #edf0f5;
}

.chat-input-area input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #dfe4ec;
  border-radius: 11px;
  outline: none;
  background: #fafbfc;
  color: #1f2937;
  font-size: 12px;
  transition: 0.2s ease;
  box-sizing: border-box;
}

.chat-input-area input:focus {
  border-color: #aeb8c8;
  background: #fff;
}

.chat-input-area input::placeholder {
  color: #a0a8b5;
}

.send-button {
  flex-shrink: 0;
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 11px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.send-button:disabled {
  background: #d7dce4;
  cursor: not-allowed;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  height: calc(100vh - 94px);
}

.income-summary-card {
  flex: 0 0 auto;
}

.summary-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
  padding: 2px 19px 19px;
}

.summary-section {
  min-width: 0;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.summary-title h3 {
  margin: 0;
  color: #293241;
  font-size: 13px;
  font-weight: 700;
}

.summary-title span:not(.summary-icon) {
  display: block;
  margin-top: 1px;
  color: #9aa3b1;
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
}

.organization-icon {
  background: #f1f5f9;
  color: #475569;
}

.personal-icon {
  background: #f8fafc;
  color: #64748b;
}

.summary-main-value {
  margin-top: 14px;
  color: #111827;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 13px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border-radius: 10px;
  background: #f8fafc;
}

.stat-label {
  color: #9aa3b1;
  font-size: 10px;
}

.stat-value {
  font-size: 12px;
  font-weight: 700;
}

.stat-value.income {
  color: #15803d;
}

.stat-value.expense {
  color: #dc2626;
}

.summary-divider {
  width: 1px;
  background: #edf0f5;
}

.analytics-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 5px;
  scrollbar-width: thin;
}

.analytics-scroll::-webkit-scrollbar {
  width: 6px;
}

.analytics-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.analytics-scroll::-webkit-scrollbar-thumb {
  background: #d6dce5;
  border-radius: 999px;
}

.analytics-scroll::-webkit-scrollbar-thumb:hover {
  background: #b8c0cd;
}

.graph-card {
  flex: 0 0 auto;
  min-height: 270px;
}

.graph-placeholder {
  min-height: 195px;
  margin: 0 17px 17px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dce2eb;
  border-radius: 15px;
  background: #fafbfc;
  text-align: center;
}

.placeholder-icon {
  font-size: 31px;
  margin-bottom: 8px;
}

.graph-placeholder h3 {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
}

.graph-placeholder p {
  max-width: 250px;
  margin: 7px 0 0;
  color: #9aa3b1;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-column {
    overflow-y: visible;
    padding-right: 0;
  }

  .calendar-card {
    min-height: 650px;
  }

  .chat-card {
    flex: 0 0 350px;
    min-height: 350px;
  }

  .right-column {
    height: auto;
  }

  .analytics-scroll {
    overflow-y: visible;
    padding-right: 0;
  }
}

@media (max-width: 700px) {
  .transactions-page {
    padding: 10px;
  }

  .dashboard-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: auto;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: visible;
    padding-right: 0;
  }

  .calendar-card {
    min-height: 620px;
  }

  .chat-card {
    flex: 0 0 350px;
    min-height: 350px;
  }

  .right-column {
    height: auto;
  }

  .analytics-scroll {
    overflow-y: visible;
    padding-right: 0;
  }

  .summary-panel {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .summary-divider {
    width: 100%;
    height: 1px;
  }

  .summary-main-value {
    font-size: 23px;
  }

  .summary-stats {
    grid-template-columns: 1fr 1fr;
  }

  .card-header {
    padding: 15px 16px 12px;
  }

  .chat-input-area {
    padding: 10px 11px 12px;
  }

  .send-button {
    padding: 0 14px;
  }
}
.history-button {
  flex-shrink: 0;
  padding: 7px 12px;
  border: 1px solid #e2e6ed;
  border-radius: 9px;
  background: #fff;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: 0.2s ease;
}

.history-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #111827;
  transform: translateY(-1px);
}
</style>
