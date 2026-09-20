<template>
  <div
    class="time-event"
    :class="eventClass"
    @mouseenter="openUserCard"
    @mouseleave="scheduleCloseUserCard"
  >
    <div class="time-event-top">
      <span class="type-badge">
        {{ transactionTypeLabel }}
      </span>

      <span class="time-event-amount">
        {{ amountLabel }}
      </span>
    </div>

    <div class="time-event-category">
      {{ category }}
    </div>

    <div class="time-event-user">
      <span class="user-label">
        登録者
      </span>

      <div class="user-trigger">
        <span
          class="user-avatar"
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
        </span>

        <span class="user-name">
          @{{ userName }}
        </span>
      </div>
    </div>
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
                @{{ userName }}
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
  username?: string | null
  avatar_url?: string | null
  background_image_url?: string | null
}

interface CalendarEvent {
  transaction_type?: 'income' | 'expense'
  amount?: number | string
  category?: string

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

/* ========================================
 * ホバーカード表示状態
 * ======================================== */

const showUserCard =
  ref(false)

/* ========================================
 * ホバーカード位置
 * ======================================== */

const cardLeft =
  ref(0)

const cardTop =
  ref(0)

/* ========================================
 * 閉じるタイマー
 * ======================================== */

let closeTimer:
  ReturnType<typeof setTimeout> | null = null

/* ========================================
 * 取引表示
 * ======================================== */

const eventClass =
  computed(() => {
    return props.calendarEvent.transaction_type ===
      'income'
      ? 'income'
      : 'expense'
  })

const transactionTypeLabel =
  computed(() => {
    return props.calendarEvent.transaction_type ===
      'income'
      ? '収入'
      : '支出'
  })

const amountLabel =
  computed(() => {
    const amount =
      Number(
        props.calendarEvent.amount ??
        0
      )

    return `${
      props.calendarEvent.transaction_type ===
      'income'
        ? '+'
        : '-'
    }${amount.toLocaleString('ja-JP')}円`
  })

const category =
  computed(() => {
    return (
      props.calendarEvent.category ||
      '未分類'
    )
  })

/* ========================================
 * ユーザー名
 * ======================================== */

const userName =
  computed(() => {
    return (
      props.calendarEvent.user?.username ??
      props.calendarEvent.user_name ??
      '不明'
    )
  })

/* ========================================
 * 表示名
 *
 * User.name は存在しないため、
 * user_display_name がなければ
 * username を使用する。
 * ======================================== */

const userDisplayName =
  computed(() => {
    return (
      props.calendarEvent.user_display_name ??
      userName.value
    )
  })

/* ========================================
 * アイコンURL
 *
 * Rails:
 * user.avatar_url
 *
 * 互換:
 * user_icon_url
 * ======================================== */

const userIconUrl =
  computed(() => {
    return (
      props.calendarEvent.user?.avatar_url ??
      props.calendarEvent.user_icon_url ??
      null
    )
  })

/* ========================================
 * 背景画像URL
 *
 * Rails:
 * user.background_image_url
 *
 * 互換:
 * user_background_url
 * ======================================== */

const userBackgroundUrl =
  computed(() => {
    return (
      props.calendarEvent.user?.background_image_url ??
      props.calendarEvent.user_background_url ??
      null
    )
  })

/* ========================================
 * 今月の収支
 * ======================================== */

const userMonthlyIncome =
  computed(() => {
    return Number(
      props.calendarEvent.user_monthly_income ??
      0
    )
  })

const userMonthlyExpense =
  computed(() => {
    return Number(
      props.calendarEvent.user_monthly_expense ??
      0
    )
  })

const userMonthlyBalance =
  computed(() => {
    return Number(
      props.calendarEvent.user_monthly_balance ??
      (
        userMonthlyIncome.value -
        userMonthlyExpense.value
      )
    )
  })

/* ========================================
 * アイコン表示
 * ======================================== */

const userAvatarStyle =
  computed(() => {
    if (
      !userIconUrl.value
    ) {
      return {
        background:
          '#eaf8fb'
      }
    }

    return {
      backgroundImage:
        `url("${userIconUrl.value}")`,

      backgroundPosition:
        'center',

      backgroundSize:
        'cover',

      backgroundRepeat:
        'no-repeat'
    }
  })

/* ========================================
 * 背景画像表示
 * ======================================== */

const userBackgroundStyle =
  computed(() => {
    if (
      !userBackgroundUrl.value
    ) {
      return {
        background:
          'linear-gradient(135deg, #dff6fb, #eef8fa)'
      }
    }

    return {
      backgroundImage:
        `url("${userBackgroundUrl.value}")`,

      backgroundPosition:
        'center',

      backgroundSize:
        'cover',

      backgroundRepeat:
        'no-repeat'
    }
  })

/* ========================================
 * ホバーカード位置
 * ======================================== */

const userCardStyle =
  computed(() => {
    return {
      left:
        `${cardLeft.value}px`,

      top:
        `${cardTop.value}px`
    }
  })

/* ========================================
 * 金額フォーマット
 * ======================================== */

const formatAmount =
  (value: number) => {
    return Math.abs(
      Number(value || 0)
    ).toLocaleString(
      'ja-JP'
    )
  }

/* ========================================
 * ホバーカードを開く
 *
 * イベント全体のmouseenterから呼ばれる。
 * ======================================== */

const openUserCard =
  (event: MouseEvent) => {
    cancelCloseUserCard()

    const cardWidth =
      270

    const cardHeight =
      260

    const gap =
      14

    let left =
      event.clientX + gap

    let top =
      event.clientY + gap

    /*
     * 右端からはみ出す場合
     */
    if (
      left + cardWidth >
      window.innerWidth - 12
    ) {
      left =
        event.clientX -
        cardWidth -
        gap
    }

    /*
     * 下端からはみ出す場合
     */
    if (
      top + cardHeight >
      window.innerHeight - 12
    ) {
      top =
        window.innerHeight -
        cardHeight -
        12
    }

    /*
     * 上端からはみ出す場合
     */
    if (
      top < 12
    ) {
      top =
        12
    }

    cardLeft.value =
      left

    cardTop.value =
      top

    showUserCard.value =
      true
  }

/* ========================================
 * ホバーカードを閉じる予約
 * ======================================== */

const scheduleCloseUserCard =
  () => {
    cancelCloseUserCard()

    closeTimer =
      setTimeout(() => {
        showUserCard.value =
          false
      }, 180)
  }

/* ========================================
 * 閉じる予約をキャンセル
 * ======================================== */

const cancelCloseUserCard =
  () => {
    if (
      !closeTimer
    ) {
      return
    }

    clearTimeout(
      closeTimer
    )

    closeTimer =
      null
  }

/* ========================================
 * アンマウント時
 * ======================================== */

onBeforeUnmount(() => {
  cancelCloseUserCard()
})
</script>

<style scoped>
.time-event {
  width: 100%;
  height: 100%;
  min-height: 50px;
  padding: 6px 9px;
  overflow: hidden;
  border-left: 7px solid;
  border-radius: 6px;
  box-sizing: border-box;
  box-shadow:
    0 2px 7px rgba(23, 49, 61, 0.1);

  /*
   * カード全体をホバー対象にするため、
   * cursorもイベント全体に設定。
   */
  cursor: default;
}

.time-event.income {
  border-color: #31b985;
  background: #effbf6;
}

.time-event.expense {
  border-color: #e56557;
  background: #fff2f0;
}

.time-event-top {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.type-badge {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 900;
  line-height: 1.2;
}

.time-event.income .type-badge {
  color: #ffffff;
  background: #31b985;
}

.time-event.expense .type-badge {
  color: #ffffff;
  background: #e56557;
}

.time-event-amount {
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}

.time-event.income .time-event-amount {
  color: #24966f;
}

.time-event.expense .time-event-amount {
  color: #d14f42;
}

.time-event-category {
  margin-top: 4px;
  overflow: hidden;
  color: #45636f;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.time-event-user {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  overflow: visible;
  line-height: 1.2;
}

.user-label {
  flex-shrink: 0;
  color: #8ea5ae;
  font-size: 8px;
  font-weight: 800;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  cursor: pointer;
}

.user-avatar {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid #b9dce5;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #eaf8fb;
  box-shadow:
    0 2px 6px rgba(23, 49, 61, 0.12);
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #22a5c5;
  font-size: 8px;
  font-weight: 900;
}

.user-name {
  min-width: 0;
  overflow: hidden;
  color: #607b85;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-trigger:hover .user-name {
  color: #1599bd;
}

.user-trigger:hover .user-avatar {
  border-color: #22b8df;
  box-shadow:
    0 0 0 3px rgba(34, 184, 223, 0.1),
    0 3px 8px rgba(23, 49, 61, 0.15);
}

.user-hover-card {
  position: fixed;
  z-index: 999999;
  width: 270px;
  overflow: hidden;
  border: 1px solid #c6dfe6;
  border-radius: 15px;
  background: #ffffff;
  box-shadow:
    0 22px 50px rgba(23, 49, 61, 0.2),
    0 5px 15px rgba(23, 49, 61, 0.1);
  pointer-events: auto;
}

.user-card-cover {
  position: relative;
  height: 82px;
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
  padding: 0 15px 15px;
}

.user-card-profile {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: -27px;
}

.user-card-avatar {
  position: relative;
  width: 54px;
  height: 54px;
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
  font-size: 13px;
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
  padding-top: 22px;
}

.user-card-name-area strong {
  display: block;
  overflow: hidden;
  color: #244854;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-name-area span {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #8ba0a8;
  font-size: 9px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-divider {
  height: 1px;
  margin: 13px 0 11px;
  background: #e3eef1;
}

.user-card-period {
  margin-bottom: 8px;
  color: #9aadb4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.15em;
}

.user-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.user-card-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 8px 9px;
  border-radius: 8px;
  background: #f7fbfc;
}

.user-card-stat span {
  color: #94a9b1;
  font-size: 8px;
  font-weight: 700;
}

.user-card-stat strong {
  overflow: hidden;
  font-size: 10px;
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
    width: 240px;
  }
}
</style>