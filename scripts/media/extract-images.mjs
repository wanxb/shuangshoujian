import path from 'node:path';
import { mediaConfig } from './config.mjs';
import { ensureParent, runFfmpeg, youkuMosaicFilter } from './lib.mjs';

for (const item of [...mediaConfig.posters, ...mediaConfig.keyframes]) {
  const output = path.join(mediaConfig.publicDir, item.file);
  const imageFilter = item.filterComplex
    ? `${youkuMosaicFilter()};${item.filterComplex}`
    : `${youkuMosaicFilter()};[clean]scale=848:-2[out]`;
  await ensureParent(output);
  await runFfmpeg([
    '-y',
    '-ss',
    String(item.time),
    '-i',
    mediaConfig.source,
    '-frames:v',
    '1',
    '-filter_complex',
    imageFilter,
    '-map',
    '[out]',
    '-c:v',
    'libwebp',
    '-quality',
    '82',
    output,
  ]);
  console.log(`[media] 抽帧 ${item.id}：${path.relative(mediaConfig.root, output)}`);
}
