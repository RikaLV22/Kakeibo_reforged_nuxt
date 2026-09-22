<template>
  <div class="admin-organizations">
    <div class="ambient-grid"></div>
    <div class="ambient-scan"></div>

    <div class="page-heading page-enter">
      <div>
        <p class="eyebrow">03 / ORGANIZATION MANAGEMENT</p>
        <h1>組織管理</h1>
        <p class="description">登録組織・所属メンバー・利用状況を管理します</p>
      </div>
      <button class="refresh-button" :disabled="isLoading" @click="fetchOrganizations">
        <span class="refresh-icon">↻</span>
        {{ isLoading ? '更新中...' : '更新' }}
      </button>
    </div>

    <section class="control-panel panel-enter panel-delay-1">
      <div class="panel-corner top-left"></div>
      <div class="panel-corner top-right"></div>
      <div class="panel-corner bottom-left"></div>
      <div class="panel-corner bottom-right"></div>

      <div class="search-box">
        <span class="search-pulse"></span>
        <span class="search-icon">⌕</span>
        <input v-model="searchQuery" type="text" placeholder="組織名・組織IDで検索">
        <span class="search-label">SEARCH</span>
      </div>

      <div class="organization-filter">
        <div class="filter-heading">
          <span class="filter-title">ORGANIZATION STATUS</span>
          <span class="filter-count">{{ filteredOrganizations.length }} RESULTS</span>
        </div>

        <div class="filter-buttons">
          <button
            class="filter-button"
            :class="{ active: organizationFilter === 'all' }"
            @click="organizationFilter = 'all'"
          >
            すべて
            <span>{{ organizations.length }}</span>
          </button>

          <button
            class="filter-button"
            :class="{ active: organizationFilter === 'active' }"
            @click="organizationFilter = 'active'"
          >
            メンバーあり
            <span>{{ activeOrganizationCount }}</span>
          </button>

          <button
            class="filter-button filter-button-empty"
            :class="{ active: organizationFilter === 'empty' }"
            @click="organizationFilter = 'empty'"
          >
            メンバー0
            <span>{{ emptyOrganizationCount }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <div class="summary-card summary-card-1">
        <div class="summary-top">
          <span class="summary-label">TOTAL ORGANIZATIONS</span>
          <span class="summary-index">ORG-01</span>
        </div>
        <strong>{{ organizations.length }}</strong>
        <span class="summary-sub">登録組織</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card summary-card-2">
        <div class="summary-top">
          <span class="summary-label">TOTAL MEMBERS</span>
          <span class="summary-index">ORG-02</span>
        </div>
        <strong>{{ totalMembers }}</strong>
        <span class="summary-sub">所属メンバー</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card summary-card-3">
        <div class="summary-top">
          <span class="summary-label">TRANSACTIONS</span>
          <span class="summary-index">ORG-03</span>
        </div>
        <strong>{{ totalTransactions }}</strong>
        <span class="summary-sub">全組織の取引</span>
        <div class="summary-line"></div>
      </div>

      <div class="summary-card summary-card-4">
        <div class="summary-top">
          <span class="summary-label">SEARCH RESULT</span>
          <span class="summary-index">ORG-04</span>
        </div>
        <strong>{{ filteredOrganizations.length }}</strong>
        <span class="summary-sub">表示中の組織</span>
        <div class="summary-line"></div>
      </div>
    </section>

    <section class="organizations-panel panel-enter panel-delay-2">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">ORGANIZATION DATABASE</p>
          <h2>組織一覧</h2>
        </div>
        <div class="result-meta">
          <span class="result-dot"></span>
          <span>{{ filteredOrganizations.length }} ORGANIZATIONS</span>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-core">
          <div class="loading-spinner"></div>
          <span></span>
        </div>
        <p>組織情報を取得しています...</p>
        <div class="loading-progress"><span></span></div>
      </div>

      <div v-else-if="loadError" class="error-state">
        <div class="error-frame">
          <div class="error-symbol">!</div>
        </div>
        <h3>データ取得エラー</h3>
        <p>{{ loadError }}</p>
        <button @click="fetchOrganizations">再試行</button>
      </div>

      <div v-else-if="filteredOrganizations.length === 0" class="empty-state">
        <div class="empty-frame">
          <div class="empty-symbol">⌕</div>
        </div>
        <h3>該当組織なし</h3>
        <p>検索条件またはフィルターに一致する組織がありません。</p>
      </div>

      <div v-else class="organization-table">
        <div class="table-header">
          <span>ID</span>
          <span>組織</span>
          <span>MEMBERS</span>
          <span>TRANSACTIONS</span>
          <span>登録日</span>
          <span>自動削除</span>
          <span>操作</span>
        </div>

        <div
          v-for="(organization, index) in filteredOrganizations"
          :key="organization.id"
          class="organization-row"
          :style="{ '--row-delay': `${index * 45}ms` }"
        >
          <span class="row-scan"></span>

          <span class="organization-id">#{{ organization.id }}</span>

          <div class="organization-profile">
            <div class="organization-avatar">
              <span>{{ getInitial(organization.name) }}</span>
            </div>
            <div class="organization-info">
              <strong>{{ organization.name }}</strong>
              <span>{{ organization.public_id }}</span>
              <span
                v-if="organization.member_count === 0"
                class="organization-empty-label"
              >
                EMPTY ORGANIZATION
              </span>
            </div>
          </div>

          <span class="number-value">{{ organization.member_count }}</span>

          <span class="number-value">{{ organization.transaction_count }}</span>

          <span class="created-date">{{ formatDate(organization.created_at) }}</span>

          <div class="retention-value">
            <template v-if="organization.auto_delete_days_remaining !== null">
              <strong
                :class="{
                  'retention-warning':
                    organization.auto_delete_days_remaining <= 7,
                  'retention-expired':
                    organization.auto_delete_days_remaining === 0
                }"
              >
                {{
                  organization.auto_delete_days_remaining === 0
                    ? '削除対象'
                    : `あと${organization.auto_delete_days_remaining}日`
                }}
              </strong>
              <span>{{ formatDate(organization.auto_delete_at) }}</span>
            </template>
            <span v-else class="retention-none">対象外</span>
          </div>

          <div class="action-group">
            <button class="detail-button" @click="openOrganizationDetail(organization.id)">
              <span>詳細</span>
              <i>→</i>
            </button>

            <button
              v-if="organization.deletable"
              class="delete-button"
              @click="deleteOrganization(organization)"
            >
              削除
            </button>

            <span v-else class="protected-label">保護中</span>
          </div>
        </div>
      </div>
    </section>

    <Transition name="modal">
      <div
        v-if="showDetailModal"
        class="modal-overlay"
        @click.self="closeOrganizationDetail"
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
              <p class="modal-eyebrow">ORGANIZATION PROFILE</p>
              <h2>組織詳細</h2>
            </div>

            <button class="close-button" @click="closeOrganizationDetail">
              ×
            </button>
          </div>

          <div v-if="isLoadingDetail" class="modal-loading">
            <div class="modal-loading-core">
              <div class="loading-spinner"></div>
            </div>
            <p>組織情報を取得しています...</p>
            <span>DATABASE QUERY / ORGANIZATION</span>
          </div>

          <div v-else-if="selectedOrganization" class="modal-content">
            <div class="profile-header">
              <div class="large-avatar">
                {{ getInitial(selectedOrganization.name) }}
              </div>

              <div class="profile-title">
                <span>ORGANIZATION</span>
                <h3>{{ selectedOrganization.name }}</h3>
                <p>{{ selectedOrganization.public_id }}</p>
              </div>

              <div
                class="profile-status"
                :class="{
                  protected: !selectedOrganization.deletable,
                  empty: selectedOrganization.member_count === 0
                }"
              >
                <span></span>
                {{
                  selectedOrganization.member_count === 0
                    ? 'AUTO DELETE'
                    : selectedOrganization.deletable
                      ? 'ACTIVE'
                      : 'PROTECTED'
                }}
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <span>ORGANIZATION ID</span>
                <strong>#{{ selectedOrganization.id }}</strong>
              </div>

              <div class="detail-item">
                <span>PUBLIC ID</span>
                <strong>{{ selectedOrganization.public_id }}</strong>
              </div>

              <div class="detail-item">
                <span>MEMBERS</span>
                <strong>{{ selectedOrganization.member_count }}</strong>
              </div>

              <div class="detail-item">
                <span>TRANSACTIONS</span>
                <strong>{{ selectedOrganization.transaction_count }}</strong>
              </div>

              <div class="detail-item">
                <span>REGISTERED</span>
                <strong>{{ formatDate(selectedOrganization.created_at) }}</strong>
              </div>

              <div class="detail-item">
                <span>EMPTY SINCE</span>
                <strong>
                  {{
                    selectedOrganization.empty_since_at
                      ? formatDateTime(selectedOrganization.empty_since_at)
                      : '—'
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>AUTO DELETE</span>
                <strong
                  :class="{
                    'status-deletable':
                      selectedOrganization.auto_delete_at !== null,
                    'status-protected':
                      selectedOrganization.auto_delete_at === null
                  }"
                >
                  {{
                    selectedOrganization.auto_delete_at
                      ? formatDateTime(selectedOrganization.auto_delete_at)
                      : '対象外'
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>STATUS</span>
                <strong
                  :class="{
                    'status-deletable': selectedOrganization.deletable,
                    'status-protected': !selectedOrganization.deletable,
                    'status-empty': selectedOrganization.member_count === 0
                  }"
                >
                  {{
                    selectedOrganization.member_count === 0
                      ? '空組織・削除可能'
                      : selectedOrganization.deletable
                        ? '削除可能'
                        : '保護中'
                  }}
                </strong>
              </div>
            </div>

            <div
              v-if="selectedOrganization.member_count === 0"
              class="auto-delete-zone"
            >
              <div class="auto-delete-icon">⌛</div>

              <div class="auto-delete-content">
                <p class="auto-delete-label">AUTO DELETE SCHEDULE</p>
                <strong>
                  {{
                    selectedOrganization.auto_delete_days_remaining === 0
                      ? '削除対象です'
                      : `あと${selectedOrganization.auto_delete_days_remaining}日で自動削除`
                  }}
                </strong>
                <span>
                  自動削除予定：
                  {{
                    selectedOrganization.auto_delete_at
                      ? formatDateTime(selectedOrganization.auto_delete_at)
                      : '—'
                  }}
                </span>
              </div>
            </div>

            <div class="members-section">
              <div class="section-title">
                <div>
                  <p>ORGANIZATION MEMBERS</p>
                  <h4>所属メンバー</h4>
                </div>

                <span class="member-count-badge">
                  {{ selectedOrganization.members?.length ?? 0 }}
                </span>
              </div>

              <div
                v-if="selectedOrganization.members?.length"
                class="member-list"
              >
                <div
                  v-for="(member, index) in selectedOrganization.members"
                  :key="member.membership_id"
                  class="member-item"
                  :style="{ '--member-delay': `${index * 40}ms` }"
                >
                  <div class="member-avatar">
                    {{ getInitial(member.username) }}
                  </div>

                  <div class="member-info">
                    <strong>{{ member.username }}</strong>
                    <span>USER #{{ member.user_id }}</span>
                    <small>{{ member.public_id }}</small>
                  </div>

                  <span class="member-state">ACTIVE</span>
                </div>
              </div>

              <div v-else class="no-members">
                所属メンバーはいません。
              </div>
            </div>

            <div v-if="selectedOrganization.deletable" class="danger-zone">
              <div>
                <p class="danger-label">DANGER ZONE</p>
                <strong>組織を削除</strong>
                <span>
                  メンバー0人のため削除できます。組織スコープの取引も削除されます。
                </span>
              </div>

              <button
                class="danger-delete-button"
                @click="deleteOrganization(selectedOrganization)"
              >
                <span>組織を削除</span>
                <i>×</i>
              </button>
            </div>

            <div v-else class="protected-zone">
              <div class="protected-icon">◆</div>

              <div>
                <p class="protected-label-large">PROTECTED ORGANIZATION</p>
                <strong>この組織は削除できません</strong>
                <span>現在メンバーが所属しています。</span>
              </div>
            </div>
          </div>

          <div v-else class="error-state modal-error">
            <div class="error-frame">
              <div class="error-symbol">!</div>
            </div>
            <h3>組織情報を取得できませんでした</h3>
            <p>もう一度詳細ボタンを押してください。</p>
          </div>

          <div class="modal-footer">
            <div class="modal-footer-status">
              <span></span>
              SECURE ADMIN ACCESS
            </div>

            <button class="modal-close-button" @click="closeOrganizationDetail">
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

interface OrganizationMember {
  membership_id: number
  user_id: number
  username: string
  public_id: string
}

interface Organization {
  id: number
  name: string
  public_id: string
  created_at: string
  member_count: number
  transaction_count: number
  empty: boolean
  empty_since_at: string | null
  auto_delete_at: string | null
  auto_delete_days_remaining: number | null
  deletable: boolean
  members?: OrganizationMember[]
}

const { $api } = useNuxtApp()

const organizations = ref<Organization[]>([])
const searchQuery = ref('')
const organizationFilter = ref<'all' | 'active' | 'empty'>('all')
const isLoading = ref(true)
const loadError = ref('')
const showDetailModal = ref(false)
const isLoadingDetail = ref(false)
const selectedOrganization = ref<Organization | null>(null)

const totalMembers = computed(() =>
  organizations.value.reduce(
    (total, organization) => total + organization.member_count,
    0
  )
)

const totalTransactions = computed(() =>
  organizations.value.reduce(
    (total, organization) => total + organization.transaction_count,
    0
  )
)

const activeOrganizationCount = computed(() =>
  organizations.value.filter(
    organization => organization.member_count > 0
  ).length
)

const emptyOrganizationCount = computed(() =>
  organizations.value.filter(
    organization => organization.member_count === 0
  ).length
)

const filteredOrganizations = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  return organizations.value.filter(organization => {
    const matchesKeyword =
      !keyword ||
      organization.name.toLowerCase().includes(keyword) ||
      organization.public_id.toLowerCase().includes(keyword)

    const matchesFilter =
      organizationFilter.value === 'all' ||
      (
        organizationFilter.value === 'active' &&
        organization.member_count > 0
      ) ||
      (
        organizationFilter.value === 'empty' &&
        organization.member_count === 0
      )

    return matchesKeyword && matchesFilter
  })
})

