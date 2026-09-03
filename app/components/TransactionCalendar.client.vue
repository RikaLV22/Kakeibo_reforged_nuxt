<template>
  <div class="calendar-container">
    <ScheduleXCalendar
      v-if="calendarApp"
      :calendar-app="calendarApp"
    />

    <!-- 家計簿モーダル -->
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="transaction-modal">
        <div class="modal-header">
          <h2>
            {{ editingId ? '家計簿を編集' : '家計簿をつける' }}
          </h2>

          <button
            type="button"
            class="close-button"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <!-- 収支種別 -->
          <div class="form-group">
            <label>収支種別</label>

            <select
              v-model="newTransaction.transaction_type"
              :disabled="editingId !== null && !isEditMode"
            >
              <option value="">選択してください</option>
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>
          </div>

          <!-- カテゴリー -->
          <div class="form-group">
            <label>カテゴリー</label>

            <input
              v-if="newTransaction.transaction_type === 'income'"
              value="収入"
              readonly
              :disabled="editingId !== null && !isEditMode"
            />

            <select
              v-else-if="newTransaction.transaction_type === 'expense'"
              v-model="newTransaction.category"
              :disabled="editingId !== null && !isEditMode"
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
          </div>

          <!-- 金額 -->
          <div class="form-group">
            <label>金額</label>

            <input
              v-model.number="newTransaction.amount"
              type="number"
              min="1"
              :disabled="editingId !== null && !isEditMode"
            />
          </div>

          <!-- 日付 -->
          <div class="form-group">
            <label>日付</label>

            <input
              v-model="newTransaction.date"
              type="date"
              :disabled="editingId !== null && !isEditMode"
            />
          </div>

          <!-- 支払方法 -->
          <div class="form-group">
            <label>支払方法</label>

            <input
              v-if="newTransaction.transaction_type === 'income'"
              value="-"
              readonly
              :disabled="editingId !== null && !isEditMode"
            />

            <select
              v-else-if="newTransaction.transaction_type === 'expense'"
              v-model="newTransaction.payment_method"
              :disabled="editingId !== null && !isEditMode"
            >
              <option value="">選択してください</option>
              <option value="現金">現金</option>
              <option value="クレジット">クレジット</option>
              <option value="引き落とし">引き落とし</option>
            </select>
          </div>

          <!-- 口座 -->
          <div
            v-if="
              newTransaction.transaction_type === 'income' ||
              (
                newTransaction.transaction_type === 'expense' &&
                newTransaction.payment_method === '引き落とし'
              )
            "
            class="form-group"
          >
            <label>口座</label>

            <select
              v-model="selectedAccountId"
              :disabled="editingId !== null && !isEditMode"
            >
              <option value="">選択してください</option>

              <option
                v-for="account in accounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.bank.name }} -
                {{ account.account_number }}
                (残高: {{ account.balance }}円)
              </option>
            </select>

            <button
              v-if="editingId === null || isEditMode"
              type="button"
              class="account-button"
              @click="openAccountModal"
            >
              口座を追加
            </button>
          </div>
        </div>

        <!-- モーダル下部 -->
        <div class="modal-footer">
          <!-- 編集モード時だけ削除 -->
          <button
            v-if="editingId && isEditMode"
            type="button"
            class="delete-button"
            @click="deleteTransaction"
          >
            削除
          </button>

          <!-- 閉じる -->
          <button
            type="button"
            class="cancel-button"
            @click="closeModal"
          >
            閉じる
          </button>

          <!-- 閲覧モード -->
          <button
            v-if="editingId && !isEditMode"
            type="button"
            class="submit-button"
            @click="startEdit"
          >
            編集
          </button>

          <!-- 編集モード -->
          <button
            v-else-if="editingId && isEditMode"
            type="button"
            class="submit-button"
            @click="saveTransaction"
          >
            保存
          </button>

          <!-- 新規追加 -->
          <button
            v-else
            type="button"
            class="submit-button"
            @click="saveTransaction"
          >
            追加
          </button>
        </div>
      </div>
    </div>

    <!-- 口座登録モーダル -->
    <div
      v-if="showAccountModal"
      class="modal-overlay"
      @click.self="closeAccountModal"
    >
      <div class="transaction-modal">
        <div class="modal-header">
          <h2>口座登録</h2>

          <button
            type="button"
            class="close-button"
            @click="closeAccountModal"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <!-- 銀行名 -->
          <div class="form-group">
            <label>銀行名</label>

            <select v-model="newAccount.bank_id">
              <option value="">選択してください</option>

              <option
                v-for="bank in banks"
                :key="bank.id"
                :value="bank.id"
              >
                {{ bank.name }}
              </option>
            </select>
          </div>

          <!-- 口座番号 -->
          <div class="form-group">
            <label>口座番号</label>

            <input
              v-model="newAccount.account_number"
              type="text"
            />
          </div>

          <!-- 初期残高 -->
          <div class="form-group">
            <label>初期残高</label>

            <input
              v-model.number="newAccount.balance"
              type="number"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="cancel-button"
            @click="closeAccountModal"
          >
            閉じる
          </button>

          <button
            type="button"
            class="submit-button"
            @click="createAccount"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, shallowRef, ref } from 'vue'
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewMonthGrid,
  createViewMonthAgenda,
  createViewWeek,
  createViewDay,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

