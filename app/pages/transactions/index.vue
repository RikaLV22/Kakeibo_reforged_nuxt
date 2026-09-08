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
            <TransactionCalendar
              api-base-path="/organization_transactions"
              account-api-base-path="/organization_accounts"
            />
          </div>
        </div>

        <ChatAssistant
          api-path="/chat"
          description="家計についてAIに相談できます"
          placeholder="家計について質問してください..."
          initial-message="こんにちは！組織の家計について何でも相談してください。"
        />
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

          <SummaryPanel
            :sections="[
              {
                title: '組織全体',
                subtitle: 'Organization Total',
                icon: '組',
                iconClass: 'organization-icon',
                summary: organization.total
              },
              {
                title: '自分',
                subtitle: 'Member Total',
                icon: '自',
                iconClass: 'personal-icon',
                summary: organizationMember.total
              }
            ]"
          />
        </div>

        <div class="analytics-scroll">
          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>組織の収支推移</h2>
                <p>月ごとの組織全体の収入・支出・収支</p>
              </div>

              <button
                type="button"
                class="chart-toggle"
                @click="
                  organizationChartMode =
                    organizationChartMode === 'line'
                      ? 'bar'
                      : 'line'
                "
              >
                <span
                  :class="{
                    active:
                      organizationChartMode === 'bar'
                  }"
                >
                  棒
                </span>

                <span
                  :class="{
                    active:
                      organizationChartMode === 'line'
                  }"
                >
                  線
                </span>
              </button>
            </div>

            <OrganizationBalanceChart
              :data="organization.monthly"
              :chart-mode="organizationChartMode"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>自分の収支推移</h2>
                <p>組織家計簿における自分の収入・支出</p>
              </div>

              <button
                type="button"
                class="chart-toggle"
                @click="
                  personalChartMode =
                    personalChartMode === 'bar-line'
                      ? 'line'
                      : 'bar-line'
                "
              >
                <span
                  :class="{
                    active:
                      personalChartMode === 'bar-line'
                  }"
                >
                  比較
                </span>

                <span
                  :class="{
                    active:
                      personalChartMode === 'line'
                  }"
                >
                  推移
                </span>
              </button>
            </div>

            <PersonalBalanceChart
              :data="organizationMember.monthly"
              :chart-mode="personalChartMode"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>支出カテゴリ</h2>
                <p>組織のカテゴリ別支出</p>
              </div>

              <div class="category-period-toggle">
                <button
                  type="button"
                  :class="{
                    active:
                      categoryPeriod === 'today'
                  }"
                  @click="
                    changeCategoryPeriod('today')
                  "
                >
                  今日
                </button>

                <button
                  type="button"
                  :class="{
                    active:
                      categoryPeriod === 'week'
                  }"
                  @click="
                    changeCategoryPeriod('week')
                  "
                >
                  今週
                </button>

                <button
                  type="button"
                  :class="{
                    active:
                      categoryPeriod === 'month'
                  }"
                  @click="
                    changeCategoryPeriod('month')
                  "
                >
                  今月
                </button>

                <button
                  type="button"
                  :class="{
                    active:
                      categoryPeriod === 'year'
                  }"
                  @click="
                    changeCategoryPeriod('year')
                  "
                >
                  今年
                </button>

                <button
                  type="button"
                  :class="{
                    active:
                      categoryPeriod === 'all'
                  }"
                  @click="
                    changeCategoryPeriod('all')
                  "
                >
                  全期間
                </button>
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

          <div class="dashboard-card graph-card account-card">
            <div class="card-header">
              <div>
                <h2>口座状況</h2>
                <p>登録されている口座の状況</p>
              </div>

              <button
                class="transfer-button"
                :disabled="
                  accounts.length < 2
                "
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

    <AccountTransferModal
      :is-open="showTransferModal"
      :accounts="accounts"
      :is-transferring="isTransferring"
      :error="transferError"
      :form="transferForm"
      @close="closeTransferModal"
      @submit="transferMoney"
    />

    <AccountDetailModal
      :account="selectedAccount"
      @close="closeAccountModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref
} from 'vue'

import TransactionCalendar from '~/components/TransactionCalendar.client.vue'
import ExpenseCategoryChart from '~/components/ExpenseCategoryChart.client.vue'
import OrganizationBalanceChart from '~/components/OrganizationBalanceChart.client.vue'
import PersonalBalanceChart from '~/components/PersonalBalanceChart.client.vue'
import UserBalanceChart from '~/components/UserBalanceChart.client.vue'
import AccountList from '~/components/AccountList.vue'
import AccountDetailModal from '~/components/AccountDetailModal.vue'
import AccountTransferModal from '~/components/AccountTransferModal.vue'
import ChatAssistant from '~/components/ChatAssistant.vue'
import type { Account } from '~/types/account'
import SummaryPanel from '~/components/SummaryPanel.vue'

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
  organization?: SummarySection
  organization_member?: SummarySection
  personal?: SummarySection
  users?: UserSummary[]
  total?: PeriodSummary
  current_month?: PeriodSummary
  current_year?: PeriodSummary
  monthly?: MonthlySummary[]
  category_expense?: CategoryExpense[]
}

interface TransferForm {
  fromAccountId: number | string
  toAccountId: number | string
  amount: number | null
}

type CategoryPeriod =
  | 'all'
  | 'year'
  | 'month'
  | 'week'
  | 'today'

const emptyPeriodSummary =
  (): PeriodSummary => ({
    income: 0,
    expense: 0,
    balance: 0
  })

