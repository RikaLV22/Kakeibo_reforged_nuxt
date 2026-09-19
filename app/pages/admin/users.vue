<template>
  <div class="admin-users">
    <div class="ambient-grid"></div>
    <div class="scan-line"></div>

    <div class="page-heading">
      <div class="heading-content">
        <div class="heading-mark">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div>
          <p class="eyebrow">02 / USER MANAGEMENT</p>
          <h1>ユーザー管理</h1>
          <p class="description">登録ユーザーの状態・権限・利用状況を管理します</p>
        </div>
      </div>

      <button
        class="refresh-button"
        :disabled="isLoading"
        @click="fetchUsers"
      >
        <span class="refresh-icon">↻</span>
        <span>{{ isLoading ? 'SYSTEM SYNC...' : 'SYSTEM REFRESH' }}</span>
      </button>
    </div>

    <section class="control-panel hud-panel">
      <div class="hud-corner top-left"></div>
      <div class="hud-corner top-right"></div>
      <div class="hud-corner bottom-left"></div>
      <div class="hud-corner bottom-right"></div>

      <div class="search-area">
        <div class="search-label">QUERY / USER DATABASE</div>
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ユーザー名・ユーザーIDで検索"
          >
          <span class="search-pulse"></span>
        </div>
      </div>

      <div class="filter-area">
        <div class="filter-label">FILTER</div>
        <div class="filter-group">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-button"
            :class="{ active: currentFilter === filter.value }"
            @click="currentFilter = filter.value"
          >
            <span class="filter-marker"></span>
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <div class="summary-card">
        <span class="summary-index">USR-01</span>
        <span class="summary-label">TOTAL USERS</span>
        <strong>{{ users.length }}</strong>
        <span class="summary-sub">登録ユーザー</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card active-card">
        <span class="summary-index">USR-02</span>
        <span class="summary-label">ACTIVE</span>
        <strong>{{ activeUsersCount }}</strong>
        <span class="summary-sub">利用可能</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card suspended-card">
        <span class="summary-index">USR-03</span>
        <span class="summary-label">SUSPENDED</span>
        <strong>{{ suspendedUsersCount }}</strong>
        <span class="summary-sub">利用停止中</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card admin-card">
        <span class="summary-index">USR-04</span>
        <span class="summary-label">ADMINS</span>
        <strong>{{ adminUsersCount }}</strong>
        <span class="summary-sub">管理者</span>
        <div class="summary-line"></div>
      </div>
    </section>

    <section class="users-panel hud-panel">
      <div class="hud-corner top-left"></div>
      <div class="hud-corner top-right"></div>
      <div class="hud-corner bottom-left"></div>
      <div class="hud-corner bottom-right"></div>

      <div class="panel-header">
        <div class="panel-title-wrap">
          <span class="panel-status-dot"></span>
          <div>
            <p class="panel-eyebrow">USER DATABASE / LIVE</p>
            <h2>ユーザー一覧</h2>
          </div>
        </div>

        <div class="result-meta">
          <span class="result-label">RESULT</span>
          <span class="result-count">{{ filteredUsers.length }} USERS</span>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="loading-core">
          <div class="loading-spinner"></div>
          <div class="loading-core-center"></div>
        </div>
        <span class="loading-code">ACCESSING USER DATABASE...</span>
        <p>ユーザー情報を取得しています...</p>
        <div class="loading-progress">
          <span></span>
        </div>
      </div>

      <div
        v-else-if="loadError"
        class="error-state"
      >
        <div class="state-frame">
          <div class="error-symbol">!</div>
        </div>
        <span class="state-code">DATABASE ACCESS FAILURE</span>
        <h3>データ取得エラー</h3>
        <p>{{ loadError }}</p>
        <button @click="fetchUsers">
          <span>RETRY CONNECTION</span>
        </button>
      </div>

      <div
        v-else-if="filteredUsers.length === 0"
        class="empty-state"
      >
        <div class="state-frame">
          <div class="empty-symbol">⌕</div>
        </div>
        <span class="state-code">QUERY RESULT / NULL</span>
        <h3>該当ユーザーなし</h3>
        <p>検索条件に一致するユーザーがありません。</p>
      </div>

      <div
        v-else
        class="user-table"
      >
        <div class="table-header">
          <span>ID</span>
          <span>ユーザー</span>
          <span>権限</span>
          <span>状態</span>
          <span>登録日</span>
          <span>操作</span>
        </div>

        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="user-row"
          :style="{ '--row-index': index }"
        >
          <div class="row-state-line"></div>

          <span class="user-id">
            #{{ user.id }}
          </span>

          <div class="user-profile">
            <div class="user-avatar">
              <span>{{ user.username.charAt(0).toUpperCase() }}</span>
              <div class="avatar-scan"></div>
            </div>

            <div class="user-info">
              <strong>{{ user.username }}</strong>
              <span>{{ user.public_id }}</span>
            </div>
          </div>

          <span
            class="role-badge"
            :class="user.role"
          >
            <span class="badge-dot"></span>
            {{ user.role === 'admin' ? 'ADMIN' : 'USER' }}
          </span>

          <span
            class="status-badge"
            :class="user.suspended ? 'suspended' : 'active'"
          >
            <span class="status-dot"></span>
            {{ user.suspended ? 'SUSPENDED' : 'ACTIVE' }}
          </span>

          <span class="created-date">
            {{ formatDate(user.created_at) }}
          </span>

          <div class="action-group">
            <button
              class="detail-button"
              @click="openUserDetail(user.id)"
            >
              <span>詳細</span>
              <span class="button-arrow">→</span>
            </button>

            <button
              v-if="user.suspended"
              class="restore-button"
              :disabled="processingUserId === user.id"
              @click="restoreUser(user)"
            >
              {{ processingUserId === user.id ? '処理中...' : '復元' }}
            </button>

            <button
              v-else
              class="suspend-button"
              :disabled="processingUserId === user.id || user.role === 'admin'"
              @click="suspendUser(user)"
            >
              {{ processingUserId === user.id ? '処理中...' : '停止' }}
            </button>

            <button
              class="force-logout-button"
              :disabled="processingUserId === user.id || user.role === 'admin'"
              @click="forceLogout(user)"
            >
              {{ processingUserId === user.id ? '処理中...' : '強制ログアウト' }}
            </button>
          </div>

          <div class="row-scanline"></div>
        </div>
      </div>
    </section>

    <Transition name="modal">
      <div
        v-if="showDetailModal"
        class="modal-overlay"
        @click.self="closeUserDetail"
      >
        <div class="modal-backdrop-grid"></div>

        <div class="detail-modal">
          <div class="modal-glow"></div>
          <div class="modal-corner top-left"></div>
          <div class="modal-corner top-right"></div>
          <div class="modal-corner bottom-left"></div>
          <div class="modal-corner bottom-right"></div>

          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">USER PROFILE / ACCESS DATA</p>
              <h2>ユーザー詳細</h2>
            </div>

            <button
              class="close-button"
              @click="closeUserDetail"
            >
              ×
            </button>
          </div>

          <div
            v-if="isLoadingDetail"
            class="modal-loading"
          >
            <div class="loading-core">
              <div class="loading-spinner"></div>
              <div class="loading-core-center"></div>
            </div>
            <span>DECRYPTING USER DATA...</span>
            <p>ユーザー情報を取得しています...</p>
          </div>

          <div
            v-else-if="selectedUser"
            class="modal-content"
          >
            <div class="profile-header">
              <div class="profile-scan"></div>

              <div class="large-avatar">
                <span>{{ selectedUser.username.charAt(0).toUpperCase() }}</span>
                <div class="large-avatar-scan"></div>
              </div>

              <div class="profile-main">
                <span class="profile-status">
                  ● CONNECTION VERIFIED
                </span>
                <h3>{{ selectedUser.username }}</h3>
                <p>{{ selectedUser.public_id }}</p>
              </div>

              <div class="profile-id-box">
                <span>USER ID</span>
                <strong>#{{ selectedUser.id }}</strong>
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <span>ROLE</span>
                <strong>{{ selectedUser.role === 'admin' ? 'ADMIN' : 'USER' }}</strong>
                <div class="detail-bar"></div>
              </div>

              <div class="detail-item">
                <span>STATUS</span>
                <strong :class="selectedUser.suspended ? 'danger-text' : 'success-text'">
                  {{ selectedUser.suspended ? 'SUSPENDED' : 'ACTIVE' }}
                </strong>
                <div class="detail-bar"></div>
              </div>

              <div class="detail-item">
                <span>REGISTERED</span>
                <strong>{{ formatDate(selectedUser.created_at) }}</strong>
                <div class="detail-bar"></div>
              </div>

              <div class="detail-item">
                <span>ORGANIZATIONS</span>
                <strong>{{ selectedUser.organization_count ?? 0 }}</strong>
                <div class="detail-bar"></div>
              </div>

              <div class="detail-item">
                <span>TRANSACTIONS</span>
                <strong>{{ selectedUser.transaction_count ?? 0 }}</strong>
                <div class="detail-bar"></div>
              </div>

              <div class="detail-item">
                <span>ACCOUNT STATE</span>
                <strong>{{ selectedUser.suspended ? 'RESTRICTED' : 'AUTHORIZED' }}</strong>
                <div class="detail-bar"></div>
              </div>
            </div>

            <div
              v-if="selectedUser.organizations?.length"
              class="organizations-section"
            >
              <div class="section-title">
                <div>
                  <span class="section-index">ORG / LINKED</span>
                  <h4>所属組織</h4>
                </div>

                <span class="organization-count">
                  {{ selectedUser.organizations.length }}
                </span>
              </div>

              <div class="organization-list">
                <div
                  v-for="organization in selectedUser.organizations"
                  :key="organization.id"
                  class="organization-item"
                >
                  <div class="organization-icon">
                    {{ organization.name.charAt(0).toUpperCase() }}
                  </div>

                  <div class="organization-info">
                    <strong>{{ organization.name }}</strong>
                    <span>{{ organization.public_id }}</span>
                  </div>

                  <span class="organization-arrow">→</span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="no-organizations"
            >
              <span class="no-org-code">LINKED ORGANIZATION / 00</span>
              所属組織はありません。
            </div>

            <div class="modal-action-section">
              <div class="danger-zone-label">SESSION CONTROL</div>

              <button
                v-if="selectedUser.role !== 'admin'"
                class="modal-force-logout-button"
                :disabled="processingUserId === selectedUser.id"
                @click="forceLogout(selectedUser)"
              >
                <span class="logout-icon">◉</span>
                <span>
                  {{
                    processingUserId === selectedUser.id
                      ? 'SESSION TERMINATING...'
                      : 'このユーザーを強制ログアウト'
                  }}
                </span>
                <span class="action-arrow">→</span>
              </button>

              <div
                v-else
                class="admin-protected-message"
              >
                <span>◆</span>
                ADMIN ACCOUNT / PROTECTED
              </div>
            </div>

            <div class="modal-security-bar">
              <span>SECURE ADMIN CHANNEL</span>
              <span>AUTH: VERIFIED</span>
              <span>NODE: ACTIVE</span>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="modal-close-button"
              @click="closeUserDetail"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface AdminUser {
  id: number
  username: string
  public_id: string
  role: 'user' | 'admin'
  suspended: boolean
  suspended_at: string | null
  created_at: string
  organization_count?: number
  transaction_count?: number
  organizations?: {
    id: number
    name: string
    public_id: string
  }[]
}

