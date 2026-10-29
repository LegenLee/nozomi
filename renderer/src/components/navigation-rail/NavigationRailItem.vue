<script setup lang="ts">
import { createReusableTemplate, useElementSize } from "@vueuse/core";
import { computed, inject, onMounted, ref, useAttrs, useTemplateRef } from "vue";
import { routerKey, type RouteLocationRaw } from "vue-router";
import { useRailIndicatorRipple } from "./useRailIndicatorRipple.ts";

// Same shapes VIcon accepts for `icon`, minus components (use the `icon` slot for those).
type IconValue = string | (string | [path: string, opacity: number])[];

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: IconValue;
    /** Icon while active, typically the filled variant of `icon`. */
    activeIcon?: IconValue;
    to?: RouteLocationRaw;
    /** Match `to` exactly instead of also matching nested routes. */
    exact?: boolean;
    /** Overrides the active state that `to` derives from the current route. */
    active?: boolean;
    /** Horizontal layout for an expanded rail. */
    expanded?: boolean;
    disabled?: boolean;
    /** `true` shows a small badge; a number or text shows a large badge. */
    badge?: boolean | number | string;
    badgeMax?: number;
  }>(),
  { active: undefined, badgeMax: 999 },
);

defineSlots<{
  default?: () => unknown;
  icon?: (props: { active: boolean }) => unknown;
}>();

const attrs = useAttrs();
const indicator = useTemplateRef<HTMLElement>("indicator");
const { ripples, press } = useRailIndicatorRipple(indicator);

// The expanded indicator gets a fixed width (16px padding + 24px icon + 8px gap + label + 16px
// padding) so the width can transition in browsers without `interpolate-size`, such as Firefox.
const measure = useTemplateRef<HTMLElement>("measure");
const { width: labelWidth } = useElementSize(measure);
const expandedIndicatorWidth = computed(() =>
  labelWidth.value ? `${Math.ceil(labelWidth.value) + 64}px` : "56px",
);

// Transitions start once the first label measurement and the initial route have been painted, so a
// rail that loads expanded, or on its active route, appears in place instead of animating into it.
const router = inject(routerKey, null);
const settled = ref(false);
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
onMounted(async () => {
  await router?.isReady();
  await nextFrame();
  await nextFrame();
  settled.value = true;
});

const [DefineItem, ReuseItem] = createReusableTemplate<{
  tag: "a" | "button";
  href?: string;
  selected: boolean;
  navigate?: (event: MouseEvent) => unknown;
}>();

// `badge` may arrive as an explicit undefined (e.g. `:badge="item.badge"`), which Vue does not cast to false.
const hasBadge = computed(() => props.badge != null && props.badge !== false);

// M3 badge placement on a 24dp icon: small 6dp badge inside the top-end corner,
// large 16dp badge 12dp from the icon start and 2dp above it.
const badgeProps = computed(() =>
  props.badge === true
    ? { dot: true, dotSize: 6 }
    : {
        content: typeof props.badge === "boolean" ? undefined : props.badge,
        max: props.badgeMax,
        height: 16,
        minWidth: 16,
        offsetY: 2,
      },
);
</script>

