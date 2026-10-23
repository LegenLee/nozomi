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

export const vuetify = createVuetify({
  blueprint: md3,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: { rounded: null },
    VBtnGroup: { rounded: "full", size: "default" },
    VBtnToggle: { size: "default" },
    VCard: { rounded: null },
    VCheckbox: { color: "primary" },
    VDatePicker: { VBtn: { rounded: "full" } },
    VSwitch: { inset: "material", color: "primary" },
  },
});