const { $api } = useNuxtApp()

const users = ref<AdminUser[]>([])
const searchQuery = ref('')
const currentFilter = ref<'all' | 'active' | 'suspended' | 'admin'>('all')
const isLoading = ref(true)
const loadError = ref('')
const processingUserId = ref<number | null>(null)
const showDetailModal = ref(false)
const isLoadingDetail = ref(false)
const selectedUser = ref<AdminUser | null>(null)

const filters = [
  { label: 'すべて', value: 'all' as const },
  { label: 'ACTIVE', value: 'active' as const },
  { label: 'SUSPENDED', value: 'suspended' as const },
  { label: 'ADMIN', value: 'admin' as const }
]

const activeUsersCount = computed(() =>
  users.value.filter(user => !user.suspended).length
)

const suspendedUsersCount = computed(() =>
  users.value.filter(user => user.suspended).length
)

const adminUsersCount = computed(() =>
  users.value.filter(user => user.role === 'admin').length
)

const filteredUsers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  return users.value.filter(user => {
    const matchesSearch =
      !keyword ||
      user.username.toLowerCase().includes(keyword) ||
      user.public_id.toLowerCase().includes(keyword)

    const matchesFilter =
      currentFilter.value === 'all' ||
      (currentFilter.value === 'active' && !user.suspended) ||
      (currentFilter.value === 'suspended' && user.suspended) ||
      (currentFilter.value === 'admin' && user.role === 'admin')

    return matchesSearch && matchesFilter
  })
})

