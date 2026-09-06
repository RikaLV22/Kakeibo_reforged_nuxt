<template>
  <div class="profile-page">
    <AppNavbar />

    <main class="profile-container">
      <section class="profile-card">
        <div
          class="profile-background"
          :style="
            user?.background_image_url
              ? { backgroundImage: `url(${user.background_image_url})` }
              : {}
          "
        ></div>

        <div class="profile-header">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                :alt="user.username"
              >
              <span v-else>
                {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
          </div>

          <div class="profile-name">
            <h1>{{ user?.username || 'ユーザー' }}</h1>
            <p>
              {{
                user?.organizations?.map(org => org.name).join(' / ') ||
                '所属組織なし'
              }}
            </p>
          </div>

          <button
            class="edit-button"
            @click="openEditModal"
          >
            プロフィールを編集
          </button>
        </div>

        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">個人ID</span>
            <span class="info-value">
              {{ user?.public_id || '-' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">アカウント登録日時</span>
            <span class="info-value">
              {{ formatDate(user?.registered_at) }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">所属組織</span>
            <span class="info-value">
              {{
                user?.organizations?.map(org => org.name).join(' / ') ||
                '-'
              }}
            </span>
          </div>
        </div>
      </section>

      <section class="record-card">
        <div class="section-title">
          <h2>家計簿記録</h2>
          <p>日々の家計簿記録状況</p>
        </div>

        <div class="record-grid">
          <div class="record-item">
            <span class="record-icon">🔥</span>
            <span class="record-label">連続記録</span>
            <strong>{{ user?.current_streak || 0 }}日</strong>
          </div>

          <div class="record-item">
            <span class="record-icon">📅</span>
            <span class="record-label">最長連続記録</span>
            <strong>{{ user?.longest_streak || 0 }}日</strong>
          </div>

          <div class="record-item">
            <span class="record-icon">📝</span>
            <span class="record-label">総記録日数</span>
            <strong>{{ user?.recorded_days || 0 }}日</strong>
          </div>
        </div>
      </section>

      <section class="settings-card">
        <div class="section-title">
          <h2>アカウント</h2>
          <p>アカウントに関する操作</p>
        </div>

        <button
          class="logout-button"
          @click="logout"
        >
          ログアウト
        </button>
      </section>
    </main>

    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="edit-modal">
        <div class="modal-header">
          <h2>プロフィールを編集</h2>
          <button
            class="close-button"
            @click="closeEditModal"
          >
            ×
          </button>
        </div>

        <div class="modal-body">
          <div class="image-section">
            <label class="section-label">プロフィール画像</label>

            <label class="file-button">
              プロフィール画像を選択
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
              >
            </label>

            <div
              v-if="avatarSourceUrl"
              ref="cropAreaRef"
              class="crop-area"
              @pointerdown="startSelectionDrag"
              @pointermove="moveSelectionDrag"
              @pointerup="endSelectionDrag"
              @pointercancel="endSelectionDrag"
              @pointerleave="endSelectionDrag"
            >
              <img
                ref="cropImageRef"
                :src="avatarSourceUrl"
                class="crop-image"
                draggable="false"
                alt="プロフィール画像トリミング"
                @load="initializeSelection"
              >

              <div class="crop-overlay"></div>

              <div
                class="selection-box"
                :style="selectionStyle"
                @pointerdown.stop="startSelectionDrag"
              >
                <div class="selection-grid"></div>
              </div>
            </div>

            <div
              v-if="avatarSourceUrl"
              class="crop-help"
            >
              枠をドラッグしてアイコンにしたい範囲を選択
            </div>

            <div
              v-if="avatarSourceUrl"
              class="selected-preview-wrapper"
            >
              <span class="preview-label">プレビュー</span>

              <div class="selected-preview">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="プロフィール画像プレビュー"
                >
              </div>
            </div>

            <div
              v-if="!avatarSourceUrl"
              class="avatar-preview"
            >
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                alt="プロフィール画像"
              >
              <span v-else>
                {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
          </div>

          <div class="image-section">
            <label class="section-label">背景画像</label>

            <div
              class="background-preview"
              :style="
                backgroundPreview
                  ? { backgroundImage: `url(${backgroundPreview})` }
                  : {}
              "
            >
              <span v-if="!backgroundPreview">
                背景画像なし
              </span>
            </div>

            <label class="file-button">
              背景画像を選択
              <input
                type="file"
                accept="image/*"
                @change="handleBackgroundChange"
              >
            </label>
          </div>

          <p
            v-if="updateError"
            class="update-error"
          >
            {{ updateError }}
          </p>

          <button
            class="save-button"
            :disabled="isUpdating"
            @click="updateProfile"
          >
            {{ isUpdating ? '保存中...' : '変更を保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import AppNavbar from '~/components/AppNavbar.vue'

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

const { $api } = useNuxtApp()
const router = useRouter()

const user = ref<ProfileUser | null>(null)

const showEditModal = ref(false)
const avatarFile = ref<File | null>(null)
const backgroundFile = ref<File | null>(null)
const avatarSourceUrl = ref<string | null>(null)
const avatarPreview = ref<string | null>(null)
const backgroundPreview = ref<string | null>(null)

const cropAreaRef = ref<HTMLElement | null>(null)
const cropImageRef = ref<HTMLImageElement | null>(null)

const selectionX = ref(0)
const selectionY = ref(0)
const selectionSize = ref(0)

const isDraggingSelection = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOriginX = ref(0)
const dragOriginY = ref(0)

const isUpdating = ref(false)
const updateError = ref('')

const selectionStyle = computed(() => ({
  left: `${selectionX.value}px`,
  top: `${selectionY.value}px`,
  width: `${selectionSize.value}px`,
  height: `${selectionSize.value}px`
}))

const fetchProfile = async () => {
  try {
    const response = await $api.get<ProfileUser>('/me')
    user.value = response.data
  } catch (error) {
    console.error('プロフィール情報の取得に失敗しました:', error)
  }
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const revokeBlobUrl = (url: string | null) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const openEditModal = () => {
  updateError.value = ''
  avatarFile.value = null
  backgroundFile.value = null
  avatarSourceUrl.value = null
  avatarPreview.value = user.value?.avatar_url || null
  backgroundPreview.value = user.value?.background_image_url || null
  resetSelection()
  showEditModal.value = true
}

const closeEditModal = () => {
  revokeBlobUrl(avatarSourceUrl.value)

  if (avatarPreview.value?.startsWith('blob:')) {
    revokeBlobUrl(avatarPreview.value)
  }

  if (backgroundPreview.value?.startsWith('blob:')) {
    revokeBlobUrl(backgroundPreview.value)
  }

  showEditModal.value = false
  avatarSourceUrl.value = null
  avatarPreview.value = null
  backgroundPreview.value = null
  avatarFile.value = null
  backgroundFile.value = null
  updateError.value = ''

  resetSelection()
}

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  revokeBlobUrl(avatarSourceUrl.value)

  if (avatarPreview.value?.startsWith('blob:')) {
    revokeBlobUrl(avatarPreview.value)
  }

  avatarFile.value = file
  avatarSourceUrl.value = URL.createObjectURL(file)
  avatarPreview.value = avatarSourceUrl.value

  resetSelection()

  await nextTick()

  if (cropImageRef.value?.complete) {
    initializeSelection()
  }
}

const handleBackgroundChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (backgroundPreview.value?.startsWith('blob:')) {
    revokeBlobUrl(backgroundPreview.value)
  }

  backgroundFile.value = file
  backgroundPreview.value = URL.createObjectURL(file)
}

const resetSelection = () => {
  selectionX.value = 0
  selectionY.value = 0
  selectionSize.value = 0
}

const initializeSelection = () => {
  if (!cropAreaRef.value || !cropImageRef.value) return

  const areaRect = cropAreaRef.value.getBoundingClientRect()
  const imageRect = cropImageRef.value.getBoundingClientRect()

  const imageX = imageRect.left - areaRect.left
  const imageY = imageRect.top - areaRect.top
  const imageWidth = imageRect.width
  const imageHeight = imageRect.height

  const size = Math.min(imageWidth, imageHeight)

  selectionSize.value = size
  selectionX.value = imageX + (imageWidth - size) / 2
  selectionY.value = imageY + (imageHeight - size) / 2
}

const getImageBounds = () => {
  if (!cropAreaRef.value || !cropImageRef.value) return null

  const areaRect = cropAreaRef.value.getBoundingClientRect()
  const imageRect = cropImageRef.value.getBoundingClientRect()

  return {
    x: imageRect.left - areaRect.left,
    y: imageRect.top - areaRect.top,
    width: imageRect.width,
    height: imageRect.height
  }
}

const clampSelection = () => {
  const imageBounds = getImageBounds()

  if (!imageBounds) return

  const maxX =
    imageBounds.x +
    imageBounds.width -
    selectionSize.value

  const maxY =
    imageBounds.y +
    imageBounds.height -
    selectionSize.value

  selectionX.value = Math.max(
    imageBounds.x,
    Math.min(maxX, selectionX.value)
  )

  selectionY.value = Math.max(
    imageBounds.y,
    Math.min(maxY, selectionY.value)
  )
}

const startSelectionDrag = (event: PointerEvent) => {
  if (!avatarSourceUrl.value || selectionSize.value <= 0) return

  isDraggingSelection.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragOriginX.value = selectionX.value
  dragOriginY.value = selectionY.value

  const target = event.currentTarget as HTMLElement
  target.setPointerCapture?.(event.pointerId)
}

const moveSelectionDrag = (event: PointerEvent) => {
  if (!isDraggingSelection.value) return

  selectionX.value =
    dragOriginX.value +
    (event.clientX - dragStartX.value)

  selectionY.value =
    dragOriginY.value +
    (event.clientY - dragStartY.value)

  clampSelection()
  updateAvatarPreview()
}

const endSelectionDrag = () => {
  isDraggingSelection.value = false
}

const updateAvatarPreview = async () => {
  if (!avatarSourceUrl.value || !cropImageRef.value) return

  try {
    const blob = await createCroppedAvatar()
    const previewUrl = URL.createObjectURL(blob)

    if (
      avatarPreview.value &&
      avatarPreview.value !== avatarSourceUrl.value
    ) {
      revokeBlobUrl(avatarPreview.value)
    }

    avatarPreview.value = previewUrl
  } catch (error) {
    console.error('プレビュー生成に失敗しました:', error)
  }
}

const createCroppedAvatar = async (): Promise<Blob> => {
  if (!avatarSourceUrl.value || !cropImageRef.value) {
    throw new Error('プロフィール画像が選択されていません')
  }

  const image = cropImageRef.value
  const imageBounds = getImageBounds()

  if (!imageBounds || selectionSize.value <= 0) {
    throw new Error('トリミング範囲を取得できませんでした')
  }

  const scaleX =
    image.naturalWidth / imageBounds.width

  const scaleY =
    image.naturalHeight / imageBounds.height

  const sourceX =
    (selectionX.value - imageBounds.x) * scaleX

  const sourceY =
    (selectionY.value - imageBounds.y) * scaleY

  const sourceSize =
    selectionSize.value * Math.min(scaleX, scaleY)

  const canvasSize = 512

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvasの初期化に失敗しました')
  }

  const safeSourceX = Math.max(
    0,
    Math.min(
      image.naturalWidth - sourceSize,
      sourceX
    )
  )

  const safeSourceY = Math.max(
    0,
    Math.min(
      image.naturalHeight - sourceSize,
      sourceY
    )
  )

  const safeSourceSize = Math.min(
    sourceSize,
    image.naturalWidth,
    image.naturalHeight
  )

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(
    image,
    safeSourceX,
    safeSourceY,
    safeSourceSize,
    safeSourceSize,
    0,
    0,
    canvasSize,
    canvasSize
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('画像の生成に失敗しました'))
        }
      },
      'image/jpeg',
      0.95
    )
  })
}

