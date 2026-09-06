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

        <ChatAssistant
          api-path="/personal_chat"
          description="自分の家計についてAIに相談できます"
          placeholder="自分の家計について質問してください..."
          initial-message="こんにちは！自分の家計について何でも相談してください。"
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
import ChatAssistant from '~/components/ChatAssistant.vue'
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

onMounted(
  async () => {
    await Promise.all([
      fetchSummary(),
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

  .transfer-button {
    width: 100%;
  }

  .card-header:has(.transfer-button) {
    flex-direction: column;
  }
}
</style>