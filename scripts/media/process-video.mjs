import { access } from 'node:fs/promises';
import path from 'node:path';
import { mediaConfig } from './config.mjs';
import { ensureParent, runFfmpeg, youkuMosaicFilter } from './lib.mjs';

const production = process.argv.includes('--production');

await access(mediaConfig.source);

const profiles = production
  ? [
      {
        name: 'standard',
        file: mediaConfig.outputs.standard,
        videoFilter: '[clean]setsar=1[out]',
        args: ['-r', '20', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '96k'],
      },
      {
        name: 'low',
        file: mediaConfig.outputs.low,
        videoFilter: '[clean]scale=640:-2,setsar=1[out]',
        args: ['-r', '20', '-c:v', 'libx264', '-preset', 'medium', '-crf', '30', '-c:a', 'aac', '-b:a', '64k'],
      },
    ]
  : [
      {
        name: 'low',
        file: mediaConfig.outputs.low,
        videoFilter: '[clean]scale=640:-2,setsar=1[out]',
        args: ['-r', '20', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '31', '-c:a', 'aac', '-b:a', '64k'],
      },
    ];

for (const profile of profiles) {
  const output = path.join(mediaConfig.publicDir, profile.file);
  await ensureParent(output);
  console.log(`[media] 生成 ${profile.name} 视频：${path.relative(mediaConfig.root, output)}`);
  await runFfmpeg([
    '-y',
    '-i',
    mediaConfig.source,
    '-filter_complex',
    `${youkuMosaicFilter()};${profile.videoFilter}`,
    '-map',
    '[out]',
    '-map',
    '0:a?',
    ...profile.args,
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-map_metadata',
    '-1',
    output,
  ]);
}
