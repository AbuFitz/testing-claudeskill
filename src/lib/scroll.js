// Tiny shared scroll bus: one listener, one rAF, no re-renders.
const subs = new Set();
let queued = false;
let bound = false;

const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));

function flush() {
  queued = false;
  subs.forEach((fn) => fn());
}
function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

export function subscribe(fn) {
  if (!bound) {
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    bound = true;
  }
  subs.add(fn);
  fn();
  return () => subs.delete(fn);
}

// 0..1 across a tall section whose inner stage is sticky.
export function pinnedProgress(el) {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  return total <= 0 ? 0 : clamp(-r.top / total);
}

// 0..1 as an element travels from entering the bottom to leaving the top.
export function passProgress(el) {
  const r = el.getBoundingClientRect();
  return clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
}

export { clamp };
