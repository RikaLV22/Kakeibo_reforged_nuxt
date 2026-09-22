<template>
  <div class="calendar-container">
    <MaintenanceCard
      v-if="!calendarEnabled"
      code="CALENDAR MAINTENANCE"
      description="現在カレンダー機能をメンテナンスしています。"
      min-height="750px"
    />

    <ScheduleXCalendar
      v-else-if="calendarApp"
      :calendar-app="calendarApp"
      :custom-components="customComponents"
    />

    <CalendarTransactionModal
      v-model="showModal"
      :editing-id="editingId"
      :is-edit-mode="isEditMode"
      :transaction="selectedTransaction"
      :selected-date="selectedDate"
      :accounts="accounts"
      @start-edit="startEdit"
      @save="saveTransaction"
      @delete="deleteTransaction"
      @open-account="openAccountModal"
    />

    <CalendarAccountModal
      v-model="showAccountModal"
      :banks="banks"
      @create="createAccount"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'

import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'

import TransactionMonthGridEvent from '~/components/TransactionMonthGridEvent.vue'
import TransactionTimeGridEvent from '~/components/TransactionTimeGridEvent.vue'
import CalendarTransactionModal from '~/components/CalendarTransactionModal.vue'
import CalendarAccountModal from '~/components/CalendarAccountModal.vue'

const props = withDefaults(
  defineProps<{
    apiBasePath?: string
    accountApiBasePath?: string
    transactionScope?: 'organization' | 'personal'
  }>(),
  {
    apiBasePath: '/organization_transactions',
    accountApiBasePath: '/organization_accounts',
    transactionScope: 'organization'
  }
)

type TransactionUser = {
  id: number
  public_id?: string | null
  username: string
  name?: string | null
  icon_image_url?: string | null
  background_image_url?: string | null
  icon_image?: string | null
  background_image?: string | null
}

type Transaction = {
  id: number
  transaction_type: 'income' | 'expense'
  amount: number | string
  date: string
  created_at: string
  category?: string
  payment_method?: string
  user_id?: number
  user_name?: string
  user_display_name?: string | null
  user_icon_url?: string | null
  user_background_url?: string | null
  user_monthly_income?: number
  user_monthly_expense?: number
  user_monthly_balance?: number
  user?: TransactionUser
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

type TransactionFormPayload = {
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  payment_method: string
  account_id: number | null
}

interface MaintenanceResponse {
  calendar_enabled: boolean
}

interface MaintenanceUpdate {
  type: string
  maintenance?: {
    features?: {
      calendar?: boolean
    }
  }
}

interface TransactionUpdate {
  type:
    | 'transaction_created'
    | 'transaction_updated'
    | 'transaction_deleted'
  transaction?: Transaction
  transaction_id?: number
}

const { $api, $cable } = useNuxtApp()

const calendarApp = shallowRef<any>(null)
const eventsService = createEventsServicePlugin()

const customComponents = {
  timeGridEvent: TransactionTimeGridEvent,
  monthGridEvent: TransactionMonthGridEvent
}

const transactions = ref<Transaction[]>([])
const banks = ref<Bank[]>([])
const accounts = ref<Account[]>([])

const showModal = ref(false)
const showAccountModal = ref(false)

const editingId = ref<number | null>(null)
const isEditMode = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const selectedDate = ref('')

const calendarEnabled = ref(true)

let maintenanceSubscription: any = null
let transactionSubscription: any = null

const getSelectedOrganizationId = () => {
  if (!import.meta.client) {
    return null
  }

  const value = localStorage.getItem('selectedOrganizationId')

  if (!value) {
    return null
  }

  const id = Number(value)

  return Number.isFinite(id) ? id : null
}

const currentMonthKey = computed(() => {
  return Temporal.Now
    .plainDateISO('Asia/Tokyo')
    .toString()
    .slice(0, 7)
})

const userMonthlySummary = computed(() => {
  const summary = new Map<
    number,
    {
      income: number
      expense: number
      balance: number
    }
  >()

  for (const transaction of transactions.value) {
    const userId = Number(
      transaction.user_id ??
      transaction.user?.id
    )

    if (!Number.isFinite(userId)) {
      continue
    }

    if (
      !transaction.date.startsWith(
        currentMonthKey.value
      )
    ) {
      continue
    }

    const current =
      summary.get(userId) ?? {
        income: 0,
        expense: 0,
        balance: 0
      }

    const amount = Number(
      transaction.amount ?? 0
    )

    if (
      transaction.transaction_type ===
      'income'
    ) {
      current.income += amount
    }

    if (
      transaction.transaction_type ===
      'expense'
    ) {
      current.expense += amount
    }

    current.balance =
      current.income -
      current.expense

    summary.set(
      userId,
      current
    )
  }

  return summary
})

const getUserName = (
  transaction: Transaction
) => {
  return (
    transaction.user_name ??
    transaction.user?.username ??
    `ユーザー${transaction.user_id ?? ''}`
  )
}

const getUserDisplayName = (
  transaction: Transaction
) => {
  return (
    transaction.user_display_name ??
    transaction.user?.name ??
    getUserName(transaction)
  )
}

const getUserIconUrl = (
  transaction: Transaction
) => {
  return (
    transaction.user_icon_url ??
    transaction.user?.icon_image_url ??
    transaction.user?.icon_image ??
    null
  )
}

const getUserBackgroundUrl = (
  transaction: Transaction
) => {
  return (
    transaction.user_background_url ??
    transaction.user?.background_image_url ??
    transaction.user?.background_image ??
    null
  )
}

const fetchCalendarMaintenance = async () => {
  try {
    const response =
      await $api.get<MaintenanceResponse>(
        '/maintenance/status'
      )

    calendarEnabled.value =
      response.data.calendar_enabled
  } catch (error) {
    console.error(
      'カレンダー状態の取得に失敗しました:',
      error
    )
  }
}

const applyCalendarEnabled = (
  enabled: boolean
) => {
  calendarEnabled.value = enabled

  if (!enabled) {
    showModal.value = false
    showAccountModal.value = false
    calendarApp.value = null
  }
}

const connectMaintenanceChannel = () => {
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
            '=== MAINTENANCE CHANNEL CONNECTED ==='
          )
        },
        disconnected() {
          console.log(
            '=== MAINTENANCE CHANNEL DISCONNECTED ==='
          )
        },
        rejected() {
          console.log(
            '=== MAINTENANCE CHANNEL REJECTED ==='
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

          const enabled =
            data.maintenance
              ?.features
              ?.calendar

          if (
            typeof enabled !==
            'boolean'
          ) {
            return
          }

          applyCalendarEnabled(
            enabled
          )
        }
      }
    )
}

