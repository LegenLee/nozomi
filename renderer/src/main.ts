import { createApp } from "vue";
import { router } from "./plugins/router.ts";
import { vuetify } from "./plugins/vuetify.ts";
import App from "./App.vue";

createApp(App).use(router).use(vuetify).mount("#app");