const fetchOrganizations = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await $api.get<Organization[]>(
      '/admin/organizations'
    )

    organizations.value =
      Array.isArray(response.data)
        ? response.data
        : []
  } catch (error: any) {
    console.error(
      '組織一覧の取得に失敗しました:',
      error
    )

    if (error?.response?.status === 403) {
      loadError.value = '管理者権限が必要です。'
    } else {
      loadError.value = '組織一覧の取得に失敗しました。'
    }
  } finally {
    isLoading.value = false
  }
}

const openOrganizationDetail = async (
  organizationId: number
) => {
  showDetailModal.value = true
  isLoadingDetail.value = true
  selectedOrganization.value = null

  try {
    const response = await $api.get<Organization>(
      `/admin/organizations/${organizationId}`
    )

    selectedOrganization.value = response.data
  } catch (error) {
    console.error(
      '組織詳細の取得に失敗しました:',
      error
    )

    selectedOrganization.value = null
  } finally {
    isLoadingDetail.value = false
  }
}

const closeOrganizationDetail = () => {
  if (isLoadingDetail.value) {
    return
  }

  showDetailModal.value = false
  selectedOrganization.value = null
}

const deleteOrganization = async (
  organization: Organization
) => {
  if (!organization.deletable) {
    window.alert('この組織は削除できません。')
    return
  }

  const confirmed = window.confirm(
    `${organization.name} を削除しますか？\nメンバー0人の組織のみ削除できます。\n組織スコープの取引も削除されます。\nこの操作は取り消せません。`
  )

  if (!confirmed) {
    return
  }

  try {
    await $api.delete(
      `/admin/organizations/${organization.id}`
    )

    organizations.value =
      organizations.value.filter(
        item => item.id !== organization.id
      )

    if (
      selectedOrganization.value?.id ===
      organization.id
    ) {
      closeOrganizationDetail()
    }

    window.alert('組織を削除しました。')
  } catch (error: any) {
    console.error(
      '組織の削除に失敗しました:',
      error
    )

    window.alert(
      error?.response?.data?.message ||
      '組織の削除に失敗しました。'
    )
  }
}