const updateProfile = async () => {
  if (!user.value) return

  if (!avatarFile.value && !backgroundFile.value) {
    closeEditModal()
    return
  }

  isUpdating.value = true
  updateError.value = ''

  try {
    const formData = new FormData()

    if (avatarSourceUrl.value && avatarFile.value) {
      const croppedAvatar = await createCroppedAvatar()

      formData.append(
        'user[avatar]',
        croppedAvatar,
        'avatar.jpg'
      )
    }

    if (backgroundFile.value) {
      formData.append(
        'user[background_image]',
        backgroundFile.value,
        backgroundFile.value.name
      )
    }

    const response = await $api.patch<ProfileUser>(
      `/users/${user.value.id}`,
      formData
    )

    user.value = response.data

    closeEditModal()
  } catch (error: any) {
    console.error('プロフィール更新に失敗しました:', error)

    updateError.value =
      error?.response?.data?.errors?.join?.('\n') ||
      error?.response?.data?.error ||
      error?.message ||
      'プロフィールの更新に失敗しました'
  } finally {
    isUpdating.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  fetchProfile()
})

onBeforeUnmount(() => {
  revokeBlobUrl(avatarSourceUrl.value)

  if (
    avatarPreview.value &&
    avatarPreview.value !== user.value?.avatar_url
  ) {
    revokeBlobUrl(avatarPreview.value)
  }

  if (
    backgroundPreview.value &&
    backgroundPreview.value !== user.value?.background_image_url
  ) {
    revokeBlobUrl(backgroundPreview.value)
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: #f5f7fb;
}

.profile-container {
  width: min(100%, 900px);
  margin: 24px auto 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card,
.record-card,
.settings-card {
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
  overflow: hidden;
}

.profile-background {
  width: 100%;
  height: 220px;
  background: #e5e7eb;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.profile-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 28px 28px;
}

.avatar-wrapper {
  flex-shrink: 0;
  margin-top: -64px;
}

.avatar {
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 5px solid #fff;
  border-radius: 50%;
  background: #111827;
  color: #fff;
  font-size: 40px;
  font-weight: 800;
  box-sizing: border-box;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.profile-name {
  padding-top: 16px;
}

.profile-name h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
}

.profile-name p {
  margin: 6px 0 0;
  color: #8a94a6;
  font-size: 13px;
}

.edit-button {
  margin-left: auto;
  padding: 10px 16px;
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  background: #fff;
  color: #1f2937;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.edit-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #edf0f5;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 22px;
}

.info-item + .info-item {
  border-left: 1px solid #edf0f5;
}

.info-label {
  color: #9aa3b1;
  font-size: 10px;
  font-weight: 700;
}

.info-value {
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
}

.record-card,
.settings-card {
  padding: 22px;
}

.section-title h2 {
  margin: 0;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
}

.section-title p {
  margin: 4px 0 0;
  color: #8a94a6;
  font-size: 12px;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 18px;
}

.record-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
}

.record-icon {
  font-size: 20px;
}

.record-label {
  color: #8a94a6;
  font-size: 10px;
}

.record-item strong {
  color: #111827;
  font-size: 22px;
  font-weight: 800;
}

.logout-button {
  width: 100%;
  height: 46px;
  margin-top: 18px;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fff;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.logout-button:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.45);
}

.edit-modal {
  width: min(100%, 600px);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #edf0f5;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
}

.close-button {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 22px;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  color: #1f2937;
  font-size: 12px;
  font-weight: 700;
}

.file-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 9px 14px;
  border: 1px solid #dbe1ea;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.file-button:hover {
  background: #f8fafc;
}

