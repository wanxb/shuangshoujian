import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';

export const resolveFfmpeg = () => process.env.FFMPEG_PATH || ffmpegStatic;

export function youkuMosaicFilter(input = '0:v', output = 'clean') {
  return `[${input}]split=2[base][wm];[wm]crop=112:40:iw-116:16,pixelize=w=7:h=7[px];[base][px]overlay=x=W-w-4:y=16[${output}]`;
}

export async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function runFfmpeg(args) {
  const executable = resolveFfmpeg();
  if (!executable) {
    throw new Error('未找到 ffmpeg。请安装依赖或设置 FFMPEG_PATH。');
  }

  await new Promise((resolve, reject) => {
    const child = spawn(executable, ['-hide_banner', '-loglevel', 'warning', ...args], {
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg 退出码：${code}`));
    });
  });
}

export function toVttTime(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const secs = Math.floor((milliseconds % 60_000) / 1000);
  const millis = milliseconds % 1000;
  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, '0'))
    .join(':') + `.${String(millis).padStart(3, '0')}`;
}