const getInitial = (value: string) => {
  return value?.charAt(0)?.toUpperCase() || '?'
}

const formatDate = (date: string | null) => {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleDateString(
    'ja-JP',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tokyo'
    }
  )
}

const formatDateTime = (date: string | null) => {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleString(
    'ja-JP',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    }
  )
}

onMounted(() => {
  fetchOrganizations()
})
</script>

<style scoped>
.admin-organizations {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 4%, rgba(34, 184, 223, 0.08), transparent 25%),
    radial-gradient(circle at 8% 92%, rgba(49, 185, 133, 0.045), transparent 22%),
    #f4f9fc;
  color: #17313d;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  opacity: 0.8;
  background-image:
    linear-gradient(rgba(34, 184, 223, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 184, 223, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), transparent 92%);
}

.ambient-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -20%;
  height: 18%;
  z-index: -2;
  pointer-events: none;
  opacity: 0.8;
  background: linear-gradient(to bottom, transparent, rgba(34, 184, 223, 0.08), transparent);
  filter: blur(12px);
  animation: ambient-scan 10s linear infinite;
}

.page-heading,
.control-panel,
.summary-grid,
.organizations-panel {
  width: min(100%, 1400px);
  margin-left: auto;
  margin-right: auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
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
  display: flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #b9d7e1;
  background: #ffffff;
  color: #1597bb;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.refresh-button::before {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, #22b8df, transparent);
  opacity: 0;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #22b8df;
  background: #f8fdff;
  box-shadow:
    0 8px 24px rgba(34, 184, 223, 0.12),
    0 0 0 3px rgba(34, 184, 223, 0.035);
}

