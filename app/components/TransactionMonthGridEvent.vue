<template>
  <div
    class="month-event"
    :class="eventClass"
    @mouseenter="openUserCard"
    @mouseleave="scheduleCloseUserCard"
  >
    <span class="type-badge">
      {{ transactionTypeLabel }}
    </span>

    <strong class="month-event-amount">
      {{ amountLabel }}
    </strong>

    <span class="month-event-category">
      {{ category }}
    </span>
  </div>

  <Teleport to="body">
    <Transition name="user-card">
      <div
        v-if="showUserCard"
        class="user-hover-card"
        :style="userCardStyle"
        @mouseenter="cancelCloseUserCard"
        @mouseleave="scheduleCloseUserCard"
      >
        <div class="user-card-header">
          このイベントの登録者
        </div>

        <div
          class="user-card-cover"
          :style="userBackgroundStyle"
        >
          <div class="user-card-cover-overlay"></div>
        </div>

        <div class="user-card-content">
          <div class="user-card-profile">
            <div
              class="user-card-avatar"
              :style="userAvatarStyle"
            >
              <img
                v-if="userIconUrl"
                :src="userIconUrl"
                :alt="userName"
              >

              <span v-else>
                @
              </span>
            </div>

            <div class="user-card-name-area">
              <strong>
                {{ userDisplayName }}
              </strong>

              <span>
                UserID:{{ userPublicId }}
              </span>
            </div>
          </div>

          <div class="user-card-divider"></div>

          <div class="user-card-period">
            THIS MONTH
          </div>

          <div class="user-card-stats">
            <div class="user-card-stat">
              <span>
                収入
              </span>

              <strong class="income">
                +{{ formatAmount(userMonthlyIncome) }}円
              </strong>
            </div>

            <div class="user-card-stat">
              <span>
                支出
              </span>

              <strong class="expense">
                -{{ formatAmount(userMonthlyExpense) }}円
              </strong>
            </div>

            <div class="user-card-stat user-card-balance">
              <span>
                今月の収支
              </span>

              <strong
                :class="
                  userMonthlyBalance >= 0
                    ? 'balance-positive'
                    : 'balance-negative'
                "
              >
                {{ userMonthlyBalance >= 0 ? '+' : '-' }}
                {{ formatAmount(userMonthlyBalance) }}円
              </strong>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref
} from 'vue'

interface CalendarUser {
  id?: number
  public_id?: string | null
  username?: string | null
  avatar_url?: string | null
  background_image_url?: string | null
}

interface CalendarEvent {
  transaction_type?: 'income' | 'expense'
  amount?: number | string
  category?: string | null
  user_name?: string | null
  user_display_name?: string | null
  user_icon_url?: string | null
  user_background_url?: string | null
  user_monthly_income?: number
  user_monthly_expense?: number
  user_monthly_balance?: number
  user?: CalendarUser | null
}

const props = defineProps<{
  calendarEvent: CalendarEvent
}>()

const showUserCard = ref(false)
const cardLeft = ref(0)
const cardTop = ref(0)

let closeTimer: ReturnType<typeof setTimeout> | null = null

const eventClass = computed(() => {
  return props.calendarEvent.transaction_type === 'income'
    ? 'income'
    : 'expense'
})

const transactionTypeLabel = computed(() => {
  return props.calendarEvent.transaction_type === 'income'
    ? '収入'
    : '支出'
})

const amountLabel = computed(() => {
  const amount = Number(
    props.calendarEvent.amount ?? 0
  )

  return `${
    props.calendarEvent.transaction_type === 'income'
      ? '+'
      : '-'
  }${amount.toLocaleString('ja-JP')}円`
})

const category = computed(() => {
  return props.calendarEvent.category || '未分類'
})

const userName = computed(() => {
  return (
    props.calendarEvent.user?.username ??
    props.calendarEvent.user_name ??
    '不明'
  )
})

const userDisplayName = computed(() => {
  return (
    props.calendarEvent.user_display_name ??
    userName.value
  )
})

const userPublicId = computed(() => {
  return (
    props.calendarEvent.user?.public_id ??
    '不明'
  )
})

const userIconUrl = computed(() => {
  return (
    props.calendarEvent.user?.avatar_url ??
    props.calendarEvent.user_icon_url ??
    null
  )
})

const userBackgroundUrl = computed(() => {
  return (
    props.calendarEvent.user?.background_image_url ??
    props.calendarEvent.user_background_url ??
    null
  )
})

const userMonthlyIncome = computed(() => {
  return Number(
    props.calendarEvent.user_monthly_income ?? 0
  )
})

const userMonthlyExpense = computed(() => {
  return Number(
    props.calendarEvent.user_monthly_expense ?? 0
  )
})

const userMonthlyBalance = computed(() => {
  return Number(
    props.calendarEvent.user_monthly_balance ??
    (
      userMonthlyIncome.value -
      userMonthlyExpense.value
    )
  )
})