const emptySummarySection =
  (): SummarySection => ({
    total:
      emptyPeriodSummary(),

    current_month:
      emptyPeriodSummary(),

    current_year:
      emptyPeriodSummary(),

    monthly: [],

    category_expense: []
  })

const organization =
  ref<SummarySection>(
    emptySummarySection()
  )

const organizationMember =
  ref<SummarySection>(
    emptySummarySection()
  )

const users =
  ref<UserSummary[]>([])

const accounts =
  ref<Account[]>([])

const selectedAccount =
  ref<Account | null>(null)

const organizationChartMode =
  ref<'bar' | 'line'>(
    'line'
  )

const personalChartMode =
  ref<'bar-line' | 'line'>(
    'bar-line'
  )

const categoryPeriod =
  ref<CategoryPeriod>(
    'all'
  )

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

const getSelectedOrganizationId =
  () => {
    if (!import.meta.client) {
      return null
    }

    const value =
      localStorage.getItem(
        'selectedOrganizationId'
      )

    if (!value) {
      return null
    }

    const id =
      Number(value)

    return Number.isFinite(id)
      ? id
      : null
  }

const openAccountModal =
  (account: Account) => {
    selectedAccount.value =
      account
  }

const closeAccountModal =
  () => {
    selectedAccount.value =
      null
  }

const normalizeSummary =
  (
    data: SummaryResponse
  ): SummarySection => {
    const source =
      data.organization ||
      data

    return {
      total:
        source.total ||
        emptyPeriodSummary(),

      current_month:
        source.current_month ||
        emptyPeriodSummary(),

      current_year:
        source.current_year ||
        emptyPeriodSummary(),

      monthly:
        source.monthly ||
        [],

      category_expense:
        source.category_expense ||
        []
    }
  }

const fetchSummary =
  async (
    period: CategoryPeriod = 'all'
  ) => {
    try {
      const response =
        await $api.get<SummaryResponse>(
          '/organization_transactions/summary',
          {
            params: {
              year:
                new Date().getFullYear(),

              organization_id:
                getSelectedOrganizationId(),

              period
            }
          }
        )

      const data =
        response.data

      organization.value =
        normalizeSummary(
          data
        )

      if (
        data.organization_member
      ) {
        organizationMember.value =
          data.organization_member
      } else if (
        data.personal
      ) {
        organizationMember.value =
          data.personal
      } else {
        organizationMember.value =
          emptySummarySection()
      }

      users.value =
        data.users ||
        []
    } catch (error) {
      console.error(
        '組織家計データの取得に失敗しました:',
        error
      )
    }
  }

const changeCategoryPeriod =
  async (
    period: CategoryPeriod
  ) => {
    categoryPeriod.value =
      period

    await fetchSummary(
      period
    )
  }

const fetchAccounts =
  async () => {
    try {
      const response =
        await $api.get<Account[]>(
          '/organization_accounts',
          {
            params: {
              organization_id:
                getSelectedOrganizationId()
            }
          }
        )

      accounts.value =
        response.data ||
        []
    } catch (error) {
      console.error(
        '口座情報の取得に失敗しました:',
        error
      )
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
    if (
      isTransferring.value
    ) {
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
        transferForm.value
          .amount
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
        '/organization_accounts/transfer',
        {
          from_account_id:
            fromAccountId,

          to_account_id:
            toAccountId,

          amount
        },
        {
          params: {
            organization_id:
              getSelectedOrganizationId()
          }
        }
      )

      await fetchAccounts()

      closeTransferModal()

      alert(
        '口座間の資金移動が完了しました'
      )
    } catch (
      error: any
    ) {
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

onMounted(
  async () => {
    await Promise.all([
      fetchSummary('all'),
      fetchAccounts()
    ])
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

.chart-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid #e2e6ed;
  border-radius: 10px;
  background: #f1f3f6;
  cursor: pointer;
  font-family: inherit;
}

.chart-toggle span {
  min-width: 38px;
  padding: 6px 9px;
  border-radius: 8px;
  color: #9aa3b1;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.chart-toggle span.active {
  background: #fff;
  color: #111827;
  box-shadow:
    0 2px 7px
    rgba(
      15,
      23,
      42,
      0.08
    );
}

.chart-toggle:hover span:not(.active) {
  color: #475569;
}

.category-period-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid #e2e6ed;
  border-radius: 10px;
  background: #f1f3f6;
}

.category-period-toggle button {
  min-width: 42px;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #9aa3b1;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.category-period-toggle button:hover {
  color: #475569;
}

.category-period-toggle button.active {
  background: #fff;
  color: #111827;
  box-shadow:
    0 2px 7px
    rgba(
      15,
      23,
      42,
      0.08
    );
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

.transfer-button:hover:not(
    :disabled
  ) {
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

  .right-column {
    height: auto;
  }

  .analytics-scroll {
    overflow-y: visible;
    padding-right: 0;
  }

  .card-header {
    padding: 15px 16px 12px;
  }

  .chart-toggle {
    align-self: flex-start;
  }

  .chart-toggle span {
    min-width: 34px;
    padding: 6px 8px;
  }

  .category-period-toggle {
    align-self: flex-start;
  }

  .category-period-toggle button {
    min-width: 38px;
    padding: 6px 6px;
    font-size: 9px;
  }

  .transfer-button {
    width: 100%;
  }

  .card-header:has(.transfer-button) {
    flex-direction: column;
  }

  .card-header:has(.category-period-toggle) {
    flex-direction: column;
  }
}
</style>