.refresh-button:hover:not(:disabled)::before {
  opacity: 1;
  animation: button-scan 0.8s ease-out;
}

.refresh-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
  font-size: 17px;
  line-height: 1;
}

.control-panel,
.organizations-panel,
.summary-card {
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.02),
    0 10px 32px rgba(47, 88, 106, 0.07);
}

.control-panel {
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.panel-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(34, 184, 223, 0.35);
  pointer-events: none;
}

.panel-corner.top-left {
  left: 8px;
  top: 8px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.panel-corner.top-right {
  right: 8px;
  top: 8px;
  border-top: 1px solid;
  border-right: 1px solid;
}

.panel-corner.bottom-left {
  left: 8px;
  bottom: 8px;
  border-bottom: 1px solid;
  border-left: 1px solid;
}

.panel-corner.bottom-right {
  right: 8px;
  bottom: 8px;
  border-bottom: 1px solid;
  border-right: 1px solid;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #c7dfe7;
  background: #fafdfe;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.search-box:focus-within {
  border-color: rgba(34, 184, 223, 0.6);
  box-shadow:
    0 0 0 3px rgba(34, 184, 223, 0.06),
    inset 0 0 20px rgba(34, 184, 223, 0.025);
}

.search-pulse {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 8px rgba(34, 184, 223, 0.55);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.search-icon {
  margin-right: 9px;
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

.search-label {
  margin-left: 10px;
  color: #9eb5bd;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.organization-filter {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #dce9ed;
}

.filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.filter-title {
  color: #718a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.filter-count {
  color: #9ab0b8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.filter-buttons {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid #c8dce3;
  background: #ffffff;
  color: #65818c;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.filter-button span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border: 1px solid #d7e6eb;
  color: #88a0a9;
  font-size: 8px;
}

.filter-button:hover {
  transform: translateY(-1px);
  border-color: #7ec4d6;
  background: #f7fcfe;
  color: #1a94b5;
}

.filter-button.active {
  border-color: #22b8df;
  background: #f1fbfe;
  color: #1597bb;
  box-shadow: 0 0 0 3px rgba(34, 184, 223, 0.05);
}

.filter-button.active span {
  border-color: rgba(34, 184, 223, 0.25);
  color: #1597bb;
}

.filter-button-empty.active {
  border-color: #d6a68f;
  background: #fff8f5;
  color: #c35f4d;
  box-shadow: 0 0 0 3px rgba(213, 113, 91, 0.05);
}

.filter-button-empty.active span {
  border-color: rgba(213, 113, 91, 0.2);
  color: #c35f4d;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  position: relative;
  padding: 17px;
  overflow: hidden;
  animation: summary-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.summary-card-1 {
  animation-delay: 0.08s;
}

.summary-card-2 {
  animation-delay: 0.14s;
}

.summary-card-3 {
  animation-delay: 0.2s;
}

.summary-card-4 {
  animation-delay: 0.26s;
}

.summary-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 28%;
  height: 1px;
  content: "";
  background: #22b8df;
  box-shadow: 0 0 10px rgba(34, 184, 223, 0.25);
}

.summary-card-2::before {
  background: #31b985;
  box-shadow: 0 0 10px rgba(49, 185, 133, 0.22);
}

.summary-card-3::before {
  background: #dcae38;
  box-shadow: 0 0 10px rgba(220, 174, 56, 0.2);
}

.summary-card-4::before {
  background: #22b8df;
}

.summary-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 184, 223, 0.3);
  box-shadow:
    inset 0 0 30px rgba(34, 184, 223, 0.025),
    0 14px 30px rgba(47, 88, 106, 0.1);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-label {
  display: block;
  color: #6d8792;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.summary-index {
  color: #9db7c1;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.summary-card strong {
  display: block;
  margin-top: 7px;
  color: #17313d;
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.summary-sub {
  display: block;
  margin-top: 3px;
  color: #6d8792;
  font-size: 10px;
}

.summary-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 35%;
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 184, 223, 0.65), transparent);
  animation: summary-line 3s ease-in-out infinite;
}