const props = withDefaults(
  defineProps<{
    scope?: 'organization' | 'personal'
  }>(),
  {
    scope: 'organization'
  }
)

type Transaction = {
  id: number
  transaction_type: 'income' | 'expense'
  amount: number | string
  date: string
  category?: string
  payment_method?: string
  user_id?: number
  user_name?: string
  account_id?: number | null

  account?: {
    id: number
    account_number: string
    balance: number
    bank?: {
      id: number
      name: string
    }
  } | null
}

type Bank = {
  id: number
  name: string
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

const { $api } = useNuxtApp()

const calendarApp = shallowRef<any>(null)
const eventsService = createEventsServicePlugin()

const transactions = ref<Transaction[]>([])
const banks = ref<Bank[]>([])
const accounts = ref<Account[]>([])

const showModal = ref(false)
const showAccountModal = ref(false)

const editingId = ref<number | null>(null)
const isEditMode = ref(false)

const selectedAccountId = ref<number | ''>('')

const newTransaction = reactive({
  transaction_type: '',
  category: '',
  amount: 0,
  date: '',
  payment_method: '',
})

const newAccount = reactive({
  bank_id: '',
  account_number: '',
  balance: 0,
})

const makeCalendarEvents = (transactionList: Transaction[]) => {
  return transactionList.map((transaction) => ({
    id: transaction.id,
    title: `${
      transaction.transaction_type === 'income' ? '+' : '-'
    }${Number(transaction.amount).toLocaleString()}円`,
    start: Temporal.PlainDate.from(transaction.date),
    end: Temporal.PlainDate.from(transaction.date),
  }))
}

const fetchTransactions = async () => {
  try {
    const response = await $api.get('/transactions', {
      params: {
        transaction_scope: props.scope
      }
    })

    transactions.value = response.data || []

    return makeCalendarEvents(transactions.value)
  } catch (error) {
    console.error('取引データの取得に失敗しました:', error)
    return []
  }
}

const fetchBanks = async () => {
  const res = await $api.get<Bank[]>('/banks')
  banks.value = res.data
}

const fetchAccounts = async () => {
  const res = await $api.get<Account[]>('/accounts')

  accounts.value = res.data

  if (
    accounts.value.length > 0 &&
    selectedAccountId.value === ''
  ) {
    selectedAccountId.value = accounts.value[0].id
  }
}

const resetForm = () => {
  editingId.value = null
  isEditMode.value = true

  newTransaction.transaction_type = ''
  newTransaction.category = ''
  newTransaction.amount = 0
  newTransaction.date = ''
  newTransaction.payment_method = ''

  selectedAccountId.value = ''
}

const openModalForDate = (date: Temporal.PlainDate) => {
  resetForm()

  newTransaction.date = date.toString()

  showModal.value = true
}

const openModalForEvent = (event: any) => {
  const transaction = transactions.value.find(
    (item) => Number(item.id) === Number(event.id)
  )

  if (!transaction) {
    return
  }

  editingId.value = transaction.id
  isEditMode.value = false

  newTransaction.transaction_type = transaction.transaction_type
  newTransaction.category = transaction.category ?? ''
  newTransaction.amount = Number(transaction.amount)
  newTransaction.date = transaction.date
  newTransaction.payment_method =
    transaction.payment_method ?? ''

  selectedAccountId.value =
    transaction.account_id ?? ''

  showModal.value = true
}

const startEdit = () => {
  isEditMode.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const openAccountModal = () => {
  showAccountModal.value = true
}

const closeAccountModal = () => {
  showAccountModal.value = false
}

const createAccount = async () => {
  if (!newAccount.bank_id || !newAccount.account_number) {
    alert('銀行名と口座番号を入力してください')
    return
  }

  try {
    await $api.post('/accounts', {
      account: {
        bank_id: newAccount.bank_id,
        account_number: newAccount.account_number,
        balance: Number(newAccount.balance),
      },
    })

    alert('口座登録しました')

    await fetchAccounts()

    newAccount.bank_id = ''
    newAccount.account_number = ''
    newAccount.balance = 0

    closeAccountModal()
  } catch (error) {
    console.error(error)
    alert('口座登録に失敗しました')
  }
}

const validateTransaction = () => {
  if (!newTransaction.transaction_type) {
    alert('収支種別を選択してください')
    return false
  }

  if (
    !newTransaction.amount ||
    Number(newTransaction.amount) <= 0
  ) {
    alert('金額を入力してください')
    return false
  }

  if (!newTransaction.date) {
    alert('日付を入力してください')
    return false
  }

  if (newTransaction.transaction_type === 'income') {
    newTransaction.category = '収入'
  }

  if (
    newTransaction.transaction_type === 'expense' &&
    !newTransaction.category
  ) {
    alert('カテゴリーを選択してください')
    return false
  }

  if (
    newTransaction.transaction_type === 'expense' &&
    !newTransaction.payment_method
  ) {
    alert('支払方法を選択してください')
    return false
  }

  if (
    (
      newTransaction.transaction_type === 'income' ||
      newTransaction.payment_method === '引き落とし'
    ) &&
    !selectedAccountId.value
  ) {
    alert('口座を選択してください')
    return false
  }

  return true
}

const saveTransaction = async () => {
  if (!validateTransaction()) {
    return
  }

  try {
    const payload = {
      transaction: {
        ...newTransaction,
        account_id:
          newTransaction.transaction_type === 'income' ||
          newTransaction.payment_method === '引き落とし'
            ? selectedAccountId.value
            : null,
        transaction_scope: props.scope,
      },
    }

    if (editingId.value) {
      await $api.patch(
        `/transactions/${editingId.value}`,
        payload
      )

      alert('更新しました')
    } else {
      await $api.post('/transactions', payload)

      if (
        newTransaction.transaction_type === 'income' &&
        selectedAccountId.value
      ) {
        await $api.patch(
          `/accounts/${selectedAccountId.value}/add_balance`,
          {
            amount: Number(newTransaction.amount),
          }
        )
      }

      if (
        newTransaction.transaction_type === 'expense' &&
        newTransaction.payment_method === '引き落とし' &&
        selectedAccountId.value
      ) {
        await $api.patch(
          `/accounts/${selectedAccountId.value}/subtract_balance`,
          {
            amount: Number(newTransaction.amount),
          }
        )
      }

      alert('追加しました')
    }

    await fetchTransactions()
    await fetchAccounts()

    closeModal()
  } catch (error) {
    console.error(error)

    if (editingId.value) {
      alert('更新に失敗しました')
    } else {
      alert('追加に失敗しました')
    }
  }
}

const deleteTransaction = async () => {
  if (!editingId.value) {
    return
  }

  const confirmed = confirm(
    'この記録を削除しますか？'
  )

  if (!confirmed) {
    return
  }

  try {
    await $api.delete(
      `/transactions/${editingId.value}`
    )

    alert('削除しました')

    await fetchTransactions()
    await fetchAccounts()

    closeModal()
  } catch (error) {
    console.error(error)
    alert('削除に失敗しました')
  }
}

onMounted(async () => {
  try {
    await fetchBanks()
    await fetchAccounts()

    const events = await fetchTransactions()

    calendarApp.value = createCalendar(
      {
        selectedDate: Temporal.PlainDate.from('2026-09-03'),

        locale: 'ja-JP',

        views: [
          createViewDay(),
          createViewWeek(),
          createViewMonthGrid(),
          createViewMonthAgenda(),
        ],

        defaultView: 'month-grid',

        events,

        callbacks: {
          onClickDate(date) {
            openModalForDate(date)
          },

          onEventClick(event) {
            openModalForEvent(event)
          },
        },
      },
      [eventsService],
    )
  } catch (error) {
    console.error(
      '家計簿データの取得に失敗しました:',
      error
    )
  }
})
</script>

<style scoped>
.calendar-container {
  width: 100%;
}

.sx-vue-calendar-wrapper {
  width: 100%;
  max-width: 1200px;
  height: 750px;
  max-height: 90vh;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.transaction-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ddd;
}

.cancel-button,
.submit-button,
.account-button,
.delete-button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-button {
  background: #e5e7eb;
}

.submit-button {
  background: #2563eb;
  color: white;
}

.account-button {
  margin-top: 8px;
  background: #e5e7eb;
}

.delete-button {
  margin-right: auto;
  background: #dc2626;
  color: white;
}
</style>