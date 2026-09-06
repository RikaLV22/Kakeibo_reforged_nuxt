<template>
  <div class="mypage">
    <AppNavbar />
    <main class="mypage-container">
      <section class="page-header">
        <div>
          <h1>マイページ</h1>
          <p>所属している組織を管理できます</p>
        </div>
      </section>

      <section class="organization-card">
        <div class="section-header">
          <div>
            <h2>所属組織</h2>
            <p>{{ organizations.length }} / {{ MAX_ORGANIZATIONS }} 組織</p>
          </div>
          <button class="add-button" :disabled="organizations.length >= MAX_ORGANIZATIONS" @click="showAddModal = true">＋ 組織を追加</button>
        </div>

        <div v-if="isLoading" class="loading">組織情報を読み込んでいます...</div>

        <div v-else-if="organizations.length === 0" class="empty-state">
          <p>現在所属している組織はありません。</p>
          <button class="empty-add-button" @click="showAddModal = true">組織を追加する</button>
        </div>

        <div v-else class="organization-list">
          <div v-for="organization in organizations" :key="organization.id" class="organization-item" :class="{ selected: selectedOrganizationId === organization.id }">
            <div class="organization-main">
              <div class="organization-icon">{{ organization.name.charAt(0).toUpperCase() }}</div>
              <div class="organization-info">
                <h3>{{ organization.name }}</h3>
                <span>{{ organization.public_id }}</span>
              </div>
            </div>

            <div class="organization-actions">
              <span v-if="selectedOrganizationId === organization.id" class="selected-label">現在の組織</span>

              <button v-else class="select-button" :disabled="isChangingOrganization" @click="selectOrganization(organization.id)">この組織を選択</button>

              <button class="detail-button" :disabled="isLoadingDetail && selectedDetailOrganizationId === organization.id" @click="openOrganizationDetail(organization.id)">詳細</button>

              <button class="leave-button" :disabled="isLeavingOrganization" @click="leaveOrganization(organization)">脱退</button>
            </div>
          </div>
        </div>
      </section>

      <section class="info-card">
        <div class="section-header">
          <div>
            <h2>現在の組織</h2>
            <p>家計簿で使用する組織</p>
          </div>
        </div>

        <div v-if="selectedOrganization" class="current-organization">
          <div class="current-icon">{{ selectedOrganization.name.charAt(0).toUpperCase() }}</div>
          <div>
            <h3>{{ selectedOrganization.name }}</h3>
            <p>{{ selectedOrganization.public_id }}</p>
          </div>
        </div>

        <div v-else class="no-selection">現在選択されている組織はありません。</div>
      </section>
    </main>

    <div v-if="showOrganizationDetailModal" class="modal-overlay" @click.self="() => closeOrganizationDetail()">
      <div class="organization-detail-modal">
        <div class="modal-header">
          <div>
            <h2>組織詳細</h2>
            <p>選択した組織の情報</p>
          </div>
          <button type="button" class="close-button" :disabled="isUploadingOrganizationImage || isDeletingOrganization" @click="() => closeOrganizationDetail()">×</button>
        </div>

        <div v-if="isLoadingDetail" class="detail-loading">
          <div class="detail-spinner"></div>
          <p>組織情報を読み込んでいます...</p>
        </div>

        <div v-else-if="selectedDetailOrganization" class="organization-detail">
          <div class="organization-profile-cover" :style="selectedDetailOrganization.background_image_url ? { backgroundImage: `url(${selectedDetailOrganization.background_image_url})` } : undefined">
            <div class="organization-profile-overlay"></div>

            <button type="button" class="background-image-button" :disabled="isUploadingOrganizationImage || isDeletingOrganization" @click="openBackgroundFilePicker">
              {{ isUploadingOrganizationImage ? '更新中...' : '背景画像を変更' }}
            </button>

            <input ref="backgroundImageInput" type="file" accept="image/*" class="hidden-file-input" @change="handleBackgroundImageChange">
          </div>

          <div class="organization-profile-header">
            <div class="organization-profile-icon-wrapper">
              <button type="button" class="organization-profile-icon-button" :disabled="isUploadingOrganizationImage || isDeletingOrganization" @click="openIconFilePicker">
                <img v-if="selectedDetailOrganization.icon_image_url" :src="selectedDetailOrganization.icon_image_url" alt="組織アイコン" class="organization-profile-icon">
                <span v-else class="organization-profile-icon fallback">{{ selectedDetailOrganization.name.charAt(0).toUpperCase() }}</span>
                <span class="organization-icon-edit">変更</span>
              </button>

              <input ref="iconImageInput" type="file" accept="image/*" class="hidden-file-input" @change="handleIconImageChange">
            </div>

            <div class="organization-profile-name">
              <h3>{{ selectedDetailOrganization.name }}</h3>
              <p>{{ selectedDetailOrganization.public_id }}</p>
            </div>
          </div>

          <div class="detail-summary-grid">
            <div class="detail-summary-card">
              <span class="detail-summary-label">総収入</span>
              <strong class="income-value">+¥{{ formatNumber(selectedDetailOrganization.total_income) }}</strong>
            </div>

            <div class="detail-summary-card">
              <span class="detail-summary-label">総支出</span>
              <strong class="expense-value">-¥{{ formatNumber(selectedDetailOrganization.total_expense) }}</strong>
            </div>

            <div class="detail-summary-card balance">
              <span class="detail-summary-label">残高</span>
              <strong>¥{{ formatNumber(selectedDetailOrganization.balance) }}</strong>
            </div>
          </div>

          <div class="detail-info-grid">
            <div class="detail-info-item">
              <span class="detail-label">組織名</span>
              <strong>{{ selectedDetailOrganization.name }}</strong>
            </div>

            <div class="detail-info-item">
              <span class="detail-label">組織ID</span>
              <strong>{{ selectedDetailOrganization.public_id }}</strong>
            </div>

            <div class="detail-info-item">
              <span class="detail-label">メンバー数</span>
              <strong>{{ organizationMembers.length }}人</strong>
            </div>

            <div class="detail-info-item">
              <span class="detail-label">所属状態</span>
              <strong>所属中</strong>
            </div>
          </div>

          <div class="member-section">
            <div class="member-section-header">
              <div>
                <h4>所属メンバー</h4>
                <p>この組織に所属しているユーザー</p>
              </div>
              <span class="member-count">{{ organizationMembers.length }}人</span>
            </div>

            <div v-if="organizationMembers.length > 0" class="member-list">
              <div v-for="member in organizationMembers" :key="member.id" class="member-item">
                <div class="member-avatar">{{ member.username.charAt(0).toUpperCase() }}</div>

                <div class="member-info">
                  <strong>{{ member.username }}</strong>
                  <span>個人ID: {{ member.public_id }}</span>
                </div>

                <span v-if="member.id === currentUserId" class="member-you">自分</span>
              </div>
            </div>

            <div v-else class="member-empty">メンバー情報がありません</div>
          </div>

          <div v-if="organizationMembers.length === 1 && organizationMembers[0]?.id === currentUserId" class="organization-danger-zone">
            <div>
              <h4>組織を削除</h4>
              <p>この組織を完全に削除します。</p>
            </div>

            <button type="button" class="organization-delete-button" :disabled="isDeletingOrganization || isUploadingOrganizationImage" @click="startDeleteOrganization">削除</button>
          </div>

          <div v-if="showDeleteConfirmation" class="delete-confirmation">
            <div class="delete-confirmation-icon">!</div>

            <div class="delete-confirmation-content">
              <h4>組織を削除しますか？</h4>
              <p>{{ selectedDetailOrganization.name }} を完全に削除します。この操作は取り消せません。</p>
            </div>

            <div class="delete-confirmation-actions">
              <button type="button" class="delete-cancel-button" :disabled="isDeletingOrganization" @click="cancelDeleteOrganization">キャンセル</button>

              <button type="button" class="delete-confirm-button" :disabled="isDeletingOrganization" @click="confirmDeleteOrganization">
                {{ isDeletingOrganization ? '削除中...' : '削除する' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="detail-empty">
          <div class="detail-empty-icon">🏢</div>
          <h3>組織情報を取得できませんでした</h3>
          <p>もう一度詳細ボタンを押してください。</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="modal-button" :disabled="isUploadingOrganizationImage || isDeletingOrganization" @click="() => closeOrganizationDetail()">閉じる</button>
        </div>
      </div>
    </div>

    <div v-if="showIconCropModal" class="modal-overlay crop-overlay" @click.self="() => closeIconCropModal()">
      <div class="crop-modal">
        <div class="modal-header">
          <div>
            <h2>組織アイコンを調整</h2>
            <p>表示したい範囲を調整してください</p>
          </div>
          <button type="button" class="close-button" :disabled="isUploadingOrganizationImage" @click="() => closeIconCropModal()">×</button>
        </div>

        <div class="crop-modal-body">
          <div ref="cropArea" class="organization-icon-crop-area" @pointerdown="startIconCropDrag" @pointermove="onIconCropDrag" @pointerup="endIconCropDrag" @pointercancel="endIconCropDrag">
            <img v-if="iconCropImageUrl" ref="iconCropImageElement" :src="iconCropImageUrl" alt="組織アイコンプレビュー" class="organization-icon-crop-image" :style="cropImageStyle" draggable="false" @load="initializeIconCrop">

            <div class="organization-icon-crop-frame" :class="{ dragging: isCropDragging }"></div>
          </div>

          <div class="crop-help">
            <span>画像をドラッグして位置を調整</span>
            <span>下のバーで拡大・縮小</span>
          </div>

          <div class="crop-zoom">
            <span>−</span>
            <input v-model.number="iconCropZoom" type="range" min="1" max="3" step="0.01" class="crop-zoom-range" @input="updateIconCropZoom">
            <span>＋</span>
          </div>

          <div class="crop-zoom-value">{{ Math.round(iconCropZoom * 100) }}%</div>
        </div>

        <div class="modal-footer crop-modal-footer">
          <button type="button" class="crop-cancel-button" :disabled="isUploadingOrganizationImage" @click="() => closeIconCropModal()">キャンセル</button>
          <button type="button" class="crop-save-button" :disabled="isUploadingOrganizationImage" @click="saveCroppedIcon">{{ isUploadingOrganizationImage ? '保存中...' : 'この範囲で保存' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showBackgroundCropModal" class="modal-overlay crop-overlay" @click.self="() => closeBackgroundCropModal()">
      <div class="crop-modal background-crop-modal">
        <div class="modal-header">
          <div>
            <h2>背景画像を調整</h2>
            <p>表示したい範囲を調整してください</p>
          </div>
          <button type="button" class="close-button" :disabled="isUploadingOrganizationImage" @click="() => closeBackgroundCropModal()">×</button>
        </div>

        <div class="crop-modal-body">
          <div ref="backgroundCropArea" class="background-crop-area" @pointerdown="startBackgroundCropDrag" @pointermove="onBackgroundCropDrag" @pointerup="endBackgroundCropDrag" @pointercancel="endBackgroundCropDrag">
            <img v-if="backgroundCropImageUrl" ref="backgroundCropImageElement" :src="backgroundCropImageUrl" alt="背景画像プレビュー" class="background-crop-image" :style="backgroundCropImageStyle" draggable="false" @load="initializeBackgroundCrop">

            <div class="background-crop-frame" :class="{ dragging: isBackgroundCropDragging }"></div>
          </div>

          <div class="crop-help">
            <span>画像をドラッグして位置を調整</span>
            <span>下のバーで拡大・縮小</span>
          </div>

          <div class="crop-zoom">
            <span>−</span>
            <input v-model.number="backgroundCropZoom" type="range" min="1" max="3" step="0.01" class="crop-zoom-range" @input="updateBackgroundCropZoom">
            <span>＋</span>
          </div>

          <div class="crop-zoom-value">{{ Math.round(backgroundCropZoom * 100) }}%</div>
        </div>

        <div class="modal-footer crop-modal-footer">
          <button type="button" class="crop-cancel-button" :disabled="isUploadingOrganizationImage" @click="() => closeBackgroundCropModal()">キャンセル</button>
          <button type="button" class="crop-save-button" :disabled="isUploadingOrganizationImage" @click="saveCroppedBackground">{{ isUploadingOrganizationImage ? '保存中...' : 'この範囲で保存' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="add-modal">
        <div class="modal-header">
          <div>
            <h2>組織を追加</h2>
            <p>組織専用IDを入力してください</p>
          </div>
          <button class="close-button" @click="closeAddModal">×</button>
        </div>

        <div class="modal-body">
          <label class="form-label">組織ID</label>

          <input v-model="organizationPublicId" type="text" class="organization-input" placeholder="ORG-XXXXXXXX" @keyup.enter="addOrganization">

          <p class="input-help">例：ORG-Z2YXBR7Y</p>

          <p v-if="addError" class="error-message">{{ addError }}</p>

          <button class="submit-button" :disabled="isAddingOrganization" @click="addOrganization">
            {{ isAddingOrganization ? '追加中...' : '組織を追加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showLeaveModal" class="modal-overlay" @click.self="closeLeaveModal">
      <div class="leave-modal">
        <div class="modal-header">
          <div>
            <h2>組織から脱退</h2>
            <p>この操作は取り消せません</p>
          </div>
          <button class="close-button" @click="closeLeaveModal">×</button>
        </div>

        <div class="modal-body">
          <div class="leave-target">
            <div class="organization-icon">{{ leaveTarget?.name?.charAt(0).toUpperCase() }}</div>

            <div>
              <strong>{{ leaveTarget?.name }}</strong>
              <span>{{ leaveTarget?.public_id }}</span>
            </div>
          </div>

          <p v-if="leaveError" class="error-message">{{ leaveError }}</p>

          <div class="modal-actions">
            <button class="cancel-button" @click="closeLeaveModal">キャンセル</button>

            <button class="confirm-leave-button" :disabled="isLeavingOrganization" @click="confirmLeaveOrganization">
              {{ isLeavingOrganization ? '脱退中...' : '脱退する' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppNavbar from '~/components/AppNavbar.vue'

interface Organization {
  id: number
  name: string
  public_id: string
  membership_id: number
}

interface ProfileOrganization {
  id: number
  name: string
  public_id: string
}

interface ProfileUser {
  id: number
  username: string
  public_id: string
  registered_at: string
  organizations: ProfileOrganization[]
  avatar_url: string | null
  background_image_url: string | null
  current_streak?: number
  longest_streak?: number
  recorded_days?: number
}

interface OrganizationMember {
  id: number
  username: string
  public_id: string
}

interface OrganizationDetail {
  id: number
  name: string
  public_id: string
  total_income: number
  total_expense: number
  balance: number
  member_count: number
  icon_image_url: string | null
  background_image_url: string | null
}

const { $api } = useNuxtApp()

const MAX_ORGANIZATIONS = 4
const organizations = ref<Organization[]>([])
const selectedOrganizationId = ref<number | null>(null)
const selectedDetailOrganizationId = ref<number | null>(null)
const selectedDetailOrganization = ref<OrganizationDetail | null>(null)
const organizationMembers = ref<OrganizationMember[]>([])
const currentUserId = ref<number | null>(null)
const isLoading = ref(true)
const isLoadingDetail = ref(false)
const isAddingOrganization = ref(false)
const isLeavingOrganization = ref(false)
const isChangingOrganization = ref(false)
const isUploadingOrganizationImage = ref(false)
const isDeletingOrganization = ref(false)
const showAddModal = ref(false)
const showLeaveModal = ref(false)
const showOrganizationDetailModal = ref(false)
const showDeleteConfirmation = ref(false)
const showIconCropModal = ref(false)
const showBackgroundCropModal = ref(false)
const organizationPublicId = ref('')
const addError = ref('')
const leaveError = ref('')
const leaveTarget = ref<Organization | null>(null)
const iconImageInput = ref<HTMLInputElement | null>(null)
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const iconCropImageUrl = ref('')
const iconCropImageElement = ref<HTMLImageElement | null>(null)
const cropArea = ref<HTMLElement | null>(null)
const iconCropZoom = ref(1)
const previousCropZoom = ref(1)
const iconCropX = ref(0)
const iconCropY = ref(0)
const iconCropBaseScale = ref(1)
const cropBoxSize = ref(420)
const isCropDragging = ref(false)
const cropDragStartX = ref(0)
const cropDragStartY = ref(0)
const cropDragOriginX = ref(0)
const cropDragOriginY = ref(0)
const backgroundCropImageUrl = ref('')
const backgroundCropImageElement = ref<HTMLImageElement | null>(null)
const backgroundCropArea = ref<HTMLElement | null>(null)
const backgroundCropZoom = ref(1)
const previousBackgroundCropZoom = ref(1)
const backgroundCropX = ref(0)
const backgroundCropY = ref(0)
const backgroundCropBaseScale = ref(1)
const backgroundCropWidth = ref(840)
const backgroundCropHeight = ref(315)
const isBackgroundCropDragging = ref(false)
const backgroundCropDragStartX = ref(0)
const backgroundCropDragStartY = ref(0)
const backgroundCropDragOriginX = ref(0)
const backgroundCropDragOriginY = ref(0)

const selectedOrganization = computed(() => {
  if (selectedOrganizationId.value === null) {
    return null
  }

  return organizations.value.find(organization => organization.id === selectedOrganizationId.value) || null
})

const cropImageStyle = computed(() => {
  const scale = iconCropBaseScale.value * iconCropZoom.value

  return {
    width: 'auto',
    height: 'auto',
    transform: `translate(${iconCropX.value}px, ${iconCropY.value}px) scale(${scale})`
  }
})

const backgroundCropImageStyle = computed(() => {
  const scale = backgroundCropBaseScale.value * backgroundCropZoom.value

  return {
    width: 'auto',
    height: 'auto',
    transform: `translate(${backgroundCropX.value}px, ${backgroundCropY.value}px) scale(${scale})`
  }
})

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(Number(value) || 0)
}

const normalizeOrganization = (organization: ProfileOrganization, membershipId: number): Organization => {
  return {
    id: organization.id,
    name: organization.name,
    public_id: organization.public_id,
    membership_id: membershipId
  }
}

const fetchOrganizations = async () => {
  isLoading.value = true

  try {
    const profileResponse = await $api.get<ProfileUser>('/me')
    currentUserId.value = profileResponse.data.id

    const profileOrganizations = profileResponse.data.organizations || []

    const membershipResponse = await $api.get<Array<{ id: number; organization: ProfileOrganization }>>('/organization_memberships')
    const memberships = membershipResponse.data

    organizations.value = profileOrganizations.map(organization => {
      const membership = memberships.find(item => item.organization.id === organization.id)
      return normalizeOrganization(organization, membership?.id || 0)
    })

    const savedOrganizationId = localStorage.getItem('selectedOrganizationId')

    if (savedOrganizationId) {
      const id = Number(savedOrganizationId)

      if (organizations.value.some(organization => organization.id === id)) {
        selectedOrganizationId.value = id
      }
    }

    if (selectedOrganizationId.value === null && organizations.value.length > 0) {
      const firstOrganization = organizations.value[0]

      if (firstOrganization) {
        selectedOrganizationId.value = firstOrganization.id
        localStorage.setItem('selectedOrganizationId', String(firstOrganization.id))
      }
    }
  } catch (error) {
    console.error('所属組織の取得に失敗しました:', error)
  } finally {
    isLoading.value = false
  }
}

const selectOrganization = (organizationId: number) => {
  isChangingOrganization.value = true
  selectedOrganizationId.value = organizationId
  localStorage.setItem('selectedOrganizationId', String(organizationId))
  isChangingOrganization.value = false
}

const openOrganizationDetail = async (organizationId: number) => {
  selectedDetailOrganizationId.value = organizationId
  selectedDetailOrganization.value = null
  organizationMembers.value = []
  showDeleteConfirmation.value = false
  showOrganizationDetailModal.value = true
  isLoadingDetail.value = true

  try {
    const [organizationResponse, membersResponse] = await Promise.all([
      $api.get<OrganizationDetail>(`/organizations/${organizationId}`),
      $api.get<OrganizationMember[]>(`/organizations/${organizationId}/users`)
    ])

    selectedDetailOrganization.value = organizationResponse.data
    organizationMembers.value = Array.isArray(membersResponse.data) ? membersResponse.data : []
  } catch (error) {
    console.error('組織詳細の取得に失敗しました:', error)
    selectedDetailOrganization.value = null
    organizationMembers.value = []
  } finally {
    isLoadingDetail.value = false
  }
}

const closeOrganizationDetail = () => {
  if (isLoadingDetail.value || isUploadingOrganizationImage.value || isDeletingOrganization.value) {
    return
  }

  closeIconCropModal()
  closeBackgroundCropModal()
  showDeleteConfirmation.value = false
  showOrganizationDetailModal.value = false
  selectedDetailOrganizationId.value = null
  selectedDetailOrganization.value = null
  organizationMembers.value = []
}

const addOrganization = async () => {
  const publicId = organizationPublicId.value.trim()
  addError.value = ''

  if (!publicId) {
    addError.value = '組織IDを入力してください'
    return
  }

  if (organizations.value.length >= MAX_ORGANIZATIONS) {
    addError.value = '所属できる組織は最大4つまでです'
    return
  }

  isAddingOrganization.value = true

  try {
    await $api.post('/organization_memberships', {
      organization_public_id: publicId
    })

    closeAddModal()
    await fetchOrganizations()
  } catch (error: any) {
    console.error('組織の追加に失敗しました:', error)

    addError.value =
      error?.response?.data?.errors?.join?.('\n') ||
      error?.response?.data?.error ||
      '組織の追加に失敗しました'
  } finally {
    isAddingOrganization.value = false
  }
}

const leaveOrganization = (organization: Organization) => {
  leaveTarget.value = organization
  leaveError.value = ''
  showLeaveModal.value = true
}

const confirmLeaveOrganization = async () => {
  if (!leaveTarget.value) {
    return
  }

  isLeavingOrganization.value = true
  leaveError.value = ''

  try {
    await $api.delete(`/organization_memberships/${leaveTarget.value.membership_id}`)

    const wasSelected = selectedOrganizationId.value === leaveTarget.value.id
    const wasDetailSelected = selectedDetailOrganizationId.value === leaveTarget.value.id

    if (wasSelected) {
      selectedOrganizationId.value = null
      localStorage.removeItem('selectedOrganizationId')
    }

    if (wasDetailSelected) {
      showOrganizationDetailModal.value = false
    }

    closeLeaveModal()
    await fetchOrganizations()
  } catch (error: any) {
    console.error('組織からの脱退に失敗しました:', error)
    leaveError.value = error?.response?.data?.error || '組織からの脱退に失敗しました'
  } finally {
    isLeavingOrganization.value = false
  }
}

const startDeleteOrganization = () => {
  if (!selectedDetailOrganization.value) {
    return
  }

  const onlyMember = organizationMembers.value[0]

  if (!onlyMember || onlyMember.id !== currentUserId.value) {
    return
  }

  showDeleteConfirmation.value = true
}

const cancelDeleteOrganization = () => {
  if (isDeletingOrganization.value) {
    return
  }

  showDeleteConfirmation.value = false
}

const confirmDeleteOrganization = async () => {
  if (!selectedDetailOrganization.value) {
    return
  }

  const onlyMember = organizationMembers.value[0]

  if (!onlyMember || onlyMember.id !== currentUserId.value) {
    return
  }

  isDeletingOrganization.value = true

  try {
    const organizationId = selectedDetailOrganization.value.id

    await $api.delete(`/organizations/${organizationId}`)

    if (selectedOrganizationId.value === organizationId) {
      selectedOrganizationId.value = null
      localStorage.removeItem('selectedOrganizationId')
    }

    showDeleteConfirmation.value = false
    showOrganizationDetailModal.value = false
    selectedDetailOrganizationId.value = null
    selectedDetailOrganization.value = null
    organizationMembers.value = []

    await fetchOrganizations()
  } catch (error: any) {
    console.error('組織の削除に失敗しました:', error)

    alert(
      error?.response?.data?.errors?.join?.('\n') ||
      error?.response?.data?.error ||
      '組織の削除に失敗しました'
    )
  } finally {
    isDeletingOrganization.value = false
  }
}

const openIconFilePicker = () => {
  if (isUploadingOrganizationImage.value) {
    return
  }

  iconImageInput.value?.click()
}

const handleIconImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください')
    input.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    const result = reader.result

    if (typeof result !== 'string') {
      return
    }

    iconCropImageUrl.value = result
    iconCropZoom.value = 1
    previousCropZoom.value = 1
    iconCropX.value = 0
    iconCropY.value = 0
    iconCropBaseScale.value = 1
    showIconCropModal.value = true
  }

  reader.readAsDataURL(file)
  input.value = ''
}

const initializeIconCrop = () => {
  const image = iconCropImageElement.value
  const area = cropArea.value

  if (!image || !area) {
    return
  }

  const areaRect = area.getBoundingClientRect()

  cropBoxSize.value = Math.min(areaRect.width, areaRect.height)

  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight

  if (!imageWidth || !imageHeight || cropBoxSize.value <= 0) {
    return
  }

  const baseScale = Math.max(cropBoxSize.value / imageWidth, cropBoxSize.value / imageHeight)

  iconCropBaseScale.value = baseScale
  iconCropZoom.value = 1
  previousCropZoom.value = 1

  const scaledWidth = imageWidth * baseScale
  const scaledHeight = imageHeight * baseScale

  iconCropX.value = (cropBoxSize.value - scaledWidth) / 2
  iconCropY.value = (cropBoxSize.value - scaledHeight) / 2

  clampCropPosition()
}

const updateIconCropZoom = () => {
  const image = iconCropImageElement.value

  if (!image) {
    return
  }

  const oldScale = iconCropBaseScale.value * previousCropZoom.value
  const newScale = iconCropBaseScale.value * iconCropZoom.value

  if (oldScale <= 0 || newScale <= 0) {
    return
  }

  const centerX = cropBoxSize.value / 2
  const centerY = cropBoxSize.value / 2

  const imageCenterX = iconCropX.value + image.naturalWidth * oldScale / 2
  const imageCenterY = iconCropY.value + image.naturalHeight * oldScale / 2

  const ratio = newScale / oldScale

  iconCropX.value = centerX - (centerX - imageCenterX) * ratio - image.naturalWidth * newScale / 2
  iconCropY.value = centerY - (centerY - imageCenterY) * ratio - image.naturalHeight * newScale / 2

  clampCropPosition()
  previousCropZoom.value = iconCropZoom.value
}

const startIconCropDrag = (event: PointerEvent) => {
  if (isUploadingOrganizationImage.value) {
    return
  }

  const area = cropArea.value

  if (!area) {
    return
  }

  isCropDragging.value = true
  cropDragStartX.value = event.clientX
  cropDragStartY.value = event.clientY
  cropDragOriginX.value = iconCropX.value
  cropDragOriginY.value = iconCropY.value

  area.setPointerCapture?.(event.pointerId)
}

const onIconCropDrag = (event: PointerEvent) => {
  if (!isCropDragging.value) {
    return
  }

  const deltaX = event.clientX - cropDragStartX.value
  const deltaY = event.clientY - cropDragStartY.value

  iconCropX.value = cropDragOriginX.value + deltaX
  iconCropY.value = cropDragOriginY.value + deltaY

  clampCropPosition()
}

const endIconCropDrag = () => {
  isCropDragging.value = false
}

const clampCropPosition = () => {
  const image = iconCropImageElement.value

  if (!image) {
    return
  }

  const scale = iconCropBaseScale.value * iconCropZoom.value
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale

  const minX = cropBoxSize.value - imageWidth
  const maxX = 0
  const minY = cropBoxSize.value - imageHeight
  const maxY = 0

  iconCropX.value = Math.min(maxX, Math.max(minX, iconCropX.value))
  iconCropY.value = Math.min(maxY, Math.max(minY, iconCropY.value))
}

const closeIconCropModal = (force = false) => {
  if (!force && isUploadingOrganizationImage.value) {
    return
  }

  showIconCropModal.value = false
  iconCropImageUrl.value = ''
  iconCropImageElement.value = null
  cropArea.value = null
  iconCropZoom.value = 1
  previousCropZoom.value = 1
  iconCropX.value = 0
  iconCropY.value = 0
  iconCropBaseScale.value = 1
  cropBoxSize.value = 420
  isCropDragging.value = false
}

const createCroppedIconFile = async (): Promise<File | null> => {
  const image = iconCropImageElement.value

  if (!image || !image.naturalWidth || !image.naturalHeight) {
    return null
  }

  const scale = iconCropBaseScale.value * iconCropZoom.value

  if (scale <= 0 || cropBoxSize.value <= 0) {
    return null
  }

  const sourceX = -iconCropX.value / scale
  const sourceY = -iconCropY.value / scale
  const sourceSize = cropBoxSize.value / scale

  const safeSourceX = Math.max(0, Math.min(image.naturalWidth, sourceX))
  const safeSourceY = Math.max(0, Math.min(image.naturalHeight, sourceY))

  const safeSourceSize = Math.min(
    sourceSize,
    image.naturalWidth - safeSourceX,
    image.naturalHeight - safeSourceY
  )

  if (safeSourceSize <= 0) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(image, safeSourceX, safeSourceY, safeSourceSize, safeSourceSize, 0, 0, 512, 512)

  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          resolve(null)
          return
        }

        resolve(new File([blob], 'organization-icon.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.9
    )
  })
}

const saveCroppedIcon = async () => {
  if (!selectedDetailOrganization.value) {
    return
  }

  if (!iconCropImageElement.value) {
    alert('画像の読み込みが完了していません')
    return
  }

  const croppedFile = await createCroppedIconFile()

  if (!croppedFile) {
    alert('画像のトリミングに失敗しました')
    return
  }

  isUploadingOrganizationImage.value = true

  try {
    const organizationId = selectedDetailOrganization.value.id
    const formData = new FormData()

    formData.append('organization[icon_image]', croppedFile)

    await $api.patch(`/organizations/${organizationId}`, formData)

    closeIconCropModal(true)
    await openOrganizationDetail(organizationId)
  } catch (error: any) {
    console.error('組織アイコン画像の更新に失敗しました:', error)

    alert(
      error?.response?.data?.errors?.join?.('\n') ||
      error?.response?.data?.error ||
      '組織アイコン画像の更新に失敗しました'
    )
  } finally {
    isUploadingOrganizationImage.value = false
  }
}

const openBackgroundFilePicker = () => {
  if (isUploadingOrganizationImage.value) {
    return
  }

  backgroundImageInput.value?.click()
}

const handleBackgroundImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください')
    input.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    const result = reader.result

    if (typeof result !== 'string') {
      return
    }

    backgroundCropImageUrl.value = result
    backgroundCropZoom.value = 1
    previousBackgroundCropZoom.value = 1
    backgroundCropX.value = 0
    backgroundCropY.value = 0
    backgroundCropBaseScale.value = 1
    showBackgroundCropModal.value = true
  }

  reader.readAsDataURL(file)
  input.value = ''
}

const initializeBackgroundCrop = () => {
  const image = backgroundCropImageElement.value
  const area = backgroundCropArea.value

  if (!image || !area) {
    return
  }

  const areaRect = area.getBoundingClientRect()

  backgroundCropWidth.value = areaRect.width
  backgroundCropHeight.value = areaRect.height

  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight

  if (!imageWidth || !imageHeight || backgroundCropWidth.value <= 0 || backgroundCropHeight.value <= 0) {
    return
  }

  const baseScale = Math.max(
    backgroundCropWidth.value / imageWidth,
    backgroundCropHeight.value / imageHeight
  )

  backgroundCropBaseScale.value = baseScale
  backgroundCropZoom.value = 1
  previousBackgroundCropZoom.value = 1

  const scaledWidth = imageWidth * baseScale
  const scaledHeight = imageHeight * baseScale

  backgroundCropX.value = (backgroundCropWidth.value - scaledWidth) / 2
  backgroundCropY.value = (backgroundCropHeight.value - scaledHeight) / 2

  clampBackgroundCropPosition()
}

const updateBackgroundCropZoom = () => {
  const image = backgroundCropImageElement.value

  if (!image) {
    return
  }

  const oldScale = backgroundCropBaseScale.value * previousBackgroundCropZoom.value
  const newScale = backgroundCropBaseScale.value * backgroundCropZoom.value

  if (oldScale <= 0 || newScale <= 0) {
    return
  }

  const centerX = backgroundCropWidth.value / 2
  const centerY = backgroundCropHeight.value / 2

  const imageCenterX = backgroundCropX.value + image.naturalWidth * oldScale / 2
  const imageCenterY = backgroundCropY.value + image.naturalHeight * oldScale / 2

  const ratio = newScale / oldScale

  backgroundCropX.value = centerX - (centerX - imageCenterX) * ratio - image.naturalWidth * newScale / 2
  backgroundCropY.value = centerY - (centerY - imageCenterY) * ratio - image.naturalHeight * newScale / 2

  clampBackgroundCropPosition()
  previousBackgroundCropZoom.value = backgroundCropZoom.value
}

const startBackgroundCropDrag = (event: PointerEvent) => {
  if (isUploadingOrganizationImage.value) {
    return
  }

  const area = backgroundCropArea.value

  if (!area) {
    return
  }

  isBackgroundCropDragging.value = true
  backgroundCropDragStartX.value = event.clientX
  backgroundCropDragStartY.value = event.clientY
  backgroundCropDragOriginX.value = backgroundCropX.value
  backgroundCropDragOriginY.value = backgroundCropY.value

  area.setPointerCapture?.(event.pointerId)
}

const onBackgroundCropDrag = (event: PointerEvent) => {
  if (!isBackgroundCropDragging.value) {
    return
  }

  const deltaX = event.clientX - backgroundCropDragStartX.value
  const deltaY = event.clientY - backgroundCropDragStartY.value

  backgroundCropX.value = backgroundCropDragOriginX.value + deltaX
  backgroundCropY.value = backgroundCropDragOriginY.value + deltaY

  clampBackgroundCropPosition()
}

const endBackgroundCropDrag = () => {
  isBackgroundCropDragging.value = false
}

const clampBackgroundCropPosition = () => {
  const image = backgroundCropImageElement.value

  if (!image) {
    return
  }

  const scale = backgroundCropBaseScale.value * backgroundCropZoom.value
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale

  const minX = backgroundCropWidth.value - imageWidth
  const maxX = 0
  const minY = backgroundCropHeight.value - imageHeight
  const maxY = 0

  backgroundCropX.value = Math.min(maxX, Math.max(minX, backgroundCropX.value))
  backgroundCropY.value = Math.min(maxY, Math.max(minY, backgroundCropY.value))
}

const closeBackgroundCropModal = (force = false) => {
  if (!force && isUploadingOrganizationImage.value) {
    return
  }

  showBackgroundCropModal.value = false
  backgroundCropImageUrl.value = ''
  backgroundCropImageElement.value = null
  backgroundCropArea.value = null
  backgroundCropZoom.value = 1
  previousBackgroundCropZoom.value = 1
  backgroundCropX.value = 0
  backgroundCropY.value = 0
  backgroundCropBaseScale.value = 1
  backgroundCropWidth.value = 840
  backgroundCropHeight.value = 315
  isBackgroundCropDragging.value = false
}

const createCroppedBackgroundFile = async (): Promise<File | null> => {
  const image = backgroundCropImageElement.value
  const area = backgroundCropArea.value

  if (!image || !area || !image.naturalWidth || !image.naturalHeight) {
    return null
  }

  const cropWidth = backgroundCropWidth.value
  const cropHeight = backgroundCropHeight.value
  const scale = backgroundCropBaseScale.value * backgroundCropZoom.value

  if (scale <= 0 || cropWidth <= 0 || cropHeight <= 0) {
    return null
  }

  const sourceX = -backgroundCropX.value / scale
  const sourceY = -backgroundCropY.value / scale
  const sourceWidth = cropWidth / scale
  const sourceHeight = cropHeight / scale

  const safeSourceX = Math.max(0, Math.min(image.naturalWidth, sourceX))
  const safeSourceY = Math.max(0, Math.min(image.naturalHeight, sourceY))
  const safeSourceWidth = Math.min(sourceWidth, image.naturalWidth - safeSourceX)
  const safeSourceHeight = Math.min(sourceHeight, image.naturalHeight - safeSourceY)

  if (safeSourceWidth <= 0 || safeSourceHeight <= 0) {
    return null
  }

  const canvas = document.createElement('canvas')
  const outputWidth = 1600
  const outputHeight = 600

  canvas.width = outputWidth
  canvas.height = outputHeight

  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(image, safeSourceX, safeSourceY, safeSourceWidth, safeSourceHeight, 0, 0, outputWidth, outputHeight)

  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          resolve(null)
          return
        }

        resolve(new File([blob], 'organization-background.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.9
    )
  })
}

const saveCroppedBackground = async () => {
  if (!selectedDetailOrganization.value) {
    return
  }

  if (!backgroundCropImageElement.value) {
    alert('画像の読み込みが完了していません')
    return
  }

  const croppedFile = await createCroppedBackgroundFile()

  if (!croppedFile) {
    alert('画像のトリミングに失敗しました')
    return
  }

  isUploadingOrganizationImage.value = true

  try {
    const organizationId = selectedDetailOrganization.value.id
    const formData = new FormData()

    formData.append('organization[background_image]', croppedFile)

    await $api.patch(`/organizations/${organizationId}`, formData)

    closeBackgroundCropModal(true)
    await openOrganizationDetail(organizationId)
  } catch (error: any) {
    console.error('組織背景画像の更新に失敗しました:', error)

    alert(
      error?.response?.data?.errors?.join?.('\n') ||
      error?.response?.data?.error ||
      '組織背景画像の更新に失敗しました'
    )
  } finally {
    isUploadingOrganizationImage.value = false
  }
}

const closeAddModal = () => {
  showAddModal.value = false
  organizationPublicId.value = ''
  addError.value = ''
}

const closeLeaveModal = () => {
  showLeaveModal.value = false
  leaveTarget.value = null
  leaveError.value = ''
}

onMounted(async () => {
  await fetchOrganizations()
})
</script>

<style scoped>
.mypage {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fb;
  box-sizing: border-box;
}

.mypage-container {
  width: min(100%, 900px);
  margin: 24px auto 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
}

.page-header p {
  margin: 6px 0 0;
  color: #8a94a6;
  font-size: 13px;
}

.organization-card,
.info-card {
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
  padding: 22px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 800;
}

.section-header p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.add-button,
.empty-add-button {
  border: 0;
  border-radius: 10px;
  padding: 10px 15px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.add-button:hover,
.empty-add-button:hover {
  background: #1f2937;
}

.add-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.organization-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.organization-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.organization-item.selected {
  border-color: #111827;
  background: #f8fafc;
}

.organization-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.organization-icon,
.current-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
}

.organization-info {
  min-width: 0;
}

.organization-info h3 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 800;
}

