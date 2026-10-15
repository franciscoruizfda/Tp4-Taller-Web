import { test, expect } from '@playwright/test';

test('introduces the program before creation and auditions without changing the project', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Tu recorrido' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Acá empieza.*tu primera base/ })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('beatmind-project-v1')))
    .not.toBeNull();
  const before = await page.evaluate(() => localStorage.getItem('beatmind-project-v1'));
  await page.getByRole('button', { name: 'Escuchar una base de ejemplo' }).click();
  await expect(page.getByText('Solo estamos escuchando. Tu proyecto no cambia.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.screenshot({ path: 'tmp/qa/introduction-purpose-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Cómo vamos a crear' }).click();
  await expect(page.getByRole('heading', { name: /De a poco.*y a tu manera/ })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Detener ejemplo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Crear mi primera base' })).toHaveCount(0);
  await page.screenshot({ path: 'tmp/qa/introduction-process-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Conocer a Byte' }).click();
  await expect(page.getByText('No agrego sonidos sin preguntarte.')).toBeVisible();
  await page.screenshot({ path: 'tmp/qa/introduction-byte-desktop.png', fullPage: true });
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.getByRole('button', { name: 'Atrás', exact: true }).click();
  await expect(page.getByRole('heading', { name: /De a poco.*y a tu manera/ })).toBeVisible();
  await page.getByRole('button', { name: 'Conocer a Byte' }).click();
  await page.getByRole('button', { name: 'Crear mi primera base' }).click();
  await expect(page.getByRole('heading', { name: '¿Qué te dan ganas de crear?' })).toBeVisible();
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.reload();
  await expect(page.getByRole('main', { name: 'Introducción a BeatMind' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar mi beat', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿Qué te dan ganas de crear?' })).toBeVisible();
  await expect(page.getByRole('main', { name: 'Introducción a BeatMind' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('shows the new introduction to returning users and replay preserves their phase and decisions', async ({
  page,
}) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('beatmind-project-v1')))
    .not.toBeNull();
  await page.evaluate(() => {
    const project = JSON.parse(localStorage.getItem('beatmind-project-v1')!);
    project.name = 'Mi base guardada';
    project.tracks[0].steps[2] = true;
    localStorage.setItem('beatmind-project-v1', JSON.stringify(project));
    localStorage.setItem(
      'beatmind-guide-v1',
      JSON.stringify({ started: true, phase: 3, unlocked: 3, genreChosen: true }),
    );
    // Older versions skipped the introduction when this flag existed.
    localStorage.setItem('beatmind-introduction-v1', 'seen');
  });
  await page.reload();
  await expect(page.getByRole('main', { name: 'Introducción a BeatMind' })).toBeVisible();
  const before = await page.evaluate(() => localStorage.getItem('beatmind-project-v1'));
  await page.keyboard.press('1');
  await page.keyboard.press('i');
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tmp/qa/introduction-purpose-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Cómo vamos a crear' }).click();
  await page.screenshot({ path: 'tmp/qa/introduction-process-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Conocer a Byte' }).click();
  await page.screenshot({ path: 'tmp/qa/introduction-byte-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Volver a mi beat', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Sumemos un poco de profundidad.' }),
  ).toBeVisible();
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.reload();
  await expect(page.getByRole('main', { name: 'Introducción a BeatMind' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await page.getByRole('button', { name: 'Continuar mi beat', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Sumemos un poco de profundidad.' }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('beatmind-project-v1'))).toBe(before);
  await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0);
});
