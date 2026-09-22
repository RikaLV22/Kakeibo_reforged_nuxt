<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="transaction-modal">
          <div class="modal-header">
            <div>
              <span class="modal-eyebrow">TRANSACTION</span>
              <h2 class="modal-title">
                {{ isEditMode ? (editingId ? '取引を編集' : '家計簿をつける') : '取引詳細' }}
              </h2>
              <p class="modal-date">{{ selectedDate }}</p>
            </div>

            <button
              type="button"
              class="modal-close"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <div
            v-if="editingId"
            class="registered-user-card"
          >
            <div
              class="registered-user-cover"
              :style="registeredUserBackgroundStyle"
            >
              <div class="registered-user-cover-overlay"></div>

              <div
                class="registered-user-avatar"
                :style="registeredUserIconStyle"
              >
                <img
                  v-if="registeredUserIcon"
                  :src="registeredUserIcon"
                  :alt="registeredUserName"
                >

                <span
                  v-else
                  class="registered-user-initial"
                >
                  @
                </span>
              </div>
            </div>

            <div class="registered-user-main">
              <div class="registered-user-content">
                <span class="registered-user-label">REGISTERED BY</span>

                <strong class="registered-user-display-name">
                  {{ registeredUserDisplayName }}
                </strong>

                <span class="registered-user-username">
                  UserID：{{ registeredUserPublicId }}
                </span>
              </div>

              <div class="registered-user-summary">
                <div class="user-summary-item income">
                  <span>THIS MONTH INCOME</span>
                  <strong>
                    +¥{{ formatMonthlyAmount(userMonthlyIncome) }}
                  </strong>
                </div>

                <div class="user-summary-item expense">
                  <span>THIS MONTH EXPENSE</span>
                  <strong>
                    -¥{{ formatMonthlyAmount(userMonthlyExpense) }}
                  </strong>
                </div>

                <div
                  class="user-summary-item balance"
                  :class="{
                    negative:
                      userMonthlyBalance < 0
                  }"
                >
                  <span>THIS MONTH BALANCE</span>

                  <strong>
                    {{
                      userMonthlyBalance >= 0
                        ? '+'
                        : '-'
                    }}¥{{ formatMonthlyAmount(
                      Math.abs(
                        userMonthlyBalance
                      )
                    ) }}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-body">
            <div
              v-if="!isEditMode"
              class="detail-grid"
            >
              <div class="detail-item">
                <span class="detail-label">TYPE</span>

                <strong
                  class="detail-value"
                  :class="
                    transactionType === 'income'
                      ? 'income'
                      : 'expense'
                  "
                >
                  {{ transactionTypeLabel }}
                </strong>
              </div>

              <div class="detail-item">
                <span class="detail-label">AMOUNT</span>

                <strong
                  class="detail-value amount"
                  :class="
                    transactionType === 'income'
                      ? 'income'
                      : 'expense'
                  "
                >
                  {{ transactionType === 'income' ? '+' : '-' }}¥{{ formatAmount(amount) }}
                </strong>
              </div>

              <div class="detail-item">
                <span class="detail-label">CATEGORY</span>
                <strong class="detail-value">
                  {{ category || '未分類' }}
                </strong>
              </div>

              <div class="detail-item">
                <span class="detail-label">PAYMENT</span>
                <strong class="detail-value">
                  {{ paymentMethod || '未設定' }}
                </strong>
              </div>

              <div class="detail-item">
                <span class="detail-label">DATE</span>
                <strong class="detail-value">
                  {{ date }}
                </strong>
              </div>

              <div class="detail-item">
                <span class="detail-label">ACCOUNT</span>
                <strong class="detail-value">
                  {{ selectedAccountName }}
                </strong>
              </div>
            </div>

            <form
              v-else
              class="transaction-form"
              @submit.prevent="handleSave"
            >
              <div class="form-group">
                <label>収支区分</label>

                <div class="transaction-type-switch">
                  <button
                    type="button"
                    class="type-option income"
                    :class="{
                      active:
                        form.transaction_type ===
                        'income'
                    }"
                    @click="
                      form.transaction_type = 'income'
                    "
                  >
                    収入
                  </button>

                  <button
                    type="button"
                    class="type-option expense"
                    :class="{
                      active:
                        form.transaction_type ===
                        'expense'
                    }"
                    @click="
                      form.transaction_type = 'expense'
                    "
                  >
                    支出
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="transaction-category">カテゴリ</label>

                <input
                  v-if="
                    form.transaction_type ===
                    'income'
                  "
                  id="transaction-category"
                  value="収入"
                  readonly
                >

                <select
                  v-else-if="
                    form.transaction_type ===
                    'expense'
                  "
                  id="transaction-category"
                  v-model="form.category"
                >
                  <option value="">選択してください</option>
                  <option value="食費">食費</option>
                  <option value="交通費">交通費</option>
                  <option value="趣味">趣味</option>
                  <option value="水道光熱費">水道光熱費</option>
                  <option value="家賃">家賃</option>
                  <option value="衣類費">衣類費</option>
                  <option value="医療費">医療費</option>
                  <option value="交際費">交際費</option>
                  <option value="日用品費">日用品費</option>
                  <option value="通信費">通信費</option>
                  <option value="その他">その他</option>
                </select>

                <input
                  v-else
                  id="transaction-category"
                  value="収支区分を選択してください"
                  readonly
                  disabled
                >
              </div>

              <div class="form-group">
                <label for="transaction-amount">金額</label>

                <input
                  id="transaction-amount"
                  v-model.number="form.amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                >
              </div>

              <div class="form-group">
                <label for="transaction-date">日付</label>

                <input
                  id="transaction-date"
                  v-model="form.date"
                  type="date"
                >
              </div>

              <div
                v-if="form.transaction_type === 'income'"
                class="form-group"
              >
                <label>入金先</label>

                <div class="income-source-switch">
                  <button
                    type="button"
                    class="source-option"
                    :class="{
                      active:
                        incomeSource === 'cash'
                    }"
                    @click="
                      setIncomeSource('cash')
                    "
                  >
                    現金
                  </button>

                  <button
                    type="button"
                    class="source-option"
                    :class="{
                      active:
                        incomeSource === 'account'
                    }"
                    @click="
                      setIncomeSource('account')
                    "
                  >
                    口座
                  </button>
                </div>
              </div>

              <div
                v-if="
                  form.transaction_type === 'income' &&
                  incomeSource === 'account'
                "
                class="form-group"
              >
                <label for="income-account">口座</label>

                <div class="account-select-row">
                  <select
                    id="income-account"
                    v-model="selectedAccountId"
                  >
                    <option value="">選択してください</option>

                    <option
                      v-for="account in accounts"
                      :key="account.id"
                      :value="account.id"
                    >
                      {{ account.bank?.name || '銀行' }} -
                      {{ account.account_number }}
                      (残高: {{ formatAmount(account.balance) }}円)
                    </option>
                  </select>

                  <button
                    type="button"
                    class="account-open-button"
                    @click="emit('open-account')"
                  >
                    口座登録
                  </button>
                </div>
              </div>

              <div
                v-if="form.transaction_type === 'expense'"
                class="form-group"
              >
                <label for="transaction-payment">
                  支払方法
                </label>

                <select
                  id="transaction-payment"
                  v-model="form.payment_method"
                >
                  <option value="">選択してください</option>
                  <option value="現金">現金</option>
                  <option value="クレジット">クレジット</option>
                  <option value="引き落とし">引き落とし</option>
                </select>
              </div>

              <div
                v-if="
                  form.transaction_type === 'expense' &&
                  form.payment_method === '引き落とし'
                "
                class="form-group"
              >
                <label for="expense-account">口座</label>

                <div class="account-select-row">
                  <select
                    id="expense-account"
                    v-model="selectedAccountId"
                  >
                    <option value="">選択してください</option>

                    <option
                      v-for="account in accounts"
                      :key="account.id"
                      :value="account.id"
                    >
                      {{ account.bank?.name || '銀行' }} -
                      {{ account.account_number }}
                      (残高: {{ formatAmount(account.balance) }}円)
                    </option>
                  </select>

                  <button
                    type="button"
                    class="account-open-button"
                    @click="emit('open-account')"
                  >
                    口座登録
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <template v-if="isEditMode">
              <button
                type="button"
                class="secondary-button"
                @click="cancelEdit"
              >
                キャンセル
              </button>

              <button
                type="button"
                class="primary-button"
                @click="handleSave"
              >
                {{ editingId ? '保存' : '追加' }}
              </button>
            </template>

            <template v-else>
              <button
                v-if="editingId"
                type="button"
                class="danger-button"
                @click="handleDelete"
              >
                削除
              </button>

              <div class="footer-spacer"></div>

              <button
                v-if="editingId"
                type="button"
                class="primary-button"
                @click="emit('start-edit')"
              >
                編集
              </button>

              <button
                type="button"
                class="secondary-button"
                @click="closeModal"
              >
                閉じる
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