const userAvatarStyle = computed(() => {
  if (!userIconUrl.value) {
    return {
      background: '#eaf8fb'
    }
  }

  return {
    backgroundImage:
      `url("${userIconUrl.value}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
})

const userBackgroundStyle = computed(() => {
  if (!userBackgroundUrl.value) {
    return {
      background:
        'linear-gradient(135deg, #dff6fb, #eef8fa)'
    }
  }

  return {
    backgroundImage:
      `url("${userBackgroundUrl.value}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
})

const userCardStyle = computed(() => {
  return {
    left: `${cardLeft.value}px`,
    top: `${cardTop.value}px`
  }
})

const formatAmount = (value: number) => {
  return Math.abs(
    Number(value || 0)
  ).toLocaleString('ja-JP')
}

const openUserCard = (
  event: MouseEvent
) => {
  cancelCloseUserCard()

  const cardWidth = 330
  const cardHeight = 320
  const gap = 14

  let left = event.clientX + gap
  let top = event.clientY + gap

  if (
    left + cardWidth >
    window.innerWidth - 12
  ) {
    left =
      event.clientX -
      cardWidth -
      gap
  }

  if (
    top + cardHeight >
    window.innerHeight - 12
  ) {
    top =
      window.innerHeight -
      cardHeight -
      12
  }

  if (top < 12) {
    top = 12
  }

  cardLeft.value = left
  cardTop.value = top
  showUserCard.value = true
}

const scheduleCloseUserCard = () => {
  cancelCloseUserCard()

  closeTimer =
    setTimeout(() => {
      showUserCard.value = false
    }, 180)
}

const cancelCloseUserCard = () => {
  if (!closeTimer) {
    return
  }

  clearTimeout(closeTimer)
  closeTimer = null
}

onBeforeUnmount(() => {
  cancelCloseUserCard()
})
</script>

<style scoped>
.month-event {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 4px 6px;
  overflow: hidden;
  border-left: 6px solid;
  border-radius: 5px;
  box-sizing: border-box;
  cursor: default;
}

.month-event.income {
  border-color: #31b985;
  background: #effbf6;
}

.month-event.expense {
  border-color: #e56557;
  background: #fff2f0;
}

.type-badge {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  line-height: 1.2;
}

.month-event.income .type-badge {
  background: #31b985;
}

.month-event.expense .type-badge {
  background: #e56557;
}

.month-event-amount {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.month-event.income .month-event-amount {
  color: #24966f;
}

.month-event.expense .month-event-amount {
  color: #d14f42;
}

.month-event-category {
  min-width: 0;
  overflow: hidden;
  color: #536f7a;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-hover-card {
  position: fixed;
  z-index: 999999;
  width: 330px;
  overflow: hidden;
  border: 1px solid #c6dfe6;
  border-radius: 15px;
  background: #ffffff;
  box-shadow:
    0 22px 50px rgba(23, 49, 61, 0.2),
    0 5px 15px rgba(23, 49, 61, 0.1);
  pointer-events: auto;
}

.user-card-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e3eef1;
  background: #ffffff;
  color: #607b85;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.user-card-cover {
  position: relative;
  height: 96px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.user-card-cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(23, 49, 61, 0.02),
      rgba(23, 49, 61, 0.18)
    );
}

.user-card-content {
  position: relative;
  padding: 0 18px 18px;
}

.user-card-profile {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: -31px;
}

.user-card-avatar {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 3px solid #ffffff;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #eaf8fb;
  color: #22a5c5;
  font-size: 14px;
  font-weight: 900;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(23, 49, 61, 0.16);
}

.user-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card-name-area {
  min-width: 0;
  padding-top: 33px;
}

.user-card-name-area strong {
  display: block;
  overflow: hidden;
  color: #244854;
  font-size: 16px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-name-area span {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #8ba0a8;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-divider {
  height: 1px;
  margin: 15px 0 12px;
  background: #e3eef1;
}

.user-card-period {
  margin-bottom: 9px;
  color: #9aadb4;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.15em;
}

.user-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.user-card-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 10px 11px;
  border-radius: 9px;
  background: #f7fbfc;
}

.user-card-stat span {
  color: #94a9b1;
  font-size: 9px;
  font-weight: 700;
}

.user-card-stat strong {
  overflow: hidden;
  font-size: 11px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-stat strong.income {
  color: #299f77;
}

.user-card-stat strong.expense {
  color: #d45d50;
}

.user-card-balance {
  grid-column: 1 / -1;
}

.balance-positive {
  color: #299f77;
}

.balance-negative {
  color: #d45d50;
}

.user-card-enter-active,
.user-card-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.user-card-enter-from,
.user-card-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}

@media (max-width: 700px) {
  .user-hover-card {
    width: 280px;
  }
}
</style>