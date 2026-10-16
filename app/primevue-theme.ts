import Aura from "@primeuix/themes/aura";

/**
 * PrimeVue-Theme (Aura mit den MYHB-Grautoenen).
 *
 * Eigene Datei statt primevue.options.theme in nuxt.config.ts: Das Modul
 * schreibt seine Optionen in runtimeConfig.public, und die steht in JEDER
 * Seite als window.__NUXT__.config im HTML. Mit dem Aura-Preset waren das
 * 110 KB je Seitenaufruf (go.-Landingpage Leipzig: 475 KB HTML, Messung
 * 16.10.2026). Ueber importTheme kommt das Theme ins JS-Bundle, das der
 * Browser einmal laedt und cached.
 */
export default {
  preset: {
    ...Aura,
    extend: {
      primitive: {
        surface: {
          0: "var(--color-white)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        primary: {
          0: "var(--color-white)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        gray: {
          0: "var(--color-white)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
      },
    },
  },
  options: {
    darkModeSelector: "none",
  },
};
