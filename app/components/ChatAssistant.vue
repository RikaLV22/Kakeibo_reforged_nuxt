<template>
  <div class="chat-card">
    <div class="card-header">
      <div>
        <h2>AI 家計簿アシスタント</h2>
        <p>{{ description }}</p>
      </div>

      <div class="chat-header-actions">
        <span
          class="bot-status"
          :class="{
            offline: isChatOffline
          }"
        >
          <span class="status-dot"></span>

          {{
            isChatOffline
              ? 'OFFLINE'
              : 'ONLINE'
          }}
        </span>

        <button
          class="chat-expand-button"
          @click="openChatModal"
        >
          ⛶ 拡大
        </button>
      </div>
    </div>

    <div
      ref="chatBody"
      class="chat-body"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-row"
        :class="message.role"
      >
        <div class="message-bubble">
          {{ message.text }}
        </div>
      </div>

      <div
        v-if="isSending"
        class="message-row bot"
      >
        <div class="message-bubble loading-bubble">
          <span class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <input
        v-model="chatInput"
        type="text"
        :placeholder="
          isChatOffline
            ? 'チャットサーバーはメンテナンス中です'
            : placeholder
        "
        @keyup.enter="sendMessage"
      />

      <button
        class="send-button"
        :disabled="
          isSending ||
          !chatInput.trim()
        "
        @click="sendMessage"
      >
        {{
          isSending
            ? '送信中...'
            : isChatOffline
              ? 'メンテナンス中'
              : '送信'
        }}
      </button>
    </div>

    <div
      v-if="showChatModal"
      class="chat-modal-overlay"
      @click.self="closeChatModal"
    >
      <div class="chat-modal">
        <div class="chat-modal-header">
          <div>
            <h2>AI 家計簿アシスタント</h2>
            <p>{{ description }}</p>
          </div>

          <div class="chat-modal-header-actions">
            <span
              class="bot-status"
              :class="{
                offline: isChatOffline
              }"
            >
              <span class="status-dot"></span>

              {{
                isChatOffline
                  ? 'OFFLINE'
                  : 'ONLINE'
              }}
            </span>

            <button
              class="chat-modal-close"
              @click="closeChatModal"
            >
              ×
            </button>
          </div>
        </div>

        <div
          ref="chatModalBody"
          class="chat-modal-body"
        >
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-row"
            :class="message.role"
          >
            <div class="message-bubble">
              {{ message.text }}
            </div>
          </div>

          <div
            v-if="isSending"
            class="message-row bot"
          >
            <div class="message-bubble loading-bubble">
              <span class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        </div>

        <div class="chat-modal-input-area">
          <input
            v-model="chatInput"
            type="text"
            :placeholder="
              isChatOffline
                ? 'チャットサーバーはメンテナンス中です'
                : placeholder
            "
            @keyup.enter="sendMessage"
          />

          <button
            class="send-button"
            :disabled="
              isSending ||
              !chatInput.trim()
            "
            @click="sendMessage"
          >
            {{
              isSending
                ? '送信中...'
                : isChatOffline
                  ? 'メンテナンス中'
                  : '送信'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
}

interface ChatStatusResponse {
  name: string
  enabled: boolean
  status: 'online' | 'offline'
  maintenance: boolean
  maintenance_message: string | null
  updated_at: string | null
}

const props = defineProps<{
  apiPath: string
  description: string
  placeholder: string
  initialMessage: string
}>()

const { $api } =
  useNuxtApp()

const chatInput =
  ref('')

const isSending =
  ref(false)

const isChatOffline =
  ref(false)

const chatStatusTimer =
  ref<ReturnType<
    typeof setInterval
  > | null>(null)

const messages =
  ref<ChatMessage[]>([
    {
      role: 'bot',
      text:
        props.initialMessage
    }
  ])

const showChatModal =
  ref(false)

const chatBody =
  ref<HTMLElement | null>(
    null
  )

const chatModalBody =
  ref<HTMLElement | null>(
    null
  )

const getSelectedOrganizationId =
  () => {
    if (!import.meta.client) {
      return null
    }

    const value =
      localStorage.getItem(
        'selectedOrganizationId'
      )

    if (!value) {
      return null
    }

    const id =
      Number(value)

    return Number.isFinite(id)
      ? id
      : null
  }

const scrollChatToBottom =
  async (
    element:
      HTMLElement | null
  ) => {
    await nextTick()

    if (!element) {
      return
    }

    element.scrollTop =
      element.scrollHeight
  }

const scrollAllChatsToBottom =
  async () => {
    await nextTick()

    if (chatBody.value) {
      chatBody.value.scrollTop =
        chatBody.value.scrollHeight
    }

    if (
      chatModalBody.value
    ) {
      chatModalBody.value.scrollTop =
        chatModalBody.value.scrollHeight
    }
  }

const fetchChatStatus =
  async () => {
    try {
      const response =
        await $api.get<ChatStatusResponse>(
          '/health/ai/status'
        )

      isChatOffline.value =
        response.data.maintenance
    } catch (
      error
    ) {
      console.error(
        'AIメンテナンス状態の取得に失敗:',
        error
      )
    }
  }

const addMaintenanceMessage =
  async () => {
    messages.value.push({
      role: 'bot',
      text:
        '現在チャットサーバーをメンテナンス中です。\n' +
        'しばらくお待ちください。'
    })

    await scrollAllChatsToBottom()
  }

const openChatModal =
  async () => {
    showChatModal.value =
      true

    await nextTick()

    await scrollChatToBottom(
      chatModalBody.value
    )
  }

const closeChatModal =
  () => {
    if (
      isSending.value
    ) {
      return
    }

    showChatModal.value =
      false
  }

const sendMessage =
  async () => {
    const message =
      chatInput.value.trim()

    if (
      !message ||
      isSending.value
    ) {
      return
    }

    /*
     * AI APIがメンテナンス中なら
     * 実際のAPIリクエストは送信しない
     */
    if (
      isChatOffline.value
    ) {
      chatInput.value = ''

      await addMaintenanceMessage()

      return
    }

    messages.value.push({
      role: 'user',
      text: message
    })

    chatInput.value =
      ''

    await scrollAllChatsToBottom()

    isSending.value =
      true

    try {
      const organizationId =
        getSelectedOrganizationId()

      const payload: {
        message: string
        organization_id?: number
      } = {
        message
      }

      /*
       * 組織チャットの場合だけ
       * selectedOrganizationIdを送信
       */
      if (
        props.apiPath ===
          '/chat' &&
        organizationId !== null
      ) {
        payload.organization_id =
          organizationId
      }

      const response =
        await $api.post(
          props.apiPath,
          payload
        )

      messages.value.push({
        role: 'bot',
        text:
          response.data?.reply ||
          '回答を取得できませんでした。'
      })

      await scrollAllChatsToBottom()
    } catch (
      error: any
    ) {
      console.error(
        'BOTエラー:',
        error
      )

      /*
       * AI APIメンテナンス中
       *
       * 画面の状態取得より先に
       * POSTが503になった場合も
       * ここでOFFLINEへ切り替える
       */
      if (
        error?.response?.status ===
        503
      ) {
        isChatOffline.value =
          true

        await addMaintenanceMessage()

        return
      }

      messages.value.push({
        role: 'bot',
        text:
          error?.response?.data?.error ||
          'エラーが発生しました。'
      })

      await scrollAllChatsToBottom()
    } finally {
      isSending.value =
        false
    }
  }

onMounted(
  async () => {
    /*
     * 初回のAIメンテナンス状態確認
     */
    await fetchChatStatus()

    await scrollAllChatsToBottom()

    /*
     * 10秒ごとにメンテナンス状態を確認
     */
    chatStatusTimer.value =
      setInterval(
        fetchChatStatus,
        10000
      )
  }
)

onUnmounted(() => {
  if (
    chatStatusTimer.value
  ) {
    clearInterval(
      chatStatusTimer.value
    )

    chatStatusTimer.value =
      null
  }
})
</script>

<style scoped>
.chat-card {
  flex: 0 0 350px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  box-shadow:
    0 6px 24px
    rgba(
      20,
      30,
      55,
      0.05
    );
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 17px 19px 13px;
}

.card-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card-header p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 12px;
  line-height: 1.5;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bot-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: 0.2s ease;
}

