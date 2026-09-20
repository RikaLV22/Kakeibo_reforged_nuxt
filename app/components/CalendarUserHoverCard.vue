<template>
  <div
    class="user-hover-wrapper"
    @mouseenter="showCard"
    @mouseleave="hideCard"
  >
    <span class="user-chip">
      <span
        class="user-chip-avatar"
        :style="avatarStyle"
      >
        <span v-if="!userIconUrl" class="avatar-fallback">
          @
        </span>
      </span>

      <span class="user-chip-name">
        @{{ userName }}
      </span>
    </span>

    <Teleport to="body">
      <Transition name="user-card">
        <div
          v-if="isVisible"
          class="calendar-user-card"
          :style="cardStyle"
          @mouseenter="cancelHide"
          @mouseleave="hideCard"
        >
          <div
            class="user-card-cover"
            :style="coverStyle"
          ></div>

          <div class="user-card-body">
            <div class="user-card-avatar">
              <img
                v-if="userIconUrl"
                :src="userIconUrl"
                :alt="userName"
              >

              <span v-else>
                @
              </span>
            </div>

            <div class="user-card-main">
              <strong class="user-card-name">
                {{ displayName }}
              </strong>

              <span class="user-card-username">
                @{{ userName }}
              </span>
            </div>

            <div class="user-card-divider"></div>

            <div class="user-card-section-label">
              THIS MONTH
            </div>

            <div class="user-monthly-stats">
              <div class="monthly-stat">
                <span class="monthly-stat-label">
                  収入
                </span>

                <strong class="income">
                  +{{ formatAmount(monthlyIncome) }}円
                </strong>
              </div>

              <div class="monthly-stat">
                <span class="monthly-stat-label">
                  支出
                </span>

                <strong class="expense">
                  -{{ formatAmount(monthlyExpense) }}円
                </strong>
              </div>

              <div class="monthly-stat monthly-stat-balance">
                <span class="monthly-stat-label">
                  収支
                </span>

                <strong
                  :class="
                    monthlyBalance >= 0
                      ? 'balance-positive'
                      : 'balance-negative'
                  "
                >
                  {{ monthlyBalance >= 0 ? '+' : '' }}
                  {{ formatAmount(monthlyBalance) }}円
                </strong>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref
} from 'vue'

const props = defineProps<{
  userName: string
  displayName?: string | null
  userIconUrl?: string | null
  userBackgroundUrl?: string | null
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
}>()

const isVisible = ref(false)
const cardX = ref(0)
const cardY = ref(0)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const formatAmount = (value: number) => {
  return Math.abs(value).toLocaleString('ja-JP')
}

const avatarStyle = computed(() => {
  if (!props.userIconUrl) {
    return {}
  }

  return {
    backgroundImage: `url("${props.userIconUrl}")`
  }
})

const coverStyle = computed(() => {
  if (!props.userBackgroundUrl) {
    return {}
  }

  return {
    backgroundImage: `url("${props.userBackgroundUrl}")`
  }
})

const cardStyle = computed(() => {
  return {
    left: `${cardX.value}px`,
    top: `${cardY.value}px`
  }
})

const showCard = (event: MouseEvent) => {
  cancelHide()

  cardX.value = event.clientX + 14
  cardY.value = event.clientY + 14
  isVisible.value = true
}

const hideCard = () => {
  cancelHide()

  hideTimer = setTimeout(() => {
    isVisible.value = false
  }, 120)
}

const cancelHide = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

onBeforeUnmount(() => {
  cancelHide()
})
</script>

<style scoped>
.user-hover-wrapper {
  display: inline-flex;
  min-width: 0;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  cursor: pointer;
}

.user-chip-avatar {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1px solid #b9dce5;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  background-color: #eaf8fb;
  box-shadow: 0 2px 6px rgba(23, 49, 61, 0.12);
  overflow: hidden;
}

.avatar-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #22a5c5;
  font-size: 9px;
  font-weight: 900;
}

.user-chip-name {
  min-width: 0;
  overflow: hidden;
  color: #5f7882;
  font-size: 9px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-chip:hover .user-chip-name {
  color: #1599bd;
}

.calendar-user-card {
  position: fixed;
  z-index: 99999;
  width: 250px;
  overflow: hidden;
  border: 1px solid #c5dfe6;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 18px 45px rgba(20, 54, 67, 0.18),
    0 4px 12px rgba(20, 54, 67, 0.08);
  pointer-events: auto;
}

.user-card-cover {
  height: 78px;
  background:
    linear-gradient(
      135deg,
      #dff6fb,
      #edf7fa
    );
  background-position: center;
  background-size: cover;
}

.user-card-body {
  position: relative;
  padding: 0 15px 15px;
}

.user-card-avatar {
  position: relative;
  width: 52px;
  height: 52px;
  margin-top: -26px;
  margin-bottom: 8px;
  display: grid;
  place-items: center;
  border: 3px solid #ffffff;
  border-radius: 50%;
  background: #eaf8fb;
  color: #22a5c5;
  font-size: 14px;
  font-weight: 900;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(23, 49, 61, 0.14);
}

.user-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-card-name {
  color: #244854;
  font-size: 14px;
  font-weight: 900;
}

.user-card-username {
  color: #8aa2aa;
  font-size: 10px;
  font-weight: 700;
}

.user-card-divider {
  height: 1px;
  margin: 13px 0 11px;
  background: #e4eef1;
}

.user-card-section-label {
  margin-bottom: 8px;
  color: #9aadb4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.user-monthly-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.monthly-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 9px;
  border-radius: 8px;
  background: #f7fbfc;
}

.monthly-stat-balance {
  grid-column: 1 / -1;
}

.monthly-stat-label {
  color: #99abb2;
  font-size: 8px;
  font-weight: 700;
}

.monthly-stat strong {
  font-size: 10px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.monthly-stat strong.income {
  color: #299f77;
}

.monthly-stat strong.expense {
  color: #d45d50;
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
    opacity 0.15s ease,
    transform 0.15s ease;
}

.user-card-enter-from,
.user-card-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.97);
}
</style>