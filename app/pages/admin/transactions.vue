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
      rgba(57, 216, 255, 0.07),
      transparent 26%
    ),
    radial-gradient(
      circle at 8% 92%,
      rgba(59, 130, 246, 0.045),
      transparent 23%
    ),
    linear-gradient(
      rgba(0, 200, 255, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(0, 200, 255, 0.025) 1px,
      transparent 1px
    ),
    #050a12;
  background-size:
    auto,
    auto,
    32px 32px,
    32px 32px,
    auto;
  color: #e6f7ff;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  opacity: 0.2;
  background-image:
    linear-gradient(
      rgba(57, 216, 255, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(57, 216, 255, 0.035) 1px,
      transparent 1px
    );
  background-size: 56px 56px;
  mask-image:
    linear-gradient(
      to bottom,
      black,
      transparent 92%
    );
  animation:
    grid-drift 18s
    linear infinite;
}

.ambient-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -20%;
  height: 18%;
  z-index: -2;
  pointer-events: none;
  opacity: 0.16;
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(57, 216, 255, 0.09),
      transparent
    );
  filter: blur(12px);
  animation:
    ambient-scan 10s
    linear infinite;
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
  color: #39d8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.page-heading h1 {
  margin: 0;
  color: #eefcff;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.description {
  margin: 8px 0 0;
  color: #7e98a8;
  font-size: 13px;
}

.refresh-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #214457;
  background: rgba(8, 22, 34, 0.8);
  color: #8de8ff;
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
      #39d8ff,
      transparent
    );
  opacity: 0;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #39d8ff;
  background: rgba(10, 34, 48, 0.9);
  box-shadow:
    0 0 20px
    rgba(57, 216, 255, 0.06);
}

.refresh-button:hover:not(:disabled)::after {
  opacity: 1;
  animation:
    button-scan 0.8s
    ease-out;
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
  animation:
    spin 0.8s
    linear infinite;
}

.control-panel,
.transactions-panel,
.summary-card {
  border: 1px solid #193444;
  background:
    linear-gradient(
      145deg,
      rgba(7, 19, 29, 0.94),
      rgba(4, 12, 19, 0.94)
    );
  box-shadow:
    inset 0 0 30px
    rgba(0, 150, 220, 0.025),
    0 12px 35px
    rgba(0, 0, 0, 0.1);
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
  border-color: rgba(57, 216, 255, 0.3);
  pointer-events: none;
}

.panel-corner.top-left {
  left: 8px;
  top: 8px;
  border-left: 1px solid;
  border-top: 1px solid;
}

.panel-corner.top-right {
  right: 8px;
  top: 8px;
  border-right: 1px solid;
  border-top: 1px solid;
}

.panel-corner.bottom-left {
  left: 8px;
  bottom: 8px;
  border-left: 1px solid;
  border-bottom: 1px solid;
}

.panel-corner.bottom-right {
  right: 8px;
  bottom: 8px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #1f4355;
  background: #07121c;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.search-box:focus-within {
  border-color: rgba(57, 216, 255, 0.5);
  box-shadow:
    0 0 0 3px
    rgba(57, 216, 255, 0.035),
    inset 0 0 20px
    rgba(57, 216, 255, 0.025);
}

