/**
 * Werbeangebot aus dem Anzeigenlink (`?angebot=`) beim Seitenaufruf merken
 * (myhb-app/myhb-os#2188). Weitergegeben wird es in useAppBookingDialog.
 */
import { angebotErfassen } from "~/lib/werbeangebotSpeicher";

export default defineNuxtPlugin(() => {
  angebotErfassen();
});
