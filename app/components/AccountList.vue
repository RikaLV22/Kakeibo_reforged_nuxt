<template>
  <div class="account-list">
    <div
      v-if="accounts.length === 0"
      class="account-empty"
    >
      <div class="account-empty-icon">
        💰
      </div>

      <h3>登録口座がありません</h3>

      <p>
        口座を登録すると
        ここに残高が表示されます
      </p>
    </div>

    <div
      v-for="account in accounts"
      :key="account.id"
      class="account-item"
      @click="selectAccount(account)"
    >
      <div class="account-main">
        <div class="account-icon">
          🏦
        </div>

        <div class="account-info">
          <h3>
            {{ account.bank?.name || '銀行名不明' }}
          </h3>

          <p>
            口座番号：
            {{ account.account_number || '未登録' }}
          </p>
        </div>
      </div>

      <div class="account-balance">
        <span>現在残高</span>

        <strong>
          ¥{{ formatNumber(Number(account.balance || 0)) }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Account
} from '~/types/account'

const props = defineProps<{
  accounts: Account[]
}>()

const emit = defineEmits<{
  select: [account: Account]
}>()

const selectAccount = (
  account: Account
) => {
  emit(
    'select',
    account
  )
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
</script>

<style scoped>
.account-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 17px 17px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  background: #fafbfc;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.account-item:hover {
  background: #fff;
  border-color: #d9dee7;
  transform: translateY(-1px);
  box-shadow:
    0 6px 18px rgba(
      20,
      30,
      55,
      0.06
    );
}

.account-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.account-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #f1f5f9;
  font-size: 17px;
}

.account-info {
  min-width: 0;
}

.account-info h3 {
  margin: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.account-info p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-balance {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.account-balance span {
  color: #9aa3b1;
  font-size: 9px;
}

.account-balance strong {
  color: #111827;
  font-size: 17px;
  font-weight: 800;
}

.account-empty {
  min-height: 195px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dce2eb;
  border-radius: 15px;
  background: #fafbfc;
  text-align: center;
}

.account-empty-icon {
  font-size: 31px;
  margin-bottom: 8px;
}

.account-empty h3 {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
}

.account-empty p {
  max-width: 250px;
  margin: 7px 0 0;
  color: #9aa3b1;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 700px) {
  .account-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .account-balance {
    align-items: flex-start;
  }
}
</style>