const fetchUsers = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await $api.get<AdminUser[]>('/admin/users')
    users.value = response.data
  } catch (error: any) {
    console.error('ユーザー一覧の取得に失敗しました:', error)

    if (error?.response?.status === 403) {
      loadError.value = '管理者権限が必要です。'
    } else {
      loadError.value = 'ユーザー一覧の取得に失敗しました。'
    }
  } finally {
    isLoading.value = false
  }
}

const openUserDetail = async (userId: number) => {
  showDetailModal.value = true
  isLoadingDetail.value = true
  selectedUser.value = null

  try {
    const response = await $api.get<AdminUser>(`/admin/users/${userId}`)
    selectedUser.value = response.data
  } catch (error) {
    console.error('ユーザー詳細の取得に失敗しました:', error)
    selectedUser.value = null
  } finally {
    isLoadingDetail.value = false
  }
}

const closeUserDetail = () => {
  if (isLoadingDetail.value) {
    return
  }

  showDetailModal.value = false
  selectedUser.value = null
}

const suspendUser = async (user: AdminUser) => {
  if (user.role === 'admin') {
    return
  }

  const confirmed = window.confirm(
    `${user.username} を停止しますか？\n停止するとこのユーザーは利用できなくなります。`
  )

  if (!confirmed) {
    return
  }

  processingUserId.value = user.id

  try {
    const response = await $api.patch<{ user: AdminUser }>(
      `/admin/users/${user.id}/suspend`
    )

    const index = users.value.findIndex(item => item.id === user.id)

    if (index !== -1) {
      users.value[index] = response.data.user
    }

    if (selectedUser.value?.id === user.id) {
      selectedUser.value = response.data.user
    }
  } catch (error: any) {
    console.error('ユーザー停止に失敗しました:', error)

    window.alert(
      error?.response?.data?.message ||
      'ユーザーの停止に失敗しました。'
    )
  } finally {
    processingUserId.value = null
  }
}

