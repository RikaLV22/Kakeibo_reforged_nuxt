<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h1>ユーザー登録</h1>
        <p>新しい家計簿と組織を作成します</p>
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
            placeholder="ユーザー名"
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
            placeholder="組織名"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">
            パスワード
          </label>

          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="パスワード"
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
          {{ isSubmitting ? '登録中...' : '登録する' }}
        </button>
      </form>

      <div class="login-link">
        <span>すでにアカウントをお持ちですか？</span>

        <NuxtLink to="/login">
          ログイン
        </NuxtLink>
      </div>
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f7fb;
}

.register-card {
  width: min(100%, 430px);
  padding: 32px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(20, 30, 55, 0.08);
}

.register-header {
  margin-bottom: 26px;
  text-align: center;
}

.register-header h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 800;
}

.register-header p {
  margin: 8px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  height: 46px;
  padding: 0 13px;
  box-sizing: border-box;
  border: 1px solid #dfe4ec;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  transition: 0.2s ease;
}

.form-group input:focus {
  border-color: #aeb8c8;
}

.form-group input::placeholder {
  color: #a0a8b5;
}

.error-message {
  padding: 11px 13px;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.register-button {
  width: 100%;
  height: 46px;
  margin-top: 2px;
  border: none;
  border-radius: 11px;
  background: #111827;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.register-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.register-button:disabled {
  background: #d7dce4;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: #8a94a6;
  font-size: 11px;
}

.login-link a {
  color: #374151;
  font-weight: 700;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .register-page {
    padding: 14px;
  }

  .register-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
}
</style>