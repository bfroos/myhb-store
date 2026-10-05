<template>
  <!--
    go.* Seitenvorlage v2 (bfroos/myhb-store#203, Playbook Kapitel 3):
    Hero -> Clips -> Vertrauenszeile -> Steckbrief -> Wirkweise (Zonenbild)
    -> Aufruf -> Ablauf (Zeitachse) -> Preise -> Weitere Zonen -> Aerzt:innen
    -> Beratungsfoto -> Bewertungen -> Einwaende ("Noch unsicher?") ->
    Standort -> Fragen + Nachsorge -> Schlussaufruf, dazu die mitlaufende
    Leiste des Heros. Kein SEO-Langtext.
    Agentur-Feedback 01.10.2026 (Beispielseite Lippen): eine Preis-/Angebots-
    zeile + ein Knopf im Hero, Leiste mit Knopf + "Anrufen" (02.10.2026:
    A = "20 % Rabatt sichern" ueber den Rabatt-Dialog, B = "Kostenlose
    Beratung buchen" direkt),
    Steckbrief mit Icons, Hervorhebungen in Fliesstexten, Zonen und
    Bewertungen mobil als Wischreihe, Standort vor den Fragen, Aufruf auch
    ueber dem Ablauf, Ueberschriften zentriert, Einwand-Abschnitt.
    Umschaltung: shared/adsTemplateV2.ts (ADS_TEMPLATE_V2_PAGES); Inhalte je
    Behandlung: shared/adsTemplateV2Content.ts.
  -->
  <div class="v2" :class="{ 'v2--ci': design !== 'v2', 'v2--ci-hell': design === 'ci-hell', 'v2--rot': design === 'ci-rot', 'v2--preis': design === 'ci-preis', 'v2--desk': desktopLayout }">
    <BlockTreatmentHero
      v-bind="hero"
      :subline="terms?.subline ?? hero.subline"
      :cta="heroCta"
      show-floating-cta
      template-v2
      :hero-clip="clips.hero ?? null"
      :sticky-cta-label="stickyLabel"
      :v2-price-line="heroPriceLine"
      :v2-sticky-price="stickyPrice"
      :v2-note="heroNote"
      :v2-design="design"
      :v2-desktop="desktopLayout"
    />

    <!-- Clips direkt nach dem Hero (Benjamin, 01.10.2026: "so sieht es bei
         uns aus", noch vor der Vertrauenszeile) -->
    <UiLayoutSectionBlock v-if="clips.carousel.length" spacing="sibling" :class="{ 'v2-clips--few': clips.carousel.length < 3 }">
      <div class="v2-card" :class="tone('clips')" data-track-placement="v2_clips">
        <h2 class="v2-h2">{{ H.clips }}</h2>
        <PagesTreatmentAdsV2ClipCarousel :clips="clips.carousel" />
      </div>
    </UiLayoutSectionBlock>

    <!-- Vertrauenszeile: Google -> Garantie -> Aerzt:innen -> ohne Termin -->
    <UiLayoutSectionBlock spacing="sibling">
      <ul class="v2-trust" role="list" data-track-placement="v2_trust">
        <li v-if="rating" class="v2-trust__item">
          <IconStarFilled class="v2-trust__icon v2-trust__icon--star" size="22" aria-hidden="true" />
          <span>
            <strong>Google {{ ratingLabel }}</strong>
            <span class="v2-trust__text">{{ ratingCountLabel }} {{ atLocation }}</span>
          </span>
        </li>
        <li v-for="item in trustItems" :key="item.key" class="v2-trust__item">
          <component :is="trustIcon(item.key)" class="v2-trust__icon" size="22" aria-hidden="true" />
          <span>
            <strong>{{ item.title }}</strong>
            <span v-if="item.text" class="v2-trust__text">{{ item.text }}</span>
            <!-- Michael, 03.10.2026: Oeffnungszeiten aus Strapi unter "Auch ohne Termin" -->
            <span v-if="item.key === 'walkin' && hours" class="v2-trust__text v2-trust__hours">{{ hours }}</span>
          </span>
        </li>
      </ul>
    </UiLayoutSectionBlock>

    <!-- 1. Steckbrief: Icon, Bezeichnung klein, Kernwert fett -->
    <UiLayoutSectionBlock v-if="facts.length">
      <div class="v2-card" :class="tone('facts')" data-track-placement="v2_facts">
        <h2 class="v2-h2">{{ H.facts }}</h2>
        <dl class="v2-facts">
          <div v-for="f in facts" :key="f.key" class="v2-facts__row" :class="{ 'v2-facts__row--price': f.key === 'preis' }">
            <component :is="factIcon(f.key)" class="v2-facts__icon" size="22" aria-hidden="true" />
            <dt>{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
      </div>
    </UiLayoutSectionBlock>

    <!-- 2. Wirkweise mit Zonenbild -->
    <UiLayoutSectionBlock v-if="terms">
      <div class="v2-card v2-split" :class="tone('how')" data-track-placement="v2_how">
        <h2 class="v2-h2">{{ H.how }}</h2>
        <div class="v2-how" :class="{ 'v2-how--text': !zoneImage }">
          <img
            v-if="zoneImage"
            class="v2-how__img"
            :src="zoneImage.src"
            :alt="zoneImage.alt"
            width="160"
            height="216"
            loading="lazy"
            decoding="async"
          />
          <p class="v2-how__text"><PagesTreatmentAdsV2Emph :parts="howParts" /></p>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Aufruf auch direkt ueber dem Ablauf (Agentur-Feedback 01.10.2026) -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-final" :class="tone('mid', 'v2-card--accent')" data-track-placement="v2_cta_mid">
        <p class="v2-h2 v2-final__title">{{ H.final }}</p>
        <p v-if="finalPrice" class="v2-final__price">
          {{ priceParts(finalPrice)[0] }}<span class="v2-nowrap">{{ priceParts(finalPrice)[1] }}</span>
        </p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Ablauf (5. Zeitachse) -->
    <UiLayoutSectionBlock>
      <div class="v2-card" :class="tone('steps', 'v2-card--soft')" data-track-placement="v2_steps">
        <h2 class="v2-h2">{{ H.steps }}</h2>
        <!-- CI-Gestaltung (Benjamin, 03.10.2026): drei Schritte mit Bild
             (Vor / Waehrend / Nachsorge) statt der Zeitachse -->
        <ol v-if="processSteps" class="v2-process">
          <li v-for="(st, i) in processSteps" :key="st.key" class="v2-process__item">
            <div class="v2-process__img">
              <UiAtomMediaPicture :media="st.image" :default-format="ImageFormat.MEDIUM" />
              <span class="v2-process__num" aria-hidden="true">{{ i + 1 }}</span>
            </div>
            <div class="v2-process__body">
              <strong class="v2-process__title">{{ st.title }}</strong>
              <p v-if="st.text" class="v2-process__text">{{ st.text }}</p>
              <ul v-if="st.list.length" class="v2-process__list" role="list">
                <li v-for="row in st.list" :key="row.when">
                  <span class="v2-process__when">{{ row.when }}</span> {{ row.title }}
                </li>
              </ul>
            </div>
          </li>
        </ol>
        <ol v-else-if="timeline.length" class="v2-timeline">
          <li v-for="item in timeline" :key="item.when" class="v2-timeline__item">
            <span class="v2-timeline__when">{{ item.when }}</span>
            <strong class="v2-steps__title">{{ item.title }}</strong>
            <span class="v2-steps__text"><PagesTreatmentAdsV2Emph :parts="emph(item.text)" /></span>
          </li>
        </ol>
        <ol v-else class="v2-steps">
          <li v-for="(step, i) in steps" :key="step.title" class="v2-steps__item">
            <span class="v2-steps__num" aria-hidden="true">{{ i + 1 }}</span>
            <span>
              <strong class="v2-steps__title">{{ step.title }}</strong>
              <span class="v2-steps__text">{{ step.text }}</span>
            </span>
          </li>
        </ol>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Preise -->
    <UiLayoutSectionBlock v-if="priceCards.length">
      <div class="v2-card v2-prices-card" :class="tone('prices')" data-track-placement="v2_prices">
        <h2 class="v2-h2">{{ H.prices }}</h2>
        <p v-if="offerShown" class="v2-lead">
          Neukundenpreis mit {{ discountPct }} % Rabatt – so sicherst du ihn dir: „{{ discountLabel }}“ antippen.
        </p>
        <ul class="v2-prices" :class="{ 'v2-prices--many': priceCards.length >= 3 }" role="list" :style="{ '--cols': String(Math.min(priceCards.length, 3)) }">
          <li v-for="card in priceCards" :key="card.key" class="v2-price" :class="{ 'v2-price--package': card.isPackage }">
            <span class="v2-price__label">{{ card.label }}</span>
            <strong v-if="card.offer" class="v2-price__offer">{{ card.offer }}</strong>
            <span v-if="card.regular" class="v2-price__regular">{{ keepAmount(card.regular) }}</span>
            <span v-if="card.note" class="v2-price__note">{{ keepAmount(card.note) }}</span>
          </li>
        </ul>
        <ul class="v2-notes" role="list">
          <li>{{ priceInclusion }}</li>
          <li v-if="productNote">{{ productNote }}</li>
        </ul>
        <!-- Raten nur ueber einen vorab gekauften Gutschein (Benjamin,
             01.10.2026); ohne Fremdlogos. Knopf auf den Geschenkgutschein im Shop. -->
        <div class="v2-pay" data-track-placement="v2_payment">
          <div class="v2-pay__body">
            <IconCreditCard class="v2-pay__icon" size="22" aria-hidden="true" />
            <p class="v2-pay__text">
              <strong>{{ ADS_V2_PAYMENT_TITLE }}</strong>
              <span>{{ ADS_V2_PAYMENT_NOTE }}</span>
            </p>
          </div>
          <a
            class="v2-pay__cta"
            :href="voucherUrl"
            target="_blank"
            rel="noopener"
            data-track-placement="v2_voucher"
            @click="trackVoucherClick"
          >
            <span>{{ ADS_V2_VOUCHER_LABEL }}</span>
            <IconArrowRight class="v2-pay__arrow" size="20" aria-hidden="true" />
          </a>
        </div>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- 7. Weitere Zonen: mobil Wischreihe, ab 900 px Raster -->
    <UiLayoutSectionBlock v-if="zoneTiles.length">
      <div class="v2-card v2-split" :class="tone('zones')" data-track-placement="v2_zones">
        <h2 class="v2-h2">{{ H.zones }}</h2>
        <p v-if="zoneHint" class="v2-lead">{{ zoneHint }}</p>
        <!-- Jede Kachel mit Bild: Poster des Behandlungsclips, sonst Zonenbild -->
        <ul class="v2-zones" :class="{ 'v2-zones--text': !zoneTilesHaveImages }" role="list">
          <li v-for="tile in zoneTiles" :key="tile.key" class="v2-zones__item">
            <a class="v2-zone" :class="{ 'v2-zone--photo': !!tile.photo }" :href="tile.href" data-track-placement="v2_zone_tile">
              <img
                v-if="tile.photo"
                class="v2-zone__photo"
                :src="tile.photo"
                alt=""
                width="180"
                height="240"
                loading="lazy"
                decoding="async"
              />
              <img
                v-else-if="tile.image"
                class="v2-zone__img"
                :src="tile.image.src"
                alt=""
                width="64"
                height="86"
                loading="lazy"
                decoding="async"
              />
              <span v-else-if="zoneTilesHaveImages" class="v2-zone__img v2-zone__img--empty" aria-hidden="true" />
              <span class="v2-zone__label">{{ tile.label }}</span>
              <span v-if="tile.price" class="v2-zone__price">{{ tile.price }}</span>
            </a>
          </li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- Aerzt:innen des Centers -->
    <UiLayoutSectionBlock v-if="doctors.length || bundesweit">
      <div class="v2-card v2-split" :class="tone('doctors', 'v2-card--soft')" data-track-placement="v2_doctors">
        <h2 class="v2-h2">{{ H.doctors }}</h2>
        <div class="v2-doctors-wrap" :class="{ 'v2-doctors-wrap--photo': !!doctorFeature?.image && doctors.length > 0 }">
        <!-- CI-Gestaltung (Benjamin, 03.10.2026): grosses Foto einer
             Aerztin des Standorts + kurzer Text, darunter die Aerzte-Reihe -->
        <div v-if="doctorFeature" class="v2-docfeature" data-track-placement="v2_doctor_feature">
          <figure v-if="doctorFeature.image" class="v2-docfeature__photo">
            <UiAtomMediaPicture :media="doctorFeature.image" :default-format="ImageFormat.MEDIUM" />
            <figcaption>{{ doctorFeature.name }}</figcaption>
          </figure>
          <div class="v2-docfeature__text">
            <p v-for="t in doctorFeature.text" :key="t">{{ t }}</p>
          </div>
        </div>
        <ul v-if="doctors.length" class="v2-doctors" role="list">
          <li v-for="doc in doctors" :key="doc.id ?? doc.name" class="v2-doctor">
            <div class="v2-doctor__photo">
              <UiAtomMediaPicture :media="doc.photo" />
            </div>
            <span class="v2-doctor__name">
              <span class="v2-doctor__title">{{ doc.title || "\u00a0" }}</span>
              <strong class="v2-doctor__full">{{ doc.fullName }}</strong>
            </span>
          </li>
        </ul>
        </div>
        <p v-if="!doctorFeature" class="v2-lead">{{ doctorsLead }}</p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Lounge-Galerie des Standorts (Benjamin, 02.10.2026, nach Parya's
         Strapi-Seite Profhilo Duesseldorf): Galerie-Block der Seite aus
         Strapi; fehlt er, entfaellt der Abschnitt. Mobil Wischreihe, ab
         1024 px Raster. Alt-Texte eigene, nicht die aus Strapi. -->
    <UiLayoutSectionBlock v-if="lounge">
      <div class="v2-card" :class="tone('lounge')" data-track-placement="v2_lounge">
        <h2 class="v2-h2">{{ lounge.headline }}</h2>
        <ul class="v2-lounge" role="list" :style="{ '--cols': String(Math.min(lounge.images.length, 3)) }">
          <li v-for="(img, i) in lounge.images" :key="img.id ?? i" class="v2-lounge__item">
            <UiAtomMediaPicture :media="img" :default-format="ImageFormat.MEDIUM" />
          </li>
        </ul>
      </div>
    </UiLayoutSectionBlock>

    <!-- 8. Beratungsfoto (leer = aus) -->
    <UiLayoutSectionBlock v-if="consultPhoto">
      <div class="v2-card v2-split" :class="tone('consult')" data-track-placement="v2_consult">
        <h2 class="v2-h2">{{ H.consult }}</h2>
        <img
          class="v2-consult__img"
          :src="consultPhoto.src"
          :alt="consultPhoto.alt"
          :width="consultPhoto.width"
          :height="consultPhoto.height"
          loading="lazy"
          decoding="async"
        />
      </div>
    </UiLayoutSectionBlock>

    <!-- Bewertungen des Standorts: Video mittig, Texte mobil als Wischreihe -->
    <UiLayoutSectionBlock v-if="reviews.length || clips.feedback.length">
      <div class="v2-card v2-reviews-card" :class="[tone('reviews'), { 'v2-reviews-card--multi': clips.feedback.length > 1 }]" data-track-placement="v2_reviews">
        <h2 class="v2-h2">{{ H.reviews }}</h2>
        <p v-if="rating" class="v2-lead">
          <IconStarFilled class="v2-star" size="18" aria-hidden="true" />
          <strong>{{ ratingLabel }}</strong> · {{ ratingCountLabel }} bei Google {{ atLocation }}
        </p>
        <!-- Kundenfeedback-Videos (Benjamin, 01.10.2026): tippen zum Abspielen, mit Ton -->
        <div v-if="clips.feedback.length" class="v2-feedback" data-track-placement="v2_feedback">
          <PagesTreatmentAdsV2ClipCarousel :clips="clips.feedback" tap-to-play placement="v2_feedback" />
        </div>
        <ul v-if="reviews.length" class="v2-reviews" role="list">
          <li v-for="review in reviews" :key="review.id ?? review.author" class="v2-review">
            <span class="v2-review__stars" role="img" aria-label="5 von 5 Sternen">
              <IconStarFilled v-for="n in 5" :key="n" size="16" aria-hidden="true" />
            </span>
            <p class="v2-review__text">„{{ review.text }}“</p>
            <span class="v2-review__author">{{ review.author }}</span>
          </li>
        </ul>
        <div class="v2-center">
          <a
            v-if="rating?.placeUrl"
            class="v2-link"
            :href="rating.placeUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Alle Bewertungen bei Google</a>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Einwaende (Agentur-Feedback 01.10.2026): nur Aussagen, die schon auf
         der Seite stehen; Texte in shared/adsTemplateV2Content.ts -->
    <UiLayoutSectionBlock v-if="objections.length">
      <div class="v2-card" :class="tone('objections', 'v2-card--soft')" data-track-placement="v2_objections">
        <h2 class="v2-h2">Noch unsicher?</h2>
        <p class="v2-lead">Das hören wir oft – und das antworten wir.</p>
        <ul class="v2-objections" :class="{ 'v2-objections--video': !!objectionClip }" role="list">
          <!-- Kundinnen-Video als Bento-Kachel (Benjamin, 03.10.2026) -->
          <li v-if="objectionClip" class="v2-objection-video" data-track-placement="v2_objection_video">
            <PagesTreatmentAdsV2ClipCarousel :clips="[objectionClip]" tap-to-play placement="v2_objection_video" />
          </li>
          <li v-for="(o, oi) in objections" :key="o.key" class="v2-objection" :class="[`v2-objection--t${oi % 3}`, `v2-objection--n${oi}`]">
            <component :is="objectionIcon(o.key)" class="v2-objection__icon" size="22" aria-hidden="true" />
            <div class="v2-objection__body">
              <strong class="v2-objection__q">{{ o.question }}</strong>
              <p class="v2-objection__a"><PagesTreatmentAdsV2Emph :parts="emph(o.answer, 0)" /></p>
              <!-- Zelgai, 05.10.2026: kein unterstrichener Zweit-Link, sondern
                   aufklappbar erklaert; der Shop-Link steht erst darin -->
              <details v-if="o.action === 'voucher'" class="v2-raten">
                <summary class="v2-raten__q" data-track-placement="v2_raten_info">
                  <IconInfoCircle size="18" aria-hidden="true" /> So funktioniert die Ratenzahlung
                </summary>
                <ol class="v2-raten__steps">
                  <li>Gutschein im Online-Shop kaufen</li>
                  <li>Im Shop mit Klarna oder PayPal in Raten bezahlen</li>
                  <li>Termin buchen und den Gutschein beim Termin einlösen</li>
                </ol>
                <a
                  class="v2-objection__link"
                  :href="voucherUrl"
                  target="_blank"
                  rel="noopener"
                  data-track-placement="v2_objection_voucher"
                  @click="trackVoucherClick"
                >{{ ADS_V2_VOUCHER_LABEL }}<IconArrowRight size="16" aria-hidden="true" /></a>
              </details>
            </div>
          </li>
        </ul>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Bundesweit (Meta-Seiten auf www): Standorte statt eines Standorts,
         die Wahl kommt beim Buchen -->
    <UiLayoutSectionBlock v-if="bundesweit">
      <div id="standort" class="v2-card" :class="tone('location')" data-track-placement="v2_locations">
        <h2 class="v2-h2">Deutschlandweit für dich da</h2>
        <p class="v2-lead">{{ standorteLead }}</p>
        <ul class="v2-cities" role="list">
          <li v-for="c in standorte" :key="c" class="v2-cities__item"><IconMapPin size="16" aria-hidden="true" /> {{ c }}</li>
        </ul>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Standort (Agentur-Feedback 01.10.2026: vor den Fragen) -->
    <UiLayoutSectionBlock v-else>
      <div id="standort" class="v2-card" :class="tone('location')" data-track-placement="v2_location">
        <h2 class="v2-h2">{{ H.location }}</h2>
        <div class="v2-location">
          <div v-if="location?.buildingImage" class="v2-location__image">
            <UiAtomMediaPicture :media="location.buildingImage" />
          </div>
          <div class="v2-location__body">
            <strong>{{ location?.name }}</strong>
            <span v-if="addressLine">{{ addressLine }}</span>
            <span v-if="location?.directions?.headline" class="v2-location__muted">{{ location.directions.headline }}</span>
            <span v-if="hours" class="v2-location__muted">{{ hours }}</span>
            <span class="v2-location__muted">Auch ohne Termin – komm einfach vorbei.</span>
          </div>
        </div>
        <!-- Weg vom Eingang des Centers zu uns (stumm, Poster, laedt erst sichtbar) -->
        <div v-if="wayClip" class="v2-way" data-track-placement="v2_way_video">
          <PagesTreatmentAdsV2ClipCarousel :clips="[wayClip]" placement="v2_way" silent />
        </div>
        <!-- Anfahrt mit Lageplan (Standort-Feld "directions" in Strapi):
             Lageplan, Wegbeschreibung, Zu Fuss / Nahverkehr / Auto. -->
        <div v-if="directions" class="v2-directions" data-track-placement="v2_directions">
          <div v-if="directions.plan" class="v2-directions__plan">
            <UiAtomMediaPicture :media="directions.plan" :default-format="ImageFormat.MEDIUM" />
          </div>
          <div class="v2-directions__body">
            <div v-if="directions.intro" class="v2-directions__intro">
              <UiLayoutRichText :blocks="directions.intro" />
            </div>
            <details v-for="item in directions.items" :key="item.key" class="v2-directions__item">
              <summary class="v2-directions__q">
                <component :is="item.icon" size="20" aria-hidden="true" />
                <span>{{ t(item.titleKey) }}</span>
              </summary>
              <div class="v2-directions__a">
                <UiLayoutRichText :blocks="item.content" />
              </div>
            </details>
          </div>
        </div>
        <div class="v2-actions v2-actions--row">
          <UiAtomBaseButton v-if="phoneHref" as="a" :href="phoneHref" variant="secondary" size="lg" class="v2-btn" @click="trackPhoneClick(phoneNumber ?? undefined)">
            <IconPhone size="18" aria-hidden="true" /> Anrufen
          </UiAtomBaseButton>
          <UiAtomBaseButton v-if="routeHref" as="a" :href="routeHref" target="_blank" rel="noopener noreferrer" variant="secondary" size="lg" class="v2-btn">
            <IconMapPin size="18" aria-hidden="true" /> Route planen
          </UiAtomBaseButton>
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Fragen + Nachsorge -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-split v2-split--rows" :class="tone('faq', 'v2-card--soft')" data-track-placement="v2_faq">
        <h2 class="v2-h2">{{ H.faq }}</h2>
        <div class="v2-faq">
          <details v-for="(faq, i) in faqs" :key="faq.question" class="v2-faq__item" :open="i === 0">
            <summary class="v2-faq__q">{{ faq.question }}</summary>
            <p class="v2-faq__a"><PagesTreatmentAdsV2Emph :parts="emph(faq.answer)" /></p>
          </details>
        </div>
        <template v-if="aftercare.length">
          <h2 class="v2-h2 v2-h2--sub">{{ H.aftercare }}</h2>
          <ul class="v2-aftercare" role="list">
            <li v-for="tip in aftercare" :key="tip">{{ tip }}</li>
          </ul>
        </template>
      </div>
    </UiLayoutSectionBlock>

    <!-- Schlussaufruf -->
    <UiLayoutSectionBlock>
      <div class="v2-card v2-final" :class="tone('final', 'v2-card--accent')" data-track-placement="v2_final">
        <h2 class="v2-h2">{{ H.final }}</h2>
        <p v-if="finalPrice" class="v2-final__price">
          {{ priceParts(finalPrice)[0] }}<span class="v2-nowrap">{{ priceParts(finalPrice)[1] }}</span>
        </p>
        <div class="v2-actions">
          <SharedButton v-if="bookingButton" :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" class="v2-btn" />
        </div>
      </div>
    </UiLayoutSectionBlock>

    <!-- Variante B ohne Sternchen-Preise: keine Fussnote -->
    <BlockAdsPriceFootnote v-if="!isB" :treatment="hero.treatment" :treatment-path-key="hero.treatmentPathKey" :force="bundesweit" />
  </div>
</template>

<script setup lang="ts">
import {
  IconArmchair,
  IconArrowRight,
  IconBus,
  IconCar,
  IconCalendarCheck,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconHourglass,
  IconInfoCircle,
  IconMapPin,
  IconMessageCircle,
  IconMoodSmile,
  IconPhone,
  IconRepeat,
  IconShieldCheck,
  IconSnowflake,
  IconSparkles,
  IconStarFilled,
  IconStethoscope,
  IconTag,
  IconWalk,
} from "@tabler/icons-vue";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { LocationDto, TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { ImageFormat, SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import { isBlockedAdsImageFile } from "#shared/adsMedia";
import {
  ADS_V2_CTA,
  ADS_V2_PAYMENT_NOTE,
  ADS_V2_PAYMENT_TITLE,
  ADS_V2_VOUCHER_LABEL,
  adsV2Faqs,
  adsV2PriceCards,
  adsV2ProductNote,
  adsV2Steps,
  adsV2TreatmentSlug,
  adsV2TrustItems,
  adsV2VoucherUrl,
  adsV2Design,
  employeeDisplayName,
  isAdsV2DesktopLayout,
  openingHoursSummary,
  pickAdsV2Reviews,
  shortenText,
} from "#shared/adsTemplateV2";
import {
  ADS_DOCTOR_FEATURE,
  ADS_TEAM_FEATURE,
  ADS_LOUNGE_NEUTRAL_HEADLINE,
  adsClipsFor,
  adsLoungeGalleryFor,
  adsObjectionClipFor,
  adsProcessImagesFor,
  adsWayClipFor,
} from "#shared/adsClips";
import {
  adsV2Aftercare,
  adsV2ConsultPhoto,
  adsV2Facts,
  adsV2FaqsV2,
  adsV2Headings,
  adsV2Terms,
  adsV2Timeline,
  adsV2ZoneHint,
  adsV2ZoneImage,
  adsV2ZoneTiles,
  adsV2PriceInclusion,
  adsV2AtLocation,
  adsV2Emphasize,
  adsV2HowParts,
  adsV2Objections,
} from "#shared/adsTemplateV2Content";
import { DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT, formatEuroCent, newCustomerPriceCent } from "#shared/newCustomerOffer";
import {
  adsOfferBPath,
  adsOfferRegularCards,
  adsOfferRegularPriceLine,
} from "#shared/adsOfferVariant";
import { getGoogleReviewAggregate, getGoogleReviewForPlace } from "~/utils/schemaLocation";
import type { AdsV2Terms } from "#shared/adsTemplateV2Content";

const props = defineProps<{
  hero: BlockTreatmentHeroDto;
  treatmentPage?: TreatmentPageDto | null;
  location?: LocationDto | null;
  /**
   * Bundesweite Fassung ohne Standort (Meta-Seiten auf www,
   * app/pages/aktion/[slug].vue, Benjamin 04.10.2026): Bewertungen aller
   * Standorte, Standortwahl erst beim Buchen, CI-Gestaltung und Desktop-Layout
   * immer an.
   */
  bundesweit?: boolean;
  /** Begriffe der Seite statt der Behandlung (z. B. "Botox" statt "Stirnfalte"). */
  termsOverride?: Partial<AdsV2Terms> | null;
  /** Woerter in allen Texten ersetzen (www darf "Botox" sagen, go. nicht). */
  wording?: ReadonlyArray<readonly [string, string]> | null;
  /** Staedte fuer "Deutschlandweit für dich da" (nur bundesweit). */
  standorte?: readonly string[];
}>();

// Bewertungen und Aerzt:innen des Standorts: eigener Endpunkt, nur hier
// abgerufen (server/api/ads-template-v2).
const route = useRoute();
const citySlug = String(route.params.citySlug ?? "");
const locSlug = String(route.params.locationSlug ?? "");
const { data: extras } = await useFetch<{ reviews?: any[]; doctors?: any[] }>(
  props.bundesweit
    ? "/api/ads-template-v2/bundesweit"
    : `/api/ads-template-v2/${encodeURIComponent(citySlug)}/${encodeURIComponent(locSlug)}`,
  {
    key: props.bundesweit ? "ads-template-v2:bundesweit" : `ads-template-v2:${citySlug}:${locSlug}`,
    default: () => ({}),
  },
);

/** Woerter ersetzen (props.wording) in Texten, Listen und einfachen Objekten. */
function withWording(x: any, w: ReadonlyArray<readonly [string, string]>): any {
  if (typeof x === "string") return w.reduce((acc, [a, b]) => acc.split(a).join(b), x);
  if (Array.isArray(x)) return x.map((v) => withWording(v, w));
  if (x && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype) {
    const o: Record<string, any> = {};
    for (const k of Object.keys(x)) o[k] = withWording(x[k], w);
    return o;
  }
  return x;
}
function W<T>(x: T): T {
  return props.wording?.length ? withWording(x, props.wording) : x;
}

// Gestaltung je Seite (shared/adsTemplateV2.ts, ADS_TEMPLATE_V2_DESIGN):
// "v2" = heutige Gestaltung; "ci"/"ci-hell" = an die bisherigen Strapi-Seiten
// angelehnt (Feedback Benjamin, 02.10.2026). Aendert nur Klassen, keine
// Inhalte, Reihenfolge, Knoepfe oder Tracking.
const design = computed(() =>
  props.bundesweit
    ? "ci-preis"
    : adsV2Design(citySlug, locSlug, props.hero.treatmentPathKey ?? props.treatmentPage?.pathKey),
);
type AdsV2Tone = "light" | "soft" | "neutral" | "strong";
type AdsV2Section =
  | "clips" | "facts" | "how" | "mid" | "steps" | "prices" | "zones" | "doctors"
  | "lounge" | "consult" | "reviews" | "objections" | "location" | "faq" | "final";
/**
 * Flaechen wie auf www (UiLayoutCardSurface: theme-light/-soft/-neutral/
 * -strong). Option 1 "ci": weisse und schwarze Abschnitte im Wechsel;
 * Option 2 "ci-hell": nur die beiden Aufrufe schwarz.
 */
const TONES: Record<"ci" | "ci-hell", Record<AdsV2Section, AdsV2Tone>> = {
  ci: {
    clips: "light", facts: "strong", how: "light", mid: "strong", steps: "soft",
    prices: "light", zones: "light", doctors: "neutral", lounge: "light", consult: "light",
    reviews: "light", objections: "light", location: "strong", faq: "soft", final: "strong",
  },
  "ci-hell": {
    clips: "light", facts: "light", how: "light", mid: "strong", steps: "soft",
    prices: "light", zones: "light", doctors: "soft", lounge: "light", consult: "light",
    reviews: "light", objections: "light", location: "light", faq: "soft", final: "strong",
  },
};
/** Klassen der Abschnittskarte; in "v2" die bisherigen Modifier.
 *  "ci-rot" (Option R2) nutzt die Flaechen von "ci", nur mit den roten
 *  Akzenten von heute. */
function tone(section: AdsV2Section, v2Class = ""): string {
  const d = design.value;
  if (d === "v2") return v2Class;
  const t = TONES[d === "ci-rot" || d === "ci-preis" ? "ci" : d][section];
  return `theme-${t} v2-card--${t}`;
}

// Desktop-Layout ab 1024 px (shared/adsTemplateV2.ts,
// ADS_TEMPLATE_V2_DESKTOP_PAGES; Feedback Benjamin 02.10.2026). Nur Klassen;
// alle Regeln stehen in @media (min-width: 1024px), mobil bleibt gleich.
const desktopLayout = computed(() =>
  !!props.bundesweit || isAdsV2DesktopLayout(citySlug, locSlug, props.hero.treatmentPathKey ?? props.treatmentPage?.pathKey),
);

const { t } = useI18n();

/**
 * Lounge-Galerie: erster Galerie-Block der Seite in Strapi mit Bildern
 * (bei Parya's Profhilo Duesseldorf "MY Lounge Duesseldorf"). Bilder aus der
 * Sperrliste (shared/adsMedia.ts: Begriff in der URL, alter Schriftzug)
 * fallen weg - der Strapi-Proxy blendet sie ohnehin schon aus. Alt-Texte
 * eigene: die aus Strapi nennen teils das Praeparat.
 */
// Beide Bausteine (Lounge, Anfahrt) zunaechst nur, wo die CI-Gestaltung an
// ist (ADS_TEMPLATE_V2_DESIGN); die Daten kommen fuer jeden Standort aus Strapi.
const lounge = computed(() => {
  if (design.value === "v2") return null;
  const blocks: any[] = ((props.treatmentPage as any)?.blocks ?? []) as any[];
  // Bevorzugt der Galerie-Block der Seite in Strapi, sonst die Auswahl je
  // Standort im Code (shared/adsClips.ts): sicher eigene Fotos mit
  // "MY Lounge <Stadt>", sonst neutrale Ueberschrift und Alt-Texte ohne Ort.
  const city = props.location?.city?.name ?? "";
  const block = blocks.find((b) => b?.__component === "blocks.gallery" && (b.images?.length ?? 0) > 0);
  let headline: string;
  let rawImages: any[];
  let own: boolean;
  if (block) {
    const raw = String(block.headline ?? "").trim();
    headline = /lounge/i.test(raw) ? raw : city ? `MY Lounge ${city}` : ADS_LOUNGE_NEUTRAL_HEADLINE;
    rawImages = block.images as any[];
    own = true;
  } else {
    const sel = adsLoungeGalleryFor(locSlug);
    own = sel.own && !!city;
    headline = own ? `MY Lounge ${city}` : ADS_LOUNGE_NEUTRAL_HEADLINE;
    rawImages = [...sel.images];
  }
  const images = rawImages
    .filter((m) => m && String(m.mime ?? "").startsWith("image/") && !isBlockedAdsImageFile(m))
    .map((m, i) => ({
      ...m,
      alternativeText: own ? `${headline} – Bild ${i + 1}` : `Einblick in eine MY Lounge – Bild ${i + 1}`,
      caption: null,
    }));
  return images.length ? { headline, images } : null;
});

/** Anfahrt aus dem Standort-Feld "directions"; leer = kein Baustein. */
const directions = computed(() => {
  const d: any = (props.location as any)?.directions;
  if (!d || design.value === "v2") return null;
  const plan =
    d.image && String(d.image.mime ?? "image/").startsWith("image/") && !isBlockedAdsImageFile(d.image)
      ? { ...d.image, alternativeText: `Lageplan ${props.location?.name ?? ""}`.trim() }
      : null;
  const intro = (d.content?.length ?? 0) > 0 ? d.content : null;
  const items = [
    { key: "walk", icon: IconWalk, titleKey: "blocks.directions.walk", content: d.walkDirections },
    { key: "bus", icon: IconBus, titleKey: "blocks.directions.publicTransport", content: d.publicTransportDirections },
    { key: "car", icon: IconCar, titleKey: "blocks.directions.car", content: d.carDirections },
  ].filter((item) => (item.content?.length ?? 0) > 0);
  if (!plan && !intro && !items.length) return null;
  return { plan, intro, items };
});

const globals = useGlobals();
const { trackPhoneClick, trackEvent } = useGoogleAnalytics();

const pathKey = computed(() => props.hero.treatmentPathKey ?? props.treatmentPage?.pathKey ?? "");
const locationName = computed(() => props.location?.name ?? "");

// Gutschein fuer Ratenzahlung: eigenes Ereignis, bewusst (noch) nicht in der
// GTM-Ereignisliste; nur Behandlung, Standort, Vorlage, keine Personendaten.
const voucherUrl = computed(() =>
  props.bundesweit
    ? adsV2VoucherUrl(pathKey.value, "bundesweit").replace("utm_source=go", "utm_source=www")
    : adsV2VoucherUrl(pathKey.value, citySlug),
);
function trackVoucherClick() {
  trackEvent("click_voucher", {
    treatment: adsV2TreatmentSlug(pathKey.value),
    location: locSlug || citySlug,
    template: "v2",
  });
}
const discountPct = computed(
  () => globals.value?.ecommerce?.newsletterDiscountPercentage || DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
);

// Alle Buchungsknoepfe: dieselbe Aktion und dieselben Daten wie der Hero
// -> derselbe Dialog, dasselbe click_booking (A/B-Weiche unveraendert).
const bookingData = computed(() => ({
  calendlyUrl: props.hero.calendlyUrl,
  appBookingUrl: props.hero.appBookingUrl,
  locationSlug: props.hero.locationSlug,
  appTreatmentSlug: props.hero.appTreatmentSlug,
  treatmentType: props.hero.treatment?.type,
}));
// Angebots-Test (Benjamin, 02.10.2026):
// - A: Hauptknopf ueberall "20 % Rabatt sichern" -> erst der Rabatt-Dialog
//   (Mailchimp, newsletter_signup), danach direkt dieselbe Buchung
//   (click_booking mit via_modal). Kein zweiter Knopf daneben.
// - B: "Kostenlose Beratung buchen" -> direkt die Buchung (wie bisher).
// Der Calendly-/App-Split (#100) entscheidet in beiden Faellen beim Oeffnen.
const discountLabel = computed(() => `${discountPct.value}\u00a0% Rabatt sichern`);
const primaryButton = computed(() =>
  isB.value
    ? {
        label: ADS_V2_CTA.primary,
        method: SharedButtonMethod.ACTION,
        action: SharedButtonAction.APPOINTMENT_BOOKING,
      }
    : {
        label: discountLabel.value,
        method: SharedButtonMethod.ACTION,
        action: SharedButtonAction.NEWSLETTER_SIGN_UP,
      },
);
const heroCta = computed(() =>
  props.hero.cta ? { ...props.hero.cta, ...primaryButton.value } : props.hero.cta,
);
const bookingButton = computed(() => (props.hero.cta ? primaryButton.value : null));
/** Leiste, eine Zeile bis 320 px neben "Anrufen". */
const stickyLabel = computed(() =>
  isB.value ? ADS_V2_CTA.sticky : `${discountPct.value}\u00a0% sichern`,
);
// Den frueheren zweiten Knopf "20 % Rabatt sichern" neben "Kostenlose
// Beratung buchen" gibt es nicht mehr: in A ist er der Hauptknopf.

const offer = useNewCustomerOffer(
  () => props.hero.treatment,
  () => props.hero.treatmentPathKey,
  () => !!props.bundesweit,
);

// Angebots-Test (shared/adsOfferVariant.ts): Variante B unter
// /ab-beratung/... - keine Rabattbotschaft, regulaere Preise (Strapi
// priceInEuroCent wie www), Vertrauenszeile im Hero. A = heutiger Stand.
const offerVariant = useAdsOfferVariant();
const isB = computed(() => offerVariant.value === "b");
/** Neukundenangebot, wie es die Seite zeigt (B: keins). */
const offerShown = computed(() => (isB.value ? null : offer.value));
const regularLine = computed(() =>
  adsOfferRegularPriceLine(props.hero.treatment as any, formatEuroCent),
);
const heroNote = computed(() =>
  isB.value
    ? ["Nur Ärztinnen und Ärzte", "Zufriedenheitsgarantie", "auch ohne Termin"]
        .map((v) => v.replace(/ /g, "\u00a0"))
        .join(" · ")
    : null,
);

/** "ab 119,99 €*" / "ab 79,99 € pro Zone*" (ohne "Neukunden"); B: "ab 149,99 €". */
const shortPrice = computed(() =>
  isB.value
    ? regularLine.value
    : offer.value
      ? offer.value.heroLine.replace(/^Neukunden\s+/, "")
      : null,
);
// Hero (Agentur-Feedback 01.10.2026): EINE Zeile "Ab 119,99 €* – mit 20 %
// Neukundenrabatt" statt Preis + zweitem Rabatt-Link.
const heroPriceLine = computed(() => {
  const p = shortPrice.value;
  if (!p) return null;
  return {
    main: `${p[0]!.toUpperCase()}${p.slice(1)}`.replace(/\s/g, "\u00a0"),
    extra: isB.value ? null : `– mit ${discountPct.value}\u00a0% Neukundenrabatt`,
  };
});
const stickyPrice = computed(() => shortPrice.value);
const finalPrice = computed(() => (isB.value ? regularLine.value : offer.value?.heroLine ?? null));

// Stadt der Seite: Clips mit fremdem Stadtnamen im Bild fallen weg.
// Betrag und Euro-Zeichen nicht trennen ("149,99" / "€" auf zwei Zeilen in
// den schmalen Preiskarten).
/**
 * "Neukunden ab 239,99 €*" -> ["Neukunden ", "ab 239,99 €*"]: der Betrag samt
 * "ab" und "€*" bricht nicht um (iPhone SE, 320 px).
 */
function priceParts(text: string | null | undefined): [string, string] {
  const t = String(text ?? "");
  const m = /(?:ab\s)?\d[\d.]*(?:,\d{2})?\s?€\*?(?:\s+pro\s+Zone\*?)?/.exec(t);
  if (!m) return [t, ""];
  return [t.slice(0, m.index), t.slice(m.index).replace(/\s/g, "\u00a0")];
}

function keepAmount(text: string | null | undefined): string {
  return String(text ?? "").replace(/(\d) (€)/g, "$1\u00a0$2");
}

// Kundinnen-Video im "Noch unsicher?"-Bento (nur CI-Gestaltung); es laeuft
// dann nicht zusaetzlich in der Clip-Reihe bzw. bei den Bewertungen.
const objectionClip = computed(() =>
  design.value === "v2" ? null : adsObjectionClipFor(pathKey.value, citySlug),
);
const clips = computed(() => {
  const c = adsClipsFor(pathKey.value, citySlug);
  const oc = objectionClip.value;
  if (!oc) return c;
  return {
    ...c,
    carousel: c.carousel.filter((x) => x.url !== oc.url),
    feedback: c.feedback.filter((x) => x.url !== oc.url),
  };
});
/**
 * Ablauf in drei Schritten mit Bild (CI-Gestaltung, Benjamin 03.10.2026):
 * Vor = Beratung, Waehrend = Dauer/Betaeubung aus dem Steckbrief,
 * Nachsorge = die weiteren Punkte der Zeitachse. Texte nur aus vorhandenen
 * Inhalten, Bilder aus shared/adsClips.ts.
 */
const processSteps = computed(() => {
  if (design.value === "v2" || !timeline.value.length) return null;
  const imgs = adsProcessImagesFor(pathKey.value);
  const pic = (i: number) => ({ ...imgs[i]!, alternativeText: imgs[i]!.alt });
  const fact = (k: string) => facts.value.find((f) => f.key === k)?.value;
  const dauer = fact("dauer");
  const betaeubung = fact("betaeubung");
  const during = [
    dauer ? `Die Behandlung dauert ${dauer}.` : "",
    betaeubung ? `Betäubung: ${betaeubung}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const none: Array<{ when: string; title: string }> = [];
  return [
    {
      key: "vor",
      image: pic(0),
      title: "Vor der Behandlung",
      text: "Kostenloses Beratungsgespräch mit deiner Ärztin oder deinem Arzt: Ihr besprecht Wunsch, Ausgangslage und Ablauf – danach entscheidest du in Ruhe.",
      list: none,
    },
    { key: "waehrend", image: pic(1), title: "Während der Behandlung", text: during || timeline.value[0]!.text, list: none },
    {
      key: "nach",
      image: pic(2),
      title: "Nachsorge und Ergebnis",
      text: "",
      list: timeline.value.slice(1).map((t) => ({ when: t.when, title: t.title })),
    },
  ];
});
/** Aerzte-Block mit grossem Foto + Text (CI-Gestaltung, Benjamin 03.10.2026). */
const doctorFeature = computed(() => {
  if (design.value === "v2") return null;
  // Bundesweit: Beratungsfoto (shared/adsClips.ts) statt einer Aerztin
  const f = props.bundesweit ? ADS_TEAM_FEATURE : ADS_DOCTOR_FEATURE[locSlug];
  return {
    image: f ? { ...f.image, alternativeText: f.name } : null,
    name: f?.name ?? "",
    text: [
      "Bei uns behandeln ausschließlich approbierte Ärztinnen und Ärzte.",
      "Vor jeder Behandlung steht ein kostenloses Beratungsgespräch: Deine Ärztin oder dein Arzt schaut sich deine Ausgangslage an und erstellt mit dir einen individuellen Behandlungsplan.",
    ],
  };
});
const wayClip = computed(() => adsWayClipFor(locSlug));
const trustItems = computed(() => W(adsV2TrustItems(pathKey.value)));
const priceInclusion = computed(() => adsV2PriceInclusion(pathKey.value));
function trustIcon(key: string) {
  if (key === "garantie") return IconShieldCheck;
  if (key === "walkin") return IconWalk;
  return IconStethoscope;
}

// Bundesweit: gewichteter Schnitt aller Standorte mit Google-Daten
const ratingAggregate = props.bundesweit ? getGoogleReviewAggregate() : null;
const rating = computed(() => {
  if (!props.bundesweit) return getGoogleReviewForPlace(props.location?.googlePlaceId);
  const agg = ratingAggregate;
  return agg ? { rating: agg.rating, userRatingsTotal: agg.userRatingsTotal, placeUrl: "" } : null;
});
const ratingLabel = computed(() =>
  rating.value
    ? rating.value.rating.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "",
);
const ratingCountLabel = computed(() =>
  rating.value ? `${rating.value.userRatingsTotal.toLocaleString("de-DE")} Bewertungen` : "",
);

const details = computed(() => (props.treatmentPage as any)?.treatmentDetails ?? null);
const steps = computed(() => W(adsV2Steps(pathKey.value, details.value?.duration)));
const faqs = computed(() => {
  const v2 = adsV2FaqsV2(pathKey.value);
  if (v2.length) return W(v2);
  return W(adsV2Faqs(pathKey.value, {
    effectDuration: details.value?.effectDuration,
    initialResults: details.value?.initialResults,
  }));
});

// Glowtox-Punkte 1-8 (shared/adsTemplateV2Content.ts); ohne Eintrag fuer die
// Behandlung bleiben die bisherigen Texte.
const terms = computed(() => {
  const base = adsV2Terms(pathKey.value);
  if (!base) return null;
  return W(props.termsOverride ? { ...base, ...props.termsOverride } : base);
});
const H = computed(() => {
  if (terms.value) return adsV2Headings(terms.value, locationName.value);
  const at = locationName.value ? ` in ${locationName.value}` : "";
  return {
    facts: "", how: "", clips: "So sieht die Behandlung aus", steps: "So läuft dein Termin ab",
    prices: `Preise${at}`, zones: "", doctors: `Dein Ärzteteam${at}`, consult: "",
    reviews: "Das sagen Kundinnen und Kunden", faq: "Häufige Fragen", aftercare: "",
    location: "So findest du uns", final: "Bereit für deine kostenlose Beratung?",
  };
});
// Steckbrief + Preis (Agentur-Feedback 01.10.2026: Kernwerte wie Dauer,
// Wirkung, Preis auf einen Blick). Preis = dieselbe Zeile wie im Hero.
const facts = computed(() => {
  const rows = W(adsV2Facts(pathKey.value, details.value?.duration));
  if (rows.length && shortPrice.value) {
    rows.splice(1, 0, { key: "preis", label: "Preis", value: shortPrice.value });
  }
  return rows;
});
const FACT_ICONS: Record<string, any> = {
  dauer: IconClock,
  preis: IconTag,
  wirkung: IconSparkles,
  ergebnis: IconCircleCheck,
  haltbarkeit: IconHourglass,
  sitzungen: IconRepeat,
  betaeubung: IconSnowflake,
  ausfall: IconWalk,
  vorab: IconStethoscope,
  ablauf: IconArmchair,
};
function factIcon(key: string) {
  return FACT_ICONS[key] ?? IconCircleCheck;
}
const howParts = computed(() =>
  W(
    props.termsOverride?.howItWorks
      ? adsV2Emphasize(props.termsOverride.howItWorks, { minChars: 0 })
      : adsV2HowParts(pathKey.value),
  ),
);
/** Fliesstext mit fetten Schluesselwoertern (ab ca. drei Zeilen). */
function emph(text: string, minChars?: number) {
  return adsV2Emphasize(text, minChars === undefined ? {} : { minChars });
}
const objections = computed(() =>
  W(adsV2Objections(pathKey.value, {
    price: shortPrice.value,
    discountPct: offerShown.value ? discountPct.value : null,
    strapiDuration: details.value?.duration,
  })),
);
const OBJECTION_ICONS: Record<string, any> = {
  result: IconMoodSmile,
  pain: IconSnowflake,
  price: IconCreditCard,
  time: IconCalendarCheck,
  info: IconMessageCircle,
};
function objectionIcon(key: string) {
  return OBJECTION_ICONS[key] ?? IconCircleCheck;
}
const timeline = computed(() => W(adsV2Timeline(pathKey.value)));
const aftercare = computed(() => W(adsV2Aftercare(pathKey.value)));
const zoneImage = computed(() => adsV2ZoneImage(terms.value?.zone));
// Variante B bleibt beim Wechsel auf eine andere Zone in B.
// Bundesweit keine Kacheln: sie verlinken Standortseiten.
const zoneTiles = computed(() =>
  props.bundesweit
    ? []
    : adsV2ZoneTiles(pathKey.value, citySlug, locSlug).map((t) => ({
        ...(isB.value ? { ...t, href: adsOfferBPath(t.href) } : t),
        price: zonePrice(t.href),
      })),
);
/**
 * Preis je Kachel "weitere Behandlungen" (CI-Gestaltung, nach Parya's
 * "Passende Behandlungen"): aus den in Strapi verknuepften Behandlungen
 * der Seite (relatedTreatments), A mit Neukundenpreis*, B regulaer. Ohne
 * Treffer kein Preis.
 */
function zonePrice(href: string): string | null {
  if (design.value === "v2") return null;
  const key = href.replace(/^.*\/standorte\/[^/]+\/[^/]+\//, "");
  const pages: any[] = (props.treatmentPage as any)?.relatedTreatments?.treatmentAdsPages ?? [];
  const tr = pages.find((p) => p?.pathKey === key || p?.pathKey === `${key}-rabatt`)?.treatment;
  const cent = Number(tr?.priceInEuroCent ?? 0);
  if (!cent) return null;
  const ab = tr?.isStartingPrice === false ? "" : "ab ";
  if (isB.value) return `${ab}${formatEuroCent(cent)}`;
  const nc = newCustomerPriceCent(cent, discountPct.value);
  return nc ? `${ab}${formatEuroCent(nc)}*` : `${ab}${formatEuroCent(cent)}`;
}
// Ohne ein einziges Zonenbild (Skinbooster, Infusionen): schlichte Textkacheln.
const zoneTilesHaveImages = computed(() => zoneTiles.value.some((t) => !!t.image));
const doctorsLead = "Bei uns behandeln nur Ärztinnen und Ärzte – von der Beratung bis zur Nachkontrolle.";
// "in den Köln Arcaden", "im Minto" (ohne Umbruch im Namen)
const atLocation = computed(() =>
  props.bundesweit
    ? `an ${ratingAggregate?.locations ?? standorte.value.length} Standorten`
    : adsV2AtLocation(locationName.value),
);
const standorte = computed(() => props.standorte ?? []);
const standorteLead = computed(
  () => `${standorte.value.length} MY Lounges in ganz Deutschland – beim Buchen wählst du deinen Standort.`,
);
const zoneHint = computed(() => adsV2ZoneHint(priceCards.value));
const consultPhoto = computed(() => adsV2ConsultPhoto(pathKey.value));
const priceCards = computed(() => {
  const cards = adsV2PriceCards(pathKey.value, props.hero.treatment as any, discountPct.value);
  return isB.value ? adsOfferRegularCards(cards) : cards;
});
const productNote = computed(() => adsV2ProductNote(pathKey.value));

/**
 * Zwei feste Zeilen (Benjamin, 01.10.2026: "Arzt Wisam" einzeilig neben
 * "Arzt / Mamdoh" zweizeilig): oben die Anrede ("Arzt", "Ärztin", "Dr."),
 * darunter der Name. Die Anrede steht in Strapi teils im Vornamen.
 */
function doctorLines(display: string): { title: string; fullName: string } {
  const m = /^((?:Dr\.\s*(?:med\.\s*)?(?:dent\.\s*)?)|Ärztin|Arzt|Prof\.\s*(?:Dr\.\s*)?)\s*(.+)$/.exec(display.trim());
  return m ? { title: m[1]!.trim(), fullName: m[2]!.trim() } : { title: "", fullName: display.trim() };
}

const doctors = computed(() =>
  (extras.value?.doctors ?? [])
    .map((d: any) => ({
      id: d.id,
      name: employeeDisplayName(d),
      ...doctorLines(employeeDisplayName(d)),
      photo: d.photo,
    }))
    .filter((d) => d.name && d.photo),
);
const reviews = computed(() =>
  pickAdsV2Reviews(extras.value?.reviews ?? [], props.location?.city?.name, pathKey.value).map(
    (r: any) => ({ ...r, text: shortenText(r.text, 220) }),
  ),
);

const addressLine = computed(() => {
  const a: any = props.location?.address;
  if (!a) return "";
  return [[a.street, a.houseNumber].filter(Boolean).join(" "), [a.postalCode, a.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
});
const hours = computed(() => openingHoursSummary((props.location as any)?.openingHours?.week));
const phoneNumber = computed(() => (props.location as any)?.contact?.phoneNumber ?? null);
const phoneHref = computed(() => {
  const digits = String(phoneNumber.value ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
});
const routeHref = computed(() => {
  const c: any = (props.location as any)?.coordinates;
  if (c?.lat && c?.long) {
    return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.long}`;
  }
  return addressLine.value
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLine.value)}`
    : null;
});
</script>

<style scoped>
.v2-card {
  padding: var(--space-card-pad);
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-light, #fff);
}

.v2-card--soft {
  background: var(--color-card-bg-soft);
}

.v2-card--accent {
  background: #fbeeee;
}

/* Alle Abschnittsueberschriften fett und zentriert, einheitlich (Agentur-
   Feedback 01.10.2026). */
.v2-h2 {
  margin: 0 0 var(--space-400);
  font-size: 1.375rem;
  line-height: 1.2;
  font-weight: var(--font-bold);
  text-align: center;
  text-wrap: balance;
  /* keine Silbentrennung in Ueberschriften ("Vit-amin") */
  hyphens: manual;
}

.v2-lead {
  margin: 0 0 var(--space-400);
  color: var(--color-text-light);
  text-align: center;
}

.v2-center {
  text-align: center;
}

.v2-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin-top: var(--space-500);
}

.v2-actions--row {
  flex-direction: row;
  flex-wrap: wrap;
}

/* "Anrufen" + "Route planen" nebeneinander; auf 320 px untereinander statt
   ueber den Kartenrand hinaus. */
.v2-actions--row .v2-btn {
  flex: 1 1 8.5rem;
  min-width: 0;
}

.v2-btn {
  width: 100%;
}

.v2-h2--sub {
  margin-top: var(--space-600, 32px);
  font-size: 1.125rem;
}

/* 1. Steckbrief (Agentur-Feedback 01.10.2026): mobil Liste mit kleinem
   Icon, Bezeichnung klein und grau, Kernwert fett darunter; ab 900 px
   Kacheln in drei Spalten. */
.v2-facts {
  display: grid;
  margin: 0;
}

.v2-facts__row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: var(--space-300);
  padding: var(--space-300) 0;
  border-top: 1px solid var(--color-border-mute);
}

.v2-facts__row:first-child {
  border-top: 0;
  padding-top: 0;
}

.v2-facts__icon {
  grid-row: 1 / span 2;
  margin-top: 2px;
  color: #b91c1c;
}

.v2-facts dt {
  font-size: var(--font-xs);
  line-height: 1.3;
  color: var(--color-text-light);
}

.v2-facts dd {
  margin: 0;
  min-width: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
  color: var(--color-text);
  hyphens: auto;
}

.v2-facts__row--price dd {
  color: #b91c1c;
}

@media (min-width: 900px) {
  .v2-facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-300);
  }

  .v2-facts__row,
  .v2-facts__row:first-child {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    row-gap: var(--space-100);
    align-content: start;
    padding: var(--space-400);
    border: 0;
    border-radius: var(--border-radius-200, 12px);
    background: var(--color-card-bg-soft);
  }

  .v2-facts__icon {
    grid-row: auto;
    margin: 0 0 var(--space-100);
  }

  .v2-facts dd {
    font-size: var(--font-md, 1rem);
    line-height: 1.35;
  }
}

/* 7-8 Kernwerte: vier Spalten statt einer einzelnen Kachel in der letzten Reihe */
@media (min-width: 1100px) {
  .v2-facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* 2. Wirkweise */
.v2-how {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: var(--space-400);
  align-items: center;
}

.v2-how__img {
  width: 112px;
  height: auto;
}

/* ohne Zonenbild: Text ueber die ganze Breite */
.v2-how.v2-how--text {
  grid-template-columns: minmax(0, 1fr);
}

/* Kacheln ohne Bilder: nur Text, niedriger */
.v2-zones--text .v2-zone {
  justify-content: center;
  min-height: 64px;
}

.v2-how__text {
  margin: 0;
  min-width: 0;
  color: var(--color-text-light);
  hyphens: auto;
}

/* 320-374 px: Zonenbild kleiner */
@media (max-width: 374px) {
  .v2-how {
    grid-template-columns: 72px minmax(0, 1fr);
    align-items: start;
    gap: var(--space-300);
    font-size: var(--font-sm);
    line-height: var(--line-sm);
  }

  .v2-how__img {
    width: 72px;
  }
}

/* 5. Zeitachse */
.v2-timeline {
  position: relative;
  display: grid;
  gap: var(--space-400);
  margin: 0;
  padding: 0 0 0 var(--space-500);
  list-style: none;
  border-left: 2px solid #f1c9c9;
}

.v2-timeline__item {
  position: relative;
}

.v2-timeline__item::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--space-500) - 6px);
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #b91c1c;
}

.v2-timeline__when {
  display: block;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #b91c1c;
}

/* Standortnamen mit geschuetztem Bindestrich ("Gesundbrunnen-Center") sind
   ein Wort: nicht ueber den Kartenrand hinaus. */
.v2-h2 {
  overflow-wrap: break-word;
}

/* 7. Weitere Zonen: mobil Wischreihe mit Einrasten (Agentur-Feedback
   01.10.2026), Kacheln ca. 44 % breit, die naechste schaut an. */
.v2-zones {
  display: flex;
  gap: var(--space-300);
  margin: 0 calc(-1 * var(--space-card-pad));
  padding: 0 var(--space-card-pad) var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--space-card-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.v2-zones__item {
  flex: 0 0 min(44%, 200px);
  min-width: 132px;
  scroll-snap-align: start;
}

.v2-zones--text .v2-zones__item {
  flex-basis: min(48%, 220px);
}

@media (min-width: 900px) {
  .v2-zones {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-width: 720px;
    margin: 0 auto;
    padding: 0;
    overflow: visible;
  }

  .v2-zones__item {
    min-width: 0;
  }
}

.v2-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-200);
  height: 100%;
  padding: var(--space-300) var(--space-200);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  color: inherit;
  text-align: center;
  text-decoration: none;
}

.v2-zone__img {
  width: 64px;
  height: 86px;
}

/* Kachel mit Foto (Poster des Behandlungsclips): Bild fuellt die Breite */
.v2-zone--photo {
  padding: 0 0 var(--space-300);
  overflow: hidden;
}

.v2-zone__photo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center 40%;
  background: #fbf7f5;
}

.v2-zone--photo .v2-zone__label {
  padding: 0 var(--space-200);
}

.v2-zone__img--empty {
  display: block;
  border-radius: 12px;
  background: #fbf7f5;
}

.v2-zone__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
  hyphens: auto;
}

/* 8. Beratungsfoto */
.v2-consult__img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-200, 12px);
}

/* 6. Nachsorge */
.v2-aftercare {
  display: grid;
  gap: var(--space-200);
  margin: 0;
  padding: 0 0 0 1.1rem;
  list-style: disc;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Vertrauenszeile */
.v2-trust {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-300);
  margin: 0;
  padding: var(--space-500) var(--space-card-pad);
  list-style: none;
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-light, #fff);
}

.v2-trust__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-trust__icon {
  flex: 0 0 auto;
  color: #b91c1c;
}

.v2-trust__icon--star {
  color: #f5a623;
}

.v2-trust__text {
  display: block;
  color: var(--color-text-light);
}

/* Ablauf */
.v2-steps {
  display: grid;
  gap: var(--space-400);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-steps__item {
  display: flex;
  gap: var(--space-400);
}

.v2-steps__num {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--color-black);
  color: var(--color-white);
  font-weight: var(--font-bold);
}

.v2-steps__title {
  display: block;
}

.v2-steps__text {
  display: block;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Preise */
.v2-prices {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-100);
  padding: var(--space-400) var(--space-200);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  text-align: center;
}

.v2-price--package {
  border-color: #b91c1c;
}

.v2-price__label {
  font-weight: var(--font-bold);
}

.v2-price__offer {
  font-size: 1.0625rem;
  white-space: nowrap;
  line-height: 1.2;
  color: #b91c1c;
}

.v2-price__regular,
.v2-price__note {
  font-size: var(--font-xs);
  line-height: 1.3;
  color: var(--color-text-light);
}

/* Untereinander statt nebeneinander: unter 375 px immer, unter 640 px ab
   drei Preisen (der fette 26-px-Preis "239,99 €*" lief in einem Drittel der
   Breite ueber den Kartenrand und in die Nachbarkachel, Benjamin 04.10.2026).
   Name links, Preis rechts; reicht die Breite nicht, rutscht der Preis in die
   naechste Zeile statt den Namen zu ueberdecken. */
@media (max-width: 374px) {
  .v2 .v2-prices {
    grid-template-columns: minmax(0, 1fr);
  }

  .v2 .v2-prices .v2-price {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: baseline;
    column-gap: var(--space-300);
    row-gap: var(--space-100);
    padding: var(--space-400);
    text-align: left;
  }

  .v2 .v2-prices .v2-price__offer {
    margin-left: auto;
    text-align: right;
  }

  .v2 .v2-prices .v2-price__regular,
  .v2 .v2-prices .v2-price__note {
    flex-basis: 100%;
  }
}

@media (min-width: 375px) and (max-width: 639px) {
  .v2 .v2-prices--many {
    grid-template-columns: minmax(0, 1fr);
  }

  .v2 .v2-prices--many .v2-price {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: baseline;
    column-gap: var(--space-300);
    row-gap: var(--space-100);
    padding: var(--space-400) var(--space-500);
    text-align: left;
  }

  .v2 .v2-prices--many .v2-price__offer {
    margin-left: auto;
    text-align: right;
  }

  .v2 .v2-prices--many .v2-price__regular,
  .v2 .v2-prices--many .v2-price__note {
    flex-basis: 100%;
  }
}

.v2-notes {
  margin: var(--space-400) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

/* Aerzt:innen */
.v2-doctors {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-300);
  margin: 0 0 var(--space-400);
  padding: 0;
  list-style: none;
}

.v2-doctor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-200);
  text-align: center;
}

.v2-doctor__photo {
  position: relative;
  width: 100%;
  /* Tablet: drei Spalten waeren sonst ~200 px grosse Kreise */
  max-width: 150px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-gray-200);
}

.v2-doctor__photo :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
}

/* Zwei feste Zeilen (Titel / Name), damit alle Namen auf einer Hoehe stehen */
.v2-doctor__name {
  display: grid;
  grid-template-rows: auto auto;
  width: 100%;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-doctor__title {
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v2-doctor__full {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: calc(2em * var(--line-sm, 1.5));
  hyphens: auto;
}

/* Ratenzahlung ueber Gutschein */
.v2-pay {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin-top: var(--space-400);
  padding: var(--space-400);
  border-radius: var(--border-radius-200, 12px);
  background: #fbeeee;
}

.v2-pay__body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
}

.v2-pay__icon {
  flex: 0 0 auto;
  color: #b91c1c;
}

.v2-pay__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Sekundaerknopf, aber klar als Knopf: weisse Fuellung, dunkler Rahmen,
   Pfeil, mind. 48 px hoch; darf auf 320 px umbrechen statt ueberzulaufen. */
.v2-pay__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
  width: 100%;
  min-height: 48px;
  padding: 10px 20px;
  border: 2px solid var(--color-black, #111);
  border-radius: 999px;
  background: #fff;
  color: var(--color-black, #111);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1.25;
  text-align: center;
  text-wrap: balance;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s linear, color 0.15s linear;
}

.v2-pay__cta:hover {
  background: var(--color-black, #111);
  color: #fff;
}

.v2-pay__cta:focus-visible {
  outline: 2px solid var(--color-text, #111);
  outline-offset: 3px;
}

.v2-pay__cta:active {
  transform: scale(0.98);
}

.v2-pay__arrow {
  flex: 0 0 auto;
}

/* Kundenfeedback-Videos ueber den Textbewertungen: mittig, solange sie in
   die Breite passen; mehr wischt (auto-Raender statt justify-content, sonst
   waere der erste Clip abgeschnitten). */
.v2-feedback {
  margin-bottom: var(--space-500);
}

.v2-feedback :deep(.clips__item:first-child) {
  margin-left: auto;
}

.v2-feedback :deep(.clips__item:last-child) {
  margin-right: auto;
}

.v2-nowrap {
  white-space: nowrap;
}

/* Bewertungen */
.v2-star {
  color: #f5a623;
  vertical-align: -3px;
}

/* Bewertungen mobil als Wischreihe (Agentur-Feedback 01.10.2026) */
.v2-reviews {
  display: flex;
  gap: var(--space-300);
  margin: 0 calc(-1 * var(--space-card-pad));
  padding: 0 var(--space-card-pad) var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--space-card-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.v2-review {
  flex: 0 0 85%;
  scroll-snap-align: start;
  padding: var(--space-400);
  border: 1px solid var(--color-border-mute);
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-card-bg-light, #fff);
}

/* Einwaende */
.v2-objections {
  display: grid;
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-objection {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: var(--space-300);
  padding: var(--space-400);
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-card-bg-light, #fff);
}

.v2-objection__icon {
  margin-top: 1px;
  color: #b91c1c;
}

.v2-objection__body {
  min-width: 0;
}

.v2-objection__q {
  display: block;
  margin-bottom: var(--space-100);
}

.v2-objection__a {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.v2-raten {
  margin-top: var(--space-300);
}

.v2-raten__q {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: inherit;
  cursor: pointer;
  list-style: none;
}

.v2-raten__q::-webkit-details-marker {
  display: none;
}

.v2-raten__steps li {
  display: list-item;
}

.v2-raten__steps {
  margin: var(--space-200) 0 0;
  padding-left: 1.25rem;
  list-style: decimal;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-objection__link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  margin-top: var(--space-200);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: inherit;
}

@media (min-width: 900px) {
  .v2-objections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.v2-review__stars {
  display: inline-flex;
  color: #f5a623;
}

.v2-review__text {
  margin: var(--space-200) 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-review__author {
  font-size: var(--font-xs);
  color: var(--color-text-light);
}

.v2-link {
  display: inline-block;
  margin-top: var(--space-400);
  color: inherit;
  font-weight: var(--font-bold);
}

/* FAQ */
.v2-faq__item {
  border-top: 1px solid var(--color-border-mute);
}

.v2-faq__item:last-child {
  border-bottom: 1px solid var(--color-border-mute);
}

.v2-faq__q {
  padding: var(--space-400) 0;
  font-weight: var(--font-bold);
  cursor: pointer;
}

.v2-faq__a {
  margin: 0 0 var(--space-400);
  color: var(--color-text-light);
}

/* Standort */
.v2-location {
  display: grid;
  gap: var(--space-400);
}

.v2-location__image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-gray-200);
}

.v2-location__image :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.v2-location__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
}

.v2-way {
  display: flex;
  justify-content: center;
  margin-top: var(--space-400);
}

.v2-way :deep(.clips) {
  overflow: visible;
}

.v2-location__muted {
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

/* Schluss */
.v2-final {
  text-align: center;
}

.v2-final__title {
  margin-bottom: var(--space-300);
}

.v2-final__price {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  color: #b91c1c;
}


@media (min-width: 900px) {
  .v2-trust {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .v2-actions {
    flex-direction: row;
    justify-content: center;
  }

  .v2-btn {
    width: auto;
  }

  .v2-location {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .v2-reviews {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    overflow: visible;
  }
}
/* =====================================================================
   Gestaltung "ci" / "ci-hell" (Feedback Benjamin, 02.10.2026): an die
   bisherigen Strapi-Seiten angelehnt. Flaechen ueber die globalen
   theme-*-Klassen (weiss, hellgrau #e8e7e8, dunkelgrau #46454a, schwarz
   #0d0d0e), Inter 500 fuer Ueberschriften, Icons und Preise schwarz-weiss,
   kein Rosa. Rot (#dc2626) nur auf dem Buchungsknopf der mitlaufenden
   Leiste. Das Bento-Raster bleibt, nur in CI-Farben.
   ===================================================================== */
.v2--ci .v2-card {
  background: var(--card-color-bg);
  color: var(--color-text);
}

/* Ueberschriften groesser, naeher an den H2 auf www (mobil 24 px statt
   22 px - 27 px braeche die langen v2-Ueberschriften in vier Zeilen -,
   ab 900 px 33 px statt 22 px) */
.v2--ci .v2-h2 {
  margin-bottom: var(--space-500);
  font-size: 1.5rem;
  line-height: var(--line-3xl);
}

.v2--ci .v2-h2--sub {
  font-size: var(--font-lg);
}

@media (min-width: 900px) {
  .v2--ci .v2-h2 {
    font-size: var(--font-3xl);
  }

  .v2--ci .v2-h2--sub {
    font-size: var(--font-2xl);
  }
}

/* Knoepfe wie auf www: schwarz auf hellen Flaechen, auf schwarzen und
   dunkelgrauen Flaechen weiss mit schwarzer Schrift (kommt aus theme-*).
   Rot nur noch auf dem Knopf der mitlaufenden Leiste (Benjamin, 02.10.2026). */

/* Icons, Sterne, Preise: Textfarbe der Flaeche statt Rot/Orange */
.v2--ci .v2-trust__icon,
.v2--ci .v2-trust__icon--star,
.v2--ci .v2-facts__icon,
.v2--ci .v2-pay__icon,
.v2--ci .v2-objection__icon,
.v2--ci .v2-star,
.v2--ci .v2-review__stars,
.v2--ci .v2-facts__row--price dd,
.v2--ci .v2-price__offer,
.v2--ci .v2-final__price {
  color: var(--color-text);
}

.v2--ci .v2-final__price {
  font-size: 1.5rem;
}

@media (min-width: 900px) {
  .v2--ci .v2-final__price {
    font-size: 1.75rem;
  }
}

/* Zonenbilder: rote Einstichpunkte und rosa Grund grau */
.v2--ci .v2-how__img,
.v2--ci .v2-zone__img {
  filter: grayscale(1);
}

.v2--ci .v2-zone__photo,
.v2--ci .v2-zone__img--empty {
  background: var(--color-gray-100);
}

/* Steckbrief: auf Schwarz feine Linien; ab 900 px Bento-Kacheln in
   #292a2c (schwarze Flaeche) bzw. schwarz (helle Flaeche) mit weisser Schrift */
.v2--ci .v2-facts dt {
  font-size: var(--font-sm);
}

@media (min-width: 900px) {
  .v2--ci .v2-facts__row,
  .v2--ci .v2-facts__row:first-child {
    --color-text: var(--strong-color-text);
    --color-text-light: var(--strong-color-text-light);
    color: var(--color-text);
    background: var(--color-card-bg-strong);
  }

  .v2--ci .theme-strong .v2-facts__row {
    background: var(--color-gray-900);
  }
}

/* Zeitachse schwarz-grau */
.v2--ci .v2-timeline {
  border-left-color: var(--color-gray-400);
}

.v2--ci .v2-timeline__item::before {
  background: var(--color-text);
}

.v2--ci .v2-timeline__when {
  color: var(--color-text);
}

/* Preise: Kacheln hellgrau statt Rahmen, Betrag gross und schwarz */
.v2--ci .v2-price {
  border: 0;
  background: var(--card-color-bg-sub);
}

.v2--ci .v2-price--package {
  box-shadow: inset 0 0 0 2px var(--color-text);
}

.v2--ci .v2-price__offer {
  font-size: 1.25rem;
}

.v2--ci .v2-pay {
  background: var(--card-color-bg-sub);
}

/* Bewertungen: Kacheln hellgrau statt Rahmen */
.v2--ci .v2-review {
  border: 0;
  background: var(--card-color-bg-sub);
}

/* Einwaende: schwarze Bento-Kacheln mit weisser Schrift */
.v2--ci .v2-objection {
  --color-text: var(--strong-color-text);
  --color-text-light: var(--strong-color-text-light);
  color: var(--color-text);
  background: var(--color-card-bg-strong);
}

/* Aerzt:innen auf Dunkelgrau: Fotogrund passend */
.v2--ci .theme-neutral .v2-doctor__photo {
  background: var(--color-gray-700);
}

/* Fragen: Trennlinien wie auf www */
.v2--ci .theme-soft .v2-faq__item {
  border-color: var(--color-gray-300);
}

/* =====================================================================
   Desktop-Layout ab 1024 px (.v2--desk, Feedback Benjamin 02.10.2026):
   mobil ist v2 gut, auf dem Desktop wirkte die zentrierte Einspalte leer.
   Farben, Inhalte, Reihenfolge und Tracking bleiben; nur die Anordnung
   aendert sich. Unter 1024 px greift hier nichts.
   ===================================================================== */
@media (min-width: 1024px) {
  /* Ueberschriften links und groesser wie auf den bisherigen Seiten */
  .v2--desk .v2-h2 {
    margin-bottom: var(--space-600);
    font-size: var(--font-3xl);
    line-height: var(--line-3xl);
    text-align: left;
  }

  .v2--desk .v2-h2--sub {
    font-size: var(--font-xl);
  }

  .v2--desk .v2-lead,
  .v2--desk .v2-center {
    text-align: left;
  }

  .v2--desk .v2-actions {
    justify-content: flex-start;
  }

  /* Zweispaltig: links Ueberschrift, Einleitung, Knopf; rechts der Inhalt */
  .v2--desk .v2-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    grid-template-rows: auto auto auto 1fr;
    grid-auto-flow: row dense;
    column-gap: var(--space-1000);
    align-items: start;
  }

  .v2--desk .v2-split > .v2-h2,
  .v2--desk .v2-split > .v2-lead,
  .v2--desk .v2-split > .v2-actions {
    grid-column: 1;
  }

  .v2--desk .v2-split > :not(.v2-h2):not(.v2-lead):not(.v2-actions) {
    grid-column: 2;
    grid-row: 1 / -1;
  }

  /* Fragen + Nachsorge: je Zeile Ueberschrift links, Inhalt rechts */
  .v2--desk .v2-split--rows {
    grid-template-rows: none;
  }

  .v2--desk .v2-split--rows > :not(.v2-h2):not(.v2-lead):not(.v2-actions) {
    grid-row: auto;
  }

  .v2--desk .v2-split--rows > .v2-h2--sub {
    margin-top: var(--space-600);
  }

  .v2--desk .v2-split--rows > .v2-aftercare {
    margin-top: var(--space-600);
  }

  /* Fliesstext: begrenzte Zeilenlaenge */
  .v2--desk .v2-how__text,
  .v2--desk .v2-faq__a {
    max-width: 68ch;
  }

  .v2--desk .v2-how:not(.v2-how--text) {
    grid-template-columns: 160px minmax(0, 1fr);
    gap: var(--space-700);
  }

  .v2--desk .v2-how__img {
    width: 160px;
  }

  .v2--desk .v2-how__text {
    font-size: var(--font-lg);
    line-height: var(--line-lg);
  }

  .v2--desk .v2-zones {
    max-width: none;
    margin: 0;
  }

  .v2--desk .v2-doctors {
    margin: 0;
  }

  /* Clips: ganze Breite, vier nebeneinander, linksbuendig */
  .v2--desk [data-track-placement="v2_clips"] :deep(.clips) {
    justify-content: flex-start;
  }

  .v2--desk [data-track-placement="v2_clips"] :deep(.clips__item) {
    width: calc((100% - 3 * var(--space-400)) / 4);
  }

  /* Auf einen Blick: vier Spalten ueber die ganze Breite */
  .v2--desk .v2-facts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  /* Aufrufe als Leiste: Titel + Preis links, Knopf rechts */
  .v2--desk .v2-final {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--space-700);
    align-items: center;
    text-align: left;
  }

  .v2--desk .v2-final > .v2-h2 {
    margin: 0;
  }

  .v2--desk .v2-final > .v2-final__price {
    grid-column: 1;
  }

  .v2--desk .v2-final > .v2-actions {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin-top: 0;
  }

  /* Ablauf als waagerechte Zeitachse */
  .v2--desk .v2-timeline {
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: var(--space-600);
    padding: var(--space-600) 0 0;
    border-left: 0;
    border-top: 2px solid #f1c9c9;
  }

  .v2--desk .v2-timeline__item::before {
    left: 0;
    top: calc(-1 * var(--space-600) - 6px);
  }

  .v2--desk .v2-steps {
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: var(--space-600);
  }

  /* Preise links, Ratenbox rechts daneben */
  .v2--desk .v2-prices-card {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    grid-auto-flow: row dense;
    column-gap: var(--space-700);
    align-items: start;
  }

  .v2--desk .v2-prices-card > .v2-h2,
  .v2--desk .v2-prices-card > .v2-lead {
    grid-column: 1 / -1;
  }

  .v2--desk .v2-prices-card > .v2-prices,
  .v2--desk .v2-prices-card > .v2-notes,
  .v2--desk .v2-prices-card > .v2-actions {
    grid-column: 1;
  }

  .v2--desk .v2-prices-card > .v2-pay {
    grid-column: 2;
    grid-row: span 3;
    margin-top: 0;
    padding: var(--space-600);
  }

  .v2--desk .v2-price {
    padding: var(--space-500) var(--space-300);
  }

  .v2--desk .v2-price__offer {
    font-size: var(--font-xl);
  }

  /* Bewertungen: Kundenvideo links, Texte rechts */
  .v2--desk .v2-reviews-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--space-700);
    align-items: start;
  }

  .v2--desk .v2-reviews-card > * {
    grid-column: 1 / -1;
  }

  .v2--desk .v2-reviews-card > .v2-feedback {
    grid-column: 1;
    margin-bottom: 0;
  }

  .v2--desk .v2-reviews-card > .v2-feedback + .v2-reviews {
    grid-column: 2;
  }

  .v2--desk .v2-feedback :deep(.clips__item:first-child) {
    margin-left: 0;
  }

  /* Standort: Knoepfe nicht ueber die ganze Breite */
  .v2--desk .v2-actions--row .v2-btn {
    flex: 0 0 auto;
  }

  /* Standort: Foto + Adresse links, Weg-Video rechts daneben */
  .v2--desk [data-track-placement="v2_location"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-auto-flow: row dense;
    column-gap: var(--space-700);
    align-items: start;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-h2 {
    grid-column: 1 / -1;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-location,
  .v2--desk [data-track-placement="v2_location"] > .v2-actions {
    grid-column: 1;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-way {
    grid-column: 2;
    grid-row: span 2;
    margin-top: 0;
  }
}
/* =====================================================================
   Option R2 ("ci-rot"): Flaechen wie "ci", Rot-Akzente wie heute live
   (Neukundenpreis, Icons im Blick-Raster, Zeitachse, Preise). Auf
   schwarzen/dunkelgrauen Flaechen helleres Rot #f87171 (Kontrast), sonst
   #b91c1c. Knoepfe bleiben schwarz bzw. weiss auf Schwarz.
   ===================================================================== */
.v2--rot {
  --v2-accent: #b91c1c;
}

.v2--rot .theme-strong,
.v2--rot .theme-neutral,
.v2--rot .v2-objection {
  --v2-accent: #f87171;
}

.v2--ci.v2--rot .v2-trust__icon,
.v2--ci.v2--rot .v2-facts__icon,
.v2--ci.v2--rot .v2-pay__icon,
.v2--ci.v2--rot .v2-objection__icon,
.v2--ci.v2--rot .v2-facts__row--price dd,
.v2--ci.v2--rot .v2-price__offer,
.v2--ci.v2--rot .v2-final__price,
.v2--ci.v2--rot .v2-timeline__when {
  color: var(--v2-accent);
}

.v2--ci.v2--rot .v2-timeline__item::before {
  background: var(--v2-accent);
}

.v2--ci.v2--rot .v2-timeline {
  border-color: #f1c9c9;
}

.v2--ci.v2--rot .v2-trust__icon--star,
.v2--ci.v2--rot .v2-star,
.v2--ci.v2--rot .v2-review__stars {
  color: #f5a623;
}

.v2--ci.v2--rot .v2-how__img,
.v2--ci.v2--rot .v2-zone__img {
  filter: none;
}

.v2--ci.v2--rot .v2-price--package {
  box-shadow: inset 0 0 0 2px var(--v2-accent);
}

/* Lounge-Galerie: mobil Wischreihe (wie die Zonen), ab 1024 px Raster */
.v2-lounge {
  display: flex;
  gap: var(--space-300);
  margin: 0 calc(-1 * var(--space-card-pad));
  padding: 0 var(--space-card-pad) var(--space-200);
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--space-card-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.v2-lounge__item {
  flex: 0 0 82%;
  scroll-snap-align: start;
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  border-radius: var(--border-radius-200, 12px);
  background: var(--color-gray-200);
}

.v2-lounge__item :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 1024px) {
  .v2-lounge {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    margin: 0;
    padding: 0;
    overflow: visible;
  }
}

/* Anfahrt im Standortblock: Lageplan, Wegbeschreibung, Akkordeon */
.v2-directions {
  display: grid;
  gap: var(--space-400);
  margin-top: var(--space-500);
}

.v2-directions__plan {
  overflow: hidden;
  border-radius: var(--border-radius-200, 12px);
  background: #fff;
}

.v2-directions__plan :deep(img) {
  display: block;
  width: 100%;
  height: auto;
}

.v2-directions__intro {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  overflow-wrap: break-word;
}

.v2-directions__intro :deep(p),
.v2-directions__a :deep(p) {
  margin: 0 0 var(--space-200);
}

.v2-directions__intro :deep(ul),
.v2-directions__a :deep(ul) {
  margin: 0 0 var(--space-200);
  padding-left: 1.1rem;
}

.v2-directions__item {
  border-top: 1px solid var(--color-border-mute);
}

.v2-directions__item:last-child {
  border-bottom: 1px solid var(--color-border-mute);
}

.v2-directions__q {
  display: flex;
  align-items: center;
  gap: var(--space-300);
  padding: var(--space-400) 0;
  font-weight: var(--font-bold);
  cursor: pointer;
}

.v2-directions__a {
  padding-bottom: var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  overflow-wrap: break-word;
}

@media (min-width: 1024px) {
  .v2--desk [data-track-placement="v2_location"] > .v2-directions {
    grid-column: 1;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-700);
    align-items: start;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-way {
    grid-row: span 3;
  }
}
/* =====================================================================
   Runde 2 (Benjamin, 02.10.2026 abends), nur CI-Gestaltung (.v2--ci):
   "ci-preis" = R1 + roter Neukundenpreis; Preise, weitere Behandlungen und
   "Noch unsicher?" als Bento-Kacheln.
   ===================================================================== */
.v2--preis {
  --v2-accent: #b91c1c;
}

.v2--preis .theme-strong,
.v2--preis .theme-neutral {
  --v2-accent: #f87171;
}

.v2--ci.v2--preis .v2-facts__row--price dd,
.v2--ci.v2--preis .v2-price__offer,
.v2--ci.v2--preis .v2-final__price {
  color: var(--v2-accent);
}

/* Preise als Bento: Preis-Kacheln gross, Inklusivleistungen und Raten je
   eine eigene Kachel */
.v2--ci .v2-prices-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: var(--space-300);
}

.v2--ci .v2-prices-card > .v2-h2,
.v2--ci .v2-prices-card > .v2-lead {
  margin-bottom: var(--space-200);
}

.v2--ci .v2-prices {
  gap: var(--space-300);
}

.v2--ci .v2-price {
  justify-content: center;
  gap: var(--space-200);
  padding: var(--space-600) var(--space-400);
  border-radius: var(--border-radius-500);
}

.v2--ci .v2-price__label {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.v2--ci .v2-price__offer {
  font-size: 1.625rem;
}

.v2--ci .v2-notes {
  display: grid;
  gap: var(--space-200);
  margin: 0;
  padding: var(--space-500);
  border-radius: var(--border-radius-500);
  background: var(--color-card-bg-soft);
  color: var(--color-text);
}

.v2--ci .v2-notes li {
  position: relative;
  padding-left: 1.5rem;
}

.v2--ci .v2-notes li::before {
  content: "✓";
  position: absolute;
  left: 0;
  font-weight: var(--font-bold);
}

.v2--ci .v2-pay {
  --color-text: var(--strong-color-text);
  --color-text-light: var(--strong-color-text-light);
  margin: 0;
  padding: var(--space-500);
  border-radius: var(--border-radius-500);
  background: var(--color-card-bg-strong);
  color: var(--color-text);
}

.v2--ci .v2-pay__icon {
  color: currentColor;
}

.v2--ci .v2-pay__cta {
  border-color: #fff;
}

.v2--ci .v2-pay__cta:hover {
  background: var(--color-gray-200);
  color: #000;
}

.v2--ci .v2-prices-card > .v2-actions {
  margin-top: var(--space-300);
}

@media (min-width: 1024px) {
  .v2--ci.v2--desk .v2-prices-card {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    column-gap: var(--space-300);
  }

  .v2--ci.v2--desk .v2-prices-card > .v2-prices {
    grid-column: 1;
    grid-row: span 2;
    height: 100%;
  }

  .v2--ci.v2--desk .v2-prices-card > .v2-notes {
    grid-column: 2;
  }

  .v2--ci.v2--desk .v2-prices-card > .v2-pay {
    grid-column: 2;
    grid-row: auto;
  }

  .v2--ci.v2--desk .v2-price {
    padding: var(--space-800) var(--space-500);
  }

  .v2--ci.v2--desk .v2-price__offer {
    font-size: var(--font-4xl);
  }
}

/* Weitere Behandlungen: grosse dunkle Bildkacheln mit Name und Preis
   (wie "Passende Behandlungen" auf Parya's Strapi-Seite) */
.v2--ci .v2-zones__item {
  flex: 0 0 74%;
  min-width: 0;
}

.v2--ci .v2-zone--photo {
  --color-text: var(--strong-color-text);
  position: relative;
  align-items: flex-start;
  gap: var(--space-200);
  padding: 0 0 var(--space-400);
  border: 0;
  border-radius: var(--border-radius-500);
  background: var(--color-card-bg-strong);
  color: var(--color-text);
  text-align: left;
}

.v2--ci .v2-zone--photo .v2-zone__photo {
  aspect-ratio: 4 / 5;
}

.v2--ci .v2-zone--photo .v2-zone__label {
  padding: 0 var(--space-400);
  font-size: var(--font-md);
}

.v2--ci .v2-zone__price {
  margin: 0 var(--space-400);
  padding: var(--space-100) var(--space-300);
  border-radius: 999px;
  background: #fff;
  color: #000;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

.v2--ci .v2-zone:not(.v2-zone--photo) .v2-zone__price {
  background: var(--color-black);
  color: #fff;
}

@media (min-width: 1024px) {
  .v2--ci.v2--desk [data-track-placement="v2_zones"] {
    display: block;
  }

  .v2--ci.v2--desk [data-track-placement="v2_zones"] > .v2-zones {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-400);
    max-width: none;
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  .v2--ci.v2--desk .v2-zone--photo .v2-zone__photo {
    aspect-ratio: 4 / 3;
  }

  .v2--ci.v2--desk .v2-zone--photo .v2-zone__label {
    font-size: var(--font-lg);
  }
}

/* "Noch unsicher?" als Bento: Kacheln in Schwarz, Dunkelgrau, Hellgrau,
   unterschiedlich gross; Icons in Textfarbe, kein Rot */
.v2--ci .v2-objections {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.v2--ci .v2-objection {
  grid-column: span 2;
  padding: var(--space-500);
  border-radius: var(--border-radius-500);
}

.v2--ci .v2-objection__icon,
.v2--ci.v2--rot .v2-objection__icon {
  color: currentColor;
}

.v2--ci .v2-objection--t1 {
  --color-text: var(--neutral-color-text);
  --color-text-light: var(--neutral-color-text-light);
  background: var(--color-card-bg-neutral);
}

.v2--ci .v2-objection--t2 {
  --color-text: var(--soft-color-text);
  --color-text-light: var(--soft-color-text-light);
  color: var(--color-text);
  background: var(--color-card-bg-soft);
}

.v2--ci .v2-objection__q {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

@media (min-width: 1024px) {
  .v2--ci .v2-objections {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--space-300);
  }

  .v2--ci .v2-objection {
    grid-column: span 3;
    min-height: 180px;
    padding: var(--space-700);
  }

  .v2--ci .v2-objection--n0 {
    grid-column: span 4;
  }

  .v2--ci .v2-objection--n1 {
    grid-column: span 2;
  }

  .v2--ci .v2-objection--n4 {
    grid-column: span 6;
  }
}
/* Zeitachse ohne Rot: auch die waagerechte Linie (Desktop) grau */
.v2--ci:not(.v2--rot) .v2-timeline {
  border-color: var(--color-gray-400);
}
/* =====================================================================
   Runde 3 (Benjamin, 03.10.2026), nur CI-Gestaltung
   ===================================================================== */
/* "Noch unsicher?": Kundinnen-Video als Kachel */
.v2-objection-video {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: var(--space-400);
  border-radius: var(--border-radius-500);
  background: var(--color-card-bg-soft);
}

.v2-objection-video :deep(.clips) {
  justify-content: center;
  overflow: visible;
}

@media (min-width: 1024px) {
  .v2--ci .v2-objections--video {
    grid-auto-flow: row dense;
  }

  .v2--ci .v2-objections--video .v2-objection-video {
    grid-column: span 2;
    grid-row: span 2;
    align-items: center;
  }

  .v2--ci .v2-objections--video .v2-objection--n0 {
    grid-column: span 4;
  }

  .v2--ci .v2-objections--video .v2-objection--n1,
  .v2--ci .v2-objections--video .v2-objection--n2 {
    grid-column: span 2;
  }

  .v2--ci .v2-objections--video .v2-objection--n3,
  .v2--ci .v2-objections--video .v2-objection--n4 {
    grid-column: span 3;
  }
}

/* Ablauf in drei Schritten mit Bild */
.v2-process {
  display: grid;
  gap: var(--space-400);
  margin: 0;
  padding: 0;
  list-style: none;
}

.v2-process__item {
  overflow: hidden;
  border-radius: var(--border-radius-500);
  background: var(--color-card-bg-light, #fff);
}

.v2-process__img {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--color-gray-200);
}

.v2-process__img :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.v2-process__num {
  position: absolute;
  top: var(--space-300);
  left: var(--space-300);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--color-black);
  color: #fff;
  font-weight: var(--font-bold);
}

.v2-process__body {
  padding: var(--space-500);
}

.v2-process__title {
  display: block;
  margin-bottom: var(--space-200);
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.v2-process__text {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.v2-process__list {
  display: grid;
  gap: var(--space-200);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.v2-process__when {
  display: block;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}

@media (min-width: 768px) {
  .v2-process {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Aerzte: grosses Foto + Text, darunter die Reihe */
.v2-docfeature {
  display: grid;
  gap: var(--space-400);
  margin-bottom: var(--space-600);
}

.v2-docfeature__photo {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--border-radius-500);
  background: var(--color-gray-700);
}

.v2-docfeature__photo :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}

.v2-docfeature__photo figcaption {
  position: absolute;
  left: var(--space-300);
  bottom: var(--space-300);
  padding: var(--space-100) var(--space-300);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}

.v2-docfeature__text p {
  margin: 0 0 var(--space-300);
  color: var(--color-text);
}

.v2-docfeature__text p + p {
  color: var(--color-text-light);
}

@media (min-width: 1024px) {
  .v2-docfeature {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: center;
    gap: var(--space-700);
  }

  .v2-docfeature__photo {
    aspect-ratio: 4 / 5;
  }

  .v2-docfeature__text p:first-child {
    font-size: var(--font-xl);
    line-height: var(--line-xl);
  }
}

/* Bewertungen: Desktop als Bento-Raster (mobil bleibt die Wischreihe) */
@media (min-width: 1024px) {
  .v2--ci.v2--desk .v2-reviews {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-flow: row dense;
  }

  .v2--ci.v2--desk .v2-review {
    grid-column: span 2;
    padding: var(--space-600);
  }

  .v2--ci.v2--desk .v2-review:nth-child(3n + 1) {
    --color-text: var(--strong-color-text);
    --color-text-light: var(--strong-color-text-light);
    grid-row: span 2;
    color: var(--color-text);
    background: var(--color-card-bg-strong);
  }

  .v2--ci.v2--desk .v2-review:nth-child(3n + 1) .v2-review__text {
    font-size: var(--font-lg);
    line-height: var(--line-lg);
  }

  .v2--ci.v2--desk .v2-review:nth-child(3n + 3) {
    --color-text: var(--neutral-color-text);
    --color-text-light: var(--neutral-color-text-light);
    color: var(--color-text);
    background: var(--color-card-bg-neutral);
  }

  .v2--ci.v2--desk .v2-review__stars {
    color: currentColor;
  }
}
/* =====================================================================
   Runde 4 (Michael, 03.10.2026), nur Koelner CI-Seiten ("ci-preis"):
   kraeftiges Rot ueberall - #dc2626 (wie der Knopf der Leiste) auf hellen
   Flaechen, Signalrot #ff3b30 auf Schwarz/Dunkelgrau; Preise fett.
   ===================================================================== */
.v2--preis {
  --v2-accent: #dc2626;
}

.v2--preis .theme-strong,
.v2--preis .theme-neutral {
  --v2-accent: #ff3b30;
}

.v2--ci.v2--preis .v2-facts__row--price dd,
.v2--ci.v2--preis .v2-price__offer,
.v2--ci.v2--preis .v2-final__price {
  font-weight: 700;
}

/* Steckbrief-Preis als grosser Text (19 px fett): auf der Kachel #292a2c
   reicht so AA fuer grossen Text */
.v2--ci.v2--preis .v2-facts__row--price dd {
  font-size: 1.1875rem;
  line-height: 1.3;
}

/* Desktop-Ueberlauf (Benjamin, 04.10.2026):
   - Bewertungen: "Video links, Texte rechts" passt nur fuer ein Video. Mit
     mehreren Videos belegte die Reihe links 714 px, das Bento wurde auf
     128 px gequetscht und lief aus der Karte. Dann Videos ueber dem Bento.
   - Preise: drei fette Preise passten bei 1024 px nicht in ihre Kacheln
     ("159,99 €*" lief in "239,99 €*"); Schrift waechst mit der Breite. */
@media (min-width: 1024px) {
  .v2--desk .v2-reviews-card--multi > .v2-feedback,
  .v2--desk .v2-reviews-card--multi > .v2-feedback + .v2-reviews {
    grid-column: 1 / -1;
  }

  .v2--desk .v2-reviews-card--multi > .v2-feedback {
    margin-bottom: var(--space-500);
  }

  .v2--ci.v2--desk .v2-prices--many .v2-price {
    padding-inline: var(--space-200);
  }

  .v2--ci.v2--desk .v2-prices--many .v2-price__offer {
    font-size: clamp(1.25rem, 1.9vw, 1.625rem);
  }
}

/* Bundesweit: Staedte der MY Lounges */
.v2-cities {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-200);
  margin: 0 0 var(--space-200);
  padding: 0;
  list-style: none;
}

.v2-cities__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  padding: var(--space-200) var(--space-400);
  border-radius: 999px;
  background: var(--color-card-bg-neutral, #46454a);
  color: #fff;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}

/* Desktop-Feinschliff (Benjamin, 05.10.2026):
   - Clips: mit nur ein, zwei Videos blieb rechts die halbe Karte leer ->
     Abschnitt am Desktop weg (das Hero-Video bleibt; mobil Wischreihe).
   - Aerzte: grosses Foto links, Text und die kleinen Fotos rechts als ein
     Block (vorher drei Kreise verteilt unter dem Foto).
   - Standort: Gebaeudefoto und Lageplan gleich breit, Texte buendig. */
@media (min-width: 1024px) {
  .v2--desk .v2-clips--few {
    display: none;
  }

  .v2--desk .v2-doctors-wrap--photo {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    grid-template-rows: auto 1fr;
    column-gap: var(--space-700);
    row-gap: var(--space-500);
  }

  .v2--desk .v2-doctors-wrap--photo > .v2-docfeature {
    display: contents;
  }

  .v2--desk .v2-doctors-wrap--photo .v2-docfeature__photo {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .v2--desk .v2-doctors-wrap--photo .v2-docfeature__text {
    grid-column: 2;
    grid-row: 1;
    align-self: end;
  }

  .v2--desk .v2-doctors-wrap--photo > .v2-doctors {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    grid-template-columns: repeat(3, minmax(0, 96px));
    justify-content: start;
    gap: var(--space-300);
  }

  /* Seitliche Ueberschriften (Arzteteam, weitere Behandlungen, Beratung):
     der Standortname bricht bewusst nicht um ("Düsseldorf Arcaden"); bei
     1024 px war die linke Spalte dafuer zu schmal und das Wort wurde
     zerschnitten ("Arca-den"). Schrift waechst mit der Breite. */
  .v2--desk .v2-split > .v2-h2 {
    font-size: clamp(1.375rem, 2.1vw, var(--font-3xl));
    line-height: 1.2;
  }

  .v2--desk .v2-doctors-wrap--photo .v2-doctor__photo {
    max-width: 96px;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-location {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: var(--space-700);
    align-items: start;
  }

  .v2--desk [data-track-placement="v2_location"] > .v2-directions {
    column-gap: var(--space-700);
  }
}

/* Aerzte-Block mobil: Hochformat wie auf dem Desktop, Gesicht und
   Oberkoerper ganz im Bild */
.v2-docfeature__photo {
  aspect-ratio: 4 / 5;
}

.v2-docfeature__photo :deep(img) {
  object-position: center 35%;
}
</style>
