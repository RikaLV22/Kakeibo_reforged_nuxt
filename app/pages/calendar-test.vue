<script setup lang="ts">
import TransactionCalendar from '~/components/TransactionCalendar.client.vue'
</script>

<template>
  <div class="calendar-page">
    <TransactionCalendar />
  </div>
</template>

<style scoped>
.calendar-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>