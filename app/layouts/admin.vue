<template>
  <div class="admin-layout">
    <!-- =========================
         GLOBAL HUD EFFECTS
    ========================== -->

    <div class="admin-grid"></div>
    <div class="admin-scan"></div>
    <div class="admin-scan-vertical"></div>

    <div class="admin-light light-top"></div>
    <div class="admin-light light-bottom"></div>

    <div class="admin-corner corner-tl"></div>
    <div class="admin-corner corner-tr"></div>
    <div class="admin-corner corner-bl"></div>
    <div class="admin-corner corner-br"></div>

    <div class="admin-status-line">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- =========================
         CONTENT
    ========================== -->

    <AdminSidebar />

    <main class="admin-content">
      <div class="admin-content-inner">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* =========================================================
   BASE
========================================================= */

.admin-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: hidden;

  background: #f4f9fc;
  color: #17313d;
}

/* =========================================================
   CONTENT
========================================================= */

.admin-content {
  position: relative;
  z-index: 2;

  flex: 1;
  min-width: 0;
  min-height: 100vh;
}

.admin-content-inner {
  position: relative;
  z-index: 2;
  min-height: 100vh;
}

/* =========================================================
   GLOBAL GRID
========================================================= */

.admin-grid {
  position: fixed;
  inset: 0;
  z-index: 10;

  pointer-events: none;

  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.045) 1px,
      transparent 1px
    );

  background-size: 36px 36px;

  opacity: 0.8;

  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0.15) 75%,
    transparent
  );

  animation: global-grid 9s linear infinite;
}

/* =========================================================
   HORIZONTAL SCAN
========================================================= */

.admin-scan {
  position: fixed;
  top: -18%;
  left: 0;

  width: 100%;
  height: 18%;

  z-index: 11;
  pointer-events: none;

  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34, 184, 223, 0.065),
    rgba(34, 184, 223, 0.025),
    transparent
  );

  filter: blur(8px);

  animation: global-scan 6s linear infinite;
}

/* =========================================================
   VERTICAL SCAN
========================================================= */

.admin-scan-vertical {
  position: fixed;
  top: 0;
  left: -8%;

  width: 8%;
  height: 100%;

  z-index: 11;
  pointer-events: none;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.035),
    transparent
  );

  filter: blur(10px);

  animation: vertical-scan 10s linear infinite;
}

/* =========================================================
   LIGHT AMBIENCE
========================================================= */

.admin-light {
  position: fixed;
  z-index: 9;

  width: 420px;
  height: 420px;

  pointer-events: none;

  border-radius: 50%;

  filter: blur(90px);

  opacity: 0.15;
}

.light-top {
  top: -300px;
  right: 8%;

  background: rgba(34, 184, 223, 0.18);

  animation: ambient-top 7s ease-in-out infinite;
}

.light-bottom {
  bottom: -320px;
  left: 30%;

  background: rgba(49, 185, 133, 0.12);

  animation: ambient-bottom 9s ease-in-out infinite;
}

/* =========================================================
   HUD CORNERS
========================================================= */

.admin-corner {
  position: fixed;
  z-index: 12;

  width: 44px;
  height: 44px;

  pointer-events: none;

  opacity: 0.55;
}

/* top-left */

.corner-tl {
  top: 18px;
  left: 285px;

  border-top: 1px solid rgba(34, 184, 223, 0.55);
  border-left: 1px solid rgba(34, 184, 223, 0.55);

  animation: corner-pulse 3s ease-in-out infinite;
}

/* top-right */

.corner-tr {
  top: 18px;
  right: 18px;

  border-top: 1px solid rgba(34, 184, 223, 0.4);
  border-right: 1px solid rgba(34, 184, 223, 0.4);

  animation: corner-pulse 3.8s ease-in-out infinite;
}

/* bottom-left */

.corner-bl {
  bottom: 18px;
  left: 285px;

  border-bottom: 1px solid rgba(34, 184, 223, 0.35);
  border-left: 1px solid rgba(34, 184, 223, 0.35);

  animation: corner-pulse 4.2s ease-in-out infinite;
}

/* bottom-right */

.corner-br {
  right: 18px;
  bottom: 18px;

  border-bottom: 1px solid rgba(34, 184, 223, 0.4);
  border-right: 1px solid rgba(34, 184, 223, 0.4);

  animation: corner-pulse 3.5s ease-in-out infinite;
}

/* =========================================================
   STATUS LINE
========================================================= */

.admin-status-line {
  position: fixed;
  top: 0;
  left: 265px;
  right: 0;

  z-index: 13;

  display: flex;
  gap: 4px;

  height: 2px;

  pointer-events: none;

  overflow: hidden;
}

.admin-status-line span {
  height: 100%;

  background: #22b8df;

  opacity: 0.5;
}

.admin-status-line span:nth-child(1) {
  width: 20%;

  animation: status-line-1 5s linear infinite;
}

.admin-status-line span:nth-child(2) {
  width: 8%;

  background: #31b985;

  animation: status-line-2 6s linear infinite;
}

.admin-status-line span:nth-child(3) {
  width: 4%;

  background: #dcae38;

  animation: status-line-3 4s linear infinite;
}

/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes global-grid {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 36px 36px;
  }
}

@keyframes global-scan {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  65% {
    opacity: 0.75;
  }

  100% {
    transform: translateY(700%);
    opacity: 0;
  }
}

@keyframes vertical-scan {
  0% {
    transform: translateX(0);
    opacity: 0;
  }

  10% {
    opacity: 0.7;
  }

  70% {
    opacity: 0.35;
  }

  100% {
    transform: translateX(1500%);
    opacity: 0;
  }
}

@keyframes ambient-top {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.10;
  }

  50% {
    transform: translate(-80px, 100px) scale(1.2);
    opacity: 0.18;
  }
}

@keyframes ambient-bottom {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.08;
  }

  50% {
    transform: translate(80px, -80px) scale(1.15);
    opacity: 0.15;
  }
}

@keyframes corner-pulse {
  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes status-line-1 {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(600%);
  }
}

@keyframes status-line-2 {
  0% {
    transform: translateX(-300%);
  }

  100% {
    transform: translateX(900%);
  }
}

@keyframes status-line-3 {
  0% {
    transform: translateX(-500%);
  }

  100% {
    transform: translateX(1200%);
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 850px) {
  .corner-tl,
  .corner-bl {
    left: 12px;
  }

  .admin-status-line {
    left: 0;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .admin-grid,
  .admin-scan,
  .admin-scan-vertical,
  .admin-light,
  .admin-corner,
  .admin-status-line span {
    animation: none;
  }
}
</style>