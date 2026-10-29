<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { computed, ref, useId, useTemplateRef } from "vue";

// Same shapes VIcon accepts for `icon`, minus components (use the `icon` slot for those).
type IconValue = string | (string | [path: string, opacity: number])[];

// Attributes such as `persistent` or `activator` go to the VDialog.
defineOptions({ inheritAttrs: false });

const isActive = defineModel<boolean>({ default: false });

const props = defineProps<{
  headline?: string;
  /** Hero icon above the headline, which then centers. */
  icon?: IconValue;
  /** Supporting text; the default slot replaces it. */
  text?: string;
}>();

const slots = defineSlots<{
  activator?: (props: { props: Record<string, unknown>; isActive: boolean }) => unknown;
  icon?: () => unknown;
  headline?: () => unknown;
  default?: () => unknown;
  actions?: (props: { close: () => void }) => unknown;
}>();

const headlineId = useId();
const hasIcon = computed(() => props.icon !== undefined || !!slots.icon);
const hasHeadline = computed(() => props.headline !== undefined || !!slots.headline);

// M3 dividers: under the headline once the content scrolls under it, and above the actions while
// more content waits below.
const scroller = useTemplateRef<HTMLElement>("scroller");
const content = useTemplateRef<HTMLElement>("content");
const scrolledDown = ref(false);
const moreBelow = ref(false);
function updateDividers() {
  const el = scroller.value;
  if (!el) return;
  scrolledDown.value = el.scrollTop > 0;
  moreBelow.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}
useResizeObserver([scroller, content], updateDividers);

function close() {
  isActive.value = false;
}
</script>

<template>
  <VDialog
    v-model="isActive"
    v-bind="$attrs"
    class="basic-dialog"
    transition="basic-dialog"
    :aria-labelledby="hasHeadline ? headlineId : undefined"
  >
    <template v-if="slots.activator" #activator="activatorProps">
      <slot name="activator" v-bind="activatorProps" />
    </template>

    <div
      class="basic-dialog__container"
      :class="{
        'basic-dialog__container--icon': hasIcon,
        'basic-dialog__container--headline': hasHeadline,
        'basic-dialog__container--actions': !!slots.actions,
      }"
    >
      <div v-if="hasIcon" class="basic-dialog__icon">
        <slot name="icon">
          <VIcon :icon="icon" size="24" />
        </slot>
      </div>
      <h2
        v-if="hasHeadline"
        :id="headlineId"
        class="basic-dialog__headline text-headline-small"
        :class="{ 'basic-dialog__headline--divided': scrolledDown }"
      >
        <slot name="headline">{{ headline }}</slot>
      </h2>
      <div ref="scroller" class="basic-dialog__scroller" @scroll="updateDividers">
        <div ref="content" class="basic-dialog__content text-body-medium">
          <slot>{{ text }}</slot>
        </div>
      </div>
      <div
        v-if="slots.actions"
        class="basic-dialog__actions"
        :class="{ 'basic-dialog__actions--divided': moreBelow }"
      >
        <!-- M3 dialog actions are 40dp text buttons; the app default is the 56px MD3E size. -->
        <VDefaultsProvider :defaults="{ VBtn: { variant: 'text', size: 'small' } }">
          <slot name="actions" :close="close" />
        </VDefaultsProvider>
      </div>
    </div>
  </VDialog>
</template>

<style scoped lang="scss">
.basic-dialog__container {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 140px;
  border-radius: 28px;
  color: rgb(var(--v-theme-on-surface));

  // Container color and level 3 elevation, on a layer of their own so they can grow open from the top.
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 100%;
    border-radius: inherit;
    background: rgb(var(--v-theme-surface-container-high));
    box-shadow:
      0 1px 3px 0 rgba(var(--v-shadow-color), var(--v-shadow-key-opacity, 0.3)),
      0 4px 8px 3px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15));
  }

  > * {
    position: relative;
  }
}

.basic-dialog__icon {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  color: rgb(var(--v-theme-secondary));
}

.basic-dialog__headline {
  margin: 0;
  padding: 24px 24px 16px;

  .basic-dialog__container--icon & {
    padding-top: 16px;
    text-align: center;
  }
}