.organizations-panel {
  margin: 0 auto;
  overflow: hidden;
  animation: panel-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.panel-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #d6e6eb;
  overflow: hidden;
}

.panel-header::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.55),
    transparent
  );
  animation: panel-header-scan 5s linear infinite;
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
  gap: 7px;
  color: #6d8792;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.result-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 8px rgba(34, 184, 223, 0.45);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.organization-table {
  width: 100%;
  overflow-x: auto;
}

.table-header,
.organization-row {
  display: grid;
  grid-template-columns:
    70px
    minmax(250px, 1.8fr)
    110px
    130px
    130px
    180px
    220px;
  align-items: center;
  gap: 12px;
  min-width: 1230px;
  padding: 13px 20px;
}

.table-header {
  border-bottom: 1px solid #d9e7eb;
  background: #f6fbfd;
  color: #6a8590;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.organization-row {
  position: relative;
  min-height: 74px;
  border-bottom: 1px solid #e1edf1;
  overflow: hidden;
  animation: row-enter 0.45s ease both;
  animation-delay: var(--row-delay);
  transition:
    background 0.22s ease,
    border-color 0.22s ease;
}

.organization-row:last-child {
  border-bottom: none;
}

.organization-row:hover {
  background: #f8fcfd;
}

.organization-row::before {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 0;
  content: "";
  background: #22b8df;
  box-shadow: 0 0 9px rgba(34, 184, 223, 0.35);
  transition: height 0.25s ease;
}

.organization-row:hover::before {
  height: 100%;
}

.row-scan {
  position: absolute;
  left: -25%;
  bottom: 0;
  width: 25%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.4),
    transparent
  );
  opacity: 0;
  pointer-events: none;
}

.organization-row:hover .row-scan {
  opacity: 1;
  animation: row-scan 0.9s ease-out;
}

.organization-id {
  color: #77919b;
  font-size: 11px;
  font-weight: 700;
}

.organization-profile {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.organization-avatar,
.large-avatar,
.member-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bfe0e9;
  background:
    linear-gradient(
      145deg,
      rgba(34, 184, 223, 0.1),
      rgba(240, 250, 253, 0.95)
    ),
    #ffffff;
  color: #1799bd;
  font-weight: 800;
}

.organization-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  font-size: 12px;
  overflow: hidden;
}

.organization-avatar::after {
  position: absolute;
  left: -30%;
  bottom: 0;
  width: 30%;
  height: 1px;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.7),
    transparent
  );
}

.organization-row:hover .organization-avatar::after {
  animation: avatar-scan 0.8s ease-out;
}

.organization-info {
  min-width: 0;
}

.organization-info strong {
  display: block;
  color: #24434f;
  font-size: 12px;
  font-weight: 800;
}

.organization-info span {
  display: block;
  margin-top: 3px;
  color: #8098a2;
  font-size: 9px;
  word-break: break-all;
}