.organization-info span {
  display: block;
  margin-top: 4px;
  color: #8a94a6;
  font-size: 11px;
  word-break: break-all;
}

.organization-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.selected-label {
  padding: 8px 11px;
  border-radius: 8px;
  background: #111827;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.select-button,
.detail-button,
.leave-button {
  padding: 8px 11px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.select-button {
  border: 1px solid #dbe1ea;
  background: #fff;
  color: #334155;
}

.select-button:hover {
  background: #f8fafc;
}

.detail-button {
  border: 1px solid #dbe1ea;
  background: #f8fafc;
  color: #334155;
}

.detail-button:hover {
  border-color: #94a3b8;
  background: #fff;
}

.leave-button {
  border: 1px solid #fecaca;
  background: #fff;
  color: #dc2626;
}

.leave-button:hover {
  background: #fef2f2;
}

.select-button:disabled,
.detail-button:disabled,
.leave-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.empty-state,
.no-selection {
  margin-top: 18px;
  padding: 22px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  font-size: 12px;
}

.empty-state p {
  margin: 0 0 12px;
}

.current-organization {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
}

.current-organization h3 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 800;
}

.current-organization p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 11px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(3px);
}

.organization-detail-modal {
  width: min(100%, 960px);
  max-height: 92vh;
  overflow-y: auto;
  scrollbar-width: none;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
}

