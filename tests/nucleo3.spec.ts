import { test, expect, type Page } from '@playwright/test';

// «Ir a núcleo 3» goes back to the Figma prototype only after the visitor downloads their beat.

async function crearYDescargarBeat(page: Page) {
  await page.getByRole('button', { name: 'Cómo vamos a crear', exact: true }).click();
  await page.getByRole('button', { name: 'Conocer a Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Crear mi primera base', exact: true }).click();
  await page.getByRole('button', { name: /Trap.*Profundo y relajado/ }).click();
  await page.getByRole('button', { name: 'Usar Trap y seguir' }).click();
  await page.getByRole('button', { name: 'Crear mi ritmo', exact: true }).click();
  await page.getByRole('button', { name: 'Bombo, paso 1', exact: true }).click();
  const bloqueado = page.getByRole('link', { name: /Ir a núcleo 3: bloqueado/ });
  await expect(bloqueado).toHaveAttribute('aria-disabled', 'true');
  // aria-disabled makes Playwright wait for it to be enabled; a visitor can still tap it.
  await bloqueado.click({ force: true });
  await expect(page.getByRole('status').filter({ hasText: 'Antes de seguir' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir con la caja', exact: true }).click();
  await page.getByRole('button', { name: 'Seguir con el hi-hat', exact: true }).click();
  await page.getByRole('button', { name: 'Conocer el bajo', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar sin bajo', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar sin melodía', exact: true }).click();
  await page.getByRole('button', { name: 'Escuchar y guardar', exact: true }).click();
  await expect(page.getByText('Al descargarlo se desbloquea el núcleo 3.')).toBeVisible();
  await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Guardar mi beat como audio' }).click(),
  ]);
}

test('el botón al núcleo 3 se habilita recién al descargar el beat', async ({ page }) => {
  await page.goto('/');
  await crearYDescargarBeat(page);
  const abierto = page.getByRole('link', { name: 'Ir a núcleo 3', exact: true });
  await expect(abierto).toHaveAttribute('href', /figma\.com\/proto\/.*node-id=265-167/);
  await expect(page.getByText('Núcleo 3 desbloqueado')).toBeVisible();

  await page.getByRole('button', { name: 'Reiniciar', exact: true }).first().click();
  await page.getByRole('button', { name: 'Empezar un beat nuevo', exact: true }).click();
  await page.getByRole('button', { name: 'Cómo vamos a crear', exact: true }).click();
  await page.getByRole('button', { name: 'Conocer a Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Crear mi primera base', exact: true }).click();
  await expect(page.getByRole('link', { name: /Ir a núcleo 3: bloqueado/ })).toHaveAttribute('href', '#');
});
