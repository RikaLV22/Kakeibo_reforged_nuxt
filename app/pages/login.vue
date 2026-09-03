<template>
  <div>
    <h2>ログイン</h2>

    <form @submit.prevent="login">
      <div>
        <label for="username">ユーザー名:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
        />
      </div>

      <div>
        <label for="password">パスワード:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
        />
      </div>

      <button type="submit">ログイン</button>
    </form>

    <p v-if="error" style="color: red;">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')

const { $api } = useNuxtApp()

const login = async () => {
  error.value = ''

  try {
    const res = await $api.post('/login', {
      username: username.value,
      password: password.value,
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))

    alert(`ログイン成功: ${res.data.user.username}`)

    await navigateTo('/transactions')
  } catch (err) {
    if (err?.response?.data) {
      error.value = err.response.data.message || 'ログイン失敗'
    } else {
      error.value = 'ログイン失敗'
    }
  }
}
</script>

<style scoped>
form div {
  margin-bottom: 10px;
}

label {
  margin-right: 10px;
  display: inline-block;
  width: 120px;
}
</style>