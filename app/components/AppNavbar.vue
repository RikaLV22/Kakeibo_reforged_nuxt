<template>
  <nav class="top-navbar">
    <div class="navbar-brand">
      家計簿
    </div>

    <div class="navbar-menu">
      <NuxtLink to="/" class="nav-item">
        ホーム
      </NuxtLink>

      <NuxtLink to="/transactions" class="nav-item">
        組織家計簿
      </NuxtLink>

      <NuxtLink to="/personal" class="nav-item">
        個人家計簿
      </NuxtLink>

      <NuxtLink to="/mypage" class="nav-item">
        マイページ
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item">
        プロフィール
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.top-navbar {
  height: 58px;
  margin-bottom: 16px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(20, 30, 55, 0.05);
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
}

.nav-item {
  padding: 9px 13px;
  border-radius: 9px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s ease;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-item.router-link-active {
  background: #111827;
  color: #fff;
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
    margin-right: 10px;
  }

  .navbar-menu {
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>