const restoreUser = async (user: AdminUser) => {
  const confirmed = window.confirm(
    `${user.username} を復元しますか？`
  )

  if (!confirmed) {
    return
  }

  processingUserId.value = user.id

  try {
    const response = await $api.patch<{ user: AdminUser }>(
      `/admin/users/${user.id}/restore`
    )

    const index = users.value.findIndex(item => item.id === user.id)

    if (index !== -1) {
      users.value[index] = response.data.user
    }

    if (selectedUser.value?.id === user.id) {
      selectedUser.value = response.data.user
    }
  } catch (error: any) {
    console.error('ユーザー復元に失敗しました:', error)

    window.alert(
      error?.response?.data?.message ||
      'ユーザーの復元に失敗しました。'
    )
  } finally {
    processingUserId.value = null
  }
}

const forceLogout = async (user: AdminUser) => {
  if (user.role === 'admin') {
    return
  }

  const confirmed = window.confirm(
    `${user.username} を強制ログアウトしますか？\n現在のセッションが無効になります。`
  )

  if (!confirmed) {
    return
  }

  processingUserId.value = user.id

  try {
    const response = await $api.post<{
      message: string
      user: AdminUser
    }>(`/admin/users/${user.id}/force_logout`)

    const index = users.value.findIndex(item => item.id === user.id)

    if (index !== -1) {
      users.value[index] = response.data.user
    }

    if (selectedUser.value?.id === user.id) {
      selectedUser.value = response.data.user
    }

    window.alert(
      response.data.message ||
      `${user.username} のセッションを無効化しました。`
    )
  } catch (error: any) {
    console.error('強制ログアウトに失敗しました:', error)

    window.alert(
      error?.response?.data?.message ||
      '強制ログアウトに失敗しました。'
    )
  } finally {
    processingUserId.value = null
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-users {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 82% 4%,
      rgba(34, 184, 223, 0.08),
      transparent 26%
    ),
    radial-gradient(
      circle at 8% 92%,
      rgba(49, 185, 133, 0.045),
      transparent 23%
    ),
    #f4f9fc;
  color: #17313d;
}

.ambient-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.8;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    );
  background-size: 56px 56px;
  mask-image:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.7),
      transparent 92%
    );
  animation: ambient-shift 18s ease-in-out infinite;
}

.scan-line {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 1px;
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.45),
      transparent
    );
  box-shadow:
    0 0 12px rgba(34, 184, 223, 0.22);
  animation: global-scan 7s linear infinite;
}

.page-heading,
.control-panel,
.summary-grid,
.users-panel {
  position: relative;
  z-index: 2;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  width: min(100%, 1400px);
  margin: 0 auto 28px;
  animation:
    heading-enter 0.55s
    ease-out both;
}

.heading-content {
  display: flex;
  align-items: center;
  gap: 13px;
}

.heading-mark {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 4px;
}

.heading-mark span {
  width: 4px;
  height: 12px;
  background: #22b8df;
  box-shadow:
    0 0 10px rgba(34, 184, 223, 0.35);
}

.heading-mark span:nth-child(2) {
  height: 22px;
  opacity: 0.65;
}

.heading-mark span:nth-child(3) {
  height: 7px;
  opacity: 0.35;
}

.eyebrow,
.panel-eyebrow,
.modal-eyebrow {
  margin: 0 0 8px;
  color: #22b8df;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.page-heading h1 {
  margin: 0;
  color: #17313d;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.description {
  margin: 8px 0 0;
  color: #6d8792;
  font-size: 13px;
}

.refresh-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 15px;
  overflow: hidden;
  border: 1px solid #bcd8e2;
  border-radius: 6px;
  background: #ffffff;
  color: #1598bc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.refresh-button::before {
  position: absolute;
  top: 0;
  left: -100%;
  width: 70%;
  height: 100%;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.08),
      transparent
    );
  transition: left 0.4s ease;
}

.refresh-button:hover:not(:disabled)::before {
  left: 130%;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #22b8df;
  background: #f8fdff;
  box-shadow:
    0 8px 22px rgba(34, 184, 223, 0.1),
    0 0 0 3px rgba(34, 184, 223, 0.035);
}

.refresh-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
  font-size: 16px;
  line-height: 1;
}

.refresh-button:disabled .refresh-icon {
  animation:
    spin 0.8s linear infinite;
}

.hud-panel {
  border: 1px solid #cfe2e9;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.97),
      rgba(248, 252, 253, 0.94)
    );
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.018),
    0 12px 40px rgba(47, 88, 106, 0.07);
}

.control-panel {
  display: flex;
  align-items: center;
  gap: 18px;
  width: min(100%, 1400px);
  margin: 0 auto 16px;
  padding: 16px;
  box-sizing: border-box;
  animation:
    panel-enter 0.5s
    0.08s ease-out both;
}

.hud-corner,
.modal-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
}

.hud-corner::before,
.hud-corner::after,
.modal-corner::before,
.modal-corner::after {
  position: absolute;
  content: "";
  background: #22b8df;
}

.hud-corner::before,
.modal-corner::before {
  width: 100%;
  height: 1px;
}

.hud-corner::after,
.modal-corner::after {
  width: 1px;
  height: 100%;
}

.top-left,
.top-right {
  top: -1px;
}

