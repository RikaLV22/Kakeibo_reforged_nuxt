<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const token = localStorage.getItem('token')

  if (token) {
    window.location.replace('/mypage')
  } else {
    window.location.replace('/login')
  }
})
</script>