type TransactionUser = {
  id: number
  public_id?: string | null
  username: string
  avatar_url?: string | null
  background_image_url?: string | null
}

type Transaction = {
  id: number
  transaction_type: 'income' | 'expense'
  amount: number | string
  date: string
  created_at?: string
  category?: string
  payment_method?: string
  account_id?: number | null
  user_id?: number
  user_name?: string | null
  user_display_name?: string | null
  user_icon_url?: string | null
  user_background_url?: string | null
  user_monthly_income?: number
  user_monthly_expense?: number
  user_monthly_balance?: number
  user?: TransactionUser | null
}

type Account = {
  id: number
  account_number: string
  balance: number
  bank: {
    id: number
    name: string
  }
}

type TransactionType = '' | 'income' | 'expense'

type TransactionFormState = {
  transaction_type: TransactionType
  category: string
  amount: number
  date: string
  payment_method: string
}

type TransactionFormPayload = {
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  payment_method: string
  account_id: number | null
}

const props = defineProps<{
  modelValue: boolean
  editingId: number | null
  isEditMode: boolean
  transaction: Transaction | null
  selectedDate: string
  accounts: Account[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'start-edit'): void
  (event: 'save', payload: TransactionFormPayload): void
  (event: 'delete'): void
  (event: 'open-account'): void
}>()