.organization-detail-modal::-webkit-scrollbar {
  display: none;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 17px;
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

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.close-button:hover:not(:disabled) {
  background: #e2e8f0;
  color: #111827;
}

.close-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.detail-loading {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.detail-loading p {
  margin: 12px 0 0;
  font-size: 11px;
}

.detail-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e5e7eb;
  border-top-color: #111827;
  border-radius: 50%;
  animation: detail-spin 0.8s linear infinite;
}

@keyframes detail-spin {
  to {
    transform: rotate(360deg);
  }
}

.organization-detail {
  padding: 0 22px 10px;
}

.organization-profile-cover {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: 16px;
  background: #e5e7eb;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.organization-profile-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.15));
  pointer-events: none;
}

.background-image-button {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  padding: 9px 13px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.62);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.background-image-button:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.8);
}

.background-image-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hidden-file-input {
  display: none;
}

.organization-profile-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-top: -58px;
  padding: 0 18px 18px;
}

.organization-profile-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.organization-profile-icon-button {
  position: relative;
  display: block;
  padding: 0;
  border: 0;
  border-radius: 24px;
  background: transparent;
  cursor: pointer;
}

.organization-profile-icon-button:disabled {
  cursor: not-allowed;
}

.organization-profile-icon {
  width: 112px;
  height: 112px;
  display: block;
  border: 5px solid #fff;
  border-radius: 22px;
  object-fit: cover;
  background: #111827;
  color: #fff;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.18);
  box-sizing: border-box;
}

