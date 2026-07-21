import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers';

const pages = [
  '/',
  '/learn/',
  '/techniques/',
  '/techniques/ji/',
  '/routine/actions/action-01/',
  '/koujue/xingong-koujue/',
  '/classics/chaoxian-shifa/juding/',
  '/classics/chaoxian-shifa/',
  '/sources/',
];

for (const path of pages) {
  test(`关键页面无严重无障碍问题：${path}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop');
    await page.goto(path);
    await page.locator('main').waitFor();
    expect(await expectNoSeriousA11yViolations(page)).toEqual([]);
  });
}

test('键盘焦点可从跳转链接进入正文', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到正文' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
