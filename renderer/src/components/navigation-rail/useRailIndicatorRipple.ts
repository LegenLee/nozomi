import { ref, toValue, type MaybeRefOrGetter } from "vue";

// Press ripple for the rail's active indicator, following Material Web's md-ripple.
// The whole item takes the press but the ripple draws inside the indicator, so the item hands
// its pointer events here and the indicator clips the ripple with its own overflow.
const MINIMUM_PRESS_MS = 225;
const TOUCH_DELAY_MS = 150;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
// Must match the fade-out transition in NavigationRailItem.vue.
const FADE_MS = 375;

export interface RailIndicatorRipple {
  id: number;
  /** Starting diameter in px; the ripple grows by `scale`. */
  size: number;
  scale: number;
  /** Top-left offsets at the press point and centered in the indicator. */
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  fading: boolean;
}

export function useRailIndicatorRipple(indicator: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const ripples = ref<RailIndicatorRipple[]>([]);
  let nextId = 0;

  function add(event: PointerEvent) {
    const el = toValue(indicator);
    if (!el) return;

    const { left, top, width, height } = el.getBoundingClientRect();
    const size = Math.floor(Math.max(width, height) * INITIAL_ORIGIN_SCALE);
    const id = nextId++;
    ripples.value.push({
      id,
      size,
      scale: (Math.hypot(width, height) + PADDING) / size,
      startX: event.clientX - left - size / 2,
      startY: event.clientY - top - size / 2,
      endX: (width - size) / 2,
      endY: (height - size) / 2,
      fading: false,
    });
    return id;
  }

  function remove(id: number, addedAt: number) {
    setTimeout(
      () => {
        const ripple = ripples.value.find((r) => r.id === id);
        if (ripple) ripple.fading = true;
        setTimeout(() => {
          ripples.value = ripples.value.filter((r) => r.id !== id);
        }, FADE_MS);
      },
      Math.max(0, MINIMUM_PRESS_MS - (performance.now() - addedAt)),
    );
  }

  function press(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;

    const target = event.currentTarget as HTMLElement;
    const listeners = new AbortController();
    let id: number | undefined;
    let addedAt = 0;
    const begin = () => {
      id = add(event);
      addedAt = performance.now();
    };

    // Touch waits so that starting a scroll does not flash a ripple.
    let touchDelay: ReturnType<typeof setTimeout> | undefined;
    if (event.pointerType === "touch") touchDelay = setTimeout(begin, TOUCH_DELAY_MS);
    else begin();

    const release = (e: PointerEvent) => {
      listeners.abort();
      clearTimeout(touchDelay);
      // A tap that ends within the touch delay still shows its ripple.
      if (id === undefined && e.type === "pointerup") begin();
      if (id !== undefined) remove(id, addedAt);
    };
    for (const type of ["pointerup", "pointerleave", "pointercancel"] as const) {
      target.addEventListener(type, release, { signal: listeners.signal });
    }
  }

  return { ripples, press };
}
