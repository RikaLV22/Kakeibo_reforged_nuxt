<template>

  <div class="admin-transactions">

    <div class="ambient-grid"></div>

    <div class="ambient-scan"></div>

    <div class="page-heading page-enter">

      <div>

        <p class="eyebrow">04 / TRANSACTION MANAGEMENT</p>

        <h1>取引管理</h1>

        <p class="description">システム内の取引データを監視・確認します</p>

      </div>

      <button

        class="refresh-button"

        :disabled="isLoading"

        @click="fetchTransactions"

      >

        <span

          class="refresh-icon"

          :class="{ spinning: isLoading }"

        >

          ↻

        </span>

        {{ isLoading ? '更新中...' : '更新' }}

      </button>

    </div>

    <section class="control-panel panel-enter panel-delay-1">

      <div class="panel-corner top-left"></div>

      <div class="panel-corner top-right"></div>

      <div class="panel-corner bottom-left"></div>

      <div class="panel-corner bottom-right"></div>

      <div class="search-box">

        <span class="search-pulse"></span>

        <span class="search-icon">⌕</span>

        <input

          v-model="searchQuery"

          type="text"

          placeholder="ユーザー・組織・カテゴリ・IDで検索"

        >

        <span class="search-label">

          DATABASE SEARCH

        </span>

      </div>

      <div class="filter-row">

        <div class="filter-group">

          <span class="filter-label">TYPE</span>

          <button

            class="filter-button"

            :class="{ active: transactionTypeFilter === 'all' }"

            @click="transactionTypeFilter = 'all'"

          >

            すべて

          </button>

          <button

            class="filter-button income-filter"

            :class="{ active: transactionTypeFilter === 'income' }"

            @click="transactionTypeFilter = 'income'"

          >

            <span></span>

            収入

          </button>

          <button

            class="filter-button expense-filter"

            :class="{ active: transactionTypeFilter === 'expense' }"

            @click="transactionTypeFilter = 'expense'"

          >

            <span></span>

            支出

          </button>

        </div>

        <div class="filter-group">

          <span class="filter-label">SCOPE</span>

          <button

            class="filter-button"

            :class="{ active: transactionScopeFilter === 'all' }"

            @click="transactionScopeFilter = 'all'"

          >

            すべて

          </button>

          <button

            class="filter-button"

            :class="{ active: transactionScopeFilter === 'personal' }"

            @click="transactionScopeFilter = 'personal'"

          >

            個人

          </button>

          <button

            class="filter-button"

            :class="{ active: transactionScopeFilter === 'organization' }"

            @click="transactionScopeFilter = 'organization'"

          >

            組織

          </button>

        </div>

      </div>

    </section>

    <section class="summary-grid">

      <div class="summary-card summary-card-1">

        <div class="summary-top">

          <span class="summary-label">TOTAL TRANSACTIONS</span>

          <span class="summary-index">TRX-01</span>

        </div>

        <strong>{{ transactions.length }}</strong>

        <span class="summary-sub">登録取引</span>

        <div class="summary-line"></div>

      </div>

      <div class="summary-card summary-card-2 income-card">

        <div class="summary-top">

          <span class="summary-label">TOTAL INCOME</span>

          <span class="summary-index">TRX-02</span>

        </div>

        <strong class="income-value">

          {{ formatAmount(totalIncome) }}

        </strong>

        <span class="summary-sub">収入総額</span>

        <div class="summary-line income-line"></div>

      </div>

      <div class="summary-card summary-card-3 expense-card">

        <div class="summary-top">

          <span class="summary-label">TOTAL EXPENSE</span>

          <span class="summary-index">TRX-03</span>

        </div>

        <strong class="expense-value">

          {{ formatAmount(totalExpense) }}

        </strong>

        <span class="summary-sub">支出総額</span>

        <div class="summary-line expense-line"></div>

      </div>

      <div class="summary-card summary-card-4">

        <div class="summary-top">

          <span class="summary-label">SEARCH RESULT</span>

          <span class="summary-index">TRX-04</span>

        </div>

        <strong>{{ filteredTransactions.length }}</strong>

        <span class="summary-sub">表示中の取引</span>

        <div class="summary-line"></div>

      </div>

    </section>

    <section class="transactions-panel panel-enter panel-delay-2">

      <div class="panel-header">

        <div>

          <p class="panel-eyebrow">TRANSACTION DATABASE</p>

          <h2>取引一覧</h2>

        </div>

        <div class="result-meta">

          <span class="result-dot"></span>

          <span>

            {{ filteredTransactions.length }} TRANSACTIONS

          </span>

        </div>

      </div>

      <div

        v-if="isLoading"

        class="loading-state"

      >

        <div class="loading-core">

          <div class="loading-spinner"></div>

          <span></span>

        </div>

        <p>取引情報を取得しています...</p>

        <div class="loading-progress">

          <span></span>

        </div>

      </div>

      <div

        v-else-if="loadError"

        class="error-state"

      >

        <div class="error-frame">

          <div class="error-symbol">!</div>

        </div>

        <h3>データ取得エラー</h3>

        <p>{{ loadError }}</p>

        <button @click="fetchTransactions">

          再試行

        </button>

      </div>

      <div

        v-else-if="filteredTransactions.length === 0"

        class="empty-state"

      >

        <div class="empty-frame">

          <div class="empty-symbol">⌕</div>

        </div>

        <h3>該当取引なし</h3>

        <p>

          検索条件・フィルターに一致する取引がありません。

        </p>

      </div>

      <div

        v-else

        class="transaction-table"

      >

        <div class="table-header">

          <span>ID</span>

          <span>USER</span>

          <span>ORGANIZATION</span>

          <span>TYPE</span>

          <span>CATEGORY</span>

          <span>AMOUNT</span>

          <span>DATE</span>

          <span>操作</span>

        </div>

        <div

          v-for="(transaction, index) in filteredTransactions"

          :key="transaction.id"

          class="transaction-row"

          :class="{

            income: transaction.transaction_type === 'income',

            expense: transaction.transaction_type === 'expense'

          }"

          :style="{ '--row-delay': `${index * 35}ms` }"

        >

          <span class="row-scan"></span>

          <span class="transaction-id">

            #{{ transaction.id }}

          </span>

          <div class="user-profile">

            <div class="user-avatar">

              {{ getInitial(transaction.user?.username) }}

            </div>

            <div class="user-info">

              <strong>

                {{ transaction.user?.username || '不明' }}

              </strong>

              <span>

                {{ transaction.user?.public_id || 'ID不明' }}

              </span>

            </div>

          </div>

          <div class="organization-info">

            <strong>

              {{ transaction.organization?.name || '未設定' }}

            </strong>

            <span>

              {{ transaction.organization?.public_id || '-' }}

            </span>

          </div>

          <span

            class="type-badge"

            :class="{

              income: transaction.transaction_type === 'income',

              expense: transaction.transaction_type === 'expense'

            }"

          >

            <span class="type-dot"></span>

            {{ getTransactionTypeLabel(transaction.transaction_type) }}

          </span>

          <span class="category-value">

            {{ transaction.category }}

          </span>

          <span

            class="amount-value"

            :class="{

              income: transaction.transaction_type === 'income',

              expense: transaction.transaction_type === 'expense'

            }"

          >

            {{ transaction.transaction_type === 'income' ? '+' : '-' }}

            {{ formatAmount(transaction.amount) }}

          </span>

          <span class="date-value">

            {{ formatDate(transaction.date) }}

          </span>

          <div class="action-group">

            <button

              class="detail-button"

              @click="openTransactionDetail(transaction.id)"

            >

              <span>詳細</span>

              <i>→</i>

            </button>

          </div>

        </div>

      </div>

    </section>

    <Transition name="modal">

      <div

        v-if="showDetailModal"

        class="modal-overlay"

        @click.self="closeTransactionDetail"

      >

        <div class="modal-backdrop-grid"></div>

        <div class="detail-modal">

          <div class="modal-glow"></div>

          <div class="modal-corner top-left"></div>

          <div class="modal-corner top-right"></div>

          <div class="modal-corner bottom-left"></div>

          <div class="modal-corner bottom-right"></div>

          <div class="modal-header">

            <div>

              <p class="modal-eyebrow">TRANSACTION PROFILE</p>

              <h2>取引詳細</h2>

            </div>

            <button

              class="close-button"

              @click="closeTransactionDetail"

            >

              ×

            </button>

          </div>

          <div

            v-if="isLoadingDetail"

            class="modal-loading"

          >

            <div class="modal-loading-core">

              <div class="loading-spinner"></div>

            </div>

            <p>取引情報を取得しています...</p>

            <span>DATABASE QUERY / TRANSACTION</span>

          </div>

          <div

            v-else-if="selectedTransaction"

            class="modal-content"

          >

            <div class="transaction-hero">

              <div

                class="hero-type"

                :class="{

                  income:

                    selectedTransaction.transaction_type === 'income',

                  expense:

                    selectedTransaction.transaction_type === 'expense'

                }"

              >

                {{ selectedTransaction.transaction_type === 'income' ? '+' : '-' }}

              </div>

              <div class="hero-main">

                <span class="hero-label">

                  {{

                    getTransactionTypeLabel(

                      selectedTransaction.transaction_type

                    )

                  }}

                </span>

                <strong

                  :class="{

                    'income-value':

                      selectedTransaction.transaction_type === 'income',

                    'expense-value':

                      selectedTransaction.transaction_type === 'expense'

                  }"

                >

                  {{ selectedTransaction.transaction_type === 'income' ? '+' : '-' }}

                  {{ formatAmount(selectedTransaction.amount) }}

                </strong>

              </div>

              <span

                class="scope-badge"

                :class="{

                  personal:

                    selectedTransaction.transaction_scope === 'personal',

                  organization:

                    selectedTransaction.transaction_scope === 'organization'

                }"

              >

                {{

                  getTransactionScopeLabel(

                    selectedTransaction.transaction_scope

                  )

                }}

              </span>

            </div>

            <div class="detail-grid">

              <div class="detail-item">

                <span>TRANSACTION ID</span>

                <strong>

                  #{{ selectedTransaction.id }}

                </strong>

              </div>

              <div class="detail-item">

                <span>CATEGORY</span>

                <strong>

                  {{ selectedTransaction.category }}

                </strong>

              </div>

              <div class="detail-item">

                <span>DATE</span>

                <strong>

                  {{ formatDate(selectedTransaction.date) }}

                </strong>

              </div>

              <div class="detail-item">

                <span>PAYMENT METHOD</span>

                <strong>

                  {{ selectedTransaction.payment_method || '-' }}

                </strong>

              </div>

              <div class="detail-item">

                <span>USER</span>

                <strong>

                  {{ selectedTransaction.user?.username || '不明' }}

                </strong>

                <small>

                  {{ selectedTransaction.user?.public_id || '-' }}

                </small>

              </div>

              <div class="detail-item">

                <span>ORGANIZATION</span>

                <strong>

                  {{ selectedTransaction.organization?.name || '未設定' }}

                </strong>

                <small>

                  {{ selectedTransaction.organization?.public_id || '-' }}

                </small>

              </div>

              <div class="detail-item">

                <span>ACCOUNT STATUS</span>

                <strong

                  :class="{

                    'account-linked':

                      selectedTransaction.account_linked,

                    'account-none':

                      !selectedTransaction.account_linked

                  }"

                >

                  {{

                    selectedTransaction.account_linked

                      ? '口座連携あり'

                      : '口座連携なし'

                  }}

                </strong>

              </div>

              <div class="detail-item">

                <span>TRANSACTION SCOPE</span>

                <strong>

                  {{

                    getTransactionScopeLabel(

                      selectedTransaction.transaction_scope

                    )

                  }}

                </strong>

              </div>

              <div

                v-if="selectedTransaction.created_at"

                class="detail-item"

              >

                <span>CREATED AT</span>

                <strong>

                  {{ formatDateTime(selectedTransaction.created_at) }}

                </strong>

              </div>

              <div

                v-if="selectedTransaction.updated_at"

                class="detail-item"

              >

                <span>UPDATED AT</span>

                <strong>

                  {{ formatDateTime(selectedTransaction.updated_at) }}

                </strong>

              </div>

            </div>

            <div class="privacy-notice">

              <span class="privacy-icon">i</span>

              <div>

                <strong>金融情報は保護されています</strong>

                <p>

                  銀行名・口座番号・カード情報などの金融情報は、管理画面では表示されません。

                </p>

              </div>

            </div>

          </div>

          <div

            v-else

            class="error-state modal-error"

          >

            <div class="error-frame">

              <div class="error-symbol">!</div>

            </div>

            <h3>取引情報を取得できませんでした</h3>

            <p>もう一度詳細ボタンを押してください。</p>

          </div>

          <div class="modal-footer">

            <div class="modal-footer-status">

              <span></span>

              SECURE ADMIN ACCESS

            </div>

            <button

              class="modal-close-button"

              @click="closeTransactionDetail"

            >

              閉じる

            </button>

          </div>

        </div>

      </div>

    </Transition>

  </div>

