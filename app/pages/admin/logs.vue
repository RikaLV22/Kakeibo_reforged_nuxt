<template>
  <main class="logs-page">
    <div class="page-grid"></div>
    <div class="page-scan"></div>

    <header class="page-header">
      <div>
        <div class="system-label">
          SYS / AUDIT LOG
        </div>

        <h1>操作ログ</h1>

        <p>
          ADMINISTRATOR ACTIVITY MONITOR
        </p>
      </div>

      <div class="header-status">
        <span class="status-dot"></span>

        <span>
          LOGGING ACTIVE
        </span>
      </div>
    </header>

    <section class="log-panel">
      <div class="panel-header">
        <span>RECENT ACTIVITY</span>

        <span>
          {{ logs.length.toString().padStart(2, '0') }}
          RECORDS
        </span>
      </div>

      <div
        v-if="logs.length"
        class="log-list"
      >
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-row"
        >
          <div class="log-time">
            {{ log.time }}
          </div>

          <div class="log-type">
            {{ log.type }}
          </div>

          <div class="log-message">
            {{ log.message }}
          </div>

          <div class="log-status">
            {{ log.status }}
          </div>
        </div>
      </div>

      <div
        v-else
        class="empty-state"
      >
        <span class="empty-mark">×</span>
        <span>NO LOG DATA</span>
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
    message:
      'Administrator session initialized',
    status: 'SUCCESS'
  },
  {
    id: 2,
    time: '22:28:41',
    type: 'SYSTEM',
    message:
      'System health check completed',
    status: 'SUCCESS'
  },
  {
    id: 3,
    time: '22:24:08',
    type: 'DATA',
    message:
      'Transaction records synchronized',
    status: 'SUCCESS'
  }
])
</script>

<style scoped>
.logs-page {
  position: relative;
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 85% 0%,
      rgba(34, 184, 223, 0.08),
      transparent 30%
    ),
    radial-gradient(
      circle at 0% 100%,
      rgba(34, 184, 223, 0.035),
      transparent 28%
    ),
    var(--admin-bg, #f4f9fc);
  color: var(--admin-text, #17313d);
}

.page-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.75;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.04) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.04) 1px,
      transparent 1px
    );
  background-size: 36px 36px;
  mask-image:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.65),
      transparent 95%
    );
}

.page-scan {
  position: absolute;
  top: -20%;
  left: 0;
  right: 0;
  z-index: 0;
  height: 18%;
  pointer-events: none;
  background:
    linear-gradient(
      to bottom,
      transparent,
      rgba(34, 184, 223, 0.06),
      transparent
    );
  filter: blur(8px);
  animation:
    page-scan 10s linear infinite;
}

.page-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;
  width: min(100%, 1400px);
  margin: 0 auto 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid
    var(--admin-border, #cfe2e9);
}

.page-header::after {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 180px;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      var(--admin-primary, #22b8df),
      transparent
    );
  box-shadow:
    0 0 8px
    rgba(34, 184, 223, 0.28);
  animation:
    header-line 4s
    ease-in-out infinite;
}

