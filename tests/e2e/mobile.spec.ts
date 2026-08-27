import { test, expect } from '@playwright/test';

test.describe('móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'solo el proyecto móvil');

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