.basic-dialog__scroller {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.basic-dialog__content {
  padding: 24px;
  color: rgb(var(--v-theme-on-surface-variant));

  .basic-dialog__container--headline & {
    padding-top: 0;
  }

  .basic-dialog__container--actions & {
    padding-bottom: 8px;
  }
}

.basic-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 24px;
}

.basic-dialog__headline--divided::after,
.basic-dialog__actions--divided::before {
  content: "";
  position: absolute;
  right: 0;
  left: 0;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

.basic-dialog__headline--divided::after {
  bottom: 0;
}

.basic-dialog__actions--divided::before {
  top: 0;
}
</style>

<!-- Unscoped: these rules target what VDialog renders (its content box, scrim and transition
     classes). Every class and keyframe name starts with basic-dialog. -->
<style lang="scss">
// M3 easing tokens, as Material Web defines them.
$emphasized: cubic-bezier(0.3, 0, 0, 1);
$emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

// MD3 basic dialog: 280–560px wide and at most 560px tall, sized to its content.
.basic-dialog > .v-overlay__content {
  width: auto;
  min-width: 280px;
  max-width: min(560px, calc(100% - 48px));
  max-height: min(560px, calc(100% - 48px));
}

// Motion from Material Web's md-dialog: the dialog drops in while its container grows down from 35%
// of its height, and the headline and content, then the actions, fade in. Closing reverses it faster.
// The longest animation sits on the transition root, so Vue waits for all of them. Closing uses its own
// keyframes: reusing the opening ones would let a close during the opening continue that animation
// with the shorter duration, which ends it at once.
.basic-dialog-enter-active {
  animation: basic-dialog-drop-in 500ms $emphasized;

  .basic-dialog__container::before {
    animation:
      basic-dialog-grow 500ms $emphasized,
      basic-dialog-fade-in 50ms linear;
  }

  :is(.basic-dialog__icon, .basic-dialog__headline, .basic-dialog__scroller) {
    animation: basic-dialog-fade-in-late 250ms linear both;
  }

  .basic-dialog__actions {
    animation: basic-dialog-fade-in-later 300ms linear both;
  }
}

.basic-dialog-leave-active {
  animation: basic-dialog-lift-out 150ms $emphasized-accelerate forwards;

  .basic-dialog__container::before {
    animation:
      basic-dialog-shrink 150ms $emphasized-accelerate forwards,
      basic-dialog-fade-out 50ms linear 100ms forwards;
  }

  :is(.basic-dialog__icon, .basic-dialog__headline, .basic-dialog__scroller, .basic-dialog__actions) {
    animation: basic-dialog-fade-out 100ms linear forwards;
  }
}

// The scrim fades with the dialog instead of Vuetify's 300ms fade.
.basic-dialog > .v-overlay__scrim {
  &.fade-transition-enter-active {
    transition: opacity 500ms linear;
  }

  &.fade-transition-leave-active {
    transition: opacity 150ms linear;
  }
}

@keyframes basic-dialog-drop-in {
  from {
    transform: translateY(-50px);
  }
}

@keyframes basic-dialog-lift-out {
  to {
    transform: translateY(-50px);
  }
}

@keyframes basic-dialog-grow {
  from {
    height: 35%;
  }
}

@keyframes basic-dialog-shrink {
  to {
    height: 35%;
  }
}

@keyframes basic-dialog-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes basic-dialog-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes basic-dialog-fade-in-late {
  0%,
  20% {
    opacity: 0;
  }
}

@keyframes basic-dialog-fade-in-later {
  0%,
  50% {
    opacity: 0;
  }
}

// Reduced motion keeps the fades but not the drop or the growing container.
@media (prefers-reduced-motion: reduce) {
  .basic-dialog-enter-active {
    animation-name: basic-dialog-fade-in;
  }

  .basic-dialog-leave-active {
    animation-name: basic-dialog-fade-out;
  }

  :is(.basic-dialog-enter-active, .basic-dialog-leave-active) .basic-dialog__container::before {
    animation-name: none;
  }
}
</style>
