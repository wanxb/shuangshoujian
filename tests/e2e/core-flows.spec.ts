import { expect, test } from '@playwright/test';

test('初学者可从首页进入入门与套路', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: '于承惠双手剑' })).toBeVisible();
  await page.getByRole('link', { name: '从基础开始' }).click();
  await expect(page).toHaveURL(/\/learn\/$/);
  await expect(page.getByRole('heading', { level: 1, name: '先把剑、空间与握持准备好' })).toBeVisible();
  await page.getByRole('link', { name: '进入套路' }).click();
  await expect(page).toHaveURL(/\/routine\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('四段');
});

test('动作播放器支持URL定位、镜像、倍速和循环且不持久化', async ({ page, context }) => {
  await page.goto('/routine/actions/action-01/?t=424');
  const video = page.locator('video');
  await expect(video).toBeVisible();
  await expect.poll(
    () => video.evaluate((element: HTMLVideoElement) => Math.floor(element.currentTime)),
    { timeout: 15_000 },
  ).toBe(424);

  const mirror = page.getByRole('button', { name: '镜像' });
  await mirror.click();
  await expect(mirror).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('镜像视角，左右已反转')).toBeVisible();

  await page.getByRole('button', { name: '0.5×' }).click();
  await expect(page.getByRole('button', { name: '0.5×' })).toHaveAttribute('aria-pressed', 'true');
  const loop = page.getByRole('button', { name: '本式循环' });
  await loop.click();
  await expect(loop).toHaveAttribute('aria-pressed', 'true');

  const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }));
  expect(storage).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toEqual([]);
});

test('歌诀可按句定位并保留完整文字降级', async ({ page }) => {
  await page.goto('/koujue/xingong-koujue/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('单练行功歌诀');
  const lineButton = page.getByRole('button', { name: /起手一剑祭苍茫/ });
  await lineButton.click();
  const video = page.locator('video');
  await expect.poll(
    () => video.evaluate((element: HTMLVideoElement) => Math.floor(element.currentTime)),
    { timeout: 15_000 },
  ).toBe(1045);
  await expect(page.locator('#transcription')).toContainText('何去何从任尔量');
});

test('二十法完整显示且四项主要剑法可进入课程', async ({ page }) => {
  await page.goto('/techniques/');
  await expect(page.getByRole('heading', { level: 1, name: '双手剑二十法' })).toBeVisible();
  await expect(page.locator('.methods-grid > li')).toHaveCount(20);
  await expect(page.getByText('抽带云抹提，点崩擦刺击，绞截斩格劈，挑拨挂锉洗。')).toBeVisible();
  await page.getByRole('link', { name: '观看击法视频讲解' }).click();
  await expect(page).toHaveURL(/\/techniques\/ji\/$/);
});

test('朝鲜势法二十四势显示完整图文', async ({ page }) => {
  await page.goto('/classics/chaoxian-shifa/');
  await expect(page.locator('.manual-index li')).toHaveCount(24);
  await expect(page.locator('.manual-index img')).toHaveCount(24);
  await page.getByRole('link', { name: /举鼎势/ }).click();
  await expect(page.locator('.form-plate img')).toHaveAttribute('src', /01-juding\.png$/);
  await expect(page.getByRole('heading', { name: '原文' })).toBeAttached();
  await expect(page.getByRole('heading', { name: '标点' })).toBeAttached();
});
