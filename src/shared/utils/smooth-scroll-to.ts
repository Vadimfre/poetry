/**
 * Smooth scroll utility with ease-out-quintic easing (iOS-style).
 * Eliminates end-of-scroll jerks that native scrollIntoView produces.
 */

// Ease-out-quintic: fast start, very gentle deceleration at the end
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export interface SmoothScrollOptions {
  /** Duration in ms. Default: 500 */
  duration?: number;
  /** Extra pixels to scroll past the target (padding below). Default: 20 */
  offset?: number;
  /** Called when the animation finishes */
  onComplete?: () => void;
}

/**
 * Smoothly scrolls an element to its bottom with ease-out-quintic easing.
 * Returns a promise that resolves when the animation is complete.
 */
export function smoothScrollElementToBottom(
  el: HTMLElement,
  options: SmoothScrollOptions = {},
): Promise<void> {
  const { duration = 500, offset = 0, onComplete } = options;
  const start = el.scrollTop;
  const target = el.scrollHeight - el.clientHeight + offset;
  const delta = target - start;

  // Already at or past the target
  if (delta <= 0) {
    onComplete?.();
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);

      el.scrollTop = start + delta * eased;

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        // Ensure we land exactly at target
        el.scrollTop = target;
        onComplete?.();
        resolve();
      }
    };

    rafId = requestAnimationFrame(step);
  });
}

/**
 * Finds all scrollable ancestors of an element up to (but not including) the document.
 */
function getScrollableAncestors(el: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = [];
  let current: HTMLElement | null = el.parentElement;

  while (current && current !== document.body && current !== document.documentElement) {
    const { overflowY } = getComputedStyle(current);
    if (overflowY === "auto" || overflowY === "scroll") {
      result.push(current);
    }
    current = current.parentElement;
  }

  return result;
}

/**
 * Smoothly scrolls all scrollable ancestors so that the target element
 * is visible with `offset` pixels of breathing room below it.
 * Uses ease-out-quintic easing for jerk-free animation.
 */
export function smoothScrollIntoView(
  targetEl: HTMLElement,
  options: SmoothScrollOptions = {},
): Promise<void> {
  const { duration = 500, offset = 20, onComplete } = options;
  const ancestors = getScrollableAncestors(targetEl);

  if (ancestors.length === 0) {
    onComplete?.();
    return Promise.resolve();
  }

  const animations: Promise<void>[] = ancestors.map((ancestor) => {
    const start = ancestor.scrollTop;
    // Calculate how far the ancestor needs to scroll so the target's
    // bottom edge is visible with `offset` padding below
    const targetRect = targetEl.getBoundingClientRect();
    const ancestorRect = ancestor.getBoundingClientRect();
    const targetBottomInAncestor = targetRect.bottom - ancestorRect.top + ancestor.scrollTop;
    const desiredScrollTop = targetBottomInAncestor - ancestor.clientHeight + offset;
    const clampedTarget = Math.max(0, desiredScrollTop);
    const delta = clampedTarget - start;

    // No scrolling needed for this ancestor
    if (delta <= 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
      let startTime: number | null = null;
      let rafId: number;

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuint(progress);

        ancestor.scrollTop = start + delta * eased;

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          ancestor.scrollTop = clampedTarget;
          resolve();
        }
      };

      rafId = requestAnimationFrame(step);
    });
  });

  return Promise.all(animations).then(() => {
    onComplete?.();
  });
}