.search-pulse {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 50%;
  background: #39d8ff;
  box-shadow:
    0 0 8px
    rgba(57, 216, 255, 0.7);
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.search-icon {
  margin-right: 9px;
  color: #39d8ff;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #e6f7ff;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #58717f;
}

.search-label {
  margin-left: 10px;
  color: #365a67;
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
  color: #4f707d;
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
  border: 1px solid #254654;
  background: transparent;
  color: #7896a1;
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
  border-color: #427183;
  color: #b7dce6;
}

.filter-button.active {
  border-color: #39d8ff;
  background: rgba(57, 216, 255, 0.07);
  color: #7de7ff;
  box-shadow:
    inset 0 0 10px
    rgba(57, 216, 255, 0.025);
}

.filter-button.income-filter span,
.filter-button.expense-filter span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.filter-button.income-filter span {
  background: #79eabc;
  box-shadow:
    0 0 6px
    rgba(121, 234, 188, 0.65);
}

.filter-button.expense-filter span {
  background: #ff9987;
  box-shadow:
    0 0 6px
    rgba(255, 153, 135, 0.65);
}

.filter-button.income-filter.active {
  border-color: #3e9976;
  background: rgba(52, 211, 153, 0.07);
  color: #7ff0c0;
}

.filter-button.expense-filter.active {
  border-color: #8b4b43;
  background: rgba(255, 92, 72, 0.07);
  color: #ff9a88;
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
  border-color: rgba(57, 216, 255, 0.24);
  box-shadow:
    inset 0 0 30px
    rgba(0, 150, 220, 0.03),
    0 12px 28px
    rgba(0, 0, 0, 0.16);
}

.summary-card.income-card:hover {
  border-color: rgba(121, 234, 188, 0.24);
}

.summary-card.expense-card:hover {
  border-color: rgba(255, 153, 135, 0.24);
}

.summary-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 28%;
  height: 1px;
  content: "";
  background: #39d8ff;
  box-shadow:
    0 0 10px
    rgba(57, 216, 255, 0.4);
}

.income-card::before {
  background: #79eabc;
}

.expense-card::before {
  background: #ff9987;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-label {
  display: block;
  color: #557481;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.summary-index {
  color: #2e515f;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.summary-card strong {
  display: block;
  margin-top: 7px;
  color: #ebfbff;
  font-size: 25px;
  font-weight: 800;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.summary-sub {
  display: block;
  margin-top: 3px;
  color: #6f8792;
  font-size: 10px;
}

.income-value {
  color: #7ff0c0 !important;
}

.expense-value {
  color: #ff9a88 !important;
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
      rgba(57, 216, 255, 0.7),
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
      rgba(121, 234, 188, 0.7),
      transparent
    );
}

.expense-line {
  background:
    linear-gradient(
      90deg,
      rgba(255, 153, 135, 0.7),
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
  border-bottom: 1px solid #173443;
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
      rgba(57, 216, 255, 0.5),
      transparent
    );
  animation:
    panel-header-scan 5s
    linear infinite;
}

.panel-header h2 {
  margin: 0;
  color: #eaf9fd;
  font-size: 18px;
  font-weight: 800;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #50717f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.result-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #39d8ff;
  box-shadow:
    0 0 8px
    rgba(57, 216, 255, 0.65);
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
  border-bottom: 1px solid #102b39;
  background: #07131d;
  color: #54717e;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.transaction-row {
  position: relative;
  min-height: 76px;
  border-bottom: 1px solid #102733;
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
  background: rgba(21, 48, 62, 0.23);
}

.transaction-row.income:hover {
  background:
    linear-gradient(
      90deg,
      rgba(52, 211, 153, 0.035),
      rgba(21, 48, 62, 0.18)
    );
}

.transaction-row.expense:hover {
  background:
    linear-gradient(
      90deg,
      rgba(255, 92, 72, 0.035),
      rgba(21, 48, 62, 0.18)
    );
}

.transaction-row::before {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 0;
  content: "";
  background: #39d8ff;
  box-shadow:
    0 0 9px
    rgba(57, 216, 255, 0.5);
  transition: height 0.25s ease;
}

.transaction-row.income::before {
  background: #79eabc;
  box-shadow:
    0 0 9px
    rgba(121, 234, 188, 0.45);
}

.transaction-row.expense::before {
  background: #ff9987;
  box-shadow:
    0 0 9px
    rgba(255, 153, 135, 0.45);
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
      rgba(57, 216, 255, 0.4),
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
      rgba(121, 234, 188, 0.4),
      transparent
    );
}

.transaction-row.expense .row-scan {
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255, 153, 135, 0.4),
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
  color: #63818e;
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
  border: 1px solid #23556a;
  border-radius: 8px;
  background:
    linear-gradient(
      145deg,
      rgba(57, 216, 255, 0.07),
      rgba(9, 26, 37, 0.9)
    ),
    #091a25;
  color: #55dcff;
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
      rgba(57, 216, 255, 0.65),
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
  color: #dff8ff;
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
  color: #52707d;
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
  border: 1px solid #35515d;
  font-size: 8px;
  font-weight: 800;
}

