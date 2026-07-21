import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const failures = [];
const blockers = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : absolute;
  }));
  return nested.flat();
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function countMatches(value, expression) {
  return Array.from(value.matchAll(expression)).length;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const requiredFiles = [
  'index.html',
  'learn/index.html',
  'techniques/index.html',
  'routine/index.html',
  'routine/actions/action-01/index.html',
  'routine/actions/action-40/index.html',
  'koujue/xingong-koujue/index.html',
  'koujue/jianlun/index.html',
  'person/yu-chenghui/index.html',
  'classics/chaoxian-shifa/index.html',
  'classics/chaoxian-shifa/hengchong/index.html',
  'sources/index.html',
  'robots.txt',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'video-sitemap.xml',
  'llms.txt',
];

for (const relative of requiredFiles) {
  expect(files.includes(path.join(root, ...relative.split('/'))), `缺少发布产物：${relative}`);
}

let jsonLdBlocks = 0;
const canonicalOrigins = new Set();
for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  expect(countMatches(html, /<title>[^<]+<\/title>/g) === 1, `${relative} 应有且仅有一个 title`);
  expect(countMatches(html, /<meta name="description" content="[^"]+">/g) === 1, `${relative} 应有且仅有一个 meta description`);
  expect(countMatches(html, /<h1\b/g) === 1, `${relative} 应有且仅有一个 H1`);
  expect(/<html lang="zh-CN">/.test(html), `${relative} 缺少 lang=zh-CN`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  expect(Boolean(canonical), `${relative} 缺少 canonical`);
  if (canonical) {
    expect(!canonical.includes('?'), `${relative} canonical 不应包含查询参数`);
    canonicalOrigins.add(new URL(canonical).origin);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    jsonLdBlocks += 1;
    try {
      JSON.parse(match[1]);
    } catch {
      failures.push(`${relative} 包含无法解析的 JSON-LD`);
    }
  }
}

expect(htmlFiles.length === 83, `静态 HTML 页面数量应为 83，实际为 ${htmlFiles.length}`);
expect(canonicalOrigins.size === 1, `canonical 来源应唯一，实际为 ${Array.from(canonicalOrigins).join(', ')}`);

const canonicalOrigin = Array.from(canonicalOrigins)[0] ?? '';
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
const sitemapIndex = await readFile(path.join(root, 'sitemap-index.xml'), 'utf8');
const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
const videoSitemap = await readFile(path.join(root, 'video-sitemap.xml'), 'utf8');
const llms = await readFile(path.join(root, 'llms.txt'), 'utf8');

expect(/<sitemapindex\b/.test(sitemapIndex), '内容 sitemap 索引格式不完整');
expect(/<urlset\b/.test(sitemap), '内容 sitemap 格式不完整');
expect(/<video:video>/.test(videoSitemap), '视频 sitemap 未包含视频条目');
expect(videoSitemap.includes('yu-chenghui-shuangshoujian-low.mp4'), '视频 sitemap 未引用发布视频');
expect(llms.includes('朝鲜势法') && llms.includes('人物与资料'), 'llms.txt 缺少核心资料入口');

const localBuild = canonicalOrigin.startsWith('http://localhost') || canonicalOrigin.startsWith('http://127.0.0.1');
if (localBuild) {
  expect(robots.includes('Disallow: /'), '本地构建应阻止搜索引擎索引');
  blockers.push('未配置 PUBLIC_SITE_URL，canonical 仍指向本地且 robots 禁止索引');
} else {
  expect(canonicalOrigin.startsWith('https://'), '公开 canonical 必须使用 HTTPS');
  expect(!robots.includes('Disallow: /'), '公开构建不应全站禁止索引');
  expect(robots.includes('Sitemap:'), '公开 robots.txt 应声明 sitemap');
}

const manifestPath = path.join(root, 'media', 'media-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
expect(manifest.source.includedInPublic === false, '媒体清单必须声明母版不进入 public');
expect(manifest.source.rightsStatus === 'cleared', '教学视频权利状态必须为 cleared');
const lowVideoSource = manifest.video.sources.low.path;
const externalVideo = /^https:\/\//.test(lowVideoSource);
if (!externalVideo) {
  const lowVideoPath = path.join(root, ...lowVideoSource.replace(/^\//, '').split('/'));
  expect(files.includes(lowVideoPath), '发布用低码率视频不存在');
  if (files.includes(lowVideoPath)) {
    expect((await stat(lowVideoPath)).size === manifest.video.sources.low.bytes, '发布视频大小与媒体清单不一致');
  }
}

expect(!files.some((file) => /IMG_4455|docs[\\/]+references|zhihu/i.test(file)), '构建产物包含母版或研究参考资产');
const javascript = (await Promise.all(files.filter((file) => file.endsWith('.js')).map((file) => readFile(file, 'utf8')))).join('\n');
expect(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(javascript), '客户端脚本包含持久化存储调用');

const home = await readFile(path.join(root, 'index.html'), 'utf8');
if (home.includes('来源与授权说明待补充')) blockers.push('PUBLIC_VIDEO_ATTRIBUTION 仍为占位文案');
if (manifest.video.sources.standard.available !== true && !externalVideo) blockers.push('正式清晰度视频或媒体 CDN 尚未配置，仅有低带宽样片');

console.log('[release candidate]', {
  htmlPages: htmlFiles.length,
  jsonLdBlocks,
  canonicalOrigin,
  blockers: blockers.length,
});
for (const blocker of blockers) console.warn(`[blocker] ${blocker}`);
for (const failure of failures) console.error(`[failure] ${failure}`);
if (failures.length) process.exit(1);
