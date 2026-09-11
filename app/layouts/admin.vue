<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: #03070a;
  color: #eef8fa;
}

.admin-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
}
</style>