<template>
  <div class="register-page">
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

    <div class="register-container">
      <section class="promotion-section">
        <div class="promotion-content">
          <div class="brand-mark">
            家計簿
          </div>

          <h1>
            お金の管理を、<br />
            もっとシンプルに。
          </h1>

          <p class="promotion-description">
            個人の家計簿から組織のお金まで、<br />
            ひとつのアプリでスマートに管理できます。
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                ¥
              </div>

              <div>
                <strong>収支をかんたん管理</strong>
                <span>
                  日々の収入と支出をまとめて管理
                </span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                □
              </div>

              <div>
                <strong>口座をまとめて管理</strong>
                <span>
                  複数の口座残高をひとつの画面で確認
                </span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">
                ◎
              </div>

              <div>
                <strong>組織でも使える</strong>
                <span>
                  メンバーと一緒に組織のお金を管理
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="register-section">
        <div class="register-card">
          <div class="register-header">
            <span class="register-badge">
              GET STARTED
            </span>

            <h2>
              アカウントを作成
            </h2>

            <p>
              家計簿を始めるための情報を入力してください
            </p>
          </div>

          <form
            class="register-form"
            @submit.prevent="createCombined"
          >
            <div class="form-group">
              <label for="userName">
                ユーザー名
              </label>

              <input
                id="userName"
                v-model="formData.userName"
                type="text"
                placeholder="ユーザー名を入力"
                autocomplete="username"
                required
              />
            </div>

            <div class="form-group">
              <label for="organizationName">
                組織名
              </label>

              <input
                id="organizationName"
                v-model="formData.organizationName"
                type="text"
                placeholder="組織名を入力"
                required
              />

              <span class="input-help">
                あなた専用の組織が自動的に作成されます
              </span>
            </div>

            <div class="form-group">
              <label for="password">
                パスワード
              </label>

              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="パスワードを入力"
                autocomplete="new-password"
                required
              />
            </div>

            <div
              v-if="errorMessage"
              class="error-message"
            >
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="register-button"
              :disabled="isSubmitting"
            >
              <span>
                {{
                  isSubmitting
                    ? 'アカウントを作成中...'
                    : '家計簿をはじめる'
                }}
              </span>

              <span
                v-if="!isSubmitting"
                class="button-arrow"
              >
                →
              </span>
            </button>
          </form>

          <div class="login-link">
            <span>
              すでにアカウントをお持ちですか？
            </span>

            <NuxtLink to="/login">
              ログイン
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { $api } = useNuxtApp()

interface RegisterForm {
  userName: string
  organizationName: string
  password: string
}

interface OrganizationResponse {
  id: number
  name: string
}

interface UserResponse {
  token: string
  user: {
    id: number
    username: string
    organization_id: number
  }
}

