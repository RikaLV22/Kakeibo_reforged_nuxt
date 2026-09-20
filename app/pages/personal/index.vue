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
              transaction-scope="personal"
            />
          </div>
        </div>

        <ChatAssistant
          v-if="aiEnabled"
          api-path="/personal_chat"
          description="自分の家計についてAIに相談できます"
          placeholder="自分の家計について質問してください..."
          initial-message="こんにちは！自分の家計について何でも相談してください。"
        />

        <MaintenanceCard
          v-else
          code="AI ASSISTANT / 01"
          description="現在、AI家計簿アシスタントをメンテナンスしています。"
          min-height="350px"
        />
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

          <SummaryPanel
            :sections="[
              {
                title: '今月の家計',
                subtitle: 'Current Month',
                icon: '今',
                iconClass: 'personal-icon',
                summary: currentMonth
              },
              {
                title: '今年の家計',
                subtitle: 'Current Year',
                icon: '年',
                iconClass: 'organization-icon',
                summary: currentYear
              }
            ]"
          />
        </div>

        <div class="analytics-scroll">
          <div class="dashboard-card graph-card">
            <div class="card-header">
              <div>
                <h2>自分の収支推移</h2>
                <p>月ごとの収入・支出・収支</p>
              </div>

              <button
                type="button"
                class="chart-toggle"
                :disabled="!personalBalanceChartEnabled"
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

            <div
              v-if="personalBalanceChartEnabled"
              class="graph-content"
            >
              <PersonalBalanceChart
                :data="monthlySummary"
                :chart-mode="personalChartMode"
              />
            </div>

            <MaintenanceCard
              v-else
              code="PERSONAL BALANCE / 02"
              description="現在、自分の収支推移グラフをメンテナンスしています。"
            />
          </div>

          <div class="dashboard-card graph-card">
            <div class="card-header category-card-header">
              <div>
                <h2>自分の支出カテゴリ</h2>
                <p>{{ categoryPeriodLabel }}のカテゴリ別支出</p>
              </div>

              <div
                v-if="personalCategoryChartEnabled"
                class="category-period-toggle"
              >
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

            <div
              v-if="personalCategoryChartEnabled"
              class="graph-content"
            >
              <ExpenseCategoryChart
                :data="categoryExpense"
              />
            </div>

            <MaintenanceCard
              v-else
              code="PERSONAL CATEGORY / 03"
              description="現在、自分の支出カテゴリグラフをメンテナンスしています。"
            />
          </div>

          <div class="dashboard-card graph-card account-card">
            <div class="card-header">
              <div>
                <h2>口座状況</h2>
                <p>登録されている口座の状況</p>
              </div>

              <button
                v-if="accountsEnabled"
                class="transfer-button"
                :disabled="accounts.length < 2"
                @click="openTransferModal"
              >
                ↔ 口座間で移動
              </button>
            </div>

            <AccountList
              v-if="accountsEnabled"
              :accounts="accounts"
              @select="openAccountModal"
            />

            <MaintenanceCard
              v-else
              code="ACCOUNT MANAGEMENT / 04"
              description="現在、口座管理機能をメンテナンスしています。"
              min-height="270px"
            />
          </div>
        </div>
      </section>
    </div>

    <AccountTransferModal
      v-if="accountsEnabled"
      :is-open="showTransferModal"
      :accounts="accounts"
      :is-transferring="isTransferring"
      :error="transferError"
      :form="transferForm"
      @close="closeTransferModal"
      @submit="transferMoney"
    />

    <AccountDetailModal
      v-if="accountsEnabled"
      :account="selectedAccount"
      @close="closeAccountModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import TransactionCalendar from '~/components/TransactionCalendar.client.vue'
import ExpenseCategoryChart from '~/components/ExpenseCategoryChart.client.vue'
import PersonalBalanceChart from '~/components/PersonalBalanceChart.client.vue'
import AccountTransferModal from '~/components/AccountTransferModal.vue'
import AccountList from '~/components/AccountList.vue'
import AccountDetailModal from '~/components/AccountDetailModal.vue'
import ChatAssistant from '~/components/ChatAssistant.vue'
import SummaryPanel from '~/components/SummaryPanel.vue'
import type { Account } from '~/types/account'

const { $api, $cable } = useNuxtApp()

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

type CategoryPeriod =
  | 'all'
  | 'year'
  | 'month'
  | 'week'
  | 'today'

interface MaintenanceResponse {
  personal_balance_chart_enabled: boolean
  personal_category_chart_enabled: boolean
  accounts_enabled: boolean
  ai_enabled: boolean
}

interface MaintenanceFeatures {
  personal_balance_chart?: boolean
  personal_category_chart?: boolean
  accounts?: boolean
  ai?: boolean
}

interface MaintenanceUpdate {
  type: string
  maintenance?: {
    features?: MaintenanceFeatures
  }
}

const emptyPeriodSummary =
  (): PeriodSummary => ({
    income: 0,
    expense: 0,
    balance: 0
  })

const currentMonth =
  ref<PeriodSummary>(
    emptyPeriodSummary()
  )

const currentYear =
  ref<PeriodSummary>(
    emptyPeriodSummary()
  )

const monthlySummary =
  ref<MonthlySummary[]>([])

const categoryExpense =
  ref<CategoryExpense[]>([])

const categoryPeriod =
  ref<CategoryPeriod>('all')

const categoryPeriodLabel =
  ref('全期間')

const personalChartMode =
  ref<'bar-line' | 'line'>(
    'bar-line'
  )

const accounts =
  ref<Account[]>([])

const selectedAccount =
  ref<Account | null>(null)

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

const personalBalanceChartEnabled =
  ref(true)

const personalCategoryChartEnabled =
  ref(true)