const connectTransactionChannel = () => {
  if (!$cable) {
    return
  }

  const channelName =
    props.transactionScope ===
    'personal'
      ? 'PersonalTransactionChannel'
      : 'OrganizationTransactionChannel'

  transactionSubscription =
    $cable.subscriptions.create(
      {
        channel: channelName
      },
      {
        connected() {
          console.log(
            '=== TRANSACTION CHANNEL CONNECTED ===',
            channelName
          )
        },
        disconnected() {
          console.log(
            '=== TRANSACTION CHANNEL DISCONNECTED ===',
            channelName
          )
        },
        rejected() {
          console.log(
            '=== TRANSACTION CHANNEL REJECTED ===',
            channelName
          )
        },
        received(
          data: TransactionUpdate
        ) {
          if (
            data?.type ===
            'transaction_created'
          ) {
            const transaction =
              data.transaction

            if (!transaction) {
              return
            }

            const alreadyExists =
              transactions.value.some(
                item =>
                  Number(item.id) ===
                  Number(
                    transaction.id
                  )
              )

            if (
              alreadyExists
            ) {
              return
            }

            transactions.value.push(
              transaction
            )

            refreshCalendarEvents()

            return
          }

          if (
            data?.type ===
            'transaction_updated'
          ) {
            const transaction =
              data.transaction

            if (!transaction) {
              return
            }

            const index =
              transactions.value.findIndex(
                item =>
                  Number(item.id) ===
                  Number(
                    transaction.id
                  )
              )

            if (index === -1) {
              transactions.value.push(
                transaction
              )
            } else {
              transactions.value[index] =
                transaction
            }

            refreshCalendarEvents()

            return
          }

          if (
            data?.type ===
            'transaction_deleted'
          ) {
            const transactionId =
              data.transaction_id

            if (
              transactionId ===
              undefined
            ) {
              return
            }

            transactions.value =
              transactions.value.filter(
                item =>
                  Number(item.id) !==
                  Number(
                    transactionId
                  )
              )

            refreshCalendarEvents()
          }
        }
      }
    )
}