<template>
  <DefineItem v-slot="{ tag, href, selected, navigate }">
    <component
      :is="tag"
      v-bind="attrs"
      class="nav-rail-item"
      :class="{
        'nav-rail-item--active': selected,
        'nav-rail-item--expanded': expanded,
        'nav-rail-item--disabled': disabled,
        'nav-rail-item--settling': !settled,
      }"
      :href="href"
      :type="tag === 'button' ? 'button' : undefined"
      :disabled="tag === 'button' ? disabled : undefined"
      :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
      :aria-current="href && selected ? 'page' : undefined"
      @click="navigate"
      @pointerdown="press"
    >
      <span ref="measure" class="nav-rail-item__measure text-label-large" aria-hidden="true">
        <slot>{{ label }}</slot>
      </span>
      <span
        ref="indicator"
        class="nav-rail-item__indicator"
        :style="{ '--nav-rail-item-expanded-width': expandedIndicatorWidth }"
      >
        <span class="nav-rail-item__state">
          <span
            v-for="ripple in ripples"
            :key="ripple.id"
            class="nav-rail-item__ripple"
            :class="{ 'nav-rail-item__ripple--fading': ripple.fading }"
            :style="{
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              '--ripple-start': `${ripple.startX}px, ${ripple.startY}px`,
              '--ripple-end': `${ripple.endX}px, ${ripple.endY}px`,
              '--ripple-scale': ripple.scale,
            }"
          />
        </span>
        <VBadge
          class="nav-rail-item__icon"
          :model-value="hasBadge"
          v-bind="badgeProps"
          transition="scale-transition"
        >
          <slot name="icon" :active="selected">
            <VIcon :icon="selected && activeIcon ? activeIcon : icon" size="24" />
          </slot>
        </VBadge>
        <Transition name="nav-rail-item-label">
          <span v-if="expanded" class="nav-rail-item__label nav-rail-item__label--inline text-label-large">
            <slot>{{ label }}</slot>
          </span>
        </Transition>
      </span>
      <Transition name="nav-rail-item-label">
        <span v-if="!expanded" class="nav-rail-item__label nav-rail-item__label--below text-label-medium">
          <slot>{{ label }}</slot>
        </span>
      </Transition>
    </component>
  </DefineItem>

  <RouterLink v-if="to && !disabled" v-slot="{ href, navigate, isActive, isExactActive }" :to custom>
    <ReuseItem tag="a" :href :navigate :selected="active ?? (exact ? isExactActive : isActive)" />
  </RouterLink>
  <ReuseItem v-else :tag="to ? 'a' : 'button'" :selected="active ?? false" />
</template>

<style scoped lang="scss">
@use "../../styles/md3e/motion";

// MD3 navigation rail item (M3 Expressive): vertical in a collapsed rail, horizontal in an expanded one.
// The indicator stays 20px from the rail's start in both, so the icon holds still while the rail
// resizes, as in the M3 rail.
.nav-rail-item {
  appearance: none;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  height: 64px;
  margin: 0;
  padding: 6px 20px 0;
  border: 0;
  background: none;
  color: rgb(var(--v-theme-on-surface-variant));
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  // Lets the inline label size itself against the rail's width rather than the growing indicator.
  container-type: inline-size;
  transition:
    color motion.$spring-default-effects-duration motion.$spring-default-effects,
    height motion.$spring-default-spatial-duration motion.$spring-default-spatial,
    padding motion.$spring-default-spatial-duration motion.$spring-default-spatial,
    margin-top motion.$spring-default-spatial-duration motion.$spring-default-spatial;

  & + & {
    margin-top: 4px;
  }
}

// Same 16px padding in both states keeps the icon in place while the width changes.
.nav-rail-item__indicator {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  width: 56px;
  max-width: 100%;
  height: 32px;
  padding: 0 16px;
  border-radius: 9999px;
  transition-property: width, height;
  transition-duration: motion.$spring-default-spatial-duration;
  transition-timing-function: motion.$spring-default-spatial;

  // Active indicator, revealed from the center when the item becomes active.
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgb(var(--v-theme-secondary-container));
    clip-path: inset(0 50% round 9999px);
    transition: clip-path motion.$spring-default-spatial-duration motion.$spring-default-spatial;
  }
}

.nav-rail-item__state {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgb(var(--v-theme-on-secondary-container));
    opacity: 0;
    transition: opacity motion.$spring-default-effects-duration motion.$spring-default-effects;
  }
}

// Grows from the press point toward the center, as Material Web's ripple does.
.nav-rail-item__ripple {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: rgb(var(--v-theme-on-secondary-container));
  opacity: 0.1;
  transform: translate(var(--ripple-end)) scale(var(--ripple-scale));
  animation:
    nav-rail-item-ripple-grow 450ms cubic-bezier(0.2, 0, 0, 1),
    nav-rail-item-ripple-in 105ms linear;
  // Matches FADE_MS in useRailIndicatorRipple.
  transition: opacity 375ms linear;
}

.nav-rail-item__ripple--fading {
  opacity: 0;
}

@keyframes nav-rail-item-ripple-grow {
  from {
    transform: translate(var(--ripple-start)) scale(1);
  }
}

