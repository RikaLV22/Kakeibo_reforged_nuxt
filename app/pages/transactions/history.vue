<template>
  <div class="history-page">
    <AppNavbar />

    <div class="history-container">
      <div class="page-header">
        <div>
          <NuxtLink
            to="/transactions"
            class="back-link"
          >
            ← 組織家計簿に戻る
          </NuxtLink>

          <h1>過去データ分析</h1>

          <p>
            過去の年度を選択して家計の推移を確認できます
          </p>
        </div>

        <div class="year-select">
          <span class="year-label">
            対象年度
          </span>

          <select v-model.number="selectedYear">
            <option
              v-for="year in availableYears"
              :key="year"
              :value="year"
            >
              {{ year }}年
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="loading-spinner"></div>

        <p>
          {{ selectedYear }}年のデータを読み込んでいます...
        </p>
      </div>

      <template v-else>
        <div
          v-if="hasHistoryData"
          class="history-content"
        >
          <!-- サマリー -->
          <section class="summary-grid">
            <div class="summary-card">
              <span class="summary-label">
                組織総収入
              </span>

              <strong class="summary-value income">
                +¥{{ formatNumber(organization.total.income) }}
              </strong>

              <span class="summary-sub">
                {{ selectedYear }}年
              </span>
            </div>

            <div class="summary-card">
              <span class="summary-label">
                組織総支出
              </span>

              <strong class="summary-value expense">
                -¥{{ formatNumber(organization.total.expense) }}
              </strong>

              <span class="summary-sub">
                {{ selectedYear }}年
              </span>
            </div>

            <div class="summary-card">
              <span class="summary-label">
                組織収支
              </span>

              <strong
                class="summary-value"
                :class="{
                  positive: organization.total.balance >= 0,
                  negative: organization.total.balance < 0
                }"
              >
                ¥{{ formatNumber(organization.total.balance) }}
              </strong>

              <span class="summary-sub">
                {{ selectedYear }}年
              </span>
            </div>

            <div class="summary-card">
              <span class="summary-label">
                自分の収支
              </span>

              <strong
                class="summary-value"
                :class="{
                  positive:
                    organizationMember.total.balance >= 0,
                  negative:
                    organizationMember.total.balance < 0
                }"
              >
                ¥{{
                  formatNumber(
                    organizationMember.total.balance
                  )
                }}
              </strong>

              <span class="summary-sub">
                {{ selectedYear }}年
              </span>
            </div>
          </section>

          <!-- 月別収支 -->
          <section class="dashboard-card large-card">
            <div class="card-header">
              <div>
                <h2>月別収支</h2>

                <p>
                  {{ selectedYear }}年の月ごとの収入・支出・収支
                </p>
              </div>
            </div>

            <OrganizationBalanceChart
              :data="organization.monthly"
            />
          </section>

          <!-- ユーザごとの収支 -->
          <section class="dashboard-card large-card">
            <div class="card-header">
              <div>
                <h2>ユーザごとの収支</h2>

                <p>
                  {{ selectedYear }}年におけるユーザーごとの収支
                </p>
              </div>
            </div>

            <UserHistoryChart
              :users="users"
            />
          </section>

          <!-- 支出カテゴリ / 月別支出 -->
          <div class="two-column">
            <section class="dashboard-card">
              <div class="card-header">
                <div>
                  <h2>支出カテゴリ</h2>

                  <p>
                    {{ selectedYear }}年のカテゴリ別支出
                  </p>
                </div>
              </div>

              <ExpenseCategoryChart
                :data="organization.category_expense"
              />
            </section>

            <section class="dashboard-card">
              <div class="card-header">
                <div>
                  <h2>月別支出</h2>

                  <p>
                    {{ selectedYear }}年の月別支出
                  </p>
                </div>
              </div>

              <div class="expense-list">
                <div
                  v-for="month in organization.monthly"
                  :key="month.month"
                  class="expense-row"
                >
                  <span class="expense-month">
                    {{ month.month }}月
                  </span>

                  <div class="expense-bar-wrap">
                    <div
                      class="expense-bar"
                      :style="{
                        width: `${monthlyExpensePercentage(month.expense)}%`
                      }"
                    ></div>
                  </div>

                  <span class="expense-value">
                    ¥{{ formatNumber(month.expense) }}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <!-- 取引一覧 -->
          <section class="dashboard-card large-card">
            <div class="card-header">
              <div>
                <h2>取引一覧</h2>

                <p>
                  {{ selectedYear }}年{{ selectedMonth }}月の取引
                </p>
              </div>

              <div class="transaction-controls">
                <select v-model.number="selectedMonth">
                  <option
                    v-for="month in 12"
                    :key="month"
                    :value="month"
                  >
                    {{ month }}月
                  </option>
                </select>

                <span class="transaction-count">
                  {{ monthlyTransactions.length }}件
                </span>
              </div>
            </div>

            <div
              v-if="monthlyTransactions.length > 0"
              class="transaction-table-wrap"
            >
              <table class="transaction-table">
                <colgroup>
                  <col class="col-date" />
                  <col class="col-user" />
                  <col class="col-type" />
                  <col class="col-category" />
                  <col class="col-amount" />
                  <col class="col-payment" />
                </colgroup>

                <thead>
                  <tr>
                    <th>日付</th>
                    <th>ユーザー</th>
                    <th>種別</th>
                    <th>カテゴリ</th>
                    <th>金額</th>
                    <th>支払方法</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="transaction in monthlyTransactions"
                    :key="transaction.id"
                    class="transaction-row"
                    @click="openTransactionModal(transaction)"
                  >
                    <td>
                      {{ formatDate(transaction.date) }}
                    </td>

                    <td>
                      {{ transaction.user_name }}
                    </td>

                    <td>
                      <span
                        class="type-badge"
                        :class="transaction.transaction_type"
                      >
                        {{
                          transaction.transaction_type === 'income'
                            ? '収入'
                            : '支出'
                        }}
                      </span>
                    </td>

                    <td>
                      {{ transaction.category }}
                    </td>

                    <td
                      class="amount-cell"
                      :class="transaction.transaction_type"
                    >
                      {{
                        transaction.transaction_type === 'income'
                          ? '+'
                          : '-'
                      }}¥{{ formatNumber(transaction.amount) }}
                    </td>

                    <td>
                      {{ transaction.payment_method || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <div class="empty-icon">
                📋
              </div>

              <p>
                {{ selectedYear }}年{{ selectedMonth }}月の取引データはありません
              </p>
            </div>
          </section>
        </div>

        <div
          v-else
          class="empty-history"
        >
          <div class="empty-history-icon">
            📊
          </div>

          <h2>
            {{ selectedYear }}年の統計データはありません
          </h2>

          <p>
            この年度には登録された家計データがありません。
          </p>
        </div>
      </template>
    </div>

    <!-- 取引詳細モーダル -->
    <Teleport to="body">
      <div
        v-if="selectedTransaction"
        class="modal-overlay"
        @click.self="closeTransactionModal"
      >
        <div class="transaction-modal">
          <div class="modal-header">
            <div>
              <h2>取引詳細</h2>

              <p>
                登録されている取引の詳細情報
              </p>
            </div>

            <button
              type="button"
              class="modal-close"
              aria-label="閉じる"
              @click="closeTransactionModal"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">
                日付
              </span>

              <span class="detail-value">
                {{ formatDate(selectedTransaction.date) }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                ユーザー
              </span>

              <span class="detail-value">
                {{ selectedTransaction.user_name }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                種別
              </span>

              <span class="detail-value">
                <span
                  class="type-badge"
                  :class="selectedTransaction.transaction_type"
                >
                  {{
                    selectedTransaction.transaction_type === 'income'
                      ? '収入'
                      : '支出'
                  }}
                </span>
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                カテゴリ
              </span>

              <span class="detail-value">
                {{ selectedTransaction.category }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                金額
              </span>

              <span
                class="detail-value detail-amount"
                :class="selectedTransaction.transaction_type"
              >
                {{
                  selectedTransaction.transaction_type === 'income'
                    ? '+'
                    : '-'
                }}¥{{
                  formatNumber(
                    selectedTransaction.amount
                  )
                }}
              </span>
            </div>

            <div class="detail-row">
                <span class="detail-label">
                    口座名
                </span>

                <span class="detail-value">
                    {{ selectedTransaction.account_name || '-' }}
                </span>
                </div>

                <div class="detail-row">
                <span class="detail-label">
                    口座番号
                </span>

                <span class="detail-value">
                    {{ selectedTransaction.account_number || '-' }}
                </span>
                </div>

            <div
              v-if="selectedTransaction.card_number"
              class="detail-row"
            >
              <span class="detail-label">
                カード番号
              </span>

              <span class="detail-value">
                {{ selectedTransaction.card_number }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="modal-button"
              @click="closeTransactionModal"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

import OrganizationBalanceChart from '~/components/OrganizationBalanceChart.client.vue'
import ExpenseCategoryChart from '~/components/ExpenseCategoryChart.client.vue'
import UserHistoryChart from '~/components/UserHistoryChart.client.vue'

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

interface SummarySection {
  total: PeriodSummary
  monthly: MonthlySummary[]
  category_expense: CategoryExpense[]
}

interface UserMonthlySummary {
  user_id: number
  user_name: string
  monthly: MonthlySummary[]
}

interface Transaction {
  id: number
  user_name: string
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  payment_method?: string | null
  card_number?: string | null
  account_id?: number | null
  account_name?: string | null
  account_number?: string | null
}

interface HistoryResponse {
  year: number
  organization: SummarySection
  organization_member: SummarySection
  personal: SummarySection
  users: UserMonthlySummary[]
  transactions: Transaction[]
}

const currentYear = new Date().getFullYear()

const selectedYear = ref(currentYear)

const selectedMonth = ref(
  new Date().getMonth() + 1
)

const isLoading = ref(false)

const selectedTransaction =
  ref<Transaction | null>(null)

const organization = ref<SummarySection>({
  total: {
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

  monthly: [],

  category_expense: []
})

const users = ref<UserMonthlySummary[]>([])

const transactions = ref<Transaction[]>([])

const availableYears = computed(() => {
  const years: number[] = []

  for (
    let year = currentYear;
    year >= currentYear - 10;
    year--
  ) {
    years.push(year)
  }

  return years
})

const hasHistoryData = computed(() => {
  return (
    transactions.value.length > 0 ||
    organization.value.total.income > 0 ||
    organization.value.total.expense > 0
  )
})

const monthlyTransactions = computed(() => {
  return transactions.value.filter(
    transaction => {
      const date = new Date(
        `${transaction.date}T00:00:00`
      )

      return (
        date.getMonth() + 1 ===
        selectedMonth.value
      )
    }
  )
})

const formatNumber = (value: number) => {
  return new Intl.NumberFormat(
    'ja-JP'
  ).format(value || 0)
}

const formatDate = (date: string) => {
  const value = new Date(
    `${date}T00:00:00`
  )

  return `${value.getFullYear()}/${String(
    value.getMonth() + 1
  ).padStart(2, '0')}/${String(
    value.getDate()
  ).padStart(2, '0')}`
}

const monthlyExpensePercentage = (
  expense: number
) => {
  const maxExpense = Math.max(
    ...organization.value.monthly.map(
      item => Number(item.expense)
    ),
    1
  )

  return Math.round(
    (Number(expense) / maxExpense) * 100
  )
}

const openTransactionModal = (
  transaction: Transaction
) => {
  selectedTransaction.value =
    transaction
}

const closeTransactionModal = () => {
  selectedTransaction.value = null
}

const fetchHistory = async () => {
  isLoading.value = true

  try {
    const response = await $api.get(
      '/transactions/history_summary',
      {
        params: {
          year: selectedYear.value
        }
      }
    )

    const data =
      response.data as unknown as HistoryResponse

    organization.value =
      data.organization

    organizationMember.value =
      data.organization_member

    users.value =
      data.users || []

    transactions.value =
      data.transactions || []
  } catch (error) {
    console.error(
      '過去データの取得に失敗しました:',
      error
    )

    organization.value = {
      total: {
        income: 0,
        expense: 0,
        balance: 0
      },

      monthly: [],

      category_expense: []
    }

    organizationMember.value = {
      total: {
        income: 0,
        expense: 0,
        balance: 0
      },

      monthly: [],

      category_expense: []
    }

    users.value = []

    transactions.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchHistory()
})

watch(
  selectedYear,
  async () => {
    selectedMonth.value = 1

    closeTransactionModal()

    await fetchHistory()
  }
)
</script>

<style scoped>
html,
body {
  overflow-x: hidden;
  overflow-y: auto;
}

.history-page {
  min-height: 100vh;
  overflow: visible;
}

.history-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: #111827;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-header p {
  margin: 6px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.year-select {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border-radius: 12px;
  background: #eef1f5;
}

.year-label {
  padding-left: 8px;
  color: #8a94a6;
  font-size: 10px;
  font-weight: 700;
}

.year-select select {
  min-width: 105px;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(
    4,
    minmax(0, 1fr)
  );
  gap: 14px;
  margin-bottom: 16px;
}

.summary-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 6px 24px rgba(
      20,
      30,
      55,
      0.05
    );
}

.summary-label {
  display: block;
  color: #8a94a6;
  font-size: 11px;
  font-weight: 600;
}

.summary-value {
  display: block;
  margin-top: 10px;
  color: #111827;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.summary-value.income,
.summary-value.positive {
  color: #15803d;
}

.summary-value.expense,
.summary-value.negative {
  color: #dc2626;
}

.summary-sub {
  display: block;
  margin-top: 5px;
  color: #b0b7c3;
  font-size: 10px;
}

.dashboard-card {
  margin-bottom: 16px;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 6px 24px rgba(
      20,
      30,
      55,
      0.05
    );
  overflow: hidden;
}

.large-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 19px 13px;
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

.two-column {
  display: grid;
  grid-template-columns: repeat(
    2,
    minmax(0, 1fr)
  );
  gap: 24px;
  align-items: stretch;
  margin-bottom: 24px;
}

.two-column .dashboard-card {
  height: 100%;
  box-sizing: border-box;
  margin-bottom: 0;
}

.user-chart {
  width: 100%;
}

.expense-list {
  padding: 0 19px 19px;
}

.expense-row {
  display: grid;
  grid-template-columns:
    40px
    minmax(0, 1fr)
    95px;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.expense-row:last-child {
  margin-bottom: 0;
}

.expense-month {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.expense-bar-wrap {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef2f6;
}

.expense-bar {
  height: 100%;
  border-radius: 999px;
  background: #ef4444;
  transition: width 0.3s ease;
}

.expense-value {
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  text-align: right;
}

.transaction-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transaction-controls select {
  min-width: 85px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.transaction-controls select:focus {
  border-color: #94a3b8;
}

.transaction-count {
  flex-shrink: 0;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

/* 取引一覧 */
.transaction-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.transaction-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.transaction-table th,
.transaction-table td {
  box-sizing: border-box;
  text-align: left;
}

.transaction-table th {
  padding: 11px 17px;
  border-bottom: 1px solid #edf0f5;
  background: #fafbfc;
  color: #8a94a6;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-table td {
  padding: 12px 17px;
  border-bottom: 1px solid #f1f3f6;
  color: #475569;
  font-size: 11px;
  white-space: nowrap;
  vertical-align: middle;
}

.transaction-table tbody tr:last-child td {
  border-bottom: none;
}

.transaction-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.transaction-row:hover {
  background: #f8fafc;
}

/* 列幅 */
.transaction-table th:nth-child(1),
.transaction-table td:nth-child(1) {
  width: 14%;
}

.transaction-table th:nth-child(2),
.transaction-table td:nth-child(2) {
  width: 16%;
}

.transaction-table th:nth-child(3),
.transaction-table td:nth-child(3) {
  width: 11%;
}

.transaction-table th:nth-child(4),
.transaction-table td:nth-child(4) {
  width: 20%;
}

.transaction-table th:nth-child(5),
.transaction-table td:nth-child(5) {
  width: 20%;
}

.transaction-table th:nth-child(6),
.transaction-table td:nth-child(6) {
  width: 19%;
}

.type-badge {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 700;
}

.type-badge.income {
  background: #f0fdf4;
  color: #15803d;
}

.type-badge.expense {
  background: #fef2f2;
  color: #dc2626;
}

.amount-cell {
  font-weight: 800;
  white-space: nowrap;
}

.amount-cell.income {
  color: #15803d;
}

.amount-cell.expense {
  color: #dc2626;
}

/* 取引詳細モーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(
    15,
    23,
    42,
    0.45
  );
  backdrop-filter: blur(3px);
}

.transaction-modal {
  width: min(
    520px,
    100%
  );
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 20px 60px rgba(
      15,
      23,
      42,
      0.18
    );
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid #edf0f5;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
}

.modal-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 11px;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #1f2937;
}

.modal-body {
  padding: 6px 22px;
}

.detail-row {
  display: grid;
  grid-template-columns:
    110px
    minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid #f1f3f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #8a94a6;
  font-size: 11px;
  font-weight: 700;
}

.detail-value {
  min-width: 0;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
}

.detail-amount {
  font-size: 16px;
  font-weight: 800;
}

.detail-amount.income {
  color: #15803d;
}

.detail-amount.expense {
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 22px 22px;
}

.modal-button {
  min-width: 90px;
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 9px;
  background: #111827;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.modal-button:hover {
  opacity: 0.85;
}

.empty-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9aa3b1;
  text-align: center;
}

.empty-icon {
  margin-bottom: 10px;
  font-size: 30px;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
}

.empty-history {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 6px 24px rgba(
      20,
      30,
      55,
      0.05
    );
  text-align: center;
}

.empty-history-icon {
  margin-bottom: 12px;
  font-size: 40px;
  opacity: 0.65;
}

.empty-history h2 {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

.empty-history p {
  margin: 7px 0 0;
  color: #9aa3b1;
  font-size: 11px;
}

.loading-state {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9aa3b1;
}

.loading-state p {
  margin: 12px 0 0;
  font-size: 12px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #64748b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .two-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .history-container {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .year-select {
    width: 100%;
  }

  .year-select select {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .expense-row {
    grid-template-columns:
      36px
      minmax(0, 1fr)
      82px;
  }

  .transaction-controls {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .modal-overlay {
    padding: 12px;
  }

  .transaction-modal {
    border-radius: 16px;
  }

  .detail-row {
    grid-template-columns:
      90px
      minmax(0, 1fr);
    gap: 12px;
  }
}
</style>