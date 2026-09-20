<template>
  <div
    v-if="modelValue"
    class="modal-overlay"
    @click.self="closeModal"
  >
    <div class="account-modal">
      <header class="modal-header">
        <div>
          <div class="eyebrow">
            ACCOUNT / SETUP
          </div>

          <h2>
            口座登録
          </h2>

          <p>
            新しい口座を家計簿へ登録します。
          </p>
        </div>

        <button
          type="button"
          class="close-button"
          @click="closeModal"
        >
          ×
        </button>
      </header>

      <div class="modal-body">
        <div class="account-grid">
          <div class="form-section">
            <label>
              <span class="label-number">
                01
              </span>

              銀行名

              <span class="required">
                REQUIRED
              </span>
            </label>

            <div class="input-shell select-shell">
              <select
                v-model="form.bank_id"
              >
                <option value="">
                  選択してください
                </option>

                <option
                  v-for="bank in banks"
                  :key="bank.id"
                  :value="bank.id"
                >
                  {{ bank.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <label>
              <span class="label-number">
                02
              </span>

              口座番号

              <span class="required">
                REQUIRED
              </span>
            </label>

            <div class="input-shell">
              <input
                v-model="form.account_number"
                type="text"
                inputmode="numeric"
                placeholder="例：1234567"
              >
            </div>
          </div>

          <div class="form-section full">
            <label>
              <span class="label-number">
                03
              </span>

              初期残高

              <span class="required">
                REQUIRED
              </span>
            </label>

            <div class="amount-input">
              <span class="currency">
                ¥
              </span>

              <input
                v-model.number="form.balance"
                type="number"
                placeholder="0"
              >

              <span class="unit">
                円
              </span>
            </div>

            <p class="hint">
              現在の口座残高を入力してください。
            </p>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button
          type="button"
          class="cancel-button"
          @click="closeModal"
        >
          閉じる
        </button>

        <button
          type="button"
          class="submit-button"
          @click="handleCreate"
        >
          <span>
            ＋
          </span>

          登録
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  watch
} from 'vue'

type Bank = {
  id: number
  name: string
}

type AccountPayload = {
  bank_id: string
  account_number: string
  balance: number
}

const props = defineProps<{
  modelValue: boolean
  banks: Bank[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [payload: AccountPayload]
}>()

const form = reactive({
  bank_id: '',
  account_number: '',
  balance: 0
})

const resetForm = () => {
  form.bank_id = ''
  form.account_number = ''
  form.balance = 0
}

watch(
  () => props.modelValue,
  visible => {
    if (visible) {
      resetForm()
    }
  }
)

const closeModal = () => {
  emit(
    'update:modelValue',
    false
  )
}

const handleCreate = () => {
  if (!form.bank_id) {
    alert(
      '銀行名を選択してください'
    )
    return
  }

  if (!form.account_number) {
    alert(
      '口座番号を入力してください'
    )
    return
  }

  emit('create', {
    bank_id:
      form.bank_id,
    account_number:
      form.account_number,
    balance:
      Number(form.balance)
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(18, 38, 47, 0.55);
  backdrop-filter: blur(7px);
}

.account-modal {
  width: min(680px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid #cfe2e9;
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(23, 49, 61, 0.25);
  animation: modal-enter 0.18s ease;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 26px 20px;
  border-bottom: 1px solid #e2edf1;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #f8fcfd 100%
  );
}

.eyebrow {
  margin-bottom: 6px;
  color: #22b8df;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.modal-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 24px;
}

.modal-header p {
  margin: 7px 0 0;
  color: #718993;
  font-size: 11px;
}

.close-button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid #d7e7ec;
  border-radius: 10px;
  background: #ffffff;
  color: #6d8792;
  font-size: 25px;
  cursor: pointer;
}

.close-button:hover {
  background: #f4fafc;
  color: #17313d;
}

.modal-body {
  padding: 26px;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 18px;
}

.form-section.full {
  grid-column: 1 / -1;
}

.form-section label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #345461;
  font-size: 12px;
  font-weight: 900;
}

.label-number {
  color: #99adb5;
  font-size: 9px;
}

.required {
  margin-left: auto;
  color: #9baeb6;
  font-size: 7px;
  letter-spacing: 0.12em;
}

.input-shell {
  min-height: 48px;
  display: flex;
  align-items: center;
  padding: 0 13px;
  border: 1px solid #d5e5ea;
  border-radius: 11px;
  background: #fbfdfe;
}

.input-shell:focus-within,
.amount-input:focus-within {
  border-color: #22b8df;
  box-shadow: 0 0 0 3px rgba(34, 184, 223, 0.09);
}

.input-shell input,
.input-shell select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #274653;
  font-size: 13px;
  font-weight: 700;
}

.select-shell {
  position: relative;
}

.select-shell select {
  appearance: none;
  cursor: pointer;
}

.select-shell::after {
  content: '⌄';
  position: absolute;
  right: 13px;
  pointer-events: none;
  color: #7d98a2;
}

.amount-input {
  min-height: 64px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border: 1px solid #d5e5ea;
  border-radius: 12px;
  background: #fbfdfe;
}

.currency {
  color: #91a7af;
  font-size: 18px;
  font-weight: 900;
}

.amount-input input {
  flex: 1;
  min-width: 0;
  padding: 0 10px;
  border: none;
  outline: none;
  background: transparent;
  color: #17313d;
  font-size: 24px;
  font-weight: 900;
}

.unit {
  color: #7e97a1;
  font-size: 11px;
  font-weight: 800;
}

.hint {
  margin: 7px 0 0;
  color: #96aab2;
  font-size: 9px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 16px 26px;
  border-top: 1px solid #e2edf1;
  background: #fbfdfe;
}

.cancel-button,
.submit-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 17px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #d6e5ea;
  background: #ffffff;
  color: #718993;
}

.submit-button {
  border: 1px solid #22b8df;
  background: #22b8df;
  color: #ffffff;
  box-shadow: 0 5px 14px rgba(34, 184, 223, 0.2);
}

@media (max-width: 650px) {
  .account-grid {
    grid-template-columns: 1fr;
  }

  .form-section.full {
    grid-column: auto;
  }

  .modal-body {
    padding: 20px;
  }
}
</style>