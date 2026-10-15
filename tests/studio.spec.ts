import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

async function snapshot(page: Page) {
  return page.evaluate(() => localStorage.getItem('beatmind-project-v1'));
}
async function saved(page: Page) {
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
}
async function introToByte(page: Page) {
  await page.getByRole('button', { name: 'Cómo vamos a crear', exact: true }).click();
  await page.getByRole('button', { name: 'Conocer a Byte', exact: true }).click();
}
async function start(page: Page) {
  await page.goto('/');
  await introToByte(page);
  await page.getByRole('button', { name: 'Crear mi primera base', exact: true }).click();
}
async function toRhythm(page: Page) {
  await start(page);
  await page.getByRole('button', { name: /Trap.*Profundo y relajado/ }).click();
  await page.getByRole('button', { name: 'Usar Trap y seguir' }).click();
  await page.getByRole('button', { name: 'Crear mi ritmo', exact: true }).click();
}
async function ask(page: Page) {
  await page.getByRole('button', { name: /Sí, mostrame/ }).click();
}

test('beginner path, consent, optional layers, save and recover', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.screenshot({ path: 'tmp/qa/welcome-desktop.png', fullPage: true });
  await expect(page.getByRole('heading', { name: /Acá empieza.*tu primera base/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bombo, paso 1' })).toHaveCount(0);
  await introToByte(page);
  await page.getByRole('button', { name: 'Crear mi primera base' }).click();
  await expect(page.getByRole('button', { name: 'Paso 4: Bajo' })).toBeDisabled();
  await saved(page);
  const beforeStyle = await snapshot(page);
  await page.getByRole('button', { name: 'Escuchar Pop', exact: true }).click();
  await page.getByRole('button', { name: /Pop.*Fresco y pegadizo/ }).click();
  await saved(page);
  expect(await snapshot(page)).toBe(beforeStyle);
  await page.screenshot({ path: 'tmp/qa/style-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Usar Pop y seguir' }).click();
  await saved(page);
  expect(JSON.parse((await snapshot(page))!).genre).toBe('Pop');
  await expect(page.getByRole('heading', { name: 'Encontrá el pulso de tu idea.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Escuchar Pop', exact: true })).toHaveCount(0);
  await page.getByRole('slider', { name: 'La velocidad de tu beat' }).fill('120');
  await page.getByRole('button', { name: 'Escuchar el pulso', exact: true }).click();
  await expect
    .poll(async () => page.locator('.pulse-display').getAttribute('class'))
    .toContain('pulsing');
  await page.getByRole('button', { name: 'Crear mi ritmo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Conocer el bajo', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Caja, paso 1', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Bombo, paso 1', exact: true }).click();
  await page.getByRole('button', { name: 'Bombo, paso 9', exact: true }).click();
  await saved(page);
  const beforeProposal = await snapshot(page);
  await ask(page);
  await saved(page);
  expect(await snapshot(page)).toBe(beforeProposal);
  await page.getByRole('button', { name: 'Escuchar propuesta', exact: true }).click();
  await expect
    .poll(async () =>
      page
        .locator('.listen-wave i')
        .first()
        .evaluate((el) => el.getBoundingClientRect().height),
    )
    .toBeGreaterThan(6);
  await saved(page);
  expect(await snapshot(page)).toBe(beforeProposal);
  await page.screenshot({ path: 'tmp/qa/rhythm-proposal-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'No, seguir con mi versión', exact: true }).click();
  await saved(page);
  expect(await snapshot(page)).toBe(beforeProposal);
  await page.getByRole('button', { name: 'Ver otra propuesta', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Seguir con la caja', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Sí, usar esta idea', exact: true }).click();
  await saved(page);
  const approvedRhythm = JSON.parse((await snapshot(page))!);
  expect(approvedRhythm.tracks[0].steps[10]).toBe(true);
  await page.getByRole('button', { name: 'Seguir con la caja', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bombo, paso 1', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Caja, paso 5', exact: true }).click();
  await page.getByRole('button', { name: 'Seguir con el hi-hat', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Caja, paso 5', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Conocer el bajo', exact: true }).click();
  await saved(page);
  const beforeBass = await snapshot(page);
  await ask(page);
  await page.getByRole('button', { name: 'Escuchar propuesta', exact: true }).click();
  expect(await snapshot(page)).toBe(beforeBass);
  await page.getByRole('button', { name: 'Sí, usar esta idea', exact: true }).click();
  await saved(page);
  expect(JSON.parse((await snapshot(page))!).tracks[3].steps.some(Boolean)).toBe(true);
  await page.getByRole('button', { name: 'Seguir con este bajo', exact: true }).click();
  await ask(page);
  await expect(page.getByRole('button', { name: /Idea [123]/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sí, usar esta idea', exact: true }).click();
  await page.getByRole('button', { name: 'Seguir con esta melodía', exact: true }).click();
  await saved(page);
  const beforeMix = await snapshot(page);
  await ask(page);
  await page.getByRole('button', { name: 'Escuchar propuesta', exact: true }).click();
  expect(await snapshot(page)).toBe(beforeMix);
  await page.getByRole('button', { name: 'No, seguir con mi versión', exact: true }).click();
  expect(await snapshot(page)).toBe(beforeMix);
  await page.getByRole('button', { name: 'Ver otra propuesta', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, usar esta idea', exact: true }).click();
  await saved(page);
  expect(JSON.parse((await snapshot(page))!).cleanMix).toBe(true);
  await page.getByRole('button', { name: 'Escuchar y guardar', exact: true }).click();
  await page.getByLabel('Nombre del proyecto').fill('Mi beat guiado');
  await saved(page);
  const [wav] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Guardar mi beat como audio' }).click(),
  ]);
  const bytes = await fs.readFile((await wav.path())!);
  expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString()).toBe('WAVE');
  let peak = 0;
  for (let i = 44; i < bytes.length; i += 2) peak = Math.max(peak, Math.abs(bytes.readInt16LE(i)));
  expect(peak).toBeGreaterThan(1000);
  expect(peak).toBeLessThan(32767);
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Guardar proyecto para seguir editando' }).click(),
  ]);
  const filePath = (await file.path())!;
  await page.screenshot({ path: 'tmp/qa/finish-desktop.png', fullPage: true });
  await page.reload();
  await expect(page.getByRole('main', { name: 'Introducción a BeatMind' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar mi beat', exact: true }).click();
  await expect(page.getByLabel('Nombre del proyecto')).toHaveValue('Mi beat guiado');
  await expect(page.getByRole('button', { name: 'Paso 5: Melodía' })).toBeEnabled();
  await page.getByRole('button', { name: 'Crear otro beat', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar un beat nuevo', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles(filePath);
  await expect(page.getByLabel('Nombre del proyecto')).toHaveValue('Mi beat guiado');
  await page.locator('input[type=file]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.getByText('Formato de proyecto incompatible.')).toBeVisible();
  await expect(page.getByLabel('Nombre del proyecto')).toHaveValue('Mi beat guiado');
  expect(errors).toEqual([]);
});

test('skip optional instruments and invalidate ideas after manual editing', async ({ page }) => {
  await toRhythm(page);
  await page.getByRole('button', { name: 'Bombo, paso 1', exact: true }).click();
  await ask(page);
  await page.getByRole('button', { name: 'Bombo, paso 9', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sí, usar esta idea' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Seguir con la caja', exact: true }).click();
  await page.getByRole('button', { name: 'Seguir con el hi-hat', exact: true }).click();
  await page.getByRole('button', { name: 'Conocer el bajo', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar sin bajo', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar sin melodía', exact: true }).click();
  await saved(page);
  const current = JSON.parse((await snapshot(page))!);
  expect(current.tracks[3].steps.some(Boolean)).toBe(false);
  expect(current.tracks[4].steps.some(Boolean)).toBe(false);
  await page.getByRole('button', { name: 'Silenciar Bombo', exact: true }).click();
  await page.getByRole('button', { name: 'Escuchar y guardar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guardar mi beat como audio' })).toBeDisabled();
});

test('legacy projects survive onboarding and the mobile layout holds', async ({ page }) => {
  await page.goto('/');
  const current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('beatmind-project-v1') ?? 'null'),
  );
  // Wait for autosave before seeding a prior-version project.
  if (!current) await expect.poll(() => snapshot(page)).not.toBeNull();
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('beatmind-project-v1')!);
    p.name = 'Proyecto anterior';
    p.tracks[0].steps[3] = true;
    localStorage.setItem('beatmind-project-v1', JSON.stringify(p));
    localStorage.removeItem('beatmind-guide-v1');
  });
  await page.reload();
  await introToByte(page);
  await expect(
    page.getByText('Tu proyecto sigue guardado: «Proyecto anterior».', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continuar mi beat', exact: true }).click();
  await saved(page);
  const before = await snapshot(page);
  await page.getByRole('button', { name: 'Escuchar Cumbia', exact: true }).click();
  expect(await snapshot(page)).toBe(before);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tmp/qa/style-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Usar Trap y seguir' }).click();
  await page.getByRole('button', { name: 'Crear mi ritmo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bombo, paso 4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await ask(page);
  await page.screenshot({ path: 'tmp/qa/rhythm-proposal-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'No, seguir con mi versión' }).click();
  await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Opciones', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Un ritmo, sonido por sonido.' })).toBeVisible();
});