.organization-empty-label {
  display: inline-flex !important;
  width: fit-content;
  margin-top: 4px !important;
  padding: 2px 5px;
  border: 1px solid #e5c0b8;
  background: #fff8f6;
  color: #c66051 !important;
  font-size: 7px !important;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.number-value {
  color: #31525e;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.created-date {
  color: #7b929b;
  font-size: 10px;
}

.retention-value {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.retention-value strong {
  color: #239d73;
  font-size: 10px;
  font-weight: 800;
}

.retention-value strong.retention-warning {
  color: #d38a36;
}

.retention-value strong.retention-expired {
  color: #d45d4f;
}

.retention-value span {
  color: #8aa0a8;
  font-size: 8px;
}

.retention-none {
  color: #9aadb4 !important;
  font-size: 9px !important;
}

.action-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.detail-button,
.delete-button {
  position: relative;
  height: 30px;
  padding: 0 10px;
  border: 1px solid;
  background: transparent;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition:
    border-color 0.22s ease,
    color 0.22s ease,
    background 0.22s ease,
    transform 0.22s ease;
}

.detail-button {
  display: flex;
  align-items: center;
  gap: 5px;
  border-color: #b9d1d9;
  color: #55727e;
}

.detail-button:hover {
  transform: translateY(-1px);
  border-color: #79bfd2;
  color: #168eaf;
  background: #f5fcfe;
}

.detail-button i {
  font-style: normal;
  color: #86a2ac;
  transition: transform 0.2s ease;
}

.detail-button:hover i {
  transform: translateX(3px);
  color: #22b8df;
}

.delete-button {
  border-color: #e1b8b1;
  color: #d45d4f;
}

.delete-button:hover {
  transform: translateY(-1px);
  background: #fff8f7;
  border-color: #e08b80;
}

.protected-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #cadde3;
  color: #8197a0;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
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

.loading-state p,
.error-state p,
.empty-state p {
  margin: 12px 0 0;
  color: #6e8791;
  font-size: 11px;
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

.loading-core::before,
.loading-core::after {
  position: absolute;
  inset: 5px;
  content: "";
  border: 1px solid rgba(34, 184, 223, 0.09);
  border-radius: 50%;
}

.loading-core::after {
  inset: 12px;
  border-color: rgba(34, 184, 223, 0.2);
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #d5e7ec;
  border-top-color: #22b8df;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-core > span {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 9px rgba(34, 184, 223, 0.55);
  animation: status-pulse 1.2s ease-in-out infinite;
}

.loading-progress {
  position: relative;
  width: min(260px, 80%);
  height: 1px;
  margin-top: 20px;
  overflow: hidden;
  background: #dbeaf0;
}

.loading-progress span {
  position: absolute;
  left: -30%;
  top: 0;
  width: 30%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    #22b8df,
    transparent
  );
  animation: loading-progress 1.1s linear infinite;
}

.error-frame,
.empty-frame {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2bdb7;
}

.error-frame::before,
.error-frame::after,
.empty-frame::before,
.empty-frame::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
  border-color: rgba(229, 101, 87, 0.5);
}

.error-frame::before,
.empty-frame::before {
  left: -1px;
  top: -1px;
  border-top: 1px solid;
  border-left: 1px solid;
}

.error-frame::after,
.empty-frame::after {
  right: -1px;
  bottom: -1px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.empty-frame {
  border-color: #c7dfe7;
}

.error-symbol,
.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e56557;
  font-size: 22px;
}

.empty-symbol {
  color: #22b8df;
}

.error-state h3,
.empty-state h3 {
  margin: 14px 0 0;
  color: #24434f;
  font-size: 14px;
}

.error-state button {
  margin-top: 14px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #bcd4dc;
  background: transparent;
  color: #4f717d;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.error-state button:hover {
  border-color: #22b8df;
  color: #1597bb;
  background: #f4fcfe;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.25s ease,
    backdrop-filter 0.25s ease;
}

.modal-enter-active .detail-modal,
.modal-leave-active .detail-modal {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .detail-modal,
.modal-leave-to .detail-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.985);
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
  pointer-events: none;
  opacity: 0.7;
  background-image:
    linear-gradient(rgba(34, 184, 223, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 184, 223, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: modal-grid 12s linear infinite;
}

.detail-modal {
  position: relative;
  width: min(100%, 760px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #b9dce7;
  background:
    radial-gradient(circle at 50% 0%, rgba(34, 184, 223, 0.05), transparent 35%),
    #ffffff;
  box-shadow:
    0 0 0 1px rgba(34, 184, 223, 0.04),
    0 24px 80px rgba(32, 76, 94, 0.2),
    0 0 45px rgba(34, 184, 223, 0.06);
}

.modal-glow {
  position: absolute;
  left: 50%;
  top: -100px;
  width: 240px;
  height: 240px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(34, 184, 223, 0.06);
  filter: blur(40px);
  pointer-events: none;
}

.modal-corner {
  position: absolute;
  z-index: 4;
  width: 14px;
  height: 14px;
  border-color: rgba(34, 184, 223, 0.45);
  pointer-events: none;
}

.modal-corner.top-left {
  left: 8px;
  top: 8px;
  border-left: 1px solid;
  border-top: 1px solid;
}

.modal-corner.top-right {
  right: 8px;
  top: 8px;
  border-right: 1px solid;
  border-top: 1px solid;
}

.modal-corner.bottom-left {
  left: 8px;
  bottom: 8px;
  border-left: 1px solid;
  border-bottom: 1px solid;
}

.modal-corner.bottom-right {
  right: 8px;
  bottom: 8px;
  border-right: 1px solid;
  border-bottom: 1px solid;
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

.close-button {
  width: 32px;
  height: 32px;
  border: 1px solid #bfd6de;
  background: #ffffff;
  color: #738c96;
  font-size: 20px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
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
  font-size: 11px;
}

.modal-loading-core {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 184, 223, 0.18);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(34, 184, 223, 0.03);
}

.modal-loading > span {
  margin-top: 8px;
  color: #8aa1aa;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-content {
  position: relative;
  z-index: 2;
  padding: 22px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px;
  border: 1px solid #cfe3e9;
  background:
    linear-gradient(
      135deg,
      rgba(34, 184, 223, 0.045),
      rgba(248, 252, 253, 0.95)
    ),
    #ffffff;
}

.large-avatar {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 10px;
  font-size: 20px;
  box-shadow:
    inset 0 0 24px rgba(34, 184, 223, 0.03),
    0 0 20px rgba(34, 184, 223, 0.04);
}

.large-avatar::after {
  position: absolute;
  left: 5px;
  right: 5px;
  bottom: 5px;
  height: 1px;
  content: "";
  background: rgba(34, 184, 223, 0.28);
}

.profile-title {
  min-width: 0;
}

.profile-title > span {
  color: #728d97;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.profile-title h3 {
  margin: 4px 0 0;
  color: #24434f;
  font-size: 18px;
  font-weight: 800;
}

.profile-title p {
  margin: 5px 0 0;
  color: #78939d;
  font-size: 10px;
  word-break: break-all;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 6px 9px;
  border: 1px solid rgba(34, 184, 223, 0.2);
  color: #1597bb;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.profile-status > span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 7px rgba(34, 184, 223, 0.5);
  animation: status-pulse 1.5s ease-in-out infinite;
}

.profile-status.protected {
  border-color: rgba(220, 174, 56, 0.35);
  color: #b78c22;
}

.profile-status.protected > span {
  background: #dcae38;
  box-shadow: 0 0 7px rgba(220, 174, 56, 0.4);
}

.profile-status.empty {
  border-color: rgba(212, 93, 80, 0.3);
  color: #c45e50;
}

.profile-status.empty > span {
  background: #d45d4f;
  box-shadow: 0 0 7px rgba(212, 93, 80, 0.45);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.detail-item::after {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 22%;
  height: 1px;
  content: "";
  background: linear-gradient(
    90deg,
    rgba(34, 184, 223, 0.35),
    transparent
  );
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
  font-size: 11px;
  font-weight: 800;
  word-break: break-word;
}

.status-deletable {
  color: #239d73 !important;
}

.status-protected {
  color: #d15d50 !important;
}

.status-empty {
  color: #c45e50 !important;
}

.auto-delete-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #e7c8c1;
  background:
    linear-gradient(
      135deg,
      rgba(229, 101, 87, 0.05),
      rgba(255, 249, 248, 0.95)
    );
}

.auto-delete-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #dfb7af;
  color: #cc6658;
  font-size: 14px;
}

.auto-delete-content {
  min-width: 0;
}

.auto-delete-label {
  margin: 0 0 4px;
  color: #d05e50;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.auto-delete-content strong {
  display: block;
  color: #83443b;
  font-size: 11px;
}

.auto-delete-content span {
  display: block;
  margin-top: 3px;
  color: #9e726b;
  font-size: 9px;
}

.members-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title p {
  margin: 0 0 3px;
  color: #718a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.section-title h4 {
  margin: 0;
  color: #31525e;
  font-size: 14px;
  font-weight: 800;
}

.member-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 7px;
  border: 1px solid #bddbe4;
  color: #2295b3;
  font-size: 9px;
  font-weight: 800;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.member-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #d5e5ea;
  background: #fbfdfe;
  overflow: hidden;
  animation: member-enter 0.4s ease both;
  animation-delay: var(--member-delay);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.member-item:hover {
  transform: translateX(2px);
  border-color: rgba(34, 184, 223, 0.3);
  background: #f7fcfe;
}

.member-item::after {
  position: absolute;
  left: -25%;
  bottom: 0;
  width: 25%;
  height: 1px;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.35),
    transparent
  );
  opacity: 0;
}

