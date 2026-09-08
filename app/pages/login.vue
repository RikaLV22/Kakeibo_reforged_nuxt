<template>
  <div class="login-page">
    <div class="motion-background">
      <div class="background-card background-card-summary">
        <div class="background-card-header">
          <div>
            <h3>家計状況</h3>
            <p>これまでの総合計</p>
          </div>
        </div>

        <div class="summary-content">
          <div class="summary-block">
            <span>収入</span>
            <strong>¥203,220</strong>
          </div>

          <div class="summary-block">
            <span>支出</span>
            <strong>¥74,820</strong>
          </div>

          <div class="summary-block balance">
            <span>収支</span>
            <strong>¥128,400</strong>
          </div>
        </div>
      </div>

      <div class="background-card background-card-balance">
        <div class="background-card-header">
          <div>
            <h3>収支推移</h3>
            <p>月ごとの収入・支出・収支</p>
          </div>
        </div>

        <div class="line-chart">
          <span class="line-point point-1"></span>
          <span class="line-point point-2"></span>
          <span class="line-point point-3"></span>
          <span class="line-point point-4"></span>
          <span class="line-point point-5"></span>
          <span class="line-point point-6"></span>
          <span class="line-point point-7"></span>

          <span class="line-segment segment-1"></span>
          <span class="line-segment segment-2"></span>
          <span class="line-segment segment-3"></span>
          <span class="line-segment segment-4"></span>
          <span class="line-segment segment-5"></span>
          <span class="line-segment segment-6"></span>
        </div>
      </div>

      <div class="background-card background-card-category">
        <div class="background-card-header">
          <div>
            <h3>支出カテゴリ</h3>
            <p>カテゴリ別支出</p>
          </div>
        </div>

        <div class="category-content">
          <div class="donut-chart">
            <span></span>
          </div>

          <div class="category-list">
            <div>
              <i></i>
              <span>食費</span>
              <strong>¥24,600</strong>
            </div>

            <div>
              <i></i>
              <span>交通費</span>
              <strong>¥12,400</strong>
            </div>

            <div>
              <i></i>
              <span>日用品</span>
              <strong>¥8,820</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="background-card background-card-account">
        <div class="background-card-header">
          <div>
            <h3>口座状況</h3>
            <p>登録されている口座</p>
          </div>
        </div>

        <div class="account-list">
          <div class="account-row">
            <span class="account-icon">¥</span>

            <div>
              <strong>普通預金</strong>
              <span>メイン口座</span>
            </div>

            <b>¥542,300</b>
          </div>

          <div class="account-row">
            <span class="account-icon">¥</span>

            <div>
              <strong>貯金口座</strong>
              <span>貯蓄用</span>
            </div>

            <b>¥300,000</b>
          </div>

          <div class="account-row">
            <span class="account-icon">¥</span>

            <div>
              <strong>生活口座</strong>
              <span>日常支出</span>
            </div>

            <b>¥128,400</b>
          </div>
        </div>
      </div>

      <div class="background-card background-card-users">
        <div class="background-card-header">
          <div>
            <h3>ユーザごとの収支</h3>
            <p>メンバー別の収入・支出</p>
          </div>
        </div>

        <div class="user-chart">
          <div class="user-row">
            <span>member01</span>

            <div class="user-bars">
              <i class="income-bar bar-1"></i>
              <i class="expense-bar bar-2"></i>
            </div>
          </div>

          <div class="user-row">
            <span>member02</span>

            <div class="user-bars">
              <i class="income-bar bar-3"></i>
              <i class="expense-bar bar-4"></i>
            </div>
          </div>

          <div class="user-row">
            <span>member03</span>

            <div class="user-bars">
              <i class="income-bar bar-5"></i>
              <i class="expense-bar bar-6"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="background-card background-card-calendar">
        <div class="background-card-header">
          <div>
            <h3>家計簿カレンダー</h3>
            <p>収入と支出をカレンダーで管理</p>
          </div>
        </div>

        <div class="mini-calendar">
          <div
            v-for="day in 21"
            :key="day"
            class="calendar-day"
            :class="{
              income: [3, 8, 14, 19].includes(day),
              expense: [5, 11, 16, 20].includes(day),
              both: [9, 17].includes(day)
            }"
          >
            <span>{{ day }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="brand-mark">
          家計簿
        </div>

        <span class="login-badge">
          WELCOME BACK
        </span>

        <h1>
          おかえりなさい
        </h1>

        <p>
          アカウントにログインしてください
        </p>
      </div>

      <form
        class="login-form"
        @submit.prevent="login"
      >
        <div class="form-group">
          <label for="username">
            ユーザー名
          </label>

          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="ユーザー名を入力"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">
            パスワード
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="パスワードを入力"
            autocomplete="current-password"
            required
          />
        </div>

        <p
          v-if="error"
          class="error-message"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          class="login-button"
          :disabled="isLoading"
        >
          <span>
            {{
              isLoading
                ? 'ログイン中...'
                : 'ログイン'
            }}
          </span>

          <span
            v-if="!isLoading"
            class="button-arrow"
          >
            →
          </span>
        </button>
      </form>

      <div class="login-footer">
        <span>
          アカウントをお持ちでない方
        </span>

        <NuxtLink
          to="/usercreate"
          class="register-link"
        >
          ユーザー新規作成
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const { $api } = useNuxtApp()

const login = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const res = await $api.post(
      '/login',
      {
        username: username.value,
        password: password.value
      }
    )

    localStorage.setItem(
      'token',
      res.data.token
    )

    localStorage.setItem(
      'currentUser',
      JSON.stringify(
        res.data.user
      )
    )

    await navigateTo('/mypage')
  } catch (err: any) {
    if (err?.response?.data) {
      error.value =
        err.response.data.message ||
        err.response.data.error ||
        'ログインに失敗しました'
    } else {
      error.value =
        'ログインに失敗しました'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background: #f5f7fb;
}

.motion-background {
  position: fixed;
  inset: -60px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.background-card {
  position: absolute;
  width: 330px;
  min-height: 180px;
  padding: 18px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(233, 237, 245, 0.88);
  border-radius: 18px;
  box-shadow:
    0 6px 24px
    rgba(20, 30, 55, 0.05);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  opacity: 0.62;
}

.background-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 12px;
}

.background-card-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.background-card-header p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 10px;
  line-height: 1.5;
}