.bottom-left,
.bottom-right {
  bottom: -1px;
}

.top-left,
.bottom-left {
  left: -1px;
}

.top-right,
.bottom-right {
  right: -1px;
}

.top-right::before,
.bottom-right::before {
  right: 0;
}

.top-right::after,
.bottom-right::after {
  right: 0;
}

.bottom-left::before,
.bottom-right::before {
  bottom: 0;
}

.bottom-left::after,
.bottom-right::after {
  bottom: 0;
}

.search-area {
  flex: 1;
  min-width: 0;
}

.search-label,
.filter-label {
  margin-bottom: 7px;
  color: #6d8792;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #c7dfe7;
  background: #fafdfe;
  overflow: hidden;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.search-box:focus-within {
  border-color: rgba(34, 184, 223, 0.6);
  box-shadow:
    0 0 0 3px rgba(34, 184, 223, 0.05),
    inset 0 0 18px rgba(34, 184, 223, 0.025);
}

.search-icon {
  margin-right: 10px;
  color: #22b8df;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #17313d;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #8aa2ac;
}

.search-pulse {
  position: absolute;
  right: 12px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow:
    0 0 8px rgba(34, 184, 223, 0.55);
  animation:
    pulse-dot 1.8s
    ease-in-out infinite;
}

.filter-area {
  flex-shrink: 0;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-button {
  position: relative;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #c7dbe2;
  background: #ffffff;
  color: #708994;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-button:hover {
  transform: translateY(-1px);
  border-color: #83b9c9;
  color: #2e6474;
  background: #f8fcfd;
}

.filter-button.active {
  border-color: #22b8df;
  background: #eaf9fd;
  color: #1597bb;
  box-shadow:
    inset 0 0 16px rgba(34, 184, 223, 0.025);
}

.filter-marker {
  display: inline-block;
  width: 4px;
  height: 4px;
  margin-right: 6px;
  vertical-align: middle;
  background: currentColor;
  box-shadow:
    0 0 6px currentColor;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: min(100%, 1400px);
  margin: 0 auto 16px;
}

.summary-card {
  position: relative;
  padding: 17px;
  overflow: hidden;
  border: 1px solid #cfe2e9;
  background:
    linear-gradient(
      145deg,
      #ffffff,
      #f8fcfd
    );
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.018),
    0 10px 28px rgba(47, 88, 106, 0.06);
  animation:
    card-enter 0.45s
    ease-out both;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.summary-card:nth-child(1) {
  animation-delay: 0.1s;
}

.summary-card:nth-child(2) {
  animation-delay: 0.16s;
}

.summary-card:nth-child(3) {
  animation-delay: 0.22s;
}

.summary-card:nth-child(4) {
  animation-delay: 0.28s;
}

.summary-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 184, 223, 0.3);
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.025),
    0 14px 32px rgba(47, 88, 106, 0.1);
}

.summary-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 28%;
  height: 1px;
  content: "";
  background: #22b8df;
  box-shadow:
    0 0 10px rgba(34, 184, 223, 0.3);
}

.summary-card::after {
  position: absolute;
  top: 0;
  right: -60px;
  width: 120px;
  height: 100%;
  content: "";
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(34, 184, 223, 0.025),
      transparent
    );
  transform: skewX(-20deg);
  animation:
    card-scan 6s
    linear infinite;
}

.summary-index {
  display: block;
  color: #91adb7;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.summary-label {
  display: block;
  margin-top: 7px;
  color: #6d8792;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.summary-card strong {
  display: block;
  margin-top: 7px;
  color: #17313d;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.summary-sub {
  display: block;
  margin-top: 6px;
  color: #6d8792;
  font-size: 10px;
}

.summary-line {
  width: 100%;
  height: 1px;
  margin-top: 14px;
  background:
    linear-gradient(
      90deg,
      #9ccbd7,
      transparent
    );
  transform-origin: left;
  animation:
    line-grow 1s
    ease-out both;
}

.active-card::before {
  background: #31b985;
  box-shadow:
    0 0 10px rgba(49, 185, 133, 0.24);
}

.suspended-card::before {
  background: #e56557;
  box-shadow:
    0 0 10px rgba(229, 101, 87, 0.22);
}

.admin-card::before {
  background: #7b70d9;
  box-shadow:
    0 0 10px rgba(123, 112, 217, 0.22);
}

.users-panel {
  width: min(100%, 1400px);
  margin: 0 auto;
  overflow: hidden;
  animation:
    panel-enter 0.55s
    0.2s ease-out both;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #d7e7ec;
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.02),
      transparent 40%
    );
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #31b985;
  box-shadow:
    0 0 9px rgba(49, 185, 133, 0.5);
  animation:
    pulse-dot 2s
    ease-in-out infinite;
}

.panel-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 18px;
  font-weight: 800;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-label {
  color: #8299a3;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.result-count {
  color: #4f8fa3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.user-table {
  width: 100%;
  overflow-x: auto;
}

