<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html,
body,
#__nuxt,
#app {
  margin: 0;
  min-height: 100%;
}

html {
  scrollbar-width: none;
}

html::-webkit-scrollbar {
  display: none;
}

body {
  background: white;
  scrollbar-width: none;
}

body::-webkit-scrollbar {
  display: none;
}

#app {
  position: relative;
  min-height: 100vh;
  background: white;
}
</style>