const formData = ref<RegisterForm>({
  userName: '',
  organizationName: '',
  password: ''
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const createCombined = async () => {
  if (isSubmitting.value) {
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const organizationResponse =
      await $api.post<OrganizationResponse>(
        '/organizations',
        {
          organization: {
            name: formData.value.organizationName
          }
        }
      )

    const organizationId =
      organizationResponse.data.id

    const organizationName =
      organizationResponse.data.name

    const userResponse =
      await $api.post<UserResponse>(
        '/users',
        {
          user: {
            username: formData.value.userName,
            organization_id: organizationId,
            password: formData.value.password
          }
        }
      )

    localStorage.setItem(
      'token',
      userResponse.data.token
    )

    localStorage.setItem(
      'user',
      JSON.stringify(
        userResponse.data.user
      )
    )

    alert(
      `登録成功\nUser: ${userResponse.data.user.username}\nOrganization: ${organizationName}`
    )

    formData.value = {
      userName: '',
      organizationName: '',
      password: ''
    }

    await navigateTo('/login')
  } catch (error: any) {
    console.error(
      'ユーザー登録エラー:',
      error
    )

    const errors =
      error?.response?.data?.errors

    if (Array.isArray(errors)) {
      errorMessage.value =
        errors.join('\n')
    } else {
      errorMessage.value =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        '登録に失敗しました'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page {
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
  padding: 0 0 12px;
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
  animation: card-summary 34s ease-in-out infinite;
}

.background-card-balance {
  top: 18%;
  right: -90px;
  animation: card-balance 38s ease-in-out infinite;
}

.background-card-category {
  bottom: 12%;
  left: -90px;
  animation: card-category 40s ease-in-out infinite;
}

.background-card-users {
  bottom: 7%;
  right: -80px;
  animation: card-users 36s ease-in-out infinite;
}

.background-card-account {
  top: 55%;
  left: 7%;
  animation: card-account 42s ease-in-out infinite;
}

.background-card-calendar {
  top: 45%;
  right: 4%;
  animation: card-calendar 44s ease-in-out infinite;
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

.register-container {
  position: relative;
  z-index: 1;
  width: min(1100px, 100%);
  min-height: 680px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 28px;
  box-shadow:
    0 20px 60px
    rgba(20, 30, 55, 0.1);
}

.promotion-section {
  position: relative;
  display: flex;
  align-items: center;
  padding: 60px;
  background:
    linear-gradient(
      145deg,
      #111827 0%,
      #1f2937 100%
    );
  color: #fff;
}

.promotion-section::after {
  content: '';
  position: absolute;
  width: 280px;
  height: 280px;
  right: -110px;
  bottom: -110px;
  border: 1px solid
    rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.promotion-section::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  right: 30px;
  top: 40px;
  border: 1px solid
    rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.promotion-content {
  position: relative;
  z-index: 1;
  max-width: 440px;
}

.brand-mark {
  margin-bottom: 44px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.promotion-content h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.promotion-description {
  margin: 24px 0 40px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.9;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.feature-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
}

.feature-item strong {
  display: block;
  margin-bottom: 3px;
  font-size: 13px;
  font-weight: 700;
}

.feature-item span {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.5;
}

.register-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.register-card {
  width: 100%;
  max-width: 390px;
}

.register-header {
  margin-bottom: 30px;
}

.register-badge {
  display: inline-block;
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.register-header h2 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.register-header p {
  margin: 9px 0 0;
  color: #8a94a6;
  font-size: 12px;
  line-height: 1.6;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 19px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #dfe4ec;
  border-radius: 12px;
  outline: none;
  background: #fff;
  color: #111827;
  font-size: 13px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input:hover {
  border-color: #cbd2dd;
}

.form-group input:focus {
  border-color: #111827;
  box-shadow:
    0 0 0 4px
    rgba(17, 24, 39, 0.06);
}

.form-group input::placeholder {
  color: #a0a8b5;
}

.input-help {
  margin-top: -1px;
  color: #9ca3af;
  font-size: 10px;
  line-height: 1.5;
}

.error-message {
  padding: 11px 13px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.register-button {
  width: 100%;
  height: 50px;
  margin-top: 2px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.register-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow:
    0 8px 20px
    rgba(17, 24, 39, 0.16);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  background: #d7dce4;
  cursor: not-allowed;
}

.button-arrow {
  font-size: 17px;
  line-height: 1;
}

.login-link {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid #eef0f4;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: #8a94a6;
  font-size: 11px;
}

.login-link a {
  color: #374151;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .background-card {
    animation: none;
  }
}

@media (max-width: 900px) {
  .register-page {
    padding: 20px;
  }

  .register-container {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .promotion-section {
    padding: 40px;
  }

  .promotion-content {
    max-width: none;
  }

  .brand-mark {
    margin-bottom: 28px;
  }

  .promotion-content h1 {
    font-size: 34px;
  }

  .promotion-description {
    margin-bottom: 28px;
  }

  .register-section {
    padding: 40px;
  }

  .background-card {
    width: 280px;
    opacity: 0.34;
  }
}

@media (max-width: 600px) {
  .register-page {
    padding: 12px;
  }

  .register-container {
    border-radius: 20px;
  }

  .promotion-section {
    padding: 30px 24px;
  }

  .promotion-content h1 {
    font-size: 28px;
  }

  .promotion-description {
    font-size: 12px;
  }

  .feature-list {
    gap: 16px;
  }

  .register-section {
    padding: 30px 22px;
  }

  .register-header h2 {
    font-size: 24px;
  }

  .background-card {
    width: 240px;
    opacity: 0.22;
  }

  .background-card-account,
  .background-card-calendar {
    display: none;
  }
}
</style>