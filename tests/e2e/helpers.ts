import axe from 'axe-core';
import type { Page } from '@playwright/test';

export async function expectNoSeriousA11yViolations(page: Page) {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const axeGlobal = (window as typeof window & { axe: typeof axe }).axe;
    return axeGlobal.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });
  return results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
}

export async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75));
    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await new Promise((resolve) => window.setTimeout(resolve, 25));
    }

    await Promise.all(Array.from(document.images, (image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }));
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}