const accountsEnabled =
  ref(true)

const aiEnabled =
  ref(true)

let maintenanceSubscription:
  any = null

const applyMaintenance =
  (
    data: MaintenanceResponse
  ) => {
    personalBalanceChartEnabled.value =
      data.personal_balance_chart_enabled

    personalCategoryChartEnabled.value =
      data.personal_category_chart_enabled

    accountsEnabled.value =
      data.accounts_enabled

    aiEnabled.value =
      data.ai_enabled

    if (!data.accounts_enabled) {
      showTransferModal.value = false
      selectedAccount.value = null
    }
  }

const applyMaintenanceUpdate =
  (
    features?: MaintenanceFeatures
  ) => {
    if (!features) {
      return
    }

    if (
      typeof features.personal_balance_chart ===
      'boolean'
    ) {
      personalBalanceChartEnabled.value =
        features.personal_balance_chart
    }

    if (
      typeof features.personal_category_chart ===
      'boolean'
    ) {
      personalCategoryChartEnabled.value =
        features.personal_category_chart
    }

    if (
      typeof features.accounts ===
      'boolean'
    ) {
      accountsEnabled.value =
        features.accounts

      if (!features.accounts) {
        showTransferModal.value = false
        selectedAccount.value = null
      }
    }

    if (
      typeof features.ai ===
      'boolean'
    ) {
      aiEnabled.value =
        features.ai
    }
  }

const connectMaintenanceChannel =
  () => {
    if (!$cable) {
      return
    }

    maintenanceSubscription =
      $cable.subscriptions.create(
        {
          channel:
            'MaintenanceChannel'
        },
        {
          connected() {
            console.log(
              '=== PERSONAL MAINTENANCE CHANNEL CONNECTED ==='
            )
          },

          disconnected() {
            console.log(
              '=== PERSONAL MAINTENANCE CHANNEL DISCONNECTED ==='
            )
          },

          rejected() {
            console.log(
              '=== PERSONAL MAINTENANCE CHANNEL REJECTED ==='
            )
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

            applyMaintenanceUpdate(
              data.maintenance?.features
            )
          }
        }
      )
  }

const fetchMaintenance =
  async () => {
    try {
      const response =
        await $api.get<MaintenanceResponse>(
          '/maintenance/status'
        )

      applyMaintenance(
        response.data
      )
    } catch (error) {
      console.error(
        '個人メンテナンス状態の取得に失敗しました:',
        error
      )
    }
  }

const fetchSummary =
  async (
    period:
      CategoryPeriod = 'all'
  ) => {
    try {
      const response =
        await $api.get<SummaryResponse>(
          '/personal_transactions/summary',
          {
            params: {
              period
            }
          }
        )

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
        data.monthly ||
        []

      categoryExpense.value =
        data.category_expense ||
        []
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

const changeCategoryPeriod =
  async (
    period:
      CategoryPeriod
  ) => {
    categoryPeriod.value =
      period

    if (
      period === 'all'
    ) {
      categoryPeriodLabel.value =
        '全期間'
    } else if (
      period === 'year'
    ) {
      categoryPeriodLabel.value =
        '今年'
    } else if (
      period === 'month'
    ) {
      categoryPeriodLabel.value =
        '今月'
    } else if (
      period === 'week'
    ) {
      categoryPeriodLabel.value =
        '今週'
    } else {
      categoryPeriodLabel.value =
        '今日'
    }

    await fetchSummary(
      period
    )
  }

const fetchAccounts =
  async () => {
    if (!accountsEnabled.value) {
      accounts.value = []
      return
    }

    try {
      const response =
        await $api.get<Account[]>(
          '/personal_accounts'
        )

      accounts.value =
        response.data ||
        []
    } catch (error) {
      console.error(
        '個人口座データの取得に失敗しました:',
        error
      )

      accounts.value =
        []
    }
  }

const openAccountModal =
  (
    account: Account
  ) => {
    if (!accountsEnabled.value) {
      return
    }

    selectedAccount.value =
      account
  }

const closeAccountModal =
  () => {
    selectedAccount.value =
      null
  }

const openTransferModal =
  () => {
    if (!accountsEnabled.value) {
      return
    }

    transferError.value =
      ''

    transferForm.value =
      {
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
    if (!accountsEnabled.value) {
      return
    }

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
      !Number.isFinite(
        amount
      ) ||
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
    } catch (
      error: any
    ) {
      console.error(
        '口座間の資金移動に失敗しました:',
        error
      )

      transferError.value =
        error?.response
          ?.data?.error ||
        '資金移動に失敗しました'
    } finally {
      isTransferring.value =
        false
    }
  }

onMounted(
  async () => {
    await Promise.all([
      fetchMaintenance(),
      fetchSummary('all')
    ])

    await fetchAccounts()

    connectMaintenanceChannel()
  }
)

onBeforeUnmount(
  () => {
    maintenanceSubscription
      ?.unsubscribe?.()

    maintenanceSubscription =
      null
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
    rgba(20, 30, 55, 0.05);
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

.graph-content {
  width: 100%;
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

.chart-toggle:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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
    rgba(15, 23, 42, 0.08);
}

.chart-toggle:hover:not(:disabled)
  span:not(.active) {
  color: #475569;
}

.category-card-header {
  align-items: center;
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
    rgba(15, 23, 42, 0.08);
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

  .category-card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-period-toggle {
    width: 100%;
    justify-content: flex-end;
  }

  .category-period-toggle button {
    flex: 1;
    min-width: 0;
    padding: 6px 5px;
    font-size: 9px;
  }

  .transfer-button {
    width: 100%;
  }

  .card-header:has(.transfer-button) {
    flex-direction: column;
  }
}
</style>
