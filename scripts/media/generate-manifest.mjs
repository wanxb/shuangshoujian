import { access, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mediaConfig } from './config.mjs';
import { ensureParent } from './lib.mjs';

async function describe(file, extra = {}) {
  const absolute = path.join(mediaConfig.publicDir, file);
  try {
    await access(absolute);
    const info = await stat(absolute);
    return { path: `/media/${file.replaceAll('\\', '/')}`, bytes: info.size, ...extra };
  } catch {
    return { path: `/media/${file.replaceAll('\\', '/')}`, available: false, ...extra };
  }
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: {
    id: mediaConfig.sourceId,
    repositoryPath: 'docs/IMG_4455.MP4',
    includedInPublic: false,
    rightsStatus: 'cleared',
  },
  video: {
    id: mediaConfig.videoId,
    duration: mediaConfig.duration,
    frameRate: mediaConfig.frameRate,
    processing: {
      standard: '848px H.264 CRF 18, 20fps, AAC 96k, yuv420p, square pixels, faststart, top-right YOUKU mosaic',
      low: '640px H.264 CRF 30/31, 20fps, AAC 64k, yuv420p, square pixels, faststart, top-right YOUKU mosaic',
    },
    sources: {
      standard: await describe(mediaConfig.outputs.standard),
      low: await describe(mediaConfig.outputs.low),
    },
  },
  posters: await Promise.all(mediaConfig.posters.map(async (item) => ({ id: item.id, time: item.time, ...(await describe(item.file)) }))),
  keyframes: await Promise.all(mediaConfig.keyframes.map(async (item) => ({ id: item.id, time: item.time, ...(await describe(item.file)) }))),
};

const output = path.join(mediaConfig.publicDir, mediaConfig.outputs.manifest);
await ensureParent(output);
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`[media] 生成清单：${path.relative(mediaConfig.root, output)}`);