const makeCalendarEvents = (
  transactionList: Transaction[]
) => {
  return transactionList
    .filter(transaction =>
      Boolean(
        transaction.created_at
      )
    )
    .map(transaction => {
      const createdAt =
        Temporal.Instant
          .from(
            transaction.created_at
          )
          .toZonedDateTimeISO(
            'Asia/Tokyo'
          )

      const transactionDate =
        Temporal.PlainDate.from(
          transaction.date
        )

      const start =
        Temporal.PlainDateTime
          .from({
            year:
              transactionDate.year,
            month:
              transactionDate.month,
            day:
              transactionDate.day,
            hour:
              createdAt.hour,
            minute:
              createdAt.minute,
            second:
              createdAt.second
          })
          .toZonedDateTime(
            'Asia/Tokyo'
          )

      const end =
        start.add({
          minutes: 15
        })

      const userId = Number(
        transaction.user_id ??
        transaction.user?.id
      )

      const userName =
        getUserName(
          transaction
        )

      const userDisplayName =
        getUserDisplayName(
          transaction
        )

      const userIconUrl =
        getUserIconUrl(
          transaction
        )

      const userBackgroundUrl =
        getUserBackgroundUrl(
          transaction
        )

      const userSummary =
        Number.isFinite(userId)
          ? userMonthlySummary.value.get(
              userId
            )
          : undefined

      const monthlyIncome =
        userSummary?.income ?? 0

      const monthlyExpense =
        userSummary?.expense ?? 0

      const monthlyBalance =
        userSummary?.balance ??
        (
          monthlyIncome -
          monthlyExpense
        )

      return {
        id: transaction.id,
        title: `${
          transaction.transaction_type ===
          'income'
            ? '+'
            : '-'
        }${Number(
          transaction.amount
        ).toLocaleString()}円 @${userName}`,
        start,
        end,
        transaction_type:
          transaction.transaction_type,
        amount:
          transaction.amount,
        date:
          transaction.date,
        category:
          transaction.category,
        payment_method:
          transaction.payment_method,
        account_id:
          transaction.account_id,
        user_id:
          userId,
        user_name:
          userName,
        user_display_name:
          userDisplayName,
        user_icon_url:
          userIconUrl,
        user_background_url:
          userBackgroundUrl,
        user_monthly_income:
          monthlyIncome,
        user_monthly_expense:
          monthlyExpense,
        user_monthly_balance:
          monthlyBalance,
        user: transaction.user,
        created_at:
          transaction.created_at
      }
    })
}

const refreshCalendarEvents = () => {
  if (!calendarApp.value) {
    return
  }

  for (
    const transaction of
    transactions.value
  ) {
    const transactionId =
      Number(transaction.id)

    const existingEvent =
      eventsService.get(
        transactionId
      )

    if (existingEvent) {
      eventsService.remove(
        transactionId
      )
    }
  }

  const events =
    makeCalendarEvents(
      transactions.value
    )

  for (
    const event of events
  ) {
    eventsService.add(event)
  }
}

const fetchTransactions = async () => {
  try {
    const response =
      await $api.get<Transaction[]>(
        props.apiBasePath,
        {
          params: {
            organization_id:
              getSelectedOrganizationId()
          }
        }
      )

    transactions.value =
      response.data || []

    const events =
      makeCalendarEvents(
        transactions.value
      )

    if (calendarApp.value) {
      refreshCalendarEvents()
    }

    return events
  } catch (error) {
    console.error(
      '取引データの取得に失敗しました:',
      error
    )

    transactions.value = []

    if (calendarApp.value) {
      refreshCalendarEvents()
    }

    return []
  }
}

const fetchBanks = async () => {
  try {
    const response =
      await $api.get<Bank[]>(
        '/banks'
      )

    banks.value =
      response.data || []
  } catch (error) {
    console.error(
      '銀行データの取得に失敗しました:',
      error
    )

    banks.value = []
  }
}

const fetchAccounts = async () => {
  try {
    const response =
      await $api.get<Account[]>(
        props.accountApiBasePath,
        {
          params: {
            organization_id:
              getSelectedOrganizationId()
          }
        }
      )

    accounts.value =
      response.data || []
  } catch (error) {
    console.error(
      '口座データの取得に失敗しました:',
      error
    )

    accounts.value = []
  }
}

const openModalForDate = (
  date: Temporal.PlainDate
) => {
  if (!calendarEnabled.value) {
    return
  }

  editingId.value = null
  isEditMode.value = true
  selectedTransaction.value = null
  selectedDate.value =
    date.toString()
  showModal.value = true
}

const openModalForEvent = (
  event: any
) => {
  if (!calendarEnabled.value) {
    return
  }

  const transaction =
    transactions.value.find(
      item =>
        Number(item.id) ===
        Number(event.id)
    )

  if (!transaction) {
    return
  }

  const userId = Number(
    transaction.user_id ??
    transaction.user?.id
  )

  const userSummary =
    Number.isFinite(userId)
      ? userMonthlySummary.value.get(
          userId
        )
      : undefined

  const monthlyIncome =
    userSummary?.income ?? 0

  const monthlyExpense =
    userSummary?.expense ?? 0

  const monthlyBalance =
    userSummary?.balance ??
    (
      monthlyIncome -
      monthlyExpense
    )

  selectedTransaction.value = {
    ...transaction,
    user_monthly_income:
      monthlyIncome,
    user_monthly_expense:
      monthlyExpense,
    user_monthly_balance:
      monthlyBalance
  }

  editingId.value =
    transaction.id
  isEditMode.value = false
  selectedDate.value =
    transaction.date
  showModal.value = true
}