.member-item:hover::after {
  opacity: 1;
  animation: member-scan 0.8s ease-out;
}

.member-avatar {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  font-size: 11px;
}

.member-info {
  min-width: 0;
}

.member-info strong {
  display: block;
  color: #31525e;
  font-size: 11px;
  font-weight: 800;
}

.member-info span,
.member-info small {
  display: block;
  margin-top: 3px;
  color: #78929c;
  font-size: 8px;
}

.member-info small {
  color: #91a7af;
}

.member-state {
  margin-left: auto;
  color: #249b84;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.no-members {
  padding: 18px;
  border: 1px solid #d5e5ea;
  background: #fbfdfe;
  color: #778f99;
  text-align: center;
  font-size: 10px;
}

.danger-zone,
.protected-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
}

.danger-zone {
  position: relative;
  border: 1px solid #ebc5bf;
  background:
    linear-gradient(
      135deg,
      rgba(229, 101, 87, 0.055),
      rgba(255, 249, 248, 0.9)
    );
  overflow: hidden;
}

.danger-zone::before {
  position: absolute;
  left: -35%;
  top: 0;
  width: 35%;
  height: 1px;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    rgba(229, 101, 87, 0.55),
    transparent
  );
  animation: danger-scan 4s linear infinite;
}

.protected-zone {
  border: 1px solid #d3e1e6;
  background: #f7fafb;
}

