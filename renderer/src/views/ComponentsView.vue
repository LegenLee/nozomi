<script setup lang="ts">
import {
  mdiBellOutline,
  mdiChartBoxOutline,
  mdiClipboardText,
  mdiClipboardTextOutline,
  mdiCogOutline,
  mdiFactory,
  mdiPlus,
} from "@mdi/js";
import { ref } from "vue";
import NavigationRailItem from "../components/navigation-rail/NavigationRailItem.vue";
import { baselineLight, toVuetifyColors } from "../theme/m3-scheme.ts";

// Fixed renders of what the M3 theme, Vuetify defaults and SASS settings affect, for comparing
// screenshots between changes. `?theme=light` or `?theme=dark` pins the theme.
const pinned = new URLSearchParams(location.search).get("theme");
const theme = ref<"system" | "light" | "dark">(
  pinned === "light" || pinned === "dark" ? pinned : "system",
);

// Each swatch uses `bg-<color>`, so its text shows the paired `on-<color>`.
const swatches = Object.keys(toVuetifyColors(baselineLight)).filter(
  (name) => !name.startsWith("on-"),
);

const buttonVariants = [
  "elevated",
  "flat",
  "tonal",
  "outlined",
  "text",
  "plain",
] as const;
const buttonSizes = [
  "x-small",
  "small",
  "default",
  "large",
  "x-large",
] as const;
const chipVariants = ["tonal", "flat", "elevated", "outlined"] as const;

// A past month, so the date picker never highlights today.
const pickedDate = new Date(2026, 2, 15);
</script>

<template>
  <VThemeProvider
    :theme="theme === 'system' ? undefined : theme"
    with-background
  >
    <div class="regression">
      <header class="regression__header">
        <h1 class="text-headline-small">렌더 회귀 확인</h1>
        <VBtnToggle v-model="theme" mandatory variant="outlined" size="small">
          <VBtn value="system">시스템</VBtn>
          <VBtn value="light">라이트</VBtn>
          <VBtn value="dark">다크</VBtn>
        </VBtnToggle>
      </header>

      <section>
        <h2 class="text-title-medium">Navigation rail</h2>
        <p class="text-body-small">
          Ripple, hover, 포커스, 접힘·펼침 전환은 직접 눌러 확인
        </p>
        <div class="regression__row regression__row--top">
          <div
            v-for="expanded in [false, true]"
            :key="String(expanded)"
            class="regression__rail"
            :class="{ 'regression__rail--expanded': expanded }"
          >
            <NavigationRailItem
              :expanded
              active
              label="작업지시"
              :icon="mdiClipboardTextOutline"
              :active-icon="mdiClipboardText"
            />
            <NavigationRailItem :expanded label="설비" :icon="mdiFactory" />
            <NavigationRailItem
              :expanded
              label="알람"
              :icon="mdiBellOutline"
              :badge="12"
            />
            <NavigationRailItem
              :expanded
              label="천 건"
              :icon="mdiBellOutline"
              :badge="1000"
            />
            <NavigationRailItem
              :expanded
              label="리포트"
              :icon="mdiChartBoxOutline"
              badge
            />
            <NavigationRailItem
              :expanded
              label="설정"
              :icon="mdiCogOutline"
              disabled
            />
            <NavigationRailItem
              :expanded
              active
              disabled
              label="비활성 선택"
              :icon="mdiCogOutline"
            />
            <NavigationRailItem
              :expanded
              label="아주 긴 메뉴 이름 테스트"
              :icon="mdiFactory"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Color roles</h2>
        <div class="regression__swatches">
          <div
            v-for="name in swatches"
            :key="name"
            class="regression__swatch text-label-small"
            :class="`bg-${name}`"
          >
            {{ name }}
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Buttons</h2>
        <div class="regression__row">
          <VBtn v-for="variant in buttonVariants" :key="variant" :variant>{{
            variant
          }}</VBtn>
        </div>
        <div class="regression__row">
          <VBtn v-for="size in buttonSizes" :key="size" :size>{{ size }}</VBtn>
        </div>
        <div class="regression__row">
          <VBtn
            v-for="size in buttonSizes"
            :key="size"
            :size
            :icon="mdiPlus"
            :aria-label="size"
          />
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Selection</h2>
        <div class="regression__row">
          <VSwitch label="꺼짐" hide-details />
          <VSwitch label="켜짐" :model-value="true" hide-details />
          <VSwitch label="비활성" disabled hide-details />
          <VSwitch
            label="비활성 켜짐"
            disabled
            :model-value="true"
            hide-details
          />
          <VCheckbox label="해제" hide-details />
          <VCheckbox label="체크" :model-value="true" hide-details />
        </div>
        <div class="regression__sliders">
          <VSlider :model-value="40" thumb-label="always" hide-details />
          <VRangeSlider :model-value="[20, 70]" hide-details />
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Chips, badges, fields</h2>
        <div class="regression__row">
          <VChip v-for="variant in chipVariants" :key="variant" :variant>{{
            variant
          }}</VChip>
          <VBadge class="regression__badge" content="3"
            ><VIcon :icon="mdiBellOutline"
          /></VBadge>
          <VBadge class="regression__badge" content="1000" max="999"
            ><VIcon :icon="mdiBellOutline"
          /></VBadge>
          <VBadge class="regression__badge" dot
            ><VIcon :icon="mdiBellOutline"
          /></VBadge>
        </div>
        <div class="regression__row">
          <VTextField label="outlined" model-value="값" hide-details />
          <VTextField
            label="filled"
            variant="filled"
            model-value="값"
            hide-details
          />
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Overlays</h2>
        <div class="regression__row regression__row--top">
          <div class="regression__tooltip">
            <VTooltip
              text="툴팁"
              :model-value="true"
              location="end"
              :transition="false"
            >
              <template #activator="{ props }">
                <span v-bind="props" class="text-body-medium">툴팁 기준</span>
              </template>
            </VTooltip>
          </div>
          <div class="regression__snackbar">
            <VSnackbar
              text="스낵바"
              contained
              :model-value="true"
              :timeout="-1"
              :transition="false"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-title-medium">Steppers, pickers</h2>
        <VStepper :items="['완료', '진행', '대기']" :model-value="2" />
        <div class="regression__row regression__row--top">
          <VStepperVertical
            :items="['첫 단계', '둘째 단계']"
            :model-value="1"
          />
          <VTimePicker model-value="09:30" />
          <VDatePicker :model-value="pickedDate" />
        </div>
      </section>
    </div>
  </VThemeProvider>
</template>

<style scoped>
.regression {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1200px;
  padding: 24px;
}

.regression__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.regression h2 {
  margin-bottom: 12px;
}

.regression__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.regression__row--top {
  align-items: flex-start;
}

.regression__rail {
  width: 96px;
  padding-block: 12px;
  outline: 1px dashed rgb(var(--v-theme-outline-variant));
}

.regression__rail--expanded {
  width: 220px;
}

.regression__swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 4px;
}

.regression__swatch {
  padding: 12px 8px;
  outline: 1px solid rgb(var(--v-theme-outline-variant));
}

.regression__sliders {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  /* Room for the pill slider's 44px value label above the track. */
  padding-top: 48px;
}

/* Room for large badges, which reach past their icon. */
.regression__badge {
  margin-inline-end: 24px;
}

/* Room for the tooltip, which opens to the end of its anchor. */
.regression__tooltip {
  width: 200px;
}

.regression__snackbar {
  position: relative;
  width: 360px;
  height: 72px;
}
</style>