.type-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    0 0 7px
    currentColor;
  animation:
    status-pulse 1.8s
    ease-in-out infinite;
}

.type-badge.income {
  border-color: #3c866b;
  background: rgba(52, 211, 153, 0.05);
  color: #79eabc;
}

.type-badge.expense {
  border-color: #75483f;
  background: rgba(255, 92, 72, 0.05);
  color: #ff9987;
}

.category-value {
  overflow: hidden;
  color: #adc8d2;
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
  color: #79eabc;
  text-shadow:
    0 0 7px
    rgba(121, 234, 188, 0.25);
}

.amount-value.expense {
  color: #ff9987;
  text-shadow:
    0 0 7px
    rgba(255, 153, 135, 0.2);
}

.date-value {
  color: #748f9a;
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
  border: 1px solid #34515d;
  background: transparent;
  color: #93b5c1;
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
  border-color: #39d8ff;
  background: rgba(57, 216, 255, 0.035);
  color: #cbeef7;
}

.detail-button i {
  font-style: normal;
  color: #4d7380;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.detail-button:hover i {
  transform: translateX(3px);
  color: #39d8ff;
}

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
  color: #637d89;
  font-size: 11px;
}

.loading-core {
  position: relative;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(57, 216, 255, 0.16);
  border-radius: 50%;
}

.loading-core::before,
.loading-core::after {
  position: absolute;
  inset: 5px;
  content: "";
  border: 1px solid rgba(57, 216, 255, 0.09);
  border-radius: 50%;
}

.loading-core::after {
  inset: 12px;
  border-color: rgba(57, 216, 255, 0.2);
}

.loading-core > span {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #39d8ff;
  box-shadow:
    0 0 9px
    rgba(57, 216, 255, 0.8);
  animation:
    status-pulse 1.2s
    ease-in-out infinite;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #1d3a48;
  border-top-color: #39d8ff;
  border-radius: 50%;
  animation:
    spin 0.8s
    linear infinite;
}

.loading-progress {
  position: relative;
  width: min(260px, 80%);
  height: 1px;
  margin-top: 20px;
  overflow: hidden;
  background: #16313e;
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
      #39d8ff,
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
  border: 1px solid #68423c;
}

.error-frame::before,
.error-frame::after,
.empty-frame::before,
.empty-frame::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
  border-color: rgba(255, 139, 120, 0.5);
}

.error-frame::before,
.empty-frame::before {
  left: -1px;
  top: -1px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.error-frame::after,
.empty-frame::after {
  right: -1px;
  bottom: -1px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.empty-frame {
  border-color: #2b4c5b;
}

.error-symbol,
.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff8b78;
  font-size: 22px;
}

.empty-symbol {
  color: #59cfe8;
}

.error-state h3,
.empty-state h3 {
  margin: 14px 0 0;
  color: #dcecf2;
  font-size: 14px;
}

.error-state button {
  margin-top: 14px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #3b6473;
  background: transparent;
  color: #9edcea;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.error-state button:hover {
  border-color: #39d8ff;
  background: rgba(57, 216, 255, 0.035);
  color: #39d8ff;
}

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
  background: rgba(1, 6, 11, 0.82);
  backdrop-filter: blur(6px);
}

.modal-backdrop-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.13;
  background-image:
    linear-gradient(
      rgba(57, 216, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(57, 216, 255, 0.03) 1px,
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
  border: 1px solid #235064;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(57, 216, 255, 0.035),
      transparent 35%
    ),
    #06111a;
  box-shadow:
    0 0 0 1px
    rgba(57, 216, 255, 0.04),
    0 24px 100px
    rgba(0, 0, 0, 0.55),
    0 0 45px
    rgba(57, 216, 255, 0.035);
}