</template>

<script setup lang="ts">

definePageMeta({

  layout: 'admin'

})

interface TransactionUser {

  id: number

  username: string

  public_id: string

}

interface TransactionOrganization {

  id: number

  name: string

  public_id: string

}

interface Transaction {

  id: number

  transaction_type: 'income' | 'expense' | string

  transaction_scope: 'personal' | 'organization' | string

  category: string

  amount: number

  date: string

  payment_method: string | null

  account_linked: boolean

  user: TransactionUser | null

  organization: TransactionOrganization | null

  created_at?: string

  updated_at?: string

}

const { $api } = useNuxtApp()

const transactions = ref<Transaction[]>([])

const searchQuery = ref('')

const transactionTypeFilter = ref<'all' | 'income' | 'expense'>('all')

const transactionScopeFilter = ref<'all' | 'personal' | 'organization'>('all')

const isLoading = ref(true)

const loadError = ref('')

const showDetailModal = ref(false)

const isLoadingDetail = ref(false)

const selectedTransaction = ref<Transaction | null>(null)

const totalIncome = computed(() =>

  transactions.value

    .filter(

      transaction =>

        transaction.transaction_type === 'income'

    )

    .reduce(

      (total, transaction) =>

        total + Number(transaction.amount),

      0

    )

)

