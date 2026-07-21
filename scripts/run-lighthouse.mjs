import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/';
const outputPath = path.resolve(process.argv[3] ?? '.tmp/lighthouse-home.json');
const profilePath = path.resolve('.tmp/lighthouse-profile');
const port = Number(process.env.LIGHTHOUSE_CHROME_PORT ?? 9223);
const chromePath = process.env.LIGHTHOUSE_CHROME_PATH
  ?? path.join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe');

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(profilePath, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  'about:blank',
], { stdio: 'ignore' });

async function waitForChrome() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome has not opened the debugging port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Chrome debugging port ${port} did not become ready`);
}

try {
  await waitForChrome();
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'silent',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  if (!result) throw new Error('Lighthouse returned no result');
  await writeFile(outputPath, result.report);

  const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([id, category]) => [
    id,
    Math.round((category.score ?? 0) * 100),
  ]));
  const metrics = {
    lcp: result.lhr.audits['largest-contentful-paint'].displayValue,
    tbt: result.lhr.audits['total-blocking-time'].displayValue,
    cls: result.lhr.audits['cumulative-layout-shift'].displayValue,
  };
  console.log('[lighthouse]', { scores, metrics, outputPath });
} finally {
  chrome.kill();
}
