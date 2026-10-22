import "vuetify/styles";
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

import "@fontsource/google-sans-flex/latin-100.css";
import "@fontsource/google-sans-flex/latin-200.css";
import "@fontsource/google-sans-flex/latin-300.css";
import "@fontsource/google-sans-flex/latin-400.css";
import "@fontsource/google-sans-flex/latin-500.css";
import "@fontsource/google-sans-flex/latin-600.css";
import "@fontsource/google-sans-flex/latin-700.css";
import "@fontsource/google-sans-flex/latin-800.css";
import "@fontsource/google-sans-flex/latin-900.css";

/**
 * @todo MD3 Expressive rounded 값 적용해야 함...
 */
export const vuetify = createVuetify({
  blueprint: md3,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: { rounded: null },
    VBtnGroup: { size: "default" },
    VBtnToggle: { size: "default" },
    VSwitch: { inset: "material", color: "primary" },
    VCheckbox: { color: "primary" },
  },
});
