<template>
  <div class="transactions-page">
    <AppNavbar />

    <div class="dashboard-grid">
      <section class="left-column">
        <div class="dashboard-card calendar-card">
          <div class="card-header">
            <div>
              <h2>マイ家計簿</h2>
              <p>自分の収入と支出をカレンダーで管理</p>
            </div>
          </div>

          <div class="calendar-wrapper">
            <TransactionCalendar
              api-base-path="/personal_transactions"
              account-api-base-path="/personal_accounts"
            />
          </div>
        </div>

        <div class="dashboard-card chat-card">
          <div class="card-header">
            <div>
              <h2>AI 家計簿アシスタント</h2>
              <p>自分の家計についてAIに相談できます</p>
            </div>

            <div class="chat-header-actions">
              <span class="bot-status">
                <span class="status-dot"></span>
                ONLINE
              </span>

              <button
                class="chat-expand-button"
                @click="openChatModal"
              >
                ⛶ 拡大
              </button>
            </div>
          </div>

          <div
            ref="chatBody"
            class="chat-body"
          >
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

            <div
              v-if="isSending"
              class="message-row bot"
            >
              <div class="message-bubble loading-bubble">
                <span class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <input
              v-model="chatInput"
              type="text"
              placeholder="自分の家計について質問してください..."
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
              <h2>個人の家計状況</h2>
              <p>自分の収支を確認できます</p>
            </div>

            <NuxtLink
              to="/personal/history"
              class="history-button"
            >
              過去データをみる
            </NuxtLink>
          </div>

          <div class="summary-panel">
            <div class="summary-section">
              <div class="summary-title">
                <span class="summary-icon personal-icon">
                  今
                </span>

                <div>
                  <h3>今月の家計</h3>
                  <span>Current Month</span>
                </div>
              </div>

              <div class="summary-main-value">
                ¥{{ formatNumber(currentMonth.balance) }}
              </div>

              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">総収入</span>

                  <span class="stat-value income">
                    +¥{{ formatNumber(currentMonth.income) }}
                  </span>
                </div>

                <div class="summary-stat">
                  <span class="stat-label">総支出</span>

                  <span class="stat-value expense">
                    -¥{{ formatNumber(currentMonth.expense) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-section">
              <div class="summary-title">
                <span class="summary-icon organization-icon">
                  年
                </span>

                <div>
                  <h3>今年の家計</h3>
                  <span>Current Year</span>
                </div>
              </div>

              <div class="summary-main-value">
                ¥{{ formatNumber(currentYear.balance) }}
              </div>

              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">総収入</span>

                  <span class="stat-value income">
                    +¥{{ formatNumber(currentYear.income) }}
                  </span>
                </div>

                <div class="summary-stat">
                  <span class="stat-label">総支出</span>

                  <span class="stat-value expense">
                    -¥{{ formatNumber(currentYear.expense) }}
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
                <h2>自分の収支推移</h2>
                <p>月ごとの収入・支出・収支</p>
              </div>
            </div>

            <OrganizationBalanceChart
              :data="monthlySummary"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>自分の支出カテゴリ</h2>
                <p>カテゴリ別の支出</p>
              </div>
            </div>

            <ExpenseCategoryChart
              :data="categoryExpense"
            />
          </div>

          <div class="dashboard-card graph-card account-card">
            <div class="card-header">
              <div>
                <h2>口座状況</h2>
                <p>登録されている口座の状況</p>
              </div>

              <button
                class="transfer-button"
                :disabled="accounts.length < 2"
                @click="openTransferModal"
              >
                ↔ 口座間で移動
              </button>
            </div>

            <AccountList
              :accounts="accounts"
              @select="openAccountModal"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- AIチャットモーダル -->
    <div
      v-if="showChatModal"
      class="chat-modal-overlay"
      @click.self="closeChatModal"
    >
      <div class="chat-modal">
        <div class="chat-modal-header">
          <div>
            <h2>AI 家計簿アシスタント</h2>
            <p>自分の家計についてAIに相談できます</p>
          </div>

          <div class="chat-modal-header-actions">
            <span class="bot-status">
              <span class="status-dot"></span>
              ONLINE
            </span>

            <button
              class="chat-modal-close"
              @click="closeChatModal"
            >
              ×
            </button>
          </div>
        </div>

        <div
          ref="chatModalBody"
          class="chat-modal-body"
        >
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

          <div
            v-if="isSending"
            class="message-row bot"
          >
            <div class="message-bubble loading-bubble">
              <span class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        </div>

        <div class="chat-modal-input-area">
          <input
            v-model="chatInput"
            type="text"
            placeholder="自分の家計について質問してください..."
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
    </div>

    <!-- 口座間移動モーダル -->
    <AccountTransferModal
      :is-open="showTransferModal"
      :accounts="accounts"
      :is-transferring="isTransferring"
      :error="transferError"
      :form="transferForm"
      @close="closeTransferModal"
      @submit="transferMoney"
    />

    <!-- 口座詳細モーダル -->
    <AccountDetailModal
      :account="selectedAccount"
      @close="closeAccountModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onMounted,
  ref
} from 'vue'

import TransactionCalendar from '~/components/TransactionCalendar.client.vue'
import ExpenseCategoryChart from '~/components/ExpenseCategoryChart.client.vue'
import OrganizationBalanceChart from '~/components/OrganizationBalanceChart.client.vue'
import AccountTransferModal from '~/components/AccountTransferModal.vue'
import type { Account } from '~/types/account'

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

interface CategoryExpense {
  category: string
  amount: number
}

interface PersonalSummary {
  current_month?: PeriodSummary
  current_year?: PeriodSummary
  monthly?: MonthlySummary[]
  category_expense?: CategoryExpense[]
}

interface SummaryResponse {
  current_month?: PeriodSummary
  current_year?: PeriodSummary
  monthly?: MonthlySummary[]
  category_expense?: CategoryExpense[]
  personal?: PersonalSummary
  organization_member?: PersonalSummary
}

interface TransferForm {
  fromAccountId: number | string
  toAccountId: number | string
  amount: number | null
}

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
}

