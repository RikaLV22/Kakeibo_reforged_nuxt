<template>
  <div>
    <h2>家計簿へようこそ！</h2>

    <div v-if="!loggedIn">
      <NuxtLink to="/login">
        <button>ログイン</button>
      </NuxtLink>

      <NuxtLink to="/usercreate">
        <button>ユーザー新規作成</button>
      </NuxtLink>
    </div>

    <div v-else>
      <p>こんにちは、{{ username }}さん！</p>

      <NuxtLink to="/transactions">
        <button>家計簿を見る</button>
      </NuxtLink>

      <button @click="logout">ログアウト</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loggedIn = ref(false)
const username = ref('')

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (user && localStorage.getItem('token')) {
    loggedIn.value = true
    username.value = user.username
  }
})

const logout = async () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')

  loggedIn.value = false
  username.value = ''

  await navigateTo('/')
}
</script>