.bot-status.offline {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  transition: 0.2s ease;
}

.bot-status.offline .status-dot {
  background: #ef4444;
}

.chat-expand-button {
  flex-shrink: 0;
  padding: 5px 9px;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.chat-expand-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #111827;
  transform: translateY(-1px);
}

.chat-body {
  flex: 1;
  min-height: 0;
  padding: 0 17px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scroll-behavior: smooth;
}

.chat-body::-webkit-scrollbar {
  width: 4px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #d6dce5;
  border-radius: 999px;
}

.message-row {
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 9px 12px;
  border-radius: 13px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-row.bot .message-bubble {
  background: #f2f4f8;
  color: #374151;
  border-bottom-left-radius: 5px;
}

.message-row.user .message-bubble {
  background: #111827;
  color: #fff;
  border-bottom-right-radius: 5px;
}

.loading-bubble {
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.loading-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9aa3b1;
  animation:
    chat-loading
    1.2s
    infinite
    ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes chat-loading {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 11px 14px 14px;
  border-top: 1px solid #edf0f5;
}

.chat-input-area input,
.chat-modal-input-area input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #dfe4ec;
  border-radius: 11px;
  outline: none;
  background: #fafbfc;
  color: #1f2937;
  font-size: 12px;
  transition: 0.2s ease;
  box-sizing: border-box;
}

.chat-input-area input:focus,
.chat-modal-input-area input:focus {
  border-color: #aeb8c8;
  background: #fff;
}

.chat-input-area input::placeholder,
.chat-modal-input-area input::placeholder {
  color: #a0a8b5;
}

.chat-input-area input:disabled,
.chat-modal-input-area input:disabled {
  background: #f5f6f8;
  cursor: not-allowed;
}

.send-button {
  flex-shrink: 0;
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 11px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.send-button:disabled {
  background: #d7dce4;
  cursor: not-allowed;
}

.chat-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(
    15,
    23,
    42,
    0.48
  );
  backdrop-filter: blur(2px);
}

.chat-modal {
  width: min(100%, 900px);
  height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  box-shadow:
    0 28px 90px
    rgba(
      15,
      23,
      42,
      0.2
    );
  overflow: hidden;
}

.chat-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #edf0f5;
}

