import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mediaBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL?.trim() ?? '';
const videoFile = 'yu-chenghui-shuangshoujian-low.mp4';

let mediaBase;
try {
  mediaBase = new URL(mediaBaseUrl);
  if (mediaBase.protocol !== 'https:') throw new Error('not https');
} catch {
  console.error('[cloudflare] PUBLIC_MEDIA_BASE_URL 必须是 R2 自定义域名的 HTTPS URL');
  process.exit(1);
}

const dist = path.resolve('dist');
const distVideo = path.join(dist, 'media', videoFile);
const manifestPath = path.join(dist, 'media', 'media-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

manifest.video.sources.low.path = new URL(videoFile, `${mediaBase.toString().replace(/\/+$/, '')}/`).toString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await rm(distVideo, { force: true });

console.log(`[cloudflare] Pages 构建已移除视频；播放器使用 ${manifest.video.sources.low.path}`);
