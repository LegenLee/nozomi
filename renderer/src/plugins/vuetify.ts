import "vuetify/styles";
import "../styles/overrides.scss";
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import {
  baselineDark,
  baselineLight,
  toVuetifyColors,
} from "../theme/m3-scheme.ts";

import "@fontsource/google-sans-flex/latin-100.css";
import "@fontsource/google-sans-flex/latin-200.css";
import "@fontsource/google-sans-flex/latin-300.css";
import "@fontsource/google-sans-flex/latin-400.css";
import "@fontsource/google-sans-flex/latin-500.css";
import "@fontsource/google-sans-flex/latin-600.css";
import "@fontsource/google-sans-flex/latin-700.css";
import "@fontsource/google-sans-flex/latin-800.css";
import "@fontsource/google-sans-flex/latin-900.css";

// MD3 pill sliders in primary; the inactive track is primary at 24%. The md3 blueprint only colors
// VSlider, so both get it here. The value label colors are in styles/md3e/slider.scss.
const sliderDefaults = {
  color: "primary",
  variant: "pill",
};

export const vuetify = createVuetify({
  blueprint: md3,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    themes: {
      light: { colors: toVuetifyColors(baselineLight) },
      dark: { colors: toVuetifyColors(baselineDark) },
    },
  },
  defaults: {
    VBadge: { color: "error" },
    VBtn: { rounded: null, size: "default" },
    VBtnGroup: { rounded: "full", size: "default" },
    VBtnToggle: { size: "default" },
    VCard: { rounded: null },
    VCheckbox: { color: "primary" },
    VDatePicker: { VBtn: { rounded: "full" } },
    VRangeSlider: sliderDefaults,
    VSlider: sliderDefaults,
    VSnackbar: { color: "inverse-surface" },
    // VStepper only forwards `color` to its actions, so items take it directly.
    VStepperItem: { color: "primary" },
    VStepperVertical: { color: "primary" },
    VSwitch: { inset: "material", color: "primary" },
    VTimePicker: { color: "primary" },
    VTooltip: { color: "inverse-surface" },
  },
});