const totalExpense = computed(() =>

  transactions.value

    .filter(

      transaction =>

        transaction.transaction_type === 'expense'

    )

    .reduce(

      (total, transaction) =>

        total + Number(transaction.amount),

      0

    )

)

const filteredTransactions = computed(() => {

  const keyword = searchQuery.value

    .trim()

    .toLowerCase()

  return transactions.value.filter(transaction => {

    const matchesKeyword =

      !keyword ||

      String(transaction.id).includes(keyword) ||

      transaction.category?.toLowerCase().includes(keyword) ||

      transaction.user?.username?.toLowerCase().includes(keyword) ||

      transaction.user?.public_id?.toLowerCase().includes(keyword) ||

      transaction.organization?.name?.toLowerCase().includes(keyword) ||

      transaction.organization?.public_id?.toLowerCase().includes(keyword)

    const matchesType =

      transactionTypeFilter.value === 'all' ||

      transaction.transaction_type === transactionTypeFilter.value

    const matchesScope =

      transactionScopeFilter.value === 'all' ||

      transaction.transaction_scope === transactionScopeFilter.value

    return matchesKeyword && matchesType && matchesScope

  })

})

const fetchTransactions = async () => {

  isLoading.value = true

  loadError.value = ''

  try {

    const response =

      await $api.get<Transaction[]>(

        '/admin/transactions'

      )

    transactions.value =

      Array.isArray(response.data)

        ? response.data

        : []

  } catch (error: any) {

    console.error(

      '取引一覧の取得に失敗しました:',

      error

    )

    if (error?.response?.status === 403) {

      loadError.value =

        '管理者権限が必要です。'

    } else {

      loadError.value =

        '取引一覧の取得に失敗しました。'

    }

  } finally {

    isLoading.value = false

  }

}

