<template>
  <div v-if="mapUrl" class="googleMapEmbed">
    <iframe
      :src="mapUrl"
      width="100%"
      height="100%"
      style="border: 0"
      :allowfullscreen="true"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      :title="$t('blocks.locationContact.map.title')"
    ></iframe>
  </div>
</template>
<script setup lang="ts">
import type {
  SharedCoordinatesDto,
  SharedAddressDto,
} from "~/lib/strapi/dto/components";

const props = defineProps<{
  /** Direkte Google-Maps-Embed-URL (hat Vorrang) */
  mapUrl?: string | null;
  /** Koordinaten für die Kartenansicht (wird ignoriert, wenn mapUrl gesetzt ist) */
  coordinates?: SharedCoordinatesDto | null;
  /** Adresse für die Kartenansicht (Fallback, wenn weder mapUrl noch coordinates) */
  address?: SharedAddressDto | null;
}>();

const mapUrl = computed(() => {
  if (props.mapUrl) {
    return props.mapUrl;
  }

  if (props.coordinates?.lat && props.coordinates?.long) {
    const lat = Number(props.coordinates.lat);
    const long = Number(props.coordinates.long);
    if (!isNaN(lat) && !isNaN(long)) {
      return `https://www.google.com/maps?q=${lat},${long}&output=embed`;
    }
  }

  if (props.address) {
    const addressParts = [
      props.address.street,
      props.address.houseNumber,
      props.address.postalCode,
      props.address.city,
    ]
      .filter(Boolean)
      .join(" ");
    if (addressParts) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        addressParts,
      )}&output=embed`;
    }
  }

  return null;
});
</script>
<style scoped>
.googleMapEmbed {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: blue;
}

.googleMapEmbed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: red;
}
</style>