const emptyPeriodSummary = (): PeriodSummary => ({
  income: 0,
  expense: 0,
  balance: 0
})

const currentMonth = ref<PeriodSummary>(
  emptyPeriodSummary()
)

const currentYear = ref<PeriodSummary>(
  emptyPeriodSummary()
)

const monthlySummary =
  ref<MonthlySummary[]>([])

const categoryExpense =
  ref<CategoryExpense[]>([])

const accounts =
  ref<Account[]>([])

/*
 * 選択中の口座
 */
const selectedAccount =
  ref<Account | null>(null)

/*
 * 口座詳細モーダルを開く
 */
const openAccountModal = (
  account: Account
) => {
  selectedAccount.value =
    account
}

/*
 * 口座詳細モーダルを閉じる
 */
const closeAccountModal = () => {
  selectedAccount.value =
    null
}

const chatInput =
  ref('')

const isSending =
  ref(false)

const messages =
  ref<ChatMessage[]>([
    {
      role: 'bot',
      text:
        'こんにちは！自分の家計について何でも相談してください。'
    }
  ])

const showChatModal =
  ref(false)

const chatBody =
  ref<HTMLElement | null>(null)

const chatModalBody =
  ref<HTMLElement | null>(null)

const showTransferModal =
  ref(false)

const isTransferring =
  ref(false)

const transferError =
  ref('')

const transferForm =
  ref<TransferForm>({
    fromAccountId: '',
    toAccountId: '',
    amount: null
  })

const formatNumber = (
  value:
    | number
    | string
    | null
    | undefined
) => {
  return new Intl.NumberFormat(
    'ja-JP'
  ).format(
    Number(value || 0)
  )
}

const scrollChatToBottom =
  async (
    element: HTMLElement | null
  ) => {
    await nextTick()

    if (!element) {
      return
    }

    element.scrollTop =
      element.scrollHeight
  }

