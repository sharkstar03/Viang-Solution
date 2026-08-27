import { test, expect } from '@playwright/test';

test.describe('móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'solo el proyecto móvil');

  test('la barra del pulgar está visible con los enlaces correctos', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByRole('navigation', { name: /acciones rápidas/i });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', /wa\.me\/50767340816/);
    await expect(bar.getByRole('link', { name: /llamar/i })).toHaveAttribute('href', /^tel:/);
    await expect(bar.getByRole('link', { name: /cotizar/i })).toHaveAttribute('href', '/#cotizar');
  });

  test('el video del hero JAMÁS se descarga en móvil', async ({ page }) => {
    const videoRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('.mp4')) videoRequests.push(req.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(videoRequests).toHaveLength(0);
  });
});
