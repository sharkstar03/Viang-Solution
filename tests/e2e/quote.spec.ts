import { test, expect } from '@playwright/test';

test.describe('camino del dinero: cotización', () => {
  test('completa los 3 pasos y ve la confirmación', async ({ page }) => {
    // Sin DB ni SMTP reales: interceptamos el endpoint.
    await page.route('**/api/contact', (route) =>
      route.fulfill({ json: { ok: true } }),
    );

    await page.goto('/#cotizar');
    await page.getByRole('button', { name: /limpieza especializada/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();

    await page.getByLabel(/mensaje/i).fill('Necesito restaurar las alfombras de mis oficinas.');
    await page.getByRole('button', { name: /continuar/i }).click();

    await page.getByLabel(/nombre/i).fill('María Pérez');
    await page.getByLabel(/correo/i).fill('maria@ejemplo.com');
    await page.getByLabel(/teléfono/i).fill('6000-0000');

    await expect(page.getByRole('button', { name: /enviar/i })).toBeEnabled();
    await page.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByText(/recibimos su solicitud/i)).toBeVisible();
  });

  test('el borrador sobrevive una recarga a mitad del paso 2', async ({ page }) => {
    await page.goto('/#cotizar');
    await page.getByRole('button', { name: /tratamientos e instalación/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByLabel(/mensaje/i).fill('Texto que no debe perderse jamás');

    await page.reload();
    await page.getByRole('button', { name: /continuar/i }).first().click();
    await expect(page.getByLabel(/mensaje/i)).toHaveValue('Texto que no debe perderse jamás');
  });
});