const openTransactionDetail = async (

  transactionId: number

) => {

  showDetailModal.value = true

  isLoadingDetail.value = true

  selectedTransaction.value = null

  try {

    const response =

      await $api.get<Transaction>(

        `/admin/transactions/${transactionId}`

      )

    selectedTransaction.value =

      response.data

  } catch (error) {

    console.error(

      '取引詳細の取得に失敗しました:',

      error

    )

    selectedTransaction.value = null

  } finally {

    isLoadingDetail.value = false

  }

}

const closeTransactionDetail = () => {

  if (isLoadingDetail.value) {

    return

  }

  showDetailModal.value = false

  selectedTransaction.value = null

}

const getTransactionTypeLabel = (

  type: string

) => {

  if (type === 'income') {

    return '収入'

  }

  if (type === 'expense') {

    return '支出'

  }

  return type

}

const getTransactionScopeLabel = (

  scope: string

) => {

  if (scope === 'personal') {

    return '個人'

  }

  if (scope === 'organization') {

    return '組織'

  }

  return scope

}

const formatAmount = (

  amount: number

) => {

  return `¥${Number(amount).toLocaleString('ja-JP')}`

}

const formatDate = (

  date: string

) => {

  return new Date(date).toLocaleDateString(

    'ja-JP',

    {

      year: 'numeric',

      month: '2-digit',

      day: '2-digit'

    }

  )

}

const formatDateTime = (

  date: string

) => {

  return new Date(date).toLocaleString(

    'ja-JP',

    {

      year: 'numeric',

      month: '2-digit',

      day: '2-digit',

      hour: '2-digit',

      minute: '2-digit'

    }

  )

}

const getInitial = (

  value?: string | null

) => {

  return (

    value?.charAt(0)?.toUpperCase() ||

    '?'

  )

}

onMounted(() => {

  fetchTransactions()

})

</script>

<style scoped>
.admin-transactions {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 82% 4%,
      rgba(34, 184, 223, 0.08),
      transparent 26%
    ),
    radial-gradient(
      circle at 8% 92%,
      rgba(49, 185, 133, 0.045),
      transparent 23%
    ),
    #f4f9fc;
  color: #17313d;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  opacity: 0.8;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    );
  background-size: 56px 56px;
  mask-image:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.75),
      transparent 92%
    );
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
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(34, 184, 223, 0.08),
      transparent
    );
  filter: blur(12px);
  animation: ambient-scan 10s linear infinite;
}

.page-heading,
.control-panel,
.summary-grid,
.transactions-panel {
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

.eyebrow,
.panel-eyebrow,
.modal-eyebrow {
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
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.refresh-button::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      #22b8df,
      transparent
    );
  opacity: 0;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #22b8df;
  background: #f8fdff;
  box-shadow:
    0 8px 22px rgba(34, 184, 223, 0.1),
    0 0 0 3px rgba(34, 184, 223, 0.035);
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

.control-panel,
.transactions-panel,
.summary-card {
  border: 1px solid #cfe2e9;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.97),
      rgba(248, 252, 253, 0.94)
    );
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.018),
    0 12px 35px rgba(47, 88, 106, 0.065);
}

.control-panel {
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.panel-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(34, 184, 223, 0.35);
  pointer-events: none;
}