.file-button input {
  display: none;
}

.crop-area {
  position: relative;
  width: min(100%, 420px);
  height: 280px;
  margin: 6px auto 0;
  overflow: hidden;
  border-radius: 12px;
  background: #111827;
  user-select: none;
  touch-action: none;
}

.crop-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  pointer-events: none;
}

.selection-box {
  position: absolute;
  border: 3px solid #fff;
  box-sizing: border-box;
  cursor: grab;
  touch-action: none;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.3),
    0 4px 20px rgba(0, 0, 0, 0.18);
}

.selection-box:active {
  cursor: grabbing;
}

.selection-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to right,
      transparent 33.2%,
      rgba(255, 255, 255, 0.55) 33.2%,
      rgba(255, 255, 255, 0.55) 33.7%,
      transparent 33.7%,
      transparent 66.2%,
      rgba(255, 255, 255, 0.55) 66.2%,
      rgba(255, 255, 255, 0.55) 66.7%,
      transparent 66.7%
    ),
    linear-gradient(
      to bottom,
      transparent 33.2%,
      rgba(255, 255, 255, 0.55) 33.2%,
      rgba(255, 255, 255, 0.55) 33.7%,
      transparent 33.7%,
      transparent 66.2%,
      rgba(255, 255, 255, 0.55) 66.2%,
      rgba(255, 255, 255, 0.55) 66.7%,
      transparent 66.7%
    );
  pointer-events: none;
}