.table-header,
.user-row {
  display: grid;
  grid-template-columns:
    70px
    minmax(220px, 1.8fr)
    100px
    130px
    120px
    330px;
  align-items: center;
  gap: 12px;
  min-width: 1050px;
  padding: 13px 20px;
}

.table-header {
  border-bottom: 1px solid #dce9ed;
  background: #f6fbfd;
  color: #6a8590;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.user-row {
  position: relative;
  min-height: 74px;
  border-bottom: 1px solid #e0edf1;
  overflow: hidden;
  animation:
    row-enter 0.4s
    ease-out both;
  animation-delay:
    calc(var(--row-index) * 45ms);
  transition:
    background 0.22s ease,
    border-color 0.22s ease;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.04),
      rgba(248, 252, 253, 0.9)
    );
}

.row-state-line {
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #c6dbe2;
  transform: scaleY(0.3);
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.user-row:hover .row-state-line {
  background: #22b8df;
  box-shadow:
    0 0 10px rgba(34, 184, 223, 0.35);
  transform: scaleY(1);
}

.row-scanline {
  position: absolute;
  left: -100%;
  right: 0;
  bottom: 0;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      #22b8df,
      transparent
    );
  opacity: 0;
}

.user-row:hover .row-scanline {
  opacity: 0.7;
  animation:
    row-scan 1s
    linear;
}

.user-id {
  color: #78919b;
  font-size: 11px;
  font-weight: 700;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.user-avatar,
.large-avatar,
.organization-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bfe0e8;
  background:
    linear-gradient(
      145deg,
      rgba(34, 184, 223, 0.1),
      rgba(240, 250, 253, 0.95)
    ),
    #ffffff;
  color: #1599bd;
  font-weight: 800;
  overflow: hidden;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 12px;
}

.avatar-scan,
.large-avatar-scan {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: #22b8df;
  box-shadow:
    0 0 8px rgba(34, 184, 223, 0.55);
  transform: translateY(-20px);
  opacity: 0;
}

.user-row:hover .avatar-scan {
  opacity: 0.65;
  animation:
    avatar-scan 0.8s
    ease-out;
}

.user-info {
  min-width: 0;
}

.user-info strong {
  display: block;
  overflow: hidden;
  color: #31525e;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info span {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #8098a2;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 8px;
  border: 1px solid;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.role-badge.user {
  border-color: #c8dbe1;
  color: #6d8792;
  background: #fbfdfe;
}

.role-badge.admin {
  border-color: #9ed4e2;
  background: #eefafd;
  color: #1d94b5;
}

.badge-dot {
  width: 4px;
  height: 4px;
  margin-right: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    0 0 6px currentColor;
}

.status-badge.active {
  border-color: #b7dccd;
  background: #f1fbf7;
  color: #299f77;
}

.status-badge.suspended {
  border-color: #e2b9b3;
  background: #fff8f7;
  color: #d45d50;
}

.status-dot {
  width: 5px;
  height: 5px;
  margin-right: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    0 0 8px currentColor;
}

.created-date {
  color: #78919b;
  font-size: 10px;
}

.action-group {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.detail-button,
.suspend-button,
.restore-button,
.force-logout-button {
  height: 30px;
  padding: 0 10px;
  border: 1px solid;
  background: transparent;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.detail-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-color: #bfd6de;
  color: #577580;
}

.detail-button:hover {
  transform: translateY(-1px);
  border-color: #22b8df;
  color: #1597bb;
  background: #f5fcfe;
}

.button-arrow {
  color: #22b8df;
}

.suspend-button {
  border-color: #e0b7b1;
  color: #d45d50;
}

.suspend-button:hover {
  transform: translateY(-1px);
  background: #fff7f5;
  border-color: #d98c81;
}

.restore-button {
  border-color: #acd5c6;
  color: #299f77;
}

.restore-button:hover {
  transform: translateY(-1px);
  background: #f1fbf7;
  border-color: #7fbba7;
}

.force-logout-button {
  border-color: #dfc993;
  color: #b48722;
}

.force-logout-button:hover {
  transform: translateY(-1px);
  background: #fffaf0;
  border-color: #c9a452;
}

.suspend-button:disabled,
.restore-button:disabled,
.force-logout-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  box-sizing: border-box;
  text-align: center;
}

.loading-core {
  position: relative;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 184, 223, 0.18);
  border-radius: 50%;
}

.loading-spinner {
  width: 34px;
  height: 34px;
  border: 1px solid #d5e7ec;
  border-top-color: #22b8df;
  border-right-color: #22b8df;
  border-radius: 50%;
  animation:
    spin 0.8s
    linear infinite;
}

.loading-core-center {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow:
    0 0 12px rgba(34, 184, 223, 0.55);
  animation:
    pulse-dot 1.2s
    ease-in-out infinite;
}

.loading-code,
.state-code {
  margin-top: 15px;
  color: #5c8591;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 9px 0 0;
  color: #6d8792;
  font-size: 11px;
}

.loading-progress {
  width: 220px;
  height: 2px;
  margin-top: 16px;
  overflow: hidden;
  background: #dbeaf0;
}