const form = reactive<TransactionFormState>({
  transaction_type: '',
  category: '',
  amount: 0,
  date: '',
  payment_method: ''
})

const selectedAccountId = ref<number | ''>('')
const incomeSource = ref<'cash' | 'account'>('cash')

const syncForm = () => {
  const transaction = props.transaction

  if (!transaction) {
    form.transaction_type = ''
    form.category = ''
    form.amount = 0
    form.date = props.selectedDate
    form.payment_method = ''
    selectedAccountId.value = ''
    incomeSource.value = 'cash'
    return
  }

  form.transaction_type = transaction.transaction_type
  form.category =
    transaction.transaction_type === 'income'
      ? '収入'
      : transaction.category ?? ''
  form.amount = Number(transaction.amount ?? 0)
  form.date = transaction.date || props.selectedDate
  form.payment_method = transaction.payment_method ?? ''
  selectedAccountId.value = transaction.account_id ?? ''

  if (transaction.transaction_type === 'income') {
    incomeSource.value =
      transaction.account_id ? 'account' : 'cash'
  } else {
    incomeSource.value = 'cash'
  }
}

watch(
  () => [
    props.transaction,
    props.selectedDate,
    props.isEditMode
  ],
  () => syncForm(),
  { immediate: true }
)

watch(
  () => form.transaction_type,
  type => {
    if (type === 'income') {
      form.category = '収入'
      form.payment_method = '-'
      return
    }

    if (type === 'expense') {
      if (form.category === '収入') {
        form.category = ''
      }

      if (form.payment_method === '-') {
        form.payment_method = ''
      }

      incomeSource.value = 'cash'
      return
    }

    form.category = ''
    form.payment_method = ''
    selectedAccountId.value = ''
    incomeSource.value = 'cash'
  }
)