.chat-modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 19px;
  font-weight: 700;
}

.chat-modal-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.chat-modal-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-modal-close {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.chat-modal-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.chat-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px;
  scrollbar-width: thin;
  scroll-behavior: smooth;
}

.chat-modal-body::-webkit-scrollbar {
  width: 6px;
}

.chat-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-modal-body::-webkit-scrollbar-thumb {
  background: #d6dce5;
  border-radius: 999px;
}

.chat-modal-body .message-bubble {
  max-width: 72%;
  padding: 11px 14px;
  font-size: 13px;
  line-height: 1.7;
}

.chat-modal-input-area {
  display: flex;
  gap: 10px;
  padding: 14px 18px 18px;
  border-top: 1px solid #edf0f5;
}

.chat-modal-input-area .send-button {
  height: 42px;
}

@media (max-width: 700px) {
  .chat-card {
    flex: 0 0 350px;
    min-height: 350px;
  }

  .chat-header-actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .chat-input-area {
    padding: 10px 11px 12px;
  }

  .send-button {
    padding: 0 14px;
  }

  .chat-modal-overlay {
    padding: 10px;
  }

  .chat-modal {
    width: 100%;
    height: calc(100vh - 20px);
    border-radius: 16px;
  }

  .chat-modal-header {
    padding: 16px;
  }

  .chat-modal-body {
    padding: 16px;
  }

  .chat-modal-body .message-bubble {
    max-width: 88%;
  }

  .chat-modal-input-area {
    padding: 10px 11px 12px;
  }
}
</style>