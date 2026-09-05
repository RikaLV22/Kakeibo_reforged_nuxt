<template>
  <Teleport to="body">
    <div
      v-if="account"
      class="modal-overlay"
      @click.self="close"
    >
      <div class="account-modal">
        <div class="modal-header">
          <div>
            <h2>口座詳細</h2>

            <p>
              登録されている口座の詳細情報
            </p>
          </div>

          <button
            type="button"
            class="modal-close"
            aria-label="閉じる"
            @click="close"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <!-- 基本情報 -->
          <div class="detail-row">
            <span class="detail-label">
              銀行名
            </span>

            <span class="detail-value">
              {{ account.bank?.name || '-' }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              口座番号
            </span>

            <span class="detail-value">
              {{ account.account_number || '-' }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              残高
            </span>

            <span class="detail-value detail-amount">
              ¥{{ formatNumber(account.balance) }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              口座種別
            </span>

            <span class="detail-value">
              {{
                account.account_scope === 'organization'
                  ? '組織口座'
                  : '個人口座'
              }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              登録日時
            </span>

            <span class="detail-value">
              {{ formatDateTime(account.registered_at) }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              取引回数
            </span>

            <span class="detail-value">
              {{ account.transaction_count }}件
            </span>
          </div>

          <!-- 取引履歴 -->
          <div class="history-section">
            <div class="history-header">
              <div>
                <h3>取引履歴</h3>

                <p>
                  この口座に紐づく最新の取引
                </p>
              </div>

              <span class="history-count">
                {{ account.transactions?.length || 0 }}件
              </span>
            </div>

            <div
              v-if="account.transactions?.length"
              class="transaction-list"
            >
              <div
                v-for="transaction in account.transactions"
                :key="transaction.id"
                class="transaction-item"
              >
                <div class="transaction-main">
                  <div class="transaction-date">
                    {{ formatDate(transaction.date) }}
                  </div>

                  <div class="transaction-info">
                    <span class="transaction-category">
                      {{ transaction.category }}
                    </span>

                    <span class="transaction-payment">
                      {{ transaction.payment_method || '-' }}
                    </span>
                  </div>
                </div>

                <div
                  class="transaction-amount"
                  :class="transaction.transaction_type"
                >
                  {{
                    transaction.transaction_type === 'income'
                      ? '+'
                      : '-'
                  }}¥{{ formatNumber(transaction.amount) }}
                </div>
              </div>
            </div>

            <div
              v-else
              class="transaction-empty"
            >
              <div class="transaction-empty-icon">
                📋
              </div>

              <p>
                この口座には取引履歴がありません
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="modal-button"
            @click="close"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Bank {
  id: number
  name: string
}

interface AccountTransaction {
  id: number
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  payment_method?: string | null
}

interface Account {
  id: number
  account_number: string
  balance: number
  account_scope: 'personal' | 'organization'
  registered_at: string
  transaction_count: number
  bank?: Bank | null
  transactions?: AccountTransaction[]
}

defineProps<{
  account: Account | null
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    'ja-JP'
  ).format(
    value || 0
  )
}

const formatDate = (
  value: string
) => {
  if (!value) {
    return '-'
  }

  const date =
    new Date(
      `${value}T00:00:00`
    )

  return `${date.getFullYear()}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')}`
}

const formatDateTime = (
  value: string
) => {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  return `${date.getFullYear()}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(
    15,
    23,
    42,
    0.45
  );
  backdrop-filter: blur(3px);
}

.account-modal {
  width: min(
    520px,
    100%
  );
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 20px 60px
    rgba(
      15,
      23,
      42,
      0.18
    );
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border-bottom: 1px solid #edf0f5;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
}

.modal-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 11px;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #1f2937;
}

.modal-body {
  padding: 6px 22px 20px;
}

.detail-row {
  display: grid;
  grid-template-columns:
    110px
    minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid #f1f3f6;
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-label {
  color: #8a94a6;
  font-size: 11px;
  font-weight: 700;
}

.detail-value {
  min-width: 0;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
}

.detail-amount {
  color: #111827;
  font-size: 16px;
  font-weight: 800;
}

/* 取引履歴 */

.history-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #edf0f5;
}

.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.history-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 800;
}

.history-header p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 10px;
}

.history-count {
  flex-shrink: 0;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 11px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #fafbfc;
}

.transaction-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.transaction-date {
  flex-shrink: 0;
  color: #8a94a6;
  font-size: 10px;
  font-weight: 600;
}

.transaction-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-category {
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-payment {
  color: #9aa3b1;
  font-size: 9px;
}

.transaction-amount {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
}

.transaction-amount.income {
  color: #15803d;
}

.transaction-amount.expense {
  color: #dc2626;
}

.transaction-empty {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dce2eb;
  border-radius: 12px;
  background: #fafbfc;
  text-align: center;
}

.transaction-empty-icon {
  margin-bottom: 6px;
  font-size: 24px;
}

.transaction-empty p {
  margin: 0;
  color: #9aa3b1;
  font-size: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 22px 22px;
  border-top: 1px solid #edf0f5;
}

.modal-button {
  min-width: 90px;
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 9px;
  background: #111827;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.modal-button:hover {
  opacity: 0.85;
}

@media (max-width: 700px) {
  .modal-overlay {
    padding: 12px;
  }

  .account-modal {
    border-radius: 16px;
  }

  .detail-row {
    grid-template-columns:
      90px
      minmax(0, 1fr);
    gap: 12px;
  }

  .transaction-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .transaction-main {
    width: 100%;
  }

  .transaction-amount {
    align-self: flex-end;
  }
}
</style>