const scrollAllChatsToBottom =
  async () => {
    await nextTick()

    if (chatBody.value) {
      chatBody.value.scrollTop =
        chatBody.value.scrollHeight
    }

    if (chatModalBody.value) {
      chatModalBody.value.scrollTop =
        chatModalBody.value.scrollHeight
    }
  }

const openChatModal =
  async () => {
    showChatModal.value =
      true

    await nextTick()

    await scrollChatToBottom(
      chatModalBody.value
    )
  }

const closeChatModal =
  () => {
    if (isSending.value) {
      return
    }

    showChatModal.value =
      false
  }

const fetchSummary =
  async () => {
    try {
      const response =
        await $api.get<SummaryResponse>(
          '/personal_transactions/summary'
        )

      console.log(response.data)

      const data =
        response.data?.personal ||
        response.data?.organization_member ||
        response.data

      if (!data) {
        currentMonth.value =
          emptyPeriodSummary()

        currentYear.value =
          emptyPeriodSummary()

        monthlySummary.value =
          []

        categoryExpense.value =
          []

        return
      }

      currentMonth.value =
        data.current_month ||
        emptyPeriodSummary()

      currentYear.value =
        data.current_year ||
        emptyPeriodSummary()

      monthlySummary.value =
        data.monthly || []

      categoryExpense.value =
        data.category_expense || []
    } catch (error) {
      console.error(
        '個人家計データの取得に失敗しました:',
        error
      )

      currentMonth.value =
        emptyPeriodSummary()

      currentYear.value =
        emptyPeriodSummary()

      monthlySummary.value =
        []

      categoryExpense.value =
        []
    }
  }

const fetchAccounts =
  async () => {
    try {
      const response =
        await $api.get<Account[]>(
          '/personal_accounts'
        )

      accounts.value =
        response.data || []
    } catch (error) {
      console.error(
        '個人口座データの取得に失敗しました:',
        error
      )

      accounts.value =
        []
    }
  }

const openTransferModal =
  () => {
    transferError.value =
      ''

    transferForm.value = {
      fromAccountId: '',
      toAccountId: '',
      amount: null
    }

    showTransferModal.value =
      true
  }

const closeTransferModal =
  () => {
    if (isTransferring.value) {
      return
    }

    showTransferModal.value =
      false

    transferError.value =
      ''
  }

const transferMoney =
  async () => {
    transferError.value =
      ''

    const fromAccountId =
      Number(
        transferForm.value
          .fromAccountId
      )

    const toAccountId =
      Number(
        transferForm.value
          .toAccountId
      )

    const amount =
      Number(
        transferForm.value.amount
      )

    if (
      !fromAccountId ||
      !toAccountId
    ) {
      transferError.value =
        '移動元と移動先の口座を選択してください'

      return
    }

    if (
      fromAccountId ===
      toAccountId
    ) {
      transferError.value =
        '同じ口座には移動できません'

      return
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      transferError.value =
        '1円以上の金額を入力してください'

      return
    }

    const fromAccount =
      accounts.value.find(
        account =>
          account.id ===
          fromAccountId
      )

    if (!fromAccount) {
      transferError.value =
        '移動元の口座が見つかりません'

      return
    }

    if (
      Number(
        fromAccount.balance
      ) < amount
    ) {
      transferError.value =
        '移動元の口座残高が不足しています'

      return
    }

    isTransferring.value =
      true

    try {
      await $api.post(
        '/personal_accounts/transfer',
        {
          from_account_id:
            fromAccountId,

          to_account_id:
            toAccountId,

          amount
        }
      )

      await fetchAccounts()

      closeTransferModal()

      alert(
        '口座間の資金移動が完了しました'
      )
    } catch (error: any) {
      console.error(
        '口座間の資金移動に失敗しました:',
        error
      )

      transferError.value =
        error?.response?.data?.error ||
        '資金移動に失敗しました'
    } finally {
      isTransferring.value =
        false
    }
  }

