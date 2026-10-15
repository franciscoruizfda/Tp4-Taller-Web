// The wide layout is designed for 1920×950 (a full-HD monitor with browser chrome). On a bigger
// viewport (larger screen, full screen, or browser zoom below 100%) the whole page is scaled up
// so it keeps filling the screen instead of leaving empty bands around the content.
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 950;
const MAX_SCALE = 2.5;

function fit() {
  const scale = Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT,
    MAX_SCALE,
  );
  const root = document.documentElement.style;
  if (scale > 1.02) {
    root.zoom = String(scale);
    // `zoom` multiplies vw/vh as well, so hand the CSS the viewport already divided by it.
    root.setProperty('--bm-vw', `${window.innerWidth / scale / 100}px`);
    root.setProperty('--bm-vh', `${window.innerHeight / scale / 100}px`);
  } else {
    root.zoom = '';
    root.removeProperty('--bm-vw');
    root.removeProperty('--bm-vh');
  }
}

// Only BeatMind uses it: the infographic scales its own artboard. Returns the cleanup.
export function fitToScreen() {
  fit();
  window.addEventListener('resize', fit);
  return () => {
    window.removeEventListener('resize', fit);
    const root = document.documentElement.style;
    root.zoom = '';
    root.removeProperty('--bm-vw');
    root.removeProperty('--bm-vh');
  };
}