.panel-corner.top-left {
  left: 8px;
  top: 8px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.panel-corner.top-right {
  right: 8px;
  top: 8px;
  border-top: 1px solid;
  border-right: 1px solid;
}

.panel-corner.bottom-left {
  left: 8px;
  bottom: 8px;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.panel-corner.bottom-right {
  right: 8px;
  bottom: 8px;
  border-bottom: 1px solid;
  border-right: 1px solid;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #c7dfe7;
  background: #fafdfe;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.search-box:focus-within {
  border-color: rgba(34, 184, 223, 0.6);
  box-shadow:
    0 0 0 3px rgba(34, 184, 223, 0.06),
    inset 0 0 20px rgba(34, 184, 223, 0.025);
}

.search-pulse {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 8px rgba(34, 184, 223, 0.55);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.search-icon {
  margin-right: 9px;
  color: #22b8df;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #17313d;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #8aa2ac;
}

.search-label {
  margin-left: 10px;
  color: #9eb5bd;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 22px;
  margin-top: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  margin-right: 4px;
  color: #6d8792;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 11px;
  border: 1px solid #c7dbe2;
  background: transparent;
  color: #6f8994;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.filter-button:hover {
  transform: translateY(-1px);
  border-color: #87b8c7;
  color: #2f6474;
  background: #f8fcfd;
}

.filter-button.active {
  border-color: #22b8df;
  background: #eaf9fd;
  color: #1597bb;
  box-shadow:
    inset 0 0 10px rgba(34, 184, 223, 0.025);
}

.filter-button.income-filter span,
.filter-button.expense-filter span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.filter-button.income-filter span {
  background: #31b985;
  box-shadow:
    0 0 6px rgba(49, 185, 133, 0.45);
}

.filter-button.expense-filter span {
  background: #e56557;
  box-shadow:
    0 0 6px rgba(229, 101, 87, 0.4);
}

.filter-button.income-filter.active {
  border-color: #8bcdb4;
  background: #f1fbf7;
  color: #258f6d;
}

.filter-button.expense-filter.active {
  border-color: #e2a39b;
  background: #fff7f5;
  color: #ca594d;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  position: relative;
  padding: 17px;
  overflow: hidden;
  animation:
    summary-enter 0.6s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.summary-card-1 {
  animation-delay: 0.08s;
}

.summary-card-2 {
  animation-delay: 0.14s;
}

.summary-card-3 {
  animation-delay: 0.2s;
}

.summary-card-4 {
  animation-delay: 0.26s;
}

.summary-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 184, 223, 0.3);
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.025),
    0 12px 28px rgba(47, 88, 106, 0.1);
}

.summary-card.income-card:hover {
  border-color: rgba(49, 185, 133, 0.28);
}

.summary-card.expense-card:hover {
  border-color: rgba(229, 101, 87, 0.28);
}

.summary-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 28%;
  height: 1px;
  content: "";
  background: #22b8df;
  box-shadow:
    0 0 10px rgba(34, 184, 223, 0.3);
}

.income-card::before {
  background: #31b985;
  box-shadow:
    0 0 10px rgba(49, 185, 133, 0.25);
}

.expense-card::before {
  background: #e56557;
  box-shadow:
    0 0 10px rgba(229, 101, 87, 0.22);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-label {
  display: block;
  color: #6d8792;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.summary-index {
  color: #9db7c1;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.summary-card strong {
  display: block;
  margin-top: 7px;
  color: #17313d;
  font-size: 25px;
  font-weight: 800;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.summary-sub {
  display: block;
  margin-top: 3px;
  color: #6d8792;
  font-size: 10px;
}

.income-value {
  color: #299f77 !important;
}

.expense-value {
  color: #d45d50 !important;
}

.summary-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 28%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.65),
      transparent
    );
  animation:
    summary-line 3s
    ease-in-out infinite;
}

.income-line {
  background:
    linear-gradient(
      90deg,
      rgba(49, 185, 133, 0.65),
      transparent
    );
}

.expense-line {
  background:
    linear-gradient(
      90deg,
      rgba(229, 101, 87, 0.6),
      transparent
    );
}

.transactions-panel {
  margin: 0 auto;
  overflow: hidden;
  animation:
    panel-enter 0.7s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
  animation-delay: 0.18s;
}

.panel-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #d6e6eb;
  overflow: hidden;
}

.panel-header::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.55),
      transparent
    );
  animation:
    panel-header-scan 5s
    linear infinite;
}

.panel-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 18px;
  font-weight: 800;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #6d8792;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.result-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow:
    0 0 8px rgba(34, 184, 223, 0.5);
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.transaction-table {
  width: 100%;
  overflow-x: auto;
}

.table-header,
.transaction-row {
  display: grid;
  grid-template-columns:
    65px
    170px
    180px
    70px
    minmax(110px, 1fr)
    130px
    105px
    80px;
  align-items: center;
  gap: 10px;
  min-width: 1090px;
  padding: 13px 20px;
}