watch(
  () => form.payment_method,
  paymentMethod => {
    if (
      form.transaction_type === 'expense' &&
      paymentMethod !== '引き落とし'
    ) {
      selectedAccountId.value = ''
    }
  }
)

const transactionType = computed(() => {
  return (
    props.transaction?.transaction_type ??
    form.transaction_type
  )
})

const transactionTypeLabel = computed(() => {
  return transactionType.value === 'income'
    ? '収入'
    : '支出'
})

const amount = computed(() => {
  return Number(
    props.transaction?.amount ??
    form.amount ??
    0
  )
})

const category = computed(() => {
  return (
    props.transaction?.category ??
    form.category ??
    ''
  )
})

const paymentMethod = computed(() => {
  return (
    props.transaction?.payment_method ??
    form.payment_method ??
    ''
  )
})

const date = computed(() => {
  return (
    props.transaction?.date ??
    form.date ??
    props.selectedDate
  )
})

const registeredUserName = computed(() => {
  return (
    props.transaction?.user?.username ??
    props.transaction?.user_name ??
    '不明'
  )
})

const registeredUserPublicId = computed(() => {
  return (
    props.transaction?.user?.public_id ??
    '-'
  )
})

const registeredUserDisplayName = computed(() => {
  return (
    props.transaction?.user_display_name ??
    registeredUserName.value
  )
})

const registeredUserIcon = computed(() => {
  return (
    props.transaction?.user?.avatar_url ??
    props.transaction?.user_icon_url ??
    null
  )
})

const registeredUserBackground = computed(() => {
  return (
    props.transaction
      ?.user
      ?.background_image_url ??
    props.transaction
      ?.user_background_url ??
    null
  )
})

const userMonthlyIncome = computed(() => {
  return Number(
    props.transaction?.user_monthly_income ??
    0
  )
})

const userMonthlyExpense = computed(() => {
  return Number(
    props.transaction?.user_monthly_expense ??
    0
  )
})

const userMonthlyBalance = computed(() => {
  return Number(
    props.transaction?.user_monthly_balance ??
    (
      userMonthlyIncome.value -
      userMonthlyExpense.value
    )
  )
})