.background-card-summary {
  top: 7%;
  left: -80px;
  animation:
    card-summary 34s ease-in-out infinite;
}

.background-card-balance {
  top: 18%;
  right: -90px;
  animation:
    card-balance 38s ease-in-out infinite;
}

.background-card-category {
  bottom: 12%;
  left: -90px;
  animation:
    card-category 40s ease-in-out infinite;
}

.background-card-account {
  top: 55%;
  left: 7%;
  animation:
    card-account 42s ease-in-out infinite;
}

.background-card-users {
  bottom: 7%;
  right: -80px;
  animation:
    card-users 36s ease-in-out infinite;
}

.background-card-calendar {
  top: 45%;
  right: 4%;
  animation:
    card-calendar 44s ease-in-out infinite;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.summary-block {
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  background: #f8fafc;
}

.summary-block span {
  display: block;
  margin-bottom: 5px;
  color: #94a3b8;
  font-size: 9px;
}

.summary-block strong {
  display: block;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.summary-block.balance {
  background: #f1f5f9;
}

.line-chart {
  position: relative;
  height: 105px;
  margin-top: 4px;
}

.line-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
}

.point-1 {
  left: 3%;
  bottom: 26%;
}

.point-2 {
  left: 17%;
  bottom: 44%;
}

.point-3 {
  left: 31%;
  bottom: 32%;
}

.point-4 {
  left: 46%;
  bottom: 63%;
}

.point-5 {
  left: 61%;
  bottom: 51%;
}

.point-6 {
  left: 76%;
  bottom: 74%;
}

.point-7 {
  right: 3%;
  bottom: 60%;
}

.line-segment {
  position: absolute;
  height: 2px;
  transform-origin: left center;
  background: #94a3b8;
}

.segment-1 {
  left: 5%;
  bottom: 29%;
  width: 58px;
  transform: rotate(-12deg);
}

.segment-2 {
  left: 19%;
  bottom: 42%;
  width: 58px;
  transform: rotate(8deg);
}

.segment-3 {
  left: 33%;
  bottom: 35%;
  width: 66px;
  transform: rotate(-17deg);
}

.segment-4 {
  left: 48%;
  bottom: 63%;
  width: 65px;
  transform: rotate(9deg);
}

.segment-5 {
  left: 63%;
  bottom: 54%;
  width: 68px;
  transform: rotate(-15deg);
}

.segment-6 {
  left: 78%;
  bottom: 72%;
  width: 50px;
  transform: rotate(4deg);
}

.category-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 0;
}

.donut-chart {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    conic-gradient(
      #64748b 0deg 150deg,
      #94a3b8 150deg 245deg,
      #cbd5e1 245deg 360deg
    );
}

.donut-chart span {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
}

.category-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.category-list > div {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 7px;
}

.category-list i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.category-list > div:nth-child(2) i {
  background: #b4becb;
}

.category-list > div:nth-child(3) i {
  background: #d2d8e0;
}

.category-list span {
  color: #64748b;
  font-size: 9px;
}