.table-header {
  border-bottom: 1px solid #dce9ed;
  background: #f6fbfd;
  color: #6a8590;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.transaction-row {
  position: relative;
  min-height: 76px;
  border-bottom: 1px solid #e1edf1;
  overflow: hidden;
  animation:
    row-enter 0.45s
    ease both;
  animation-delay: var(--row-delay);
  transition:
    background 0.22s ease,
    border-color 0.22s ease;
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-row:hover {
  background: #f8fcfd;
}

.transaction-row.income:hover {
  background:
    linear-gradient(
      90deg,
      rgba(49, 185, 133, 0.045),
      #f8fcfd
    );
}

.transaction-row.expense:hover {
  background:
    linear-gradient(
      90deg,
      rgba(229, 101, 87, 0.04),
      #f8fcfd
    );
}

.transaction-row::before {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 0;
  content: "";
  background: #22b8df;
  box-shadow:
    0 0 9px rgba(34, 184, 223, 0.3);
  transition: height 0.25s ease;
}

.transaction-row.income::before {
  background: #31b985;
  box-shadow:
    0 0 9px rgba(49, 185, 133, 0.28);
}

.transaction-row.expense::before {
  background: #e56557;
  box-shadow:
    0 0 9px rgba(229, 101, 87, 0.25);
}

.transaction-row:hover::before {
  height: 100%;
}

.row-scan {
  position: absolute;
  left: -25%;
  bottom: 0;
  width: 25%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.4),
      transparent
    );
  opacity: 0;
  pointer-events: none;
}

.transaction-row.income .row-scan {
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(49, 185, 133, 0.4),
      transparent
    );
}

.transaction-row.expense .row-scan {
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(229, 101, 87, 0.4),
      transparent
    );
}

.transaction-row:hover .row-scan {
  opacity: 1;
  animation:
    row-scan 0.9s
    ease-out;
}

.transaction-id {
  color: #78919b;
  font-size: 10px;
  font-weight: 700;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.user-avatar {
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bfe0e8;
  border-radius: 8px;
  background:
    linear-gradient(
      145deg,
      rgba(34, 184, 223, 0.1),
      rgba(240, 250, 253, 0.95)
    ),
    #ffffff;
  color: #1599bd;
  font-size: 10px;
  font-weight: 800;
  overflow: hidden;
}

.user-avatar::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.65),
      transparent
    );
}

.transaction-row:hover .user-avatar::after {
  animation:
    avatar-scan 0.8s
    ease-out;
}

.user-info,
.organization-info {
  min-width: 0;
}

.user-info strong,
.organization-info strong {
  display: block;
  overflow: hidden;
  color: #31525e;
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info span,
.organization-info span {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #8299a2;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge,
.scope-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  min-width: 42px;
  height: 23px;
  padding: 0 8px;
  border: 1px solid #c7dbe2;
  font-size: 8px;
  font-weight: 800;
}

.type-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    0 0 7px currentColor;
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.type-badge.income {
  border-color: #a8d7c5;
  background: #f1fbf7;
  color: #299f77;
}

.type-badge.expense {
  border-color: #e1b8b1;
  background: #fff8f7;
  color: #d45d50;
}

.category-value {
  overflow: hidden;
  color: #56727d;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-value {
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.amount-value.income {
  color: #299f77;
}

.amount-value.expense {
  color: #d45d50;
}

.date-value {
  color: #78919b;
  font-size: 9px;
}

.action-group {
  display: flex;
  justify-content: flex-end;
}

.detail-button {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 29px;
  padding: 0 10px;
  border: 1px solid #bfd6de;
  background: transparent;
  color: #577580;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.detail-button:hover {
  transform: translateY(-1px);
  border-color: #22b8df;
  background: #f5fcfe;
  color: #1597bb;
}

.detail-button i {
  font-style: normal;
  color: #86a2ac;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.detail-button:hover i {
  transform: translateX(3px);
  color: #22b8df;
}

/* =========================
   Loading / Empty / Error
   ========================= */

.loading-state,
.error-state,
.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 12px 0 0;
  color: #6e8791;
  font-size: 11px;
}

.loading-core {
  position: relative;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 184, 223, 0.18);
  border-radius: 50%;
}

.loading-core::before,
.loading-core::after {
  position: absolute;
  inset: 5px;
  content: "";
  border: 1px solid rgba(34, 184, 223, 0.1);
  border-radius: 50%;
}

.loading-core::after {
  inset: 12px;
  border-color: rgba(34, 184, 223, 0.2);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #d5e7ec;
  border-top-color: #22b8df;
  border-radius: 50%;
  animation:
    spin 0.8s
    linear infinite;
}

.loading-core > span {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow:
    0 0 9px rgba(34, 184, 223, 0.55);
  animation:
    status-pulse 1.2s
    ease-in-out infinite;
}

.loading-progress {
  position: relative;
  width: min(260px, 80%);
  height: 1px;
  margin-top: 20px;
  overflow: hidden;
  background: #dbeaf0;
}

