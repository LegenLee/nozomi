import { resolve } from "node:path";

import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
  ],
});
