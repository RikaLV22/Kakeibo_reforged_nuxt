<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    @click.self="handleClose"
  >
    <div class="transfer-modal">
      <div class="transfer-modal-header">
        <div>
          <h2>口座間で移動</h2>
          <p>口座から別の口座へお金を移動します</p>
        </div>

        <button
          class="modal-close-button"
          @click="handleClose"
        >
          ×
        </button>
      </div>

      <div class="transfer-form">
        <div class="transfer-field">
          <label for="from-account">
            移動元
          </label>

          <select
            id="from-account"
            v-model="form.fromAccountId"
          >
            <option
              value=""
              disabled
            >
              移動元の口座を選択
            </option>

            <option
              v-for="account in accounts"
              :key="`from-${account.id}`"
              :value="account.id"
            >
              {{ account.bank?.name || '銀行名不明' }}
              （{{ account.account_number }}）
              - ¥{{ formatNumber(Number(account.balance || 0)) }}
            </option>
          </select>
        </div>

        <div class="transfer-arrow">
          ↓
        </div>

        <div class="transfer-field">
          <label for="to-account">
            移動先
          </label>

          <select
            id="to-account"
            v-model="form.toAccountId"
          >
            <option
              value=""
              disabled
            >
              移動先の口座を選択
            </option>

            <option
              v-for="account in accounts"
              :key="`to-${account.id}`"
              :value="account.id"
            >
              {{ account.bank?.name || '銀行名不明' }}
              （{{ account.account_number }}）
            </option>
          </select>
        </div>

        <div class="transfer-field">
          <label for="transfer-amount">
            金額
          </label>

          <div class="amount-input-wrapper">
            <span>¥</span>

            <input
              id="transfer-amount"
              v-model.number="form.amount"
              type="number"
              min="1"
              step="1"
              placeholder="50000"
            />
          </div>
        </div>

        <div
          v-if="error"
          class="transfer-error"
        >
          {{ error }}
        </div>

        <div class="transfer-actions">
          <button
            class="cancel-button"
            :disabled="isTransferring"
            @click="handleClose"
          >
            キャンセル
          </button>

          <button
            class="confirm-transfer-button"
            :disabled="isTransferring"
            @click="handleSubmit"
          >
            {{ isTransferring ? '移動中...' : '移動する' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '~/types/account'

interface TransferForm {
  fromAccountId: number | string
  toAccountId: number | string
  amount: number | null
}

const props = defineProps<{
  isOpen: boolean
  accounts: Account[]
  isTransferring: boolean
  error: string
  form: TransferForm
}>()

const emit = defineEmits<{
  close: []
  submit: []
}>()

const handleClose = () => {
  if (props.isTransferring) {
    return
  }

  emit('close')
}

const handleSubmit = () => {
  if (props.isTransferring) {
    return
  }

  emit('submit')
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(
    value || 0
  )
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(
    15,
    23,
    42,
    0.38
  );
}

.transfer-modal {
  width: min(
    100%,
    470px
  );
  background: #fff;
  border-radius: 18px;
  box-shadow:
    0 24px 80px
    rgba(
      15,
      23,
      42,
      0.2
    );
  overflow: hidden;
}

.transfer-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid #edf0f5;
}

.transfer-modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
}

.transfer-modal-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 11px;
}

.modal-close-button {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: 9px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 21px;
  line-height: 1;
  cursor: pointer;
}

.modal-close-button:hover {
  background: #e5e7eb;
  color: #111827;
}

.transfer-form {
  padding: 20px;
}

.transfer-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.transfer-field label {
  color: #374151;
  font-size: 11px;
  font-weight: 700;
}

.transfer-field select,
.transfer-field input {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #dfe4ec;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: #1f2937;
  font-size: 12px;
}

.transfer-field select:focus,
.transfer-field input:focus {
  border-color: #aeb8c8;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #dfe4ec;
  border-radius: 11px;
  background: #fff;
}

.amount-input-wrapper:focus-within {
  border-color: #aeb8c8;
}

.amount-input-wrapper span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.amount-input-wrapper input {
  height: 100%;
  padding: 0 0 0 6px;
  border: none;
  outline: none;
}

.amount-input-wrapper input:focus {
  border: none;
}

.transfer-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  color: #94a3b8;
  font-size: 18px;
}

.transfer-error {
  margin-top: 13px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 11px;
  line-height: 1.5;
}

.transfer-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

.cancel-button,
.confirm-transfer-button {
  height: 44px;
  border: none;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  background: #f3f4f6;
  color: #4b5563;
}

.cancel-button:hover:not(:disabled) {
  background: #e5e7eb;
}

.confirm-transfer-button {
  background: #111827;
  color: #fff;
}

.confirm-transfer-button:hover:not(:disabled) {
  background: #1f2937;
}

.cancel-button:disabled,
.confirm-transfer-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .modal-overlay {
    padding: 12px;
  }

  .transfer-modal {
    border-radius: 15px;
  }

  .transfer-actions {
    grid-template-columns: 1fr;
  }
}
</style>