.protected-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(220, 174, 56, 0.3);
  color: #c29425;
  font-size: 10px;
}

.danger-label {
  margin: 0 0 4px;
  color: #d45e50;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.danger-zone strong {
  display: block;
  color: #7d4037;
  font-size: 11px;
}

.danger-zone span {
  display: block;
  margin-top: 3px;
  color: #a27169;
  font-size: 9px;
}

.danger-delete-button {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 36px;
  padding: 0 13px;
  border: 1px solid #dd8e83;
  background: transparent;
  color: #d45d50;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.danger-delete-button:hover {
  transform: translateY(-1px);
  background: #fff7f5;
  border-color: #d96e60;
}

.danger-delete-button i {
  font-style: normal;
  font-size: 13px;
}

.protected-label-large {
  margin: 0 0 4px;
  color: #6e8994;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.protected-zone strong {
  display: block;
  color: #45616c;
  font-size: 11px;
}

.protected-zone span {
  display: block;
  margin-top: 3px;
  color: #8298a1;
  font-size: 9px;
}

.modal-error {
  min-height: 340px;
}

.modal-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 22px 20px;
  border-top: 1px solid #d5e6eb;
}

.modal-footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #728b95;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.modal-footer-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 7px rgba(34, 184, 223, 0.5);
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

.page-enter {
  animation: page-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.panel-enter {
  animation: panel-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.panel-delay-1 {
  animation-delay: 0.08s;
}

.panel-delay-2 {
  animation-delay: 0.16s;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.995);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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

@keyframes summary-enter {
  from {
    opacity: 0;
    transform: translateY(9px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateX(7px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes member-enter {
  from {
    opacity: 0;
    transform: translateX(6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes ambient-scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(680%);
  }
}

@keyframes panel-header-scan {
  0% {
    left: -30%;
  }
  55%,
  100% {
    left: 110%;
  }
}

@keyframes button-scan {
  from {
    left: -30%;
  }
  to {
    left: 110%;
  }
}

@keyframes row-scan {
  from {
    left: -25%;
  }
  to {
    left: 110%;
  }
}

@keyframes avatar-scan {
  from {
    left: -30%;
  }
  to {
    left: 110%;
  }
}

@keyframes member-scan {
  from {
    left: -25%;
  }
  to {
    left: 110%;
  }
}

@keyframes summary-line {
  0%,
  100% {
    width: 25%;
    opacity: 0.4;
  }
  50% {
    width: 55%;
    opacity: 1;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-progress {
  from {
    left: -30%;
  }
  to {
    left: 100%;
  }
}

@keyframes modal-grid {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 32px 32px;
  }
}

@keyframes danger-scan {
  from {
    left: -35%;
  }
  to {
    left: 110%;
  }
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-header {
    display: none;
  }

  .organization-table {
    overflow-x: visible;
  }

  .organization-row {
    grid-template-columns: 1fr;
    min-width: 0;
    gap: 9px;
    padding: 16px;
  }

  .action-group {
    justify-content: flex-start;
  }

  .retention-value {
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .admin-organizations {
    padding: 16px;
  }

  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .refresh-button {
    align-self: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .search-label {
    display: none;
  }

  .filter-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-button {
    justify-content: space-between;
    width: 100%;
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

  .profile-status {
    margin-left: 0;
  }

  .auto-delete-zone {
    align-items: flex-start;
  }

  .danger-zone,
  .protected-zone {
    align-items: stretch;
    flex-direction: column;
  }

  .danger-delete-button {
    width: 100%;
    justify-content: center;
  }

  .modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .modal-close-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-grid,
  .ambient-scan,
  .search-pulse,
  .result-dot,
  .summary-card,
  .summary-line,
  .organizations-panel,
  .organization-row,
  .row-scan,
  .organization-avatar::after,
  .loading-spinner,
  .loading-core > span,
  .loading-progress span,
  .modal-backdrop-grid,
  .profile-status > span,
  .member-item,
  .member-item::after,
  .danger-zone::before,
  .modal-footer-status span {
    animation: none;
  }

  .page-enter,
  .panel-enter {
    animation: none;
  }
}
</style>