.loading-progress span {
  position: absolute;
  left: -30%;
  top: 0;
  width: 30%;
  height: 100%;
  background:
    linear-gradient(
      90deg,
      transparent,
      #22b8df,
      transparent
    );
  animation:
    loading-progress 1.1s
    linear infinite;
}

.error-frame,
.empty-frame {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2bdb7;
}

.error-frame::before,
.error-frame::after,
.empty-frame::before,
.empty-frame::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
}

.error-frame::before,
.empty-frame::before {
  left: -1px;
  top: -1px;
  border-top: 1px solid rgba(229, 101, 87, 0.5);
  border-left: 1px solid rgba(229, 101, 87, 0.5);
}

.error-frame::after,
.empty-frame::after {
  right: -1px;
  bottom: -1px;
  border-right: 1px solid rgba(229, 101, 87, 0.5);
  border-bottom: 1px solid rgba(229, 101, 87, 0.5);
}

.empty-frame {
  border-color: #c7dfe7;
}

.error-symbol,
.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e56557;
  font-size: 22px;
}

.empty-symbol {
  color: #22b8df;
}

.error-state h3,
.empty-state h3 {
  margin: 14px 0 0;
  color: #31525e;
  font-size: 14px;
}

.error-state button {
  margin-top: 14px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #bfd6de;
  background: transparent;
  color: #577580;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.error-state button:hover {
  border-color: #22b8df;
  color: #1597bb;
  background: #f5fcfe;
}

/* =========================
   Modal
   ========================= */

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.25s ease,
    backdrop-filter 0.25s ease;
}

.modal-enter-active .detail-modal,
.modal-leave-active .detail-modal {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .detail-modal,
.modal-leave-to .detail-modal {
  opacity: 0;
  transform:
    translateY(12px)
    scale(0.985);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  background: rgba(23, 49, 61, 0.3);
  backdrop-filter: blur(7px);
}

.modal-backdrop-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.7;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    );
  background-size: 32px 32px;
  animation:
    modal-grid 12s
    linear infinite;
}

.detail-modal {
  position: relative;
  width: min(100%, 760px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #b9dce7;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(34, 184, 223, 0.05),
      transparent 35%
    ),
    #ffffff;
  box-shadow:
    0 0 0 1px rgba(34, 184, 223, 0.04),
    0 24px 80px rgba(32, 76, 94, 0.2),
    0 0 45px rgba(34, 184, 223, 0.06);
}

.modal-glow {
  position: absolute;
  left: 50%;
  top: -100px;
  width: 240px;
  height: 240px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(34, 184, 223, 0.06);
  filter: blur(40px);
  pointer-events: none;
}

.modal-corner {
  position: absolute;
  z-index: 4;
  width: 14px;
  height: 14px;
  border-color: rgba(34, 184, 223, 0.45);
  pointer-events: none;
}

.modal-corner.top-left {
  left: 8px;
  top: 8px;
  border-left: 1px solid;
  border-top: 1px solid;
}

.modal-corner.top-right {
  right: 8px;
  top: 8px;
  border-right: 1px solid;
  border-top: 1px solid;
}

.modal-corner.bottom-left {
  left: 8px;
  bottom: 8px;
  border-left: 1px solid;
  border-bottom: 1px solid;
}

.modal-corner.bottom-right {
  right: 8px;
  bottom: 8px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.modal-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #d5e6eb;
}

.modal-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 20px;
  font-weight: 800;
}

.close-button {
  width: 32px;
  height: 32px;
  border: 1px solid #bfd6de;
  background: #ffffff;
  color: #738c96;
  font-size: 20px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  transform: rotate(90deg);
  border-color: #22b8df;
  background: #f5fcfe;
  color: #22b8df;
}

.modal-loading {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6f8994;
  font-size: 11px;
}

.modal-loading-core {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 184, 223, 0.18);
  border-radius: 50%;
  box-shadow:
    inset 0 0 20px rgba(34, 184, 223, 0.03);
}

.modal-loading > span {
  margin-top: 8px;
  color: #8aa1aa;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-content {
  position: relative;
  z-index: 2;
  padding: 22px;
}

.transaction-hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid #cfe3e9;
  background:
    linear-gradient(
      135deg,
      rgba(34, 184, 223, 0.05),
      rgba(248, 252, 253, 0.96)
    ),
    #ffffff;
  overflow: hidden;
}

.transaction-hero::after {
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
      rgba(34, 184, 223, 0.5),
      transparent
    );
  animation:
    hero-scan 4s
    linear infinite;
}

.hero-type {
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c8dce3;
  font-size: 24px;
  font-weight: 800;
}

.hero-type.income {
  border-color: #a8d7c5;
  color: #299f77;
  background: #f1fbf7;
  box-shadow:
    0 0 20px rgba(49, 185, 133, 0.035);
}

.hero-type.expense {
  border-color: #e1b8b1;
  color: #d45d50;
  background: #fff8f7;
  box-shadow:
    0 0 20px rgba(229, 101, 87, 0.035);
}

