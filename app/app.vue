<template>
  <div id="app">
    <NuxtPage />
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

/* スクロールバーだけ非表示 */
html {
  scrollbar-width: none; /* Firefox */
}

html::-webkit-scrollbar {
  display: none; /* Chrome / Edge / Safari */
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