.modal-glow {
  position: absolute;
  left: 50%;
  top: -100px;
  width: 240px;
  height: 240px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(57, 216, 255, 0.035);
  filter: blur(40px);
  pointer-events: none;
}

.modal-corner {
  position: absolute;
  z-index: 4;
  width: 14px;
  height: 14px;
  border-color: rgba(57, 216, 255, 0.35);
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
  border-bottom: 1px solid #173443;
}

.modal-header h2 {
  margin: 0;
  color: #edfaff;
  font-size: 20px;
  font-weight: 800;
}

.close-button {
  width: 32px;
  height: 32px;
  border: 1px solid #284553;
  background: transparent;
  color: #83a3af;
  font-size: 20px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.close-button:hover {
  transform: rotate(90deg);
  border-color: #39d8ff;
  background: rgba(57, 216, 255, 0.035);
  color: #39d8ff;
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
  border: 1px solid rgba(57, 216, 255, 0.17);
  border-radius: 50%;
  box-shadow:
    inset 0 0 20px
    rgba(57, 216, 255, 0.03);
}

.modal-loading > span {
  margin-top: 8px;
  color: #3d5b67;
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
  border: 1px solid #183a48;
  background:
    linear-gradient(
      135deg,
      rgba(57, 216, 255, 0.04),
      rgba(8, 23, 34, 0.9)
    ),
    #081722;
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
      rgba(57, 216, 255, 0.5),
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
  border: 1px solid #355460;
  font-size: 24px;
  font-weight: 800;
}

.hero-type.income {
  border-color: #3c866b;
  color: #79eabc;
  background: rgba(52, 211, 153, 0.025);
  box-shadow:
    0 0 20px
    rgba(121, 234, 188, 0.025);
}

.hero-type.expense {
  border-color: #75483f;
  color: #ff9987;
  background: rgba(255, 92, 72, 0.025);
  box-shadow:
    0 0 20px
    rgba(255, 153, 135, 0.025);
}

.hero-main {
  min-width: 0;
  flex: 1;
}

.hero-label {
  display: block;
  color: #607e89;
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
  border-color: #345e6d;
  background: rgba(57, 216, 255, 0.04);
  color: #8adff2;
}

.scope-badge.organization {
  border-color: #3c8069;
  background: rgba(52, 211, 153, 0.04);
  color: #79eabc;
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
  border: 1px solid #163440;
  background: #07131d;
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
      rgba(57, 216, 255, 0.35),
      transparent
    );
}

.detail-item span {
  display: block;
  color: #52707d;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.detail-item strong {
  display: block;
  margin-top: 5px;
  color: #d8f5fc;
  font-size: 11px;
  font-weight: 800;
  word-break: break-word;
}

.detail-item small {
  display: block;
  margin-top: 4px;
  color: #506d79;
  font-size: 8px;
}

.account-linked {
  color: #79eabc !important;
}

.account-none {
  color: #758c96 !important;
}

.privacy-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #284454;
  background:
    linear-gradient(
      135deg,
      rgba(13, 32, 43, 0.72),
      rgba(8, 20, 29, 0.72)
    );
}

.privacy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid #3a7184;
  color: #73d7ec;
  font-size: 10px;
  font-weight: 800;
}

.privacy-notice strong {
  display: block;
  color: #a9d5df;
  font-size: 9px;
  font-weight: 800;
}

.privacy-notice p {
  margin: 4px 0 0;
  color: #5d7782;
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
  border-top: 1px solid #173443;
}

.modal-footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #466672;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.modal-footer-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #39d8ff;
  box-shadow:
    0 0 7px
    rgba(57, 216, 255, 0.7);
  animation:
    status-pulse 1.5s
    ease-in-out infinite;
}

.modal-close-button {
  height: 36px;
  min-width: 90px;
  border: 1px solid #315566;
  background: transparent;
  color: #9ed9e7;
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
  border-color: #39d8ff;
  background: rgba(57, 216, 255, 0.035);
  color: #39d8ff;
}

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
    transform:
      translateY(12px);
    filter: blur(1.5px);
  }

  to {
    opacity: 1;
    transform:
      translateY(0);
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