.loading-progress span {
  display: block;
  width: 35%;
  height: 100%;
  background: #22b8df;
  box-shadow:
    0 0 8px rgba(34, 184, 223, 0.45);
  animation:
    loading-progress 1.2s
    ease-in-out infinite;
}

.state-frame {
  position: relative;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2bdb7;
}

.state-frame::before,
.state-frame::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
}

.state-frame::before {
  top: -1px;
  left: -1px;
  border-top: 1px solid #e08b80;
  border-left: 1px solid #e08b80;
}

.state-frame::after {
  right: -1px;
  bottom: -1px;
  border-right: 1px solid #e08b80;
  border-bottom: 1px solid #e08b80;
}

.error-symbol,
.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  color: #d96254;
  font-size: 22px;
}

.empty-state .state-frame {
  border-color: #c7dfe7;
}

.empty-state .state-frame::before {
  border-top-color: #8bc8d7;
  border-left-color: #8bc8d7;
}

.empty-state .state-frame::after {
  border-right-color: #8bc8d7;
  border-bottom-color: #8bc8d7;
}

.empty-symbol {
  color: #22b8df;
}

.error-state h3,
.empty-state h3 {
  margin: 12px 0 0;
  color: #31525e;
  font-size: 14px;
}

.error-state button {
  margin-top: 14px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #bfd6de;
  background: transparent;
  color: #577580;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.error-state button:hover {
  border-color: #22b8df;
  color: #1597bb;
  background: #f5fcfe;
}

/* =========================
   Modal
   ========================= */

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .detail-modal,
.modal-leave-active .detail-modal {
  transition:
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .detail-modal,
.modal-leave-to .detail-modal {
  transform:
    translateY(14px)
    scale(0.985);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  background: rgba(23, 49, 61, 0.3);
  backdrop-filter: blur(7px);
}

.modal-backdrop-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.035) 1px,
      transparent 1px
    );
  background-size: 28px 28px;
  opacity: 0.7;
  animation:
    modal-grid 12s
    linear infinite;
}

.detail-modal {
  position: relative;
  z-index: 1;
  width: min(100%, 760px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #b9dce7;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(34, 184, 223, 0.05),
      transparent 35%
    ),
    #ffffff;
  box-shadow:
    0 0 0 1px rgba(34, 184, 223, 0.04),
    0 24px 80px rgba(32, 76, 94, 0.2),
    0 0 45px rgba(34, 184, 223, 0.06);
}

.modal-glow {
  position: absolute;
  top: 0;
  left: 12%;
  width: 76%;
  height: 1px;
  background: #22b8df;
  box-shadow:
    0 0 20px rgba(34, 184, 223, 0.35);
}

.modal-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #d5e6eb;
}

.modal-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 20px;
  font-weight: 800;
}

.modal-eyebrow {
  color: #22b8df;
}

.close-button {
  width: 32px;
  height: 32px;
  border: 1px solid #bfd6de;
  background: #ffffff;
  color: #738c96;
  font-size: 20px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.close-button:hover {
  transform: rotate(90deg);
  border-color: #22b8df;
  background: #f5fcfe;
  color: #22b8df;
}

.modal-loading {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6f8994;
  font-size: 10px;
  letter-spacing: 0.1em;
}

.modal-loading p {
  margin: 8px 0 0;
  color: #6d8792;
  font-size: 11px;
  letter-spacing: normal;
}

.modal-content {
  position: relative;
  z-index: 2;
  padding: 22px;
}

.profile-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px;
  border: 1px solid #cfe3e9;
  background:
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.045),
      rgba(248, 252, 253, 0.96)
    );
  overflow: hidden;
}

.profile-scan {
  position: absolute;
  top: 0;
  left: -120%;
  width: 90%;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      #22b8df,
      transparent
    );
  opacity: 0.55;
  animation:
    profile-scan 4s
    linear infinite;
}

.large-avatar {
  width: 62px;
  height: 62px;
  border-radius: 10px;
  font-size: 20px;
}

.large-avatar-scan {
  opacity: 0.45;
  animation:
    large-avatar-scan 2.8s
    linear infinite;
}

.profile-main {
  min-width: 0;
}

.profile-status {
  display: block;
  margin-bottom: 4px;
  color: #299f77;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.profile-header h3 {
  margin: 0;
  color: #31525e;
  font-size: 18px;
  font-weight: 800;
}

.profile-header p {
  margin: 5px 0 0;
  color: #78939d;
  font-size: 10px;
}

.profile-id-box {
  margin-left: auto;
  padding: 8px 10px;
  border: 1px solid #c9dde4;
  background: #f8fcfd;
  text-align: right;
}