.system-label {
  margin-bottom: 9px;
  color: var(--admin-primary, #22b8df);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.page-header h1 {
  margin: 0;
  color: var(--admin-text, #17313d);
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.page-header p {
  margin: 8px 0 0;
  color: var(--admin-subtext, #6d8792);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px;
  border: 1px solid
    rgba(34, 184, 223, 0.25);
  background:
    rgba(255, 255, 255, 0.78);
  color: var(--admin-primary, #22b8df);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  box-shadow:
    0 4px 16px
    rgba(42, 87, 101, 0.04);
}

.status-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--admin-success, #31b985);
  box-shadow:
    0 0 8px
    rgba(49, 185, 133, 0.45);
  animation:
    status-pulse 1.6s
    ease-in-out infinite;
}

.log-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 1400px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid
    var(--admin-border, #cfe2e9);
  background:
    rgba(255, 255, 255, 0.96);
  box-shadow:
    0 12px 34px
      rgba(42, 87, 101, 0.06),
    inset 0 0 30px
      rgba(34, 184, 223, 0.02);
}

.log-panel::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 24%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      var(--admin-primary, #22b8df),
      transparent
    );
  box-shadow:
    0 0 10px
    rgba(34, 184, 223, 0.3);
}

.panel-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 48px;
  padding: 0 18px;
  border-bottom: 1px solid #dbeaf0;
  background:
    linear-gradient(
      180deg,
      #ffffff,
      #f7fbfc
    );
  color: #5f7983;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.panel-header::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  width: 90px;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.25)
    );
}

.log-list {
  position: relative;
}

.log-row {
  position: relative;
  display: grid;
  grid-template-columns:
    105px 95px minmax(0, 1fr) 100px;
  gap: 18px;
  align-items: center;
  min-height: 64px;
  padding: 0 18px;
  border-bottom: 1px solid #e3edf1;
  background: #ffffff;
  transition:
    background 0.2s ease,
    padding-left 0.2s ease,
    border-color 0.2s ease;
}

.log-row:last-child {
  border-bottom: none;
}

.log-row::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  content: "";
  background: transparent;
  transition:
    background 0.2s ease;
}

.log-row::after {
  position: absolute;
  bottom: 0;
  left: -20%;
  width: 20%;
  height: 1px;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.4),
      transparent
    );
  opacity: 0;
}

.log-row:hover {
  padding-left: 23px;
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.045),
      #ffffff 28%
    );
}

.log-row:hover::before {
  background:
    var(--admin-primary, #22b8df);
  box-shadow:
    0 0 8px
    rgba(34, 184, 223, 0.35);
}

.log-row:hover::after {
  opacity: 1;
  animation:
    row-scan 0.9s ease-out;
}

.log-time {
  color: #6f8a94;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.log-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 62px;
  padding: 5px 7px;
  border: 1px solid
    rgba(34, 184, 223, 0.2);
  background:
    rgba(34, 184, 223, 0.035);
  color: var(--admin-primary, #22b8df);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.log-message {
  min-width: 0;
  overflow: hidden;
  color: #38545e;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-status {
  color: var(--admin-success, #31b985);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-align: right;
  text-shadow:
    0 0 7px
    rgba(49, 185, 133, 0.14);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 240px;
  color: #8198a0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.empty-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid #cfe2e9;
  border-radius: 50%;
  color: #9aaeb5;
  font-size: 18px;
  font-weight: 400;
}

@keyframes page-scan {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(760%);
  }
}

@keyframes header-line {
  0%,
  100% {
    width: 120px;
    opacity: 0.45;
  }

  50% {
    width: 260px;
    opacity: 1;
  }
}

@keyframes row-scan {
  from {
    left: -20%;
  }

  to {
    left: 110%;
  }
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

@media (max-width: 900px) {
  .logs-page {
    padding: 28px;
  }

  .log-row {
    grid-template-columns:
      85px 80px minmax(0, 1fr);
  }

  .log-status {
    display: none;
  }
}

@media (max-width: 650px) {
  .logs-page {
    padding: 20px 16px 30px;
  }

  .page-header {
    flex-direction: column;
    margin-bottom: 22px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .header-status {
    align-self: flex-start;
  }

  .log-row {
    grid-template-columns: 1fr;
    gap: 7px;
    align-items: flex-start;
    min-height: auto;
    padding: 13px 16px;
  }

  .log-row:hover {
    padding-left: 20px;
  }

  .log-time {
    font-size: 9px;
  }

  .log-type {
    min-width: auto;
  }

  .log-message {
    white-space: normal;
    line-height: 1.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-scan,
  .status-dot,
  .log-row:hover::after {
    animation: none;
  }
}
</style>