const startEdit = () => {
  if (!calendarEnabled.value) {
    return
  }

  isEditMode.value = true
}

const closeTransactionModal = () => {
  showModal.value = false
}

watch(
  showModal,
  visible => {
    if (!visible) {
      editingId.value = null
      isEditMode.value = false
      selectedTransaction.value =
        null
      selectedDate.value = ''
    }
  }
)

const openAccountModal = () => {
  if (!calendarEnabled.value) {
    return
  }

  showAccountModal.value = true
}

const closeAccountModal = () => {
  showAccountModal.value = false
}

const createAccount =
  async (
    accountData: {
      bank_id: string
      account_number: string
      balance: number
    }
  ) => {
    if (!calendarEnabled.value) {
      return
    }

    try {
      await $api.post(
        props.accountApiBasePath,
        {
          account: {
            bank_id:
              accountData.bank_id,
            account_number:
              accountData.account_number,
            balance:
              Number(
                accountData.balance
              )
          }
        },
        {
          params: {
            organization_id:
              getSelectedOrganizationId()
          }
        }
      )

      alert('口座登録しました')

      await fetchAccounts()

      closeAccountModal()
    } catch (error) {
      console.error(error)
      alert(
        '口座登録に失敗しました'
      )
    }
  }

const saveTransaction =
  async (
    formData: TransactionFormPayload
  ) => {
    if (!calendarEnabled.value) {
      return
    }

    try {
      const payload = {
        transaction: {
          transaction_type:
            formData.transaction_type,
          category:
            formData.category,
          amount:
            Number(
              formData.amount
            ),
          date:
            formData.date,
          payment_method:
            formData.payment_method,
          account_id:
            formData.account_id
        }
      }

      const requestParams = {
        organization_id:
          getSelectedOrganizationId()
      }

      if (editingId.value) {
        await $api.patch(
          `${props.apiBasePath}/${editingId.value}`,
          payload,
          {
            params:
              requestParams
          }
        )

        alert('更新しました')
      } else {
        await $api.post(
          props.apiBasePath,
          payload,
          {
            params:
              requestParams
          }
        )

        alert('追加しました')
      }

      await fetchTransactions()
      await fetchAccounts()

      closeTransactionModal()
    } catch (error) {
      console.error(error)

      alert(
        editingId.value
          ? '更新に失敗しました'
          : '追加に失敗しました'
      )
    }
  }

const deleteTransaction =
  async () => {
    if (!calendarEnabled.value) {
      return
    }

    if (!editingId.value) {
      return
    }

    if (
      !confirm(
        'この記録を削除しますか？'
      )
    ) {
      return
    }

    try {
      await $api.delete(
        `${props.apiBasePath}/${editingId.value}`,
        {
          params: {
            organization_id:
              getSelectedOrganizationId()
          }
        }
      )

      alert('削除しました')

      await fetchTransactions()
      await fetchAccounts()

      closeTransactionModal()
    } catch (error) {
      console.error(error)
      alert(
        '削除に失敗しました'
      )
    }
  }

const initializeCalendar =
  async () => {
    if (!calendarEnabled.value) {
      return
    }

    await fetchBanks()
    await fetchAccounts()

    const events =
      await fetchTransactions()

    calendarApp.value =
      createCalendar(
        {
          selectedDate:
            Temporal.PlainDate.from(
              '2026-09-20'
            ),
          locale: 'ja-JP',
          timezone:
            'Asia/Tokyo',
          views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
            createViewMonthAgenda()
          ],
          defaultView:
            'month-grid',
          weekOptions: {
            gridHeight: 2500,
            gridStep: 30,
            timeAxisFormatOptions: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }
          },
          events,
          callbacks: {
            onClickDate(date) {
              openModalForDate(
                date
              )
            },
            onEventClick(
              event
            ) {
              openModalForEvent(
                event
              )
            }
          }
        },
        [eventsService]
      )
  }

watch(
  calendarEnabled,
  async enabled => {
    if (!enabled) {
      calendarApp.value = null
      return
    }

    if (calendarApp.value) {
      return
    }

    try {
      await initializeCalendar()
    } catch (error) {
      console.error(
        'カレンダーの再初期化に失敗しました:',
        error
      )
    }
  }
)

onMounted(
  async () => {
    await fetchCalendarMaintenance()

    connectMaintenanceChannel()
    connectTransactionChannel()

    if (
      !calendarEnabled.value
    ) {
      return
    }

    try {
      await initializeCalendar()
    } catch (error) {
      console.error(
        '家計簿データの取得に失敗しました:',
        error
      )
    }
  }
)

onBeforeUnmount(() => {
  maintenanceSubscription?.unsubscribe?.()
  maintenanceSubscription = null

  transactionSubscription?.unsubscribe?.()
  transactionSubscription = null

  calendarApp.value = null
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
</style>