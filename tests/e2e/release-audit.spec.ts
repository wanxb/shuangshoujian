import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/learn/',
  '/techniques/',
  '/techniques/ji/',
  '/routine/actions/action-01/',
  '/koujue/xingong-koujue/',
  '/person/yu-chenghui/',
  '/classics/chaoxian-shifa/juding/',
  '/classics/chaoxian-shifa/',
  '/sources/',
];

for (const path of pages) {
  test(`关键页面无控制台错误或本地资源失败：${path}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.origin === 'http://127.0.0.1:4321' && response.status() >= 400) {
        errors.push(`${response.status()}: ${url.pathname}`);
      }
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('main')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
