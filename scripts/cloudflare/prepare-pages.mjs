import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL?.trim() ?? '';
const videoFiles = {
  standard: 'yu-chenghui-shuangshoujian.mp4',
  low: 'yu-chenghui-shuangshoujian-low.mp4',
};

let mediaBase;
try {
  mediaBase = new URL(mediaBaseUrl);
  if (mediaBase.protocol !== 'https:') throw new Error('not https');
} catch {
  console.error('[cloudflare] PUBLIC_MEDIA_BASE_URL 必须是 R2 自定义域名的 HTTPS URL');
  process.exit(1);
}

const dist = path.resolve('dist');
const manifestPath = path.join(dist, 'media', 'media-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

for (const [profile, videoFile] of Object.entries(videoFiles)) {
  manifest.video.sources[profile].path = new URL(videoFile, `${mediaBase.toString().replace(/\/+$/, '')}/`).toString();
  await rm(path.join(dist, 'media', videoFile), { force: true });
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`[cloudflare] Pages 构建已移除视频；播放器优先使用 ${manifest.video.sources.standard.path}`);