.profile-id-box span {
  display: block;
  color: #718a94;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.profile-id-box strong {
  display: block;
  margin-top: 4px;
  color: #2296b3;
  font-size: 11px;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.detail-item {
  position: relative;
  padding: 13px;
  border: 1px solid #d5e5ea;
  background: #fafdfe;
  overflow: hidden;
}

.detail-item span {
  display: block;
  color: #718a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.detail-item strong {
  display: block;
  margin-top: 5px;
  color: #31525e;
  font-size: 12px;
  font-weight: 800;
}

.detail-item .success-text {
  color: #299f77;
}

.detail-item .danger-text {
  color: #d45d50;
}

.detail-bar {
  width: 35%;
  height: 1px;
  margin-top: 10px;
  background:
    linear-gradient(
      90deg,
      #a8d4df,
      transparent
    );
  box-shadow:
    0 0 8px rgba(34, 184, 223, 0.08);
}

.organizations-section {
  margin-top: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.section-title > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-index {
  color: #7b96a0;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.section-title h4 {
  margin: 0;
  color: #31525e;
  font-size: 13px;
}

.organization-count {
  padding: 4px 7px;
  border: 1px solid #bddbe4;
  color: #2295b3;
  background: #f4fbfd;
  font-size: 9px;
}

.organization-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.organization-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #d5e5ea;
  background: #fbfdfe;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.organization-item:hover {
  transform: translateX(2px);
  border-color: #9fcbd8;
  background: #f7fcfe;
}

.organization-icon {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  font-size: 11px;
}

.organization-info {
  min-width: 0;
}

.organization-item strong {
  display: block;
  color: #31525e;
  font-size: 11px;
}

.organization-item span {
  display: block;
  margin-top: 3px;
  color: #78929c;
  font-size: 9px;
}

.organization-arrow {
  margin-left: auto;
  color: #4b8ca0;
  font-size: 14px;
}

.no-organizations {
  margin-top: 18px;
  padding: 15px;
  border: 1px solid #d5e5ea;
  background: #fafdfe;
  color: #6d8792;
  text-align: center;
  font-size: 10px;
}

.no-org-code {
  display: block;
  margin-bottom: 5px;
  color: #78939d;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-action-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #d8e7ec;
}

.danger-zone-label {
  margin-bottom: 8px;
  color: #a27a28;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-force-logout-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #dec98e;
  background: #fffaf0;
  color: #af8427;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.modal-force-logout-button:hover {
  border-color: #c6a34b;
  background: #fff8e9;
  box-shadow:
    0 0 18px rgba(220, 174, 56, 0.06);
}

.modal-force-logout-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.logout-icon {
  font-size: 10px;
}

.action-arrow {
  margin-left: auto;
  font-size: 14px;
}

.admin-protected-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  border: 1px solid #d3e0e5;
  background: #f7fafb;
  color: #718a94;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.admin-protected-message span {
  color: #c29830;
}

.modal-security-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #e0ebef;
  color: #7a949d;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 22px 20px;
  border-top: 1px solid #d5e6eb;
}

.modal-close-button {
  height: 36px;
  min-width: 90px;
  border: 1px solid #bfd6de;
  background: #ffffff;
  color: #577580;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.modal-close-button:hover {
  border-color: #22b8df;
  background: #f5fcfe;
  color: #1597bb;
}

/* =========================
   Animation
   ========================= */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes global-scan {
  0% {
    transform: translateY(-10vh);
  }

  100% {
    transform: translateY(110vh);
  }
}

@keyframes ambient-shift {
  0%,
  100% {
    opacity: 0.65;
    transform: translateX(0);
  }

  50% {
    opacity: 0.95;
    transform: translateX(12px);
  }
}

@keyframes heading-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
    filter: blur(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(1.5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes card-scan {
  0% {
    transform: translateX(-40px) skewX(-20deg);
  }

  100% {
    transform: translateX(360px) skewX(-20deg);
  }
}

@keyframes line-grow {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes row-scan {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes avatar-scan {
  0% {
    transform: translateY(-20px);
  }

  100% {
    transform: translateY(50px);
  }
}

@keyframes profile-scan {
  0% {
    left: -120%;
  }

  45%,
  100% {
    left: 120%;
  }
}

@keyframes large-avatar-scan {
  0% {
    transform: translateY(-35px);
  }

  100% {
    transform: translateY(70px);
  }
}

@keyframes loading-progress {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(600%);
  }
}

@keyframes modal-grid {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 28px 28px;
  }
}

/* =========================
   Responsive
   ========================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .control-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-area {
    width: 100%;
  }

  .filter-group {
    justify-content: flex-start;
  }

  .table-header {
    display: none;
  }

  .user-table {
    overflow-x: visible;
  }

  .user-row {
    grid-template-columns: 1fr;
    min-width: 0;
    gap: 9px;
    padding: 16px;
  }

  .action-group {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .admin-users {
    padding: 16px;
  }

  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .heading-content {
    align-items: flex-start;
  }

  .page-heading h1 {
    font-size: 27px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

  .profile-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-id-box {
    width: 100%;
    margin-left: 0;
    text-align: left;
  }

  .modal-security-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-button,
  .suspend-button,
  .restore-button,
  .force-logout-button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-grid,
  .scan-line,
  .summary-card,
  .user-row,
  .refresh-button:disabled .refresh-icon,
  .loading-spinner,
  .loading-core-center,
  .panel-status-dot,
  .search-pulse,
  .profile-scan,
  .large-avatar-scan,
  .modal-backdrop-grid {
    animation: none !important;
  }
}
</style>