<template>
  <nav class="top-navbar">
    <div class="navbar-brand">
      家計簿
    </div>

    <div class="navbar-menu">
      <div class="organization-nav">
        <button
          type="button"
          class="nav-item organization-trigger"
          :class="{
            active:
              showOrganizations ||
              isTransactionsPage
          }"
          @click="toggleOrganizations"
        >
          組織家計簿
        </button>

        <Transition name="organization-slide">
          <div
            v-if="showOrganizations"
            class="organization-list"
          >
            <div
              v-if="isLoadingOrganizations"
              class="organization-loading"
            >
              読み込み中...
            </div>

            <template
              v-else-if="
                organizations.length > 0
              "
            >
              <button
                v-for="organization in organizations"
                :key="organization.id"
                type="button"
                class="organization-item"
                :class="{
                  selected:
                    selectedOrganizationId ===
                    organization.id
                }"
                @click="
                  selectOrganization(
                    organization.id
                  )
                "
              >
                <span
                  class="organization-name"
                >
                  {{
                    organization.name
                  }}
                </span>

                <span
                  v-if="
                    selectedOrganizationId ===
                    organization.id
                  "
                  class="selected-mark"
                >
                  ✓
                </span>
              </button>
            </template>

            <div
              v-else
              class="organization-empty"
            >
              所属組織がありません
            </div>
          </div>
        </Transition>
      </div>

      <NuxtLink
        to="/personal"
        class="nav-item"
      >
        個人家計簿
      </NuxtLink>

      <NuxtLink
        to="/mypage"
        class="nav-item"
      >
        マイページ
      </NuxtLink>

      <NuxtLink
        to="/profile"
        class="nav-item"
      >
        プロフィール
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref
} from 'vue'

interface Organization {
  id: number
  name: string
  public_id: string
}

interface MembershipResponse {
  id: number
  organization?: Organization
}

const { $api } =
  useNuxtApp()

const router =
  useRouter()

const route =
  useRoute()

const organizations =
  ref<Organization[]>([])

const selectedOrganizationId =
  ref<number | null>(null)

const showOrganizations =
  ref(false)

const isLoadingOrganizations =
  ref(false)

const isTransactionsPage =
  computed(() =>
    route.path === '/transactions'
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

const fetchOrganizations =
  async () => {
    isLoadingOrganizations.value =
      true

    try {
      const response =
        await $api.get<
          MembershipResponse[]
        >(
          '/organization_memberships'
        )

      const memberships =
        Array.isArray(
          response.data
        )
          ? response.data
          : []

      organizations.value =
        memberships
          .filter(
            membership =>
              membership.organization
          )
          .map(
            membership => ({
              id:
                membership
                  .organization!.id,

              name:
                membership
                  .organization!.name,

              public_id:
                membership
                  .organization!.public_id
            })
          )

      const savedId =
        getSelectedOrganizationId()

      if (
        savedId &&
        organizations.value.some(
          organization =>
            organization.id ===
            savedId
        )
      ) {
        selectedOrganizationId.value =
          savedId
      } else if (
        organizations.value.length > 0
      ) {
        selectedOrganizationId.value =
          organizations.value[0].id

        localStorage.setItem(
          'selectedOrganizationId',
          String(
            selectedOrganizationId.value
          )
        )
      }
    } catch (error: any) {
      console.error(
        '所属組織の取得に失敗しました:',
        error
      )

      organizations.value =
        []

      selectedOrganizationId.value =
        null
    } finally {
      isLoadingOrganizations.value =
        false
    }
  }

const toggleOrganizations =
  async () => {
    if (
      !isTransactionsPage.value
    ) {
      localStorage.setItem(
        'openOrganizationSelector',
        'true'
      )

      await router.push(
        '/transactions'
      )

      return
    }

    showOrganizations.value =
      !showOrganizations.value
  }

const selectOrganization =
  async (
    organizationId: number
  ) => {
    selectedOrganizationId.value =
      organizationId

    localStorage.setItem(
      'selectedOrganizationId',
      String(
        organizationId
      )
    )

    showOrganizations.value =
      false

    if (
      route.path !== '/transactions'
    ) {
      await router.push(
        '/transactions'
      )

      return
    }

    window.location.reload()
  }

onMounted(
  async () => {
    await fetchOrganizations()

    if (
      localStorage.getItem(
        'openOrganizationSelector'
      ) === 'true'
    ) {
      localStorage.removeItem(
        'openOrganizationSelector'
      )

      if (
        route.path ===
        '/transactions'
      ) {
        showOrganizations.value =
          true
      }
    }
  }
)
</script>

<style scoped>
.top-navbar {
  position: relative;
  z-index: 100;
  height: 58px;
  margin-bottom: 16px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  box-shadow:
    0 6px 24px
    rgba(
      20,
      30,
      55,
      0.05
    );
  overflow: visible;
}

.navbar-brand {
  margin-right: 30px;
  color: #111827;
  font-size: 17px;
  font-weight: 800;
  white-space: nowrap;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: visible;
}

.nav-item {
  padding: 9px 13px;
  border-radius: 9px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-item.router-link-active {
  background: #111827;
  color: #fff;
}

.organization-nav {
  display: flex;
  align-items: center;
  overflow: visible;
  border-radius: 9px;
}

.organization-trigger {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

.organization-trigger.active {
  background: #111827;
  color: #fff;
}

.organization-list {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
}

.organization-item {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 110px;
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #f8fafc;
  color: #1f2937;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s ease;
}

.organization-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.organization-item.selected {
  border-color: #111827;
  background: #111827;
  color: #fff;
}

.organization-name {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 800;
}

.selected-mark {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
}

.organization-loading,
.organization-empty {
  padding: 8px 10px;
  color: #94a3b8;
  font-size: 10px;
  white-space: nowrap;
}

.organization-slide-enter-active,
.organization-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s ease,
    max-width 0.25s ease;
}

.organization-slide-enter-from,
.organization-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
  max-width: 0;
}

.organization-slide-enter-to,
.organization-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
  max-width: 600px;
}

@media (max-width: 900px) {
  .navbar-brand {
    margin-right: 12px;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 12px;
  }

  .organization-item {
    min-width: 90px;
  }

  .organization-name {
    max-width: 70px;
  }
}

@media (max-width: 700px) {
  .top-navbar {
    height: auto;
    min-height: 58px;
    padding: 10px 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .navbar-brand {
    margin-right: 4px;
  }

  .navbar-menu {
    width: 100%;
    flex-wrap: wrap;
  }

  .organization-nav {
    max-width: 100%;
    overflow: visible;
  }

  .organization-list {
    max-width: calc(100vw - 120px);
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .organization-item {
    min-width: 100px;
  }

  .organization-name {
    max-width: 70px;
  }
}
</style>