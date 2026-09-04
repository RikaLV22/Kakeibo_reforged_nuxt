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
        <p>データを読み込んでいます...</p>
      </div>

      <div
        v-else
        class="history-content"
      >
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
                positive:
                  organization.total.balance >= 0,
                negative:
                  organization.total.balance < 0
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

        <section class="dashboard-card large-card">
          <div class="card-header">
            <div>
              <h2>ユーザごとの収支</h2>
              <p>
                {{ selectedYear }}年におけるユーザーごとの収入・支出
              </p>
            </div>
          </div>

          <div
            v-if="users.length > 0"
            class="user-chart"
          >
            <UserHistoryChart
              :users="users"
            />
          </div>

          <div
            v-else
            class="empty-state"
          >
            <div class="empty-icon">
              👥
            </div>

            <p>
              {{ selectedYear }}年のユーザーデータはありません
            </p>
          </div>
        </section>

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

        <section class="dashboard-card large-card">
          <div class="card-header">
            <div>
              <h2>取引一覧</h2>
              <p>
                {{ selectedYear }}年に登録された組織家計簿の取引
              </p>
            </div>

            <span class="transaction-count">
              {{ transactions.length }}件
            </span>
          </div>

          <div
            v-if="transactions.length > 0"
            class="transaction-table-wrap"
          >
            <table class="transaction-table">
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
                  v-for="transaction in transactions"
                  :key="transaction.id"
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
              {{ selectedYear }}年の取引データはありません
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

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

const isLoading = ref(false)

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

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(
    value || 0
  )
}

const formatDate = (date: string) => {
  const value = new Date(`${date}T00:00:00`)

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

    organization.value = data.organization

    organizationMember.value =
      data.organization_member

    users.value = data.users || []

    transactions.value =
      data.transactions || []
  } catch (error) {
    console.error(
      '過去データの取得に失敗しました:',
      error
    )
  } finally {
    isLoading.value = false
  }
}

watch(
  selectedYear,
  async () => {
    await fetchHistory()
  }
)

onMounted(async () => {
  await fetchHistory()
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f7fb;
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
  padding: 4px;
  border-radius: 11px;
  background: #eef1f5;
}

.year-select select {
  min-width: 105px;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.summary-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
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
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.two-column .dashboard-card {
  margin-bottom: 16px;
}

.user-chart {
  width: 100%;
}

.expense-list {
  padding: 0 19px 19px;
}

.expense-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 95px;
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

.transaction-count {
  flex-shrink: 0;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.transaction-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th {
  padding: 11px 17px;
  border-bottom: 1px solid #edf0f5;
  background: #fafbfc;
  color: #8a94a6;
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.transaction-table td {
  padding: 12px 17px;
  border-bottom: 1px solid #f1f3f6;
  color: #475569;
  font-size: 11px;
  white-space: nowrap;
}

.transaction-table tbody tr:last-child td {
  border-bottom: none;
}

.transaction-table tbody tr:hover {
  background: #fafbfc;
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
  text-align: right;
}

.amount-cell.income {
  color: #15803d;
}

.amount-cell.expense {
  color: #dc2626;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    grid-template-columns: 36px minmax(0, 1fr) 82px;
  }
}
</style>