.category-list strong {
  color: #334155;
  font-size: 10px;
  font-weight: 800;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-row {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #f8fafc;
}

.account-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #eef2f6;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.account-row strong {
  display: block;
  color: #334155;
  font-size: 9px;
  font-weight: 800;
}

.account-row div span {
  display: block;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 8px;
}

.account-row b {
  color: #334155;
  font-size: 10px;
  font-weight: 800;
}

.user-chart {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.user-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 10px;
}

.user-row > span {
  color: #64748b;
  font-size: 9px;
  white-space: nowrap;
}

.user-bars {
  display: flex;
  gap: 5px;
  height: 16px;
  align-items: center;
}

.user-bars i {
  display: block;
  height: 10px;
  border-radius: 999px;
}

.income-bar {
  background: #94a3b8;
}

.expense-bar {
  background: #d8dee7;
}

.bar-1 {
  width: 86px;
}

.bar-2 {
  width: 48px;
}

.bar-3 {
  width: 65px;
}

.bar-4 {
  width: 38px;
}

.bar-5 {
  width: 103px;
}

.bar-6 {
  width: 56px;
}

.mini-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day {
  position: relative;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #edf0f5;
  border-radius: 7px;
  background: #f8fafc;
}

.calendar-day span {
  color: #64748b;
  font-size: 8px;
}

.calendar-day::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: transparent;
}

.calendar-day.income::after {
  background: #94a3b8;
}

.calendar-day.expense::after {
  background: #cbd5e1;
}

.calendar-day.both::after {
  background: #64748b;
}

@keyframes card-summary {
  0% {
    transform: translate3d(0, 0, 0) rotate(-4deg);
  }

  50% {
    transform: translate3d(190px, 32px, 0) rotate(1deg);
  }

  100% {
    transform: translate3d(430px, -24px, 0) rotate(-3deg);
  }
}

@keyframes card-balance {
  0% {
    transform: translate3d(0, 0, 0) rotate(4deg);
  }

  50% {
    transform: translate3d(-210px, 38px, 0) rotate(-1deg);
  }

  100% {
    transform: translate3d(-470px, -20px, 0) rotate(3deg);
  }
}

@keyframes card-category {
  0% {
    transform: translate3d(0, 0, 0) rotate(4deg);
  }

  50% {
    transform: translate3d(210px, -30px, 0) rotate(-1deg);
  }

  100% {
    transform: translate3d(450px, 18px, 0) rotate(3deg);
  }
}

@keyframes card-account {
  0% {
    transform: translate3d(0, 0, 0) rotate(-2deg);
  }

  50% {
    transform: translate3d(120px, -35px, 0) rotate(2deg);
  }

  100% {
    transform: translate3d(250px, 20px, 0) rotate(-1deg);
  }
}

@keyframes card-users {
  0% {
    transform: translate3d(0, 0, 0) rotate(-3deg);
  }

  50% {
    transform: translate3d(-200px, -28px, 0) rotate(2deg);
  }

  100% {
    transform: translate3d(-450px, 20px, 0) rotate(-2deg);
  }
}

@keyframes card-calendar {
  0% {
    transform: translate3d(0, 0, 0) rotate(3deg);
  }

  50% {
    transform: translate3d(-120px, 30px, 0) rotate(-2deg);
  }

  100% {
    transform: translate3d(-260px, -20px, 0) rotate(2deg);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
  padding: 40px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e8ebf2;
  border-radius: 24px;
  box-shadow:
    0 20px 60px
    rgba(20, 30, 55, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand-mark {
  margin-bottom: 16px;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.login-badge {
  display: inline-block;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.login-header h1 {
  margin: 0 0 10px;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.login-header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #d9dee8;
  border-radius: 12px;
  background: #fff;
  color: #111827;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.form-group input:hover {
  border-color: #cbd2dd;
}

.form-group input:focus {
  border-color: #111827;
  box-shadow:
    0 0 0 4px
    rgba(17, 24, 39, 0.08);
}

.error-message {
  margin: -4px 0 0;
  padding: 11px 12px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.5;
}

.login-button {
  width: 100%;
  height: 50px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow:
    0 8px 20px
    rgba(17, 24, 39, 0.16);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-arrow {
  font-size: 17px;
  line-height: 1;
}

.login-footer {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
}

.register-link {
  color: #111827;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .background-card {
    animation: none;
  }
}

@media (max-width: 900px) {
  .login-page {
    padding: 20px;
  }

  .background-card {
    width: 280px;
    opacity: 0.34;
  }
}

@media (max-width: 600px) {
  .login-page {
    padding: 12px;
  }

  .login-card {
    padding: 30px 22px;
    border-radius: 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .background-card {
    width: 240px;
    opacity: 0.2;
  }

  .background-card-account,
  .background-card-calendar,
  .background-card-users {
    display: none;
  }
}
</style>