.hero-main {
  min-width: 0;
  flex: 1;
}

.hero-label {
  display: block;
  color: #718a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.hero-main strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.scope-badge.personal {
  border-color: #b9dce6;
  background: #f2fbfd;
  color: #198fae;
}

.scope-badge.organization {
  border-color: #b8dacd;
  background: #f1fbf7;
  color: #299f77;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.detail-item {
  position: relative;
  padding: 13px;
  border: 1px solid #d5e5ea;
  background: #fafdfe;
  overflow: hidden;
}

.detail-item::after {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 22%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.35),
      transparent
    );
}

.detail-item span {
  display: block;
  color: #718a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.detail-item strong {
  display: block;
  margin-top: 5px;
  color: #31525e;
  font-size: 11px;
  font-weight: 800;
  word-break: break-word;
}

.detail-item small {
  display: block;
  margin-top: 4px;
  color: #7c969f;
  font-size: 8px;
  word-break: break-word;
}

.account-linked {
  color: #299f77 !important;
}

.account-none {
  color: #8399a2 !important;
}

.privacy-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #cfe1e7;
  background:
    linear-gradient(
      135deg,
      #f4fbfd,
      #fbfdfe
    );
}

.privacy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid #a9cfda;
  color: #2296b3;
  font-size: 10px;
  font-weight: 800;
}

.privacy-notice strong {
  display: block;
  color: #3b5b67;
  font-size: 9px;
  font-weight: 800;
}

.privacy-notice p {
  margin: 4px 0 0;
  color: #708993;
  font-size: 9px;
  line-height: 1.5;
}

.modal-error {
  min-height: 340px;
}

.modal-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 22px 20px;
  border-top: 1px solid #d5e6eb;
}

.modal-footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #728b95;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.modal-footer-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow:
    0 0 7px rgba(34, 184, 223, 0.5);
  animation:
    status-pulse 1.5s
    ease-in-out infinite;
}

.modal-close-button {
  height: 36px;
  min-width: 90px;
  border: 1px solid #bfd6de;
  background: #ffffff;
  color: #577580;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.modal-close-button:hover {
  transform: translateY(-1px);
  border-color: #22b8df;
  background: #f5fcfe;
  color: #1597bb;
}

/* =========================
   Animation
   ========================= */

.page-enter {
  animation:
    page-enter 0.7s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
}

.panel-enter {
  animation:
    panel-enter 0.7s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
}

.panel-delay-1 {
  animation-delay: 0.08s;
}

.panel-delay-2 {
  animation-delay: 0.16s;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform:
      translateY(14px)
      scale(0.995);
    filter: blur(2px);
  }

  to {
    opacity: 1;
    transform:
      translateY(0)
      scale(1);
    filter: blur(0);
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(1.5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes summary-enter {
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

@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateX(7px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
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

@keyframes button-scan {
  from {
    left: -30%;
  }

  to {
    left: 110%;
  }
}

@keyframes panel-header-scan {
  0% {
    left: -30%;
  }

  55%,
  100% {
    left: 110%;
  }
}

@keyframes row-scan {
  from {
    left: -25%;
  }

  to {
    left: 110%;
  }
}

@keyframes avatar-scan {
  from {
    left: -30%;
  }

  to {
    left: 110%;
  }
}

@keyframes loading-progress {
  from {
    left: -30%;
  }

  to {
    left: 100%;
  }
}

@keyframes summary-line {
  0%,
  100% {
    width: 25%;
    opacity: 0.4;
  }

  50% {
    width: 55%;
    opacity: 1;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modal-grid {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 32px 32px;
  }
}

@keyframes hero-scan {
  from {
    left: -25%;
  }

  to {
    left: 110%;
  }
}

/* =========================
   Responsive
   ========================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .table-header {
    display: none;
  }

  .transaction-table {
    overflow-x: visible;
  }

  .transaction-row {
    grid-template-columns: 1fr;
    min-width: 0;
    gap: 9px;
    padding: 16px;
  }

  .action-group {
    justify-content: flex-start;
  }

  .amount-value {
    font-size: 12px;
  }
}

@media (max-width: 700px) {
  .admin-transactions {
    padding: 16px;
  }

  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .refresh-button {
    align-self: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .search-label {
    display: none;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

  .transaction-hero {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .scope-badge {
    margin-left: auto;
  }

  .modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .modal-close-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-grid,
  .ambient-scan,
  .refresh-icon.spinning,
  .search-pulse,
  .summary-card,
  .summary-line,
  .result-dot,
  .panel-header::after,
  .transaction-row,
  .row-scan,
  .user-avatar::after,
  .type-dot,
  .loading-core > span,
  .loading-spinner,
  .loading-progress span,
  .modal-backdrop-grid,
  .transaction-hero::after,
  .modal-footer-status span {
    animation: none;
  }

  .page-enter,
  .panel-enter {
    animation: none;
  }
}
</style>
