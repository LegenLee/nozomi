<script setup lang="ts">
import {
  mdiBell,
  mdiBellOutline,
  mdiChartBox,
  mdiChartBoxOutline,
  mdiClipboardText,
  mdiClipboardTextOutline,
  mdiCog,
  mdiCogOutline,
  mdiFactory,
  mdiMenu,
  mdiMenuOpen,
} from "@mdi/js";
import { ref } from "vue";
import NavigationRailItem from "../components/navigation-rail/NavigationRailItem.vue";

const rail = ref(true);
const selected = ref("orders");

const items = [
  { value: "orders", label: "작업지시", icon: mdiClipboardTextOutline, activeIcon: mdiClipboardText },
  { value: "equipment", label: "설비", icon: mdiFactory },
  { value: "alarms", label: "알람", icon: mdiBellOutline, activeIcon: mdiBell, badge: 12 },
  { value: "reports", label: "리포트", icon: mdiChartBoxOutline, activeIcon: mdiChartBox, badge: true },
  { value: "settings", label: "설정", icon: mdiCogOutline, activeIcon: mdiCog, disabled: true },
];
</script>

<template>
  <VNavigationDrawer class="rail-drawer" :rail="rail" permanent rail-width="96" width="220" border="0">
    <div class="rail">
      <VBtn
        class="rail__menu"
        :icon="rail ? mdiMenu : mdiMenuOpen"
        variant="text"
        size="small"
        :aria-label="rail ? '메뉴 펼치기' : '메뉴 접기'"
        @click="rail = !rail"
      />
      <NavigationRailItem
        v-for="item in items"
        :key="item.value"
        :label="item.label"
        :icon="item.icon"
        :active-icon="item.activeIcon"
        :badge="item.badge"
        :disabled="item.disabled"
        :active="selected === item.value"
        :expanded="!rail"
        @click="selected = item.value"
      />
    </div>
  </VNavigationDrawer>

  <VMain>
    <div class="pa-6">
      <h1 class="text-headline-small mb-2">Navigation rail</h1>
      <p class="text-body-medium">선택: {{ selected }} · 레일: {{ rail ? "접힘" : "펼침" }}</p>
    </div>
  </VMain>
</template>

<style scoped lang="scss">
@use "../styles/md3e/motion";

/* Resize with the same spring as the rail items instead of Vuetify's 200ms drawer transition. */
.rail-drawer {
  transition-duration: motion.$spring-default-spatial-duration;
  transition-timing-function: motion.$spring-default-spatial;
}

/* M3 rail container: 44dp top space, 40dp below the header. */
.rail {
  display: flex;
  flex-direction: column;
  padding-top: 44px;
}

/* Keeps the menu button on the same 48px center line as the item icons in both rail states. */
.rail__menu {
  margin: 0 0 40px 28px;
}
</style>
