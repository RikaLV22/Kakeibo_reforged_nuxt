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
            {{
              healthStatus?.status === 'ok'
                ? 'SYSTEM READY'
                : 'SYSTEM WARNING'
            }}
          </strong>

          <span>
            {{
              healthStatus?.status === 'ok'
                ? 'ALL SYSTEMS NORMAL'
                : 'SYSTEM CHECK REQUIRED'
            }}
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
  { number: '05', text: 'API監視', to: '/admin/api-monitor' },
  { number: '06', text: 'システム監視', to: '/admin/system' },
  { number: '07', text: 'メンテナンス', to: '/admin/maintenance' },
  { number: '08', text: '操作ログ', to: '/admin/logs' },
  { number: '09', text: 'リソース管理', to: '/admin/resources' }
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
  background: #ffffff;
  color: #17313d;
  border-right: 1px solid #cfe2e9;
  box-shadow: 8px 0 28px rgba(34, 184, 223, 0.04);
}

.sidebar::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;

  background:
    linear-gradient(
      135deg,
      rgba(34, 184, 223, 0.05),
      transparent 35%
    ),
    linear-gradient(
      315deg,
      rgba(49, 185, 133, 0.025),
      transparent 30%
    );
}

.sidebar::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  content: "";
  pointer-events: none;

  background: linear-gradient(
    to bottom,
    rgba(34, 184, 223, 0),
    rgba(34, 184, 223, 0.55),
    rgba(34, 184, 223, 0)
  );
}

.sidebar-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.9;

  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.045) 1px,
      transparent 1px
    );

  background-size: 28px 28px;

  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.85),
    rgba(0, 0, 0, 0.15) 80%,
    transparent
  );

  animation: sidebar-grid 12s linear infinite;
}

.sidebar-header {
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;
  gap: 14px;

  padding: 24px 20px 20px;

  border-bottom: 1px solid #d7e8ed;

  background: rgba(255, 255, 255, 0.92);

  backdrop-filter: blur(6px);
}

.sidebar-header::before {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;

  height: 1px;

  content: "";

  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.65),
    transparent
  );
}

.system-emblem {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  border: 1px solid rgba(34, 184, 223, 0.4);

  background:
    linear-gradient(
      135deg,
      rgba(34, 184, 223, 0.1),
      rgba(34, 184, 223, 0.025)
    );

  color: #22b8df;
  font-size: 14px;

  text-shadow: 0 0 10px rgba(34, 184, 223, 0.35);

  box-shadow:
    inset 0 0 14px rgba(34, 184, 223, 0.05),
    0 0 18px rgba(34, 184, 223, 0.04);

  transform: rotate(45deg);

  animation: emblem-pulse 2.4s ease-in-out infinite;
}

.system-emblem::before,
.system-emblem::after {
  position: absolute;
  content: "";
  pointer-events: none;
}

.system-emblem::before {
  inset: 4px;
  border: 1px solid rgba(34, 184, 223, 0.16);
}

.system-emblem::after {
  left: -5px;
  right: -5px;
  top: 50%;

  height: 1px;

  background: rgba(34, 184, 223, 0.15);
}

.system-emblem span {
  transform: rotate(-45deg);
}

.system-title {
  color: #17313d;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

.system-subtitle {
  margin-top: 3px;
  color: #7b969f;
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

  border-bottom: 1px solid #d7e8ed;

  background: rgba(248, 252, 253, 0.88);
}

.sidebar-access span {
  color: #8199a2;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.sidebar-access strong {
  color: #2e5867;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.access-line {
  position: relative;

  width: 70%;
  height: 1px;

  margin-top: 5px;

  background: linear-gradient(
    90deg,
    rgba(34, 184, 223, 0.7),
    rgba(34, 184, 223, 0)
  );
}

.access-line::after {
  position: absolute;
  top: -2px;
  right: 0;

  width: 4px;
  height: 5px;

  content: "";

  background: #22b8df;

  box-shadow: 0 0 8px rgba(34, 184, 223, 0.35);
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
  border-radius: 2px;

  background: transparent;

  color: #718b95;

  font-family: inherit;
  text-align: left;
  text-decoration: none;

  cursor: pointer;

  overflow: hidden;

  transition:
    color 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.menu-item::before {
  position: absolute;
  left: 0;
  top: 50%;

  width: 2px;
  height: 0;

  content: "";

  background: #22b8df;

  transform: translateY(-50%);

  transition: height 0.2s ease;

  box-shadow: 0 0 8px rgba(34, 184, 223, 0.35);
}

.menu-item::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;

  width: 24%;

  content: "";

  pointer-events: none;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.04)
  );

  opacity: 0;

  transition: opacity 0.22s ease;
}

.menu-item:hover,
.menu-item.active {
  border-color: rgba(34, 184, 223, 0.22);

  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.09),
      rgba(34, 184, 223, 0.035)
    );

  color: #17313d;

  transform: translateX(2px);

  box-shadow:
    inset 0 0 20px rgba(34, 184, 223, 0.025),
    0 3px 12px rgba(34, 184, 223, 0.035);
}

.menu-item:hover::before,
.menu-item.active::before {
  height: 28px;
}

.menu-item:hover::after,
.menu-item.active::after {
  opacity: 1;
}

.menu-number {
  position: relative;
  z-index: 1;

  width: 22px;

  color: #a0b4bb;

  font-size: 10px;
  font-weight: 800;

  transition: color 0.2s ease;
}

.menu-item.active .menu-number,
.menu-item:hover .menu-number {
  color: #22b8df;
}

.menu-text {
  position: relative;
  z-index: 1;

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

  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.7),
    transparent
  );
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
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 13px 12px;

  border: 1px solid rgba(49, 185, 133, 0.22);

  background: rgba(49, 185, 133, 0.035);

  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.system-online::before {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;

  width: 2px;

  content: "";

  background: #31b985;
  opacity: 0.7;
}

.system-online::after {
  position: absolute;
  top: 0;
  right: 0;

  width: 18px;
  height: 1px;

  content: "";

  background: #31b985;

  opacity: 0.5;
}

.system-online:not(.offline) {
  box-shadow:
    inset 0 0 25px rgba(49, 185, 133, 0.025),
    0 0 16px rgba(49, 185, 133, 0.025);
}

.system-online.offline {
  border-color: rgba(229, 101, 87, 0.28);
  background: rgba(229, 101, 87, 0.045);
}

.system-online.offline::before,
.system-online.offline::after {
  background: #e56557;
}

.status-dot {
  display: inline-block;

  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;

  background: #31b985;

  box-shadow: 0 0 10px rgba(49, 185, 133, 0.5);

  animation: status-pulse 1.8s ease-in-out infinite;
}

.status-dot.offline {
  background: #e56557;

  box-shadow: 0 0 10px rgba(229, 101, 87, 0.45);

  animation: status-error-pulse 1.1s ease-in-out infinite;
}

.system-online strong,
.system-online span {
  display: block;
}

.system-online strong {
  color: #258a67;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.system-online.offline strong {
  color: #cf5a4e;
}

.system-online span {
  margin-top: 4px;

  color: #7d969f;

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
    border-right: none;
    border-bottom: 1px solid #cfe2e9;
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

  .menu-item,
  .menu-item::before,
  .menu-item::after,
  .system-online {
    transition: none;
  }
}
</style>