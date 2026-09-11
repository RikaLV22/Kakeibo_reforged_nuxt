<template>
  <main class="logs-page">
    <div class="page-grid"></div>

    <header class="page-header">
      <div>
        <div class="system-label">SYS / AUDIT LOG</div>
        <h1>操作ログ</h1>
        <p>ADMINISTRATOR ACTIVITY MONITOR</p>
      </div>

      <div class="header-status">
        <span class="status-dot"></span>
        <span>LOGGING ACTIVE</span>
      </div>
    </header>

    <section class="log-panel">
      <div class="panel-header">
        <span>RECENT ACTIVITY</span>
        <span>{{ logs.length.toString().padStart(2, '0') }} RECORDS</span>
      </div>

      <div v-if="logs.length" class="log-list">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-row"
        >
          <div class="log-time">{{ log.time }}</div>
          <div class="log-type">{{ log.type }}</div>
          <div class="log-message">{{ log.message }}</div>
          <div class="log-status">{{ log.status }}</div>
        </div>
      </div>

      <div v-else class="empty-state">
        NO LOG DATA
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface LogItem {
  id: number
  time: string
  type: string
  message: string
  status: string
}

const logs = ref<LogItem[]>([
  {
    id: 1,
    time: '22:30:15',
    type: 'AUTH',
    message: 'Administrator session initialized',
    status: 'SUCCESS'
  },
  {
    id: 2,
    time: '22:28:41',
    type: 'SYSTEM',
    message: 'System health check completed',
    status: 'SUCCESS'
  },
  {
    id: 3,
    time: '22:24:08',
    type: 'DATA',
    message: 'Transaction records synchronized',
    status: 'SUCCESS'
  }
])
</script>

<style scoped>
.logs-page {
  position: relative;
  min-height: 100vh;
  padding: 42px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(0, 220, 255, 0.08), transparent 30%),
    #03070a;
  color: #eef8fa;
}

.page-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(0, 220, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 220, 255, 0.05) 1px, transparent 1px);
  background-size: 36px 36px;
}

.page-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 32px;
}

.system-label {
  margin-bottom: 10px;
  color: #42e8ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.page-header p {
  margin: 8px 0 0;
  color: #6b858d;
  font-size: 11px;
  letter-spacing: 0.18em;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 220, 255, 0.22);
  background: rgba(0, 220, 255, 0.04);
  color: #7fefff;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #42e8ff;
  box-shadow: 0 0 12px rgba(66, 232, 255, 0.8);
}

.log-panel {
  position: relative;
  z-index: 1;
  border: 1px solid rgba(0, 220, 255, 0.16);
  background: rgba(4, 12, 16, 0.82);
  box-shadow: inset 0 0 40px rgba(0, 220, 255, 0.025);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(0, 220, 255, 0.12);
  color: #6fddec;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.log-row {
  display: grid;
  grid-template-columns: 100px 90px 1fr 90px;
  gap: 18px;
  align-items: center;
  min-height: 58px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(0, 220, 255, 0.06);
  transition:
    background 0.2s ease,
    padding 0.2s ease;
}

.log-row:hover {
  padding-left: 23px;
  background: rgba(0, 220, 255, 0.035);
}

.log-time {
  color: #5e8992;
  font-family: monospace;
  font-size: 12px;
}

.log-type {
  color: #42e8ff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.log-message {
  color: #d8eaed;
  font-size: 13px;
}

.log-status {
  color: #76e7b2;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: right;
}

.empty-state {
  padding: 60px 20px;
  color: #52717a;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-align: center;
}

@media (max-width: 900px) {
  .logs-page {
    padding: 24px;
  }

  .log-row {
    grid-template-columns: 80px 70px 1fr;
  }

  .log-status {
    display: none;
  }
}

@media (max-width: 650px) {
  .page-header {
    flex-direction: column;
  }

  .log-row {
    grid-template-columns: 1fr;
    gap: 5px;
    padding: 12px 18px;
  }

  .log-row:hover {
    padding-left: 18px;
  }
}
</style>