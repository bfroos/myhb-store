<template>
  <!--
    Schlanker Rahmen fuer beworbene Landingpages (Meta-Seiten /aktion,
    Zelgai 05.10.2026: "maximal 1 CTA"): nur das Logo oben, unten nur die
    Pflichtlinks. Kein Menue, keine Footer-Navigation, kein zweites
    Newsletter-Formular. Dialoge (Rabatt, Buchung) wie im Standard-Layout.
  -->
  <div class="landing">
    <header class="landing__header">
      <span class="landing__logo"><ImageAppLogo /></span>
    </header>
    <main>
      <slot />
    </main>
    <footer class="landing__footer">
      <nav aria-label="Rechtliches">
        <ul>
          <li><NuxtLinkLocale to="/p/impressum">{{ $t("navigation.meta.imprint") }}</NuxtLinkLocale></li>
          <li><NuxtLinkLocale to="/p/datenschutz">{{ $t("navigation.meta.privacyPolicy") }}</NuxtLinkLocale></li>
          <li><NuxtLinkLocale to="/p/agb">{{ $t("navigation.meta.terms") }}</NuxtLinkLocale></li>
          <li>
            <button type="button" class="landing__cookies" @click="openCookieSettings">
              {{ $t("navigation.meta.cookieSettings") }}
            </button>
          </li>
        </ul>
      </nav>
    </footer>
    <Toast />
    <DynamicDialog />
  </div>
</template>

<script setup lang="ts">
const { openCookieSettings } = useCookiebot();
</script>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.landing > main {
  flex: 1;
}

.landing__header {
  display: flex;
  justify-content: center;
  padding: var(--space-400) var(--container-pad) var(--space-200);
}

.landing__logo {
  display: inline-flex;
  height: 40px;
}

.landing__logo :deep(svg) {
  height: 100%;
  width: auto;
}

.landing__footer {
  padding: var(--space-700) var(--container-pad) calc(var(--space-900) + 64px);
  font-size: var(--font-sm);
}

.landing__cookies {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
  color: inherit;
}

.landing__footer ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-400);
  row-gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