.crop-help {
  text-align: center;
  color: #64748b;
  font-size: 11px;
}

.selected-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-label {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.selected-preview {
  width: 110px;
  height: 110px;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  background: #111827;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
}

.selected-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview {
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 4px auto 8px;
  border-radius: 50%;
  background: #111827;
  color: #fff;
  font-size: 40px;
  font-weight: 800;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-preview {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  border-radius: 12px;
  background: #e5e7eb;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.update-error {
  margin: 0;
  padding: 11px 12px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 11px;
  white-space: pre-line;
}

.save-button {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.save-button:hover {
  background: #1f2937;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .profile-page {
    padding: 10px;
  }

  .profile-container {
    margin-top: 12px;
  }

  .profile-background {
    height: 180px;
  }

  .profile-header {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
    gap: 8px;
    padding: 0 18px 24px;
  }

  .avatar-wrapper {
    width: 100%;
    margin-top: -64px;
    display: flex;
    justify-content: center;
  }

  .profile-name {
    width: 100%;
    padding-top: 4px;
  }

  .edit-button {
    margin: 8px auto 0;
  }

  .profile-info {
    grid-template-columns: 1fr;
  }

  .info-item + .info-item {
    border-left: none;
    border-top: 1px solid #edf0f5;
  }

  .record-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

  .edit-modal {
    max-height: 95vh;
  }

  .crop-area {
    width: 100%;
    height: min(280px, 65vw);
  }
}
</style>