// Captures every BeatMind screen (intro, 7 phases, proposal) at wide, desktop and mobile.
// Requires the Vite dev server (npm.cmd run dev). Uses an isolated browser profile, so the
// user's real localStorage is never touched.
//
// Usage (from the project root):
//   node .claude/skills/beatmind-neon/scripts/capture.mjs [--url http://127.0.0.1:5173/] [--out tmp/qa/neon] [--only wide,mobile]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const url = arg('url', 'http://127.0.0.1:5173/');
const out = resolve(arg('out', 'tmp/qa/neon'));
// 'wide' is a full-HD monitor with browser chrome: captured as the visible viewport only, to
// judge how much of the screen is used without scrolling. The others capture the full page.
const VIEWPORTS = {
  wide: { width: 1920, height: 950, fullPage: false },
  desktop: { width: 1440, height: 1000, fullPage: true },
  mobile: { width: 390, height: 844, fullPage: true },
};
const only = arg('only', '').split(',').filter(Boolean);
const PHASES = ['estilo', 'velocidad', 'ritmo', 'bajo', 'melodia', 'equilibrio', 'tu-beat'];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [device, { fullPage, ...viewport }] of Object.entries(VIEWPORTS)) {
    if (only.length && !only.includes(device)) continue;
    const page = await browser.newPage({ viewport });
    // Wait for images (Byte poses) and entrance animations (speech bubbles) so a capture never
    // shows a half-loaded screen. Endless loops, like Byte floating, are ignored.
    const shot = async (name) => {
      await page.waitForFunction(
        () =>
          [...document.images].every((img) => img.complete) &&
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .every((a) => a.playState === 'finished'),
      );
      await page.screenshot({ path: `${out}/${name}-${device}.png`, fullPage });
    };
    await page.goto(url);
    // Seed a full demo beat with the app's own modules so the fixture follows the real schema.
    await page.evaluate(async () => {
      const music = await import('/src/music.ts');
      const project = music.generateBass(music.makeProject('Trap'));
      const melody = music.generateMelodies(project, 7)[0];
      project.name = 'Demo neon';
      project.tracks = project.tracks.map((t) =>
        t.id === 'melody' ? { ...t, steps: melody.steps, notes: melody.notes } : t,
      );
      localStorage.setItem('beatmind-project-v1', JSON.stringify(project));
      localStorage.setItem(
        'beatmind-guide-v1',
        JSON.stringify({ started: true, phase: 0, unlocked: 6, genreChosen: true }),
      );
    });
    await page.reload();
    await page.getByRole('main', { name: 'Introducción a BeatMind' }).waitFor();
    await shot('intro-1');
    await page.getByRole('button', { name: 'Cómo vamos a crear' }).click();
    await shot('intro-2');
    await page.getByRole('button', { name: /^Conocer a/ }).click();
    await shot('intro-3');
    await page.getByRole('button', { name: 'Volver a mi beat', exact: true }).click();

    for (const [i, phase] of PHASES.entries()) {
      await page.getByRole('button', { name: new RegExp(`^Paso ${i + 1}:`) }).click();
      await page.waitForTimeout(150);
      await shot(`${i + 1}-${phase}`);
    }

    await page.getByRole('button', { name: /^Paso 3:/ }).click();
    await page.getByRole('button', { name: /^Sí, mostrame/ }).click();
    await shot('3-ritmo-propuesta');
    await page.getByRole('button', { name: 'No, seguir con mi versión' }).click();
    await shot('3-ritmo-rechazada');

    // The melody proposal is the tallest state of Byte's card (three ideas to choose from).
    await page.getByRole('button', { name: /^Paso 5:/ }).click();
    await page.getByRole('button', { name: /^Sí, mostrame/ }).click();
    await shot('5-melodia-propuesta');
    await page.getByRole('button', { name: 'No, seguir con mi versión' }).click();

    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Capturas guardadas en ${out}`);
