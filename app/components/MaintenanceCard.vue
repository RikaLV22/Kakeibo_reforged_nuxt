<template>
  <div
    class="maintenance-card"
    :style="{ minHeight }"
  >
    <div class="maintenance-icon">
      !
    </div>

    <p class="maintenance-code">
      {{ code }}
    </p>

    <h3>
      {{ title }}
    </h3>

    <p class="maintenance-message">
      {{ description }}
    </p>

    <span class="maintenance-subtext">
      復旧までしばらくお待ちください。
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    code?: string
    description?: string
    minHeight?: string
  }>(),
  {
    title: 'メンテナンス中です',
    code: 'SYSTEM MAINTENANCE',
    description: '現在この機能をメンテナンスしています。',
    minHeight: '270px'
  }
)
</script>

<style scoped>
.maintenance-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 30px 20px;
  border-top: 1px solid #f0f2f5;
  background:
    radial-gradient(
      circle at center,
      rgba(56, 189, 248, 0.04),
      transparent 58%
    ),
    #fbfcfe;
  text-align: center;
}

.maintenance-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.06);
  color: #0891b2;
  font-size: 22px;
  font-weight: 800;
  animation: maintenance-pulse 1.8s ease-in-out infinite;
}

.maintenance-code {
  margin: 14px 0 0;
  color: #0891b2;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.maintenance-card h3 {
  margin: 7px 0 0;
  color: #1f2937;
  font-size: 17px;
  font-weight: 800;
}

.maintenance-message {
  max-width: 310px;
  margin: 7px 0 0;
  color: #64748b;
  font-size: 10px;
  line-height: 1.6;
}

.maintenance-subtext {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 9px;
}

@keyframes maintenance-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}
</style>
