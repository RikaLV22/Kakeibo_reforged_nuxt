<template>
  <aside class="sidebar">
    <div class="sidebar-grid"></div>

    <div class="sidebar-header">
      <div class="system-emblem">
        <span>◆</span>
      </div>

      <div>
        <div class="system-title">SYSTEM</div>
        <div class="system-subtitle">CONTROL CONSOLE</div>
      </div>
    </div>

    <div class="sidebar-access">
      <span>ACCESS LEVEL</span>
      <strong>ADMINISTRATOR</strong>
      <div class="access-line"></div>
    </div>

    <nav class="menu">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="menu-item"
        :class="{ active: isActiveMenu(item.to) }"
      >
        <span class="menu-number">{{ item.number }}</span>
        <span class="menu-text">{{ item.text }}</span>
        <span class="menu-scan"></span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <div
        class="system-online"
        :class="{ offline: healthStatus?.status !== 'ok' }"
      >
        <span
          class="status-dot"
          :class="{ offline: healthStatus?.status !== 'ok' }"
        ></span>

        <div>
          <strong>
            {{ healthStatus?.status === 'ok' ? 'SYSTEM READY' : 'SYSTEM WARNING' }}
          </strong>

          <span>
            {{ healthStatus?.status === 'ok' ? 'ALL SYSTEMS NORMAL' : 'SYSTEM CHECK REQUIRED' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface HealthStatus {
  status: 'ok' | 'degraded'
  backend: 'ok' | 'error'
  database: 'ok' | 'error'
  timestamp: string
}

const { $api } = useNuxtApp()
const route = useRoute()

const healthStatus = ref<HealthStatus | null>(null)

const menuItems = [
  { number: '01', text: 'ダッシュボード', to: '/admin' },
  { number: '02', text: 'ユーザー管理', to: '/admin/users' },
  { number: '03', text: '組織管理', to: '/admin/organizations' },
  { number: '04', text: '取引管理', to: '/admin/transactions' },
  { number: '05', text: 'システム監視', to: '/admin/system' },
  { number: '06', text: 'メンテナンス', to: '/admin/maintenance' },
  { number: '07', text: '操作ログ', to: '/admin/logs' }
]

const isActiveMenu = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }

  return route.path.startsWith(path)
}

const checkHealth = async () => {
  try {
    const response = await $api.get<HealthStatus>('/health', {
      timeout: 5000
    })

    healthStatus.value = response.data
  } catch (error) {
    console.error('Sidebar health check failed:', error)

    healthStatus.value = {
      status: 'degraded',
      backend: 'error',
      database: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

let healthTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await checkHealth()

  healthTimer = setInterval(() => {
    checkHealth()
  }, 5000)
})

onBeforeUnmount(() => {
  if (healthTimer) {
    clearInterval(healthTimer)
    healthTimer = null
  }
})
</script>

<style scoped>
.sidebar {
  position: relative;
  width: 265px;
  min-height: 100vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #060b0f;
  border-right: 1px solid rgba(255, 255, 255, 0.09);
}

.sidebar-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  animation: sidebar-grid 12s linear infinite;
}

.sidebar-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.system-emblem {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(0, 229, 255, 0.32);
  color: #00e5ff;
  font-size: 14px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.7);
  transform: rotate(45deg);
  animation: emblem-pulse 2.4s ease-in-out infinite;
}

.system-emblem span {
  transform: rotate(-45deg);
}

.system-title {
  color: #f2fbfd;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

.system-subtitle {
  margin-top: 3px;
  color: #6a8187;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.sidebar-access {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-access span {
  color: #61777e;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.sidebar-access strong {
  color: #cde9ed;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.access-line {
  width: 70%;
  height: 1px;
  margin-top: 5px;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.5), transparent);
}

.menu {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #8ca0a5;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition:
    color 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    transform 0.22s ease;
}

.menu-item::before {
  position: absolute;
  left: 0;
  top: 50%;
  width: 2px;
  height: 0;
  content: "";
  background: #00e5ff;
  transform: translateY(-50%);
  transition: height 0.2s ease;
}

.menu-item:hover,
.menu-item.active {
  border-color: rgba(0, 229, 255, 0.13);
  background: rgba(0, 229, 255, 0.055);
  color: #eefeff;
  transform: translateX(2px);
}

.menu-item:hover::before,
.menu-item.active::before {
  height: 28px;
}

.menu-number {
  width: 22px;
  color: #4e656c;
  font-size: 10px;
  font-weight: 800;
  transition: color 0.2s ease;
}

.menu-item.active .menu-number,
.menu-item:hover .menu-number {
  color: #00e5ff;
}

.menu-text {
  font-size: 12px;
  font-weight: 700;
}

.menu-scan {
  position: absolute;
  left: -40%;
  bottom: 0;
  width: 40%;
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.65), transparent);
}

.menu-item:hover .menu-scan {
  opacity: 1;
  animation: menu-scan 0.9s ease-out;
}

.sidebar-footer {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: 14px 16px 18px;
}

.system-online {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 12px;
  border: 1px solid rgba(0, 229, 255, 0.13);
  background: rgba(0, 229, 255, 0.025);
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.system-online:not(.offline) {
  box-shadow: inset 0 0 25px rgba(0, 229, 255, 0.025);
}

.system-online.offline {
  border-color: rgba(255, 77, 77, 0.2);
  background: rgba(255, 77, 77, 0.04);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.9);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.status-dot.offline {
  background: #ff4d4d;
  box-shadow: 0 0 10px rgba(255, 77, 77, 0.8);
  animation: status-error-pulse 1.1s ease-in-out infinite;
}

.system-online strong,
.system-online span {
  display: block;
}

.system-online strong {
  color: #bff9fc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.system-online.offline strong {
  color: #ff8a8a;
}

.system-online span {
  margin-top: 4px;
  color: #5e777e;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

@keyframes sidebar-grid {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 28px 28px;
  }
}

@keyframes emblem-pulse {
  0%,
  100% {
    transform: rotate(45deg) scale(1);
  }
  50% {
    transform: rotate(45deg) scale(1.05);
  }
}

@keyframes menu-scan {
  from {
    left: -40%;
  }
  to {
    left: 100%;
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

@keyframes status-error-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.85);
  }
}

@media (max-width: 850px) {
  .sidebar {
    width: 100%;
    min-height: auto;
  }

  .menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sidebar-footer {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-grid,
  .system-emblem,
  .status-dot,
  .status-dot.offline {
    animation: none;
  }
}
</style>