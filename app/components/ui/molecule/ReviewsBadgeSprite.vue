<template>
  <!--
    TSEO-13: Grafiken des Bewertungs-Badges einmal pro Seite. Das Badge steht
    auf Filialseiten ~40-mal; vorher trug jedes Exemplar fuenf Sterne, das
    Google-Logo und den Kreis als vollstaendige SVGs (~150 KB HTML auf
    /standorte/koeln/koeln-arcaden). Jetzt verweist es per <use href="#...">.
    Nicht display:none - manche Browser zeichnen <use> dann nicht.
  -->
  <svg
    class="reviewsBadgeSprite"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <symbol id="rb-star" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
      />
    </symbol>
    <symbol id="rb-star-half" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 1a.993 .993 0 0 1 .823 .443l.067 .116l2.852 5.781l6.38 .925c.741 .108 1.08 .94 .703 1.526l-.07 .095l-.078 .086l-4.624 4.499l1.09 6.355a1.001 1.001 0 0 1 -1.249 1.135l-.101 -.035l-.101 -.046l-5.693 -3l-5.706 3c-.105 .055 -.212 .09 -.32 .106l-.106 .01a1.003 1.003 0 0 1 -1.038 -1.06l.013 -.11l1.09 -6.355l-4.623 -4.5a1.001 1.001 0 0 1 .328 -1.647l.113 -.036l.114 -.023l6.379 -.925l2.853 -5.78a.968 .968 0 0 1 .904 -.56zm0 3.274v12.476a1 1 0 0 1 .239 .029l.115 .036l.112 .05l4.363 2.299l-.836 -4.873a1 1 0 0 1 .136 -.696l.07 -.099l.082 -.09l3.546 -3.453l-4.891 -.708a1 1 0 0 1 -.62 -.344l-.073 -.097l-.06 -.106l-2.183 -4.424z"
      />
    </symbol>
    <symbol id="rb-star-empty" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"
      />
    </symbol>
    <symbol id="rb-google" viewBox="0 0 26 26">
      <path
        d="M25.154 13.125a14.75 14.75 0 0 0-.233-2.625H12.834v4.97h6.907c-.303 1.598-1.213 2.952-2.578 3.862v3.232h4.165c2.427-2.24 3.827-5.53 3.827-9.438z"
        fill="#4285f4"
      />
      <path
        d="M12.834 25.667c3.465 0 6.37-1.143 8.493-3.103l-4.165-3.232c-1.143.77-2.602 1.237-4.328 1.237-3.337 0-6.172-2.252-7.187-5.285h-4.27v3.313c2.112 4.188 6.44 7.07 11.457 7.07z"
        fill="#34a853"
      />
      <path
        d="M5.647 15.271a7.69 7.69 0 0 1-.408-2.438 7.69 7.69 0 0 1 .408-2.438V7.081h-4.27C.502 8.808 0 10.756 0 12.833s.502 4.025 1.377 5.752l3.325-2.59.945-.723z"
        fill="#fbbc05"
      />
      <path
        d="M12.834 5.11c1.89 0 3.57.653 4.912 1.913l3.675-3.675C19.192 1.272 16.299 0 12.834 0 7.817 0 3.489 2.882 1.377 7.082l4.27 3.313c1.015-3.033 3.85-5.285 7.187-5.285z"
        fill="#ea4335"
      />
    </symbol>
    <symbol id="rb-value-bg" viewBox="1.5 2.5 21 19">
      <path
        fill="none"
        stroke="var(--color-text-light)"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"
      />
    </symbol>
  </svg>
</template>

<style scoped>
.reviewsBadgeSprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