.organization-profile-icon.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
}

.organization-icon-edit {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
}

.organization-profile-name {
  padding-bottom: 7px;
}

.organization-profile-name h3 {
  margin: 0;
  color: #1f2937;
  font-size: 21px;
  font-weight: 800;
}

.organization-profile-name p {
  margin: 5px 0 0;
  color: #8a94a6;
  font-size: 11px;
}

.detail-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 2px;
}

.detail-summary-card {
  padding: 16px;
  border: 1px solid #edf0f5;
  border-radius: 13px;
  background: #fff;
}

.detail-summary-card.balance {
  background: #f8fafc;
}

.detail-summary-label {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
}

.detail-summary-card strong {
  display: block;
  margin-top: 7px;
  color: #111827;
  font-size: 19px;
  font-weight: 800;
}

.detail-summary-card strong.income-value {
  color: #15803d;
}

.detail-summary-card strong.expense-value {
  color: #dc2626;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.detail-info-item {
  padding: 13px;
  border: 1px solid #edf0f5;
  border-radius: 11px;
}

.detail-label {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
}

.detail-info-item strong {
  display: block;
  margin-top: 5px;
  color: #374151;
  font-size: 12px;
  word-break: break-word;
}

.member-section {
  margin-top: 18px;
}

.member-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.member-section-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 13px;
  font-weight: 800;
}