const registeredUserIconStyle = computed(() => {
  if (!registeredUserIcon.value) {
    return {
      background: '#eaf8fb'
    }
  }

  return {
    backgroundImage:
      `url("${registeredUserIcon.value}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
})

const registeredUserBackgroundStyle = computed(() => {
  if (!registeredUserBackground.value) {
    return {
      background:
        'linear-gradient(135deg, #dff6fb, #eef8fa)'
    }
  }

  return {
    backgroundImage:
      `url("${registeredUserBackground.value}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
})

const selectedAccountName = computed(() => {
  const accountId =
    props.transaction?.account_id ??
    selectedAccountId.value

  if (!accountId) {
    return '未設定'
  }

  const account =
    props.accounts.find(
      item =>
        Number(item.id) ===
        Number(accountId)
    )

  if (!account) {
    return '不明'
  }

  return `${account.bank.name} / ${account.account_number}`
})

const setIncomeSource = (
  source: 'cash' | 'account'
) => {
  incomeSource.value = source

  if (source === 'cash') {
    selectedAccountId.value = ''
    return
  }

  if (
    props.accounts.length > 0 &&
    selectedAccountId.value === ''
  ) {
    selectedAccountId.value =
      props.accounts[0].id
  }
}

const validateForm = () => {
  if (
    form.transaction_type !== 'income' &&
    form.transaction_type !== 'expense'
  ) {
    alert('収支種別を選択してください')
    return false
  }

  if (
    !form.amount ||
    Number(form.amount) <= 0
  ) {
    alert('金額を入力してください')
    return false
  }

  if (!form.date) {
    alert('日付を入力してください')
    return false
  }

  if (form.transaction_type === 'income') {
    form.category = '収入'
    form.payment_method = '-'

    if (
      incomeSource.value === 'account' &&
      !selectedAccountId.value
    ) {
      alert('口座を選択してください')
      return false
    }
  }

  if (
    form.transaction_type === 'expense' &&
    !form.category
  ) {
    alert('カテゴリーを選択してください')
    return false
  }

  if (
    form.transaction_type === 'expense' &&
    !form.payment_method
  ) {
    alert('支払方法を選択してください')
    return false
  }

  if (
    form.transaction_type === 'expense' &&
    form.payment_method === '引き落とし' &&
    !selectedAccountId.value
  ) {
    alert('口座を選択してください')
    return false
  }

  return true
}

const formatAmount = (
  value: number | string
) => {
  return Number(
    value || 0
  ).toLocaleString('ja-JP')
}

const formatMonthlyAmount = (
  value: number | string
) => {
  return Math.abs(
    Number(value || 0)
  ).toLocaleString('ja-JP')
}

const closeModal = () => {
  emit(
    'update:modelValue',
    false
  )
}

const cancelEdit = () => {
  syncForm()
  closeModal()
}

const handleSave = () => {
  if (!validateForm()) {
    return
  }

  if (
    form.transaction_type !== 'income' &&
    form.transaction_type !== 'expense'
  ) {
    return
  }

  let accountId: number | null = null

  if (
    form.transaction_type === 'income' &&
    incomeSource.value === 'account'
  ) {
    accountId =
      selectedAccountId.value
        ? Number(
            selectedAccountId.value
          )
        : null
  }

  if (
    form.transaction_type === 'expense' &&
    form.payment_method === '引き落とし'
  ) {
    accountId =
      selectedAccountId.value
        ? Number(
            selectedAccountId.value
          )
        : null
  }

  emit(
    'save',
    {
      transaction_type:
        form.transaction_type,
      category:
        form.category,
      amount:
        Number(
          form.amount
        ),
      date:
        form.date,
      payment_method:
        form.payment_method,
      account_id:
        accountId
    }
  )
}

const handleDelete = () => {
  emit('delete')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(20, 45, 55, 0.38);
  backdrop-filter: blur(5px);
}

.transaction-modal {
  width: min(760px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #c8e0e7;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 30px 70px rgba(23, 49, 61, 0.2),
    0 8px 20px rgba(23, 49, 61, 0.1);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 26px 18px;
}

.modal-eyebrow {
  display: block;
  color: #24a6c7;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.modal-title {
  margin: 5px 0 4px;
  color: #244854;
  font-size: 24px;
  font-weight: 900;
}

.modal-date {
  margin: 0;
  color: #8ea4ac;
  font-size: 12px;
  font-weight: 700;
}

.modal-close {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #eef7f9;
  color: #68838d;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  background: #dff2f6;
}

.registered-user-card {
  margin: 0 26px 20px;
  overflow: hidden;
  border: 1px solid #cfe4ea;
  border-radius: 16px;
  background: #fff;
}

.registered-user-cover {
  position: relative;
  height: 96px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.registered-user-cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(24, 52, 63, 0.02),
      rgba(24, 52, 63, 0.2)
    );
}

.registered-user-avatar {
  position: absolute;
  bottom: -30px;
  left: 20px;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  background: #eaf8fb;
  box-shadow:
    0 5px 14px rgba(23, 49, 61, 0.16);
}

.registered-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.registered-user-initial {
  color: #23a5c5;
  font-size: 15px;
  font-weight: 900;
}

.registered-user-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  padding: 42px 20px 18px;
}

.registered-user-content {
  min-width: 0;
}

.registered-user-label {
  display: block;
  margin-bottom: 4px;
  color: #9aadb4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.registered-user-display-name {
  display: block;
  overflow: hidden;
  color: #244854;
  font-size: 16px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.registered-user-username {
  display: block;
  margin-top: 3px;
  color: #8ca2aa;
  font-size: 11px;
  font-weight: 700;
}

.registered-user-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 7px;
  min-width: 380px;
}

.user-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 9px 10px;
  border-radius: 9px;
  background: #f7fbfc;
}