const sendMessage =
  async () => {
    const message =
      chatInput.value.trim()

    if (
      !message ||
      isSending.value
    ) {
      return
    }

    messages.value.push({
      role: 'user',
      text: message
    })

    chatInput.value =
      ''

    await scrollAllChatsToBottom()

    isSending.value =
      true

    try {
      const response =
        await $api.post(
          '/personal_chat',
          {
            message
          }
        )

      messages.value.push({
        role: 'bot',
        text:
          response.data?.reply ||
          '回答を取得できませんでした。'
      })

      await scrollAllChatsToBottom()
    } catch (error) {
      console.error(
        'BOTエラー:',
        error
      )

      messages.value.push({
        role: 'bot',
        text:
          'エラーが発生しました。'
      })

      await scrollAllChatsToBottom()
    } finally {
      isSending.value =
        false
    }
  }

onMounted(
  async () => {
    await Promise.all([
      fetchSummary(),
      fetchAccounts()
    ])

    await scrollAllChatsToBottom()
  }
)
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
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(420px, 1fr);
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
  box-shadow:
    0 6px 24px
    rgba(
      20,
      30,
      55,
      0.05
    );
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

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.chat-expand-button {
  flex-shrink: 0;
  padding: 5px 9px;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.chat-expand-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #111827;
  transform: translateY(-1px);
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
  scroll-behavior: smooth;
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

.loading-bubble {
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.loading-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9aa3b1;
  animation:
    chat-loading
    1.2s
    infinite
    ease-in-out;
}

.loading-dots
span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots
span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes chat-loading {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 11px 14px 14px;
  border-top: 1px solid #edf0f5;
}

.chat-input-area input,
.chat-modal-input-area input {
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

.chat-input-area input:focus,
.chat-modal-input-area input:focus {
  border-color: #aeb8c8;
  background: #fff;
}

.chat-input-area input::placeholder,
.chat-modal-input-area input::placeholder {
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
  grid-template-columns:
    minmax(0, 1fr)
    1px
    minmax(0, 1fr);
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

.account-card {
  min-height: 270px;
}

.transfer-button {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #e2e6ed;
  border-radius: 9px;
  background: #fff;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.transfer-button:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #111827;
  transform: translateY(-1px);
}

.transfer-button:disabled {
  background: #f1f3f6;
  color: #a0a8b5;
  cursor: not-allowed;
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

.chat-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(
    15,
    23,
    42,
    0.48
  );
  backdrop-filter: blur(2px);
}

.chat-modal {
  width: min(100%, 900px);
  height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  box-shadow:
    0 28px 90px
    rgba(
      15,
      23,
      42,
      0.2
    );
  overflow: hidden;
}

.chat-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #edf0f5;
}

.chat-modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 19px;
  font-weight: 700;
}

.chat-modal-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.chat-modal-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-modal-close {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.chat-modal-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.chat-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px;
  scrollbar-width: thin;
  scroll-behavior: smooth;
}

.chat-modal-body::-webkit-scrollbar {
  width: 6px;
}

.chat-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-modal-body::-webkit-scrollbar-thumb {
  background: #d6dce5;
  border-radius: 999px;
}

.chat-modal-body .message-bubble {
  max-width: 72%;
  padding: 11px 14px;
  font-size: 13px;
  line-height: 1.7;
}

.chat-modal-input-area {
  display: flex;
  gap: 10px;
  padding: 14px 18px 18px;
  border-top: 1px solid #edf0f5;
}

.chat-modal-input-area .send-button {
  height: 42px;
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

  .chat-header-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .chat-input-area {
    padding: 10px 11px 12px;
  }

  .send-button {
    padding: 0 14px;
  }

  .transfer-button {
    width: 100%;
  }

  .card-header:has(.transfer-button) {
    flex-direction: column;
  }

  .chat-modal-overlay {
    padding: 10px;
  }

  .chat-modal {
    width: 100%;
    height: calc(100vh - 20px);
    border-radius: 16px;
  }

  .chat-modal-header {
    padding: 16px;
  }

  .chat-modal-body {
    padding: 16px;
  }

  .chat-modal-body .message-bubble {
    max-width: 88%;
  }

  .chat-modal-input-area {
    padding: 10px 11px 12px;
  }
}
</style>