.member-section-header p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 10px;
}

.member-count {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: none;
  margin-top: 10px;
}

.member-list::-webkit-scrollbar {
  display: none;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 11px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
}

.member-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #eef2f7;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.member-info {
  min-width: 0;
  flex: 1;
}

.member-info strong {
  display: block;
  color: #374151;
  font-size: 11px;
  font-weight: 800;
}

.member-info span {
  display: block;
  margin-top: 3px;
  color: #94a3b8;
  font-size: 9px;
}

.member-you {
  padding: 4px 7px;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 9px;
  font-weight: 700;
}

.member-empty {
  margin-top: 10px;
  padding: 18px;
  border-radius: 10px;
  background: #f8fafc;
  color: #94a3b8;
  text-align: center;
  font-size: 10px;
}

.organization-danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  background: #fff7f7;
}

.organization-danger-zone h4 {
  margin: 0;
  color: #991b1b;
  font-size: 12px;
  font-weight: 800;
}

.organization-danger-zone p {
  margin: 4px 0 0;
  color: #b91c1c;
  font-size: 10px;
}

.organization-delete-button {
  flex-shrink: 0;
  height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.organization-delete-button:hover:not(:disabled) {
  background: #b91c1c;
}

.organization-delete-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.delete-confirmation {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  margin-top: 14px;
  padding: 15px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
}

.delete-confirmation-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

.delete-confirmation-content h4 {
  margin: 0;
  color: #991b1b;
  font-size: 12px;
  font-weight: 800;
}

.delete-confirmation-content p {
  margin: 5px 0 0;
  color: #b91c1c;
  font-size: 10px;
  line-height: 1.5;
}

.delete-confirmation-actions {
  grid-column: 2;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}

.delete-cancel-button,
.delete-confirm-button {
  height: 36px;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.delete-cancel-button {
  border: 1px solid #fecaca;
  background: #fff;
  color: #991b1b;
}

.delete-confirm-button {
  border: 0;
  background: #dc2626;
  color: #fff;
}

.delete-cancel-button:disabled,
.delete-confirm-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.detail-empty {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.detail-empty-icon {
  margin-bottom: 10px;
  font-size: 38px;
  opacity: 0.55;
}

.detail-empty h3 {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.detail-empty p {
  margin: 7px 0 0;
  color: #94a3b8;
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
  height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 9px;
  background: #111827;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.modal-button:hover:not(:disabled) {
  background: #1f2937;
}

.modal-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.crop-overlay {
  z-index: 3000;
}

.crop-modal {
  width: min(100%, 560px);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.crop-modal-body {
  padding: 20px 22px;
}

.organization-icon-crop-area {
  position: relative;
  width: min(100%, 420px);
  aspect-ratio: 1;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 14px;
  background: #0f172a;
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.organization-icon-crop-area:active {
  cursor: grabbing;
}

.organization-icon-crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  max-height: none;
  transform-origin: 0 0;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
}

.organization-icon-crop-frame {
  position: absolute;
  inset: 0;
  border: 3px solid #fff;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.organization-icon-crop-frame.dragging {
  border-color: #e2e8f0;
}

.background-crop-modal {
  width: min(100%, 900px);
}

.background-crop-area {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 6;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 14px;
  background: #0f172a;
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.background-crop-area:active {
  cursor: grabbing;
}

.background-crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  max-height: none;
  transform-origin: 0 0;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
}

.background-crop-frame {
  position: absolute;
  inset: 0;
  border: 3px solid #fff;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.background-crop-frame.dragging {
  border-color: #e2e8f0;
}

.crop-help {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  color: #64748b;
  font-size: 11px;
  text-align: center;
}

.crop-zoom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
}

.crop-zoom-range {
  flex: 1;
  accent-color: #111827;
}

.crop-zoom-value {
  margin-top: 7px;
  color: #94a3b8;
  font-size: 10px;
  text-align: center;
}

.crop-modal-footer {
  justify-content: space-between;
}

.crop-cancel-button,
.crop-save-button {
  min-width: 130px;
  height: 40px;
  padding: 0 15px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.crop-cancel-button {
  border: 1px solid #dbe1ea;
  background: #fff;
  color: #334155;
}

.crop-save-button {
  border: 0;
  background: #111827;
  color: #fff;
}

.crop-cancel-button:disabled,
.crop-save-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.add-modal,
.leave-modal {
  width: min(100%, 460px);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
}

.modal-body {
  padding: 22px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 12px;
  font-weight: 700;
}

.organization-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  box-sizing: border-box;
  outline: none;
  color: #1f2937;
  font-size: 13px;
}

.organization-input:focus {
  border-color: #111827;
}

.input-help {
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 10px;
}

.error-message {
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 11px;
  white-space: pre-line;
}

.submit-button {
  width: 100%;
  height: 44px;
  margin-top: 16px;
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.leave-target {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.leave-target strong {
  display: block;
  color: #1f2937;
  font-size: 13px;
}

.leave-target span {
  display: block;
  margin-top: 4px;
  color: #8a94a6;
  font-size: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.cancel-button,
.confirm-leave-button {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #dbe1ea;
  background: #fff;
  color: #334155;
}

.confirm-leave-button {
  border: 0;
  background: #dc2626;
  color: #fff;
}

.confirm-leave-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .mypage {
    padding: 10px;
  }

  .mypage-container {
    margin-top: 12px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .add-button {
    width: 100%;
  }

  .organization-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .organization-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .select-button,
  .detail-button,
  .leave-button,
  .selected-label {
    flex: 1;
    text-align: center;
  }

  .organization-detail {
    padding: 0 14px 10px;
  }

  .organization-profile-cover {
    height: 220px;
  }

  .organization-profile-header {
    align-items: flex-start;
    flex-direction: column;
    margin-top: -52px;
  }

  .organization-profile-name {
    padding-left: 4px;
  }

  .detail-summary-grid {
    grid-template-columns: 1fr;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .organization-danger-zone {
    align-items: flex-start;
    flex-direction: column;
  }

  .organization-delete-button {
    width: 100%;
  }

  .delete-confirmation {
    grid-template-columns: auto 1fr;
  }

  .delete-confirmation-actions {
    grid-column: 1 / -1;
  }

  .organization-detail-modal,
  .add-modal,
  .leave-modal,
  .crop-modal {
    max-height: 94vh;
  }

  .organization-icon-crop-area {
    width: min(100%, 360px);
  }

  .background-crop-area {
    aspect-ratio: 16 / 7;
  }

  .crop-help {
    flex-direction: column;
    gap: 4px;
  }

  .crop-modal-footer {
    gap: 8px;
  }

  .crop-cancel-button,
  .crop-save-button {
    min-width: 0;
    flex: 1;
  }
}
</style>