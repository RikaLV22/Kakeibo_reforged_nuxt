<template>
  <div class="summary-panel">
    <template
      v-for="(section, index) in sections"
      :key="section.title"
    >
      <div class="summary-section">
        <div class="summary-title">
          <span
            class="summary-icon"
            :class="section.iconClass"
          >
            {{ section.icon }}
          </span>

          <div>
            <h3>{{ section.title }}</h3>
            <span>{{ section.subtitle }}</span>
          </div>
        </div>

        <div class="summary-main-value">
          ¥{{ formatNumber(section.summary.balance) }}
        </div>

        <div class="summary-stats">
          <div class="summary-stat">
            <span class="stat-label">総収入</span>
            <span class="stat-value income">
              +¥{{ formatNumber(section.summary.income) }}
            </span>
          </div>

          <div class="summary-stat">
            <span class="stat-label">総支出</span>
            <span class="stat-value expense">
              -¥{{ formatNumber(section.summary.expense) }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="index < sections.length - 1"
        class="summary-divider"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface PeriodSummary {
  income: number
  expense: number
  balance: number
}

interface SummarySection {
  title: string
  subtitle: string
  icon: string
  iconClass: string
  summary: PeriodSummary
}

defineProps<{
  sections: SummarySection[]
}>()

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value || 0)
}
</script>

<style scoped>
.summary-panel {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    1px
    minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
  padding: 2px 19px 19px;
}

.summary-section {
  min-width: 0;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.summary-title h3 {
  margin: 0;
  color: #293241;
  font-size: 13px;
  font-weight: 700;
}

.summary-title span:not(.summary-icon) {
  display: block;
  margin-top: 1px;
  color: #9aa3b1;
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
}

.organization-icon {
  background: #f1f5f9;
  color: #475569;
}

.personal-icon {
  background: #f8fafc;
  color: #64748b;
}

.summary-main-value {
  margin-top: 14px;
  color: #111827;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 13px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border-radius: 10px;
  background: #f8fafc;
}

.stat-label {
  color: #9aa3b1;
  font-size: 10px;
}

.stat-value {
  font-size: 12px;
  font-weight: 700;
}

.stat-value.income {
  color: #15803d;
}

.stat-value.expense {
  color: #dc2626;
}

.summary-divider {
  width: 1px;
  background: #edf0f5;
}

@media (max-width: 700px) {
  .summary-panel {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .summary-divider {
    width: 100%;
    height: 1px;
  }

  .summary-main-value {
    font-size: 23px;
  }

  .summary-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>