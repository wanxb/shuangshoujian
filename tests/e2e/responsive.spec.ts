import { expect, test } from '@playwright/test';
import { loadLazyImages } from './helpers';

const viewports = [
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'wide-1440', width: 1440, height: 900 },
  { name: 'phone-landscape', width: 812, height: 375 },
];

for (const viewport of viewports) {
  test(`首页响应式截图：${viewport.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await loadLazyImages(page);
    await page.screenshot({ path: `.tmp/visual-qa/home-${viewport.name}.png`, fullPage: true });
  });
}

test('手机动作页与播放器无水平溢出', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/routine/actions/action-01/');
  await expect(page.locator('.lesson-player')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await loadLazyImages(page);
  await page.screenshot({ path: '.tmp/visual-qa/action-01-mobile.png', fullPage: true });
});

for (const path of ['/techniques/', '/classics/chaoxian-shifa/']) {
  test(`${path} 在桌面与手机均无水平溢出`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await loadLazyImages(page);
    const label = path.includes('techniques') ? 'techniques' : 'chaoxian-shifa';
    await page.screenshot({ path: `.tmp/visual-qa/${label}-${testInfo.project.name}.png`, fullPage: true });
  });
}