.user-summary-item span {
  color: #94a9b1;
  font-size: 7px;
  font-weight: 800;
  white-space: nowrap;
}

.user-summary-item strong {
  color: #299f77;
  font-size: 10px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.user-summary-item.expense strong {
  color: #d45d50;
}

.user-summary-item.balance strong {
  color: #299f77;
}

.user-summary-item.balance.negative strong {
  color: #d45d50;
}

.modal-body {
  padding: 0 26px 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.detail-item {
  padding: 14px;
  border: 1px solid #e0edf0;
  border-radius: 10px;
  background: #f9fcfd;
}

.detail-label {
  display: block;
  margin-bottom: 5px;
  color: #9aadb4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.detail-value {
  display: block;
  color: #2e515d;
  font-size: 13px;
  font-weight: 800;
}

.detail-value.amount {
  font-size: 17px;
  font-variant-numeric: tabular-nums;
}

.detail-value.income {
  color: #299f77;
}

.detail-value.expense {
  color: #d45d50;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #607b85;
  font-size: 10px;
  font-weight: 900;
}

.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #cfe1e6;
  border-radius: 9px;
  outline: none;
  background: #fbfdfe;
  color: #294c58;
  font-size: 13px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #28afd0;
  box-shadow:
    0 0 0 3px rgba(40, 175, 208, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f7f8;
  color: #93a5ab;
  cursor: default;
}

.transaction-type-switch,
.income-source-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: #eef1f5;
}

.type-option,
.source-option {
  height: 42px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.type-option.income {
  color: #299f77;
}

.type-option.expense {
  color: #d45d50;
}

.type-option.income.active,
.type-option.expense.active {
  background: #fff;
  box-shadow:
    0 2px 8px rgba(20, 30, 55, 0.08);
}

.type-option.income.active {
  color: #299f77;
}

.type-option.expense.active {
  color: #d45d50;
}

.source-option {
  color: #607b85;
}

.source-option.active {
  background: #fff;
  color: #179bbd;
  box-shadow:
    0 2px 8px rgba(20, 30, 55, 0.08);
}

.account-select-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-select-row select {
  flex: 1;
}

.account-open-button {
  flex-shrink: 0;
  padding: 11px 13px;
  border: 1px solid #b9dce5;
  border-radius: 9px;
  background: #eef9fb;
  color: #179bbd;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.account-open-button:hover {
  background: #e1f5f8;
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 26px 24px;
  border-top: 1px solid #e5eef1;
}

.footer-spacer {
  flex: 1;
}

.primary-button,
.secondary-button,
.danger-button {
  min-width: 90px;
  padding: 10px 16px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #20a8ca;
  background: #20a8ca;
  color: #fff;
}

.primary-button:hover {
  background: #1599bd;
}

.secondary-button {
  border: 1px solid #c7dce2;
  background: #f7fbfc;
  color: #607b85;
}

.secondary-button:hover {
  background: #edf6f8;
}

.danger-button {
  border: 1px solid #e5b8b2;
  background: #fff5f3;
  color: #d45d50;
}

.danger-button:hover {
  background: #ffebe8;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-active .transaction-modal,
.modal-leave-active .transaction-modal {
  transition: transform 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .transaction-modal,
.modal-leave-to .transaction-modal {
  transform: translateY(10px) scale(0.98);
}

@media (max-width: 800px) {
  .registered-user-main {
    grid-template-columns: 1fr;
  }

  .registered-user-summary {
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }

  .transaction-modal {
    max-height: 94vh;
    border-radius: 15px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .registered-user-card {
    margin-left: 16px;
    margin-right: 16px;
  }

  .registered-user-summary {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .account-select-row {
    flex-direction: column;
    align-items: stretch;
  }

  .account-open-button {
    width: 100%;
  }
}
</style>