@keyframes nav-rail-item-ripple-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-rail-item__ripple {
    animation-name: none, nav-rail-item-ripple-in;
  }
}

.nav-rail-item__icon,
.nav-rail-item__label {
  position: relative;
}

// Large badges reach past the icon; keep them above the inline label, as in the M3 badge spec.
.nav-rail-item__icon {
  z-index: 1;
}

.nav-rail-item__icon:not(.v-badge--dot) :deep(.v-badge__badge) {
  padding: 0 4px;
  // label-small
  font-size: 0.6875rem;
  line-height: 1rem;
  letter-spacing: 0.0454545455em;
}

.nav-rail-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Keeps its full width while the indicator grows, so it does not ellipsize mid-animation; a long
// label still ends in an ellipsis at the rail's width (16px + 16px padding, 24px icon, 8px gap).
.nav-rail-item__label--inline {
  flex: none;
  max-width: calc(100cqi - 64px);
}

// Sizes the expanded indicator; never shown.
.nav-rail-item__measure {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  white-space: nowrap;
  pointer-events: none;
}

// Centered under the indicator, with room past its edges for longer labels.
.nav-rail-item__label--below {
  width: 88px;
  margin-inline-start: -16px;
  text-align: center;
}

// States
@media (hover: hover) {
  .nav-rail-item:hover .nav-rail-item__state::before {
    opacity: 0.08;
  }
}

.nav-rail-item:focus-visible {
  .nav-rail-item__state::before {
    opacity: 0.1;
  }

  .nav-rail-item__indicator {
    outline: 3px solid rgb(var(--v-theme-secondary));
    outline-offset: 2px;
  }
}

.nav-rail-item--active {
  color: rgb(var(--v-theme-secondary));

  .nav-rail-item__indicator::before {
    clip-path: inset(0 round 9999px);
  }

  .nav-rail-item__icon {
    color: rgb(var(--v-theme-on-secondary-container));
  }
}

.nav-rail-item--disabled {
  pointer-events: none;
  color: rgba(var(--v-theme-on-surface-variant), 0.38);

  .nav-rail-item__icon {
    color: inherit;
  }
}

// Expanded rail: icon and label share the indicator, which hugs its content.
.nav-rail-item--expanded {
  height: 56px;
  padding: 0 20px;

  & + & {
    margin-top: 0;
  }

  .nav-rail-item__indicator {
    width: var(--nav-rail-item-expanded-width);
    height: 56px;
  }
}

// Until the item has settled after mounting, its measured width and initial active state apply
// without transitions.
.nav-rail-item--settling,
.nav-rail-item--settling .nav-rail-item__indicator,
.nav-rail-item--settling .nav-rail-item__indicator::before {
  transition: none;
}

// The label moves between below the indicator and inside it. As in the M3 rail, the old label
// fades out where it was, outside the layout, while the new one fades in: right away below the
// indicator, but only once the indicator has mostly grown for the inline label.
.nav-rail-item-label-enter-active {
  transition: opacity 60ms linear;
}

// The inline label also slides in its last 7px, as measured from the M3 rail animation
// (Compose moves it in from halfway while it is still transparent). Emphasized decelerate easing.
.nav-rail-item__label--inline.nav-rail-item-label-enter-active {
  transition:
    opacity 60ms linear 90ms,
    transform 150ms cubic-bezier(0.05, 0.7, 0.1, 1) 90ms;
}

.nav-rail-item__label--inline.nav-rail-item-label-enter-from {
  transform: translateX(-7px);
}

.nav-rail-item-label-leave-active {
  position: absolute;
  transition: opacity 60ms linear;
}

.nav-rail-item-label-enter-from,
.nav-rail-item-label-leave-to {
  opacity: 0;
}

// Collapsed position: 6px top padding + 32px indicator + 4px gap.
.nav-rail-item__label--below.nav-rail-item-label-leave-active {
  top: 42px;
  left: 4px;
  margin: 0;
}

// Expanded position inside the indicator: 16px padding + 24px icon + 8px gap.
.nav-rail-item__label--inline.nav-rail-item-label-leave-active {
  top: 50%;
  left: 48px;
  transform: translateY(-50%);
}
</style>
