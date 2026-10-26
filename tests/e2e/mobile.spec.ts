import { test, expect } from '@playwright/test';

test.describe('móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'solo el proyecto móvil');

  test('la portada ofrece WhatsApp y cotización sin descargar ningún video', async ({ page }) => {
    // El hero es una imagen estática por decisión del cliente: ningún .mp4 debe viajar.
    const videoRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('.mp4')) videoRequests.push(req.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(videoRequests).toHaveLength(0);

    const quote = page.getByRole('link', { name: /cotice sin compromiso/i }).first();
    await expect(quote).toBeVisible();
    await expect(quote).toHaveAttribute('href', /wa\.me\/\d+/);
    await expect(page.getByRole('link', { name: /ver servicios/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /^whatsapp$/i })).toBeVisible();
  });

  test('el menú móvil abre y muestra la navegación', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /abrir menú/i }).click();
    const menu = page.getByRole('navigation', { name: /menú móvil/i });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: /servicios/i })).toBeVisible();
  });
});
