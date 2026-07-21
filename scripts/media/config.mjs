import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const mediaConfig = {
  root,
  source: path.join(root, 'docs', 'IMG_4455.MP4'),
  publicDir: path.join(root, 'public', 'media'),
  sourceId: 'video-main',
  videoId: 'yu-chenghui-main',
  duration: 1219.2667,
  frameRate: 19.9997,
  outputs: {
    standard: 'yu-chenghui-shuangshoujian.mp4',
    low: 'yu-chenghui-shuangshoujian-low.mp4',
    manifest: 'media-manifest.json',
  },
  posters: [
    {
      id: 'home',
      time: 365.9,
      file: 'posters/home.webp',
      filterComplex: '[clean]crop=840:460:4:2,scale=1280:700,hqdn3d=1.2:1.0:3:2,unsharp=5:5:0.4:3:3:0,split=2[base][edge];[base]crop=1040:700:240:0[fg];[edge]crop=200:700:40:0,scale=880:700[ext];[ext][fg]hstack=inputs=2[out]',
    },
    { id: 'core-techniques', time: 300, file: 'posters/core-techniques.webp' },
    { id: 'section-1', time: 455, file: 'posters/section-1.webp' },
    { id: 'section-2', time: 655, file: 'posters/section-2.webp' },
    { id: 'section-3', time: 815, file: 'posters/section-3.webp' },
    { id: 'section-4', time: 845, file: 'posters/section-4.webp' },
    { id: 'full-routine', time: 958, file: 'posters/full-routine.webp' },
    { id: 'xingong-koujue', time: 1045, file: 'posters/xingong-koujue.webp' },
    { id: 'jianlun', time: 1132, file: 'posters/jianlun.webp' },
  ],
  keyframes: [
    { id: 'technique-ji', time: 310, file: 'keyframes/technique-ji.webp' },
    { id: 'technique-ci', time: 326, file: 'keyframes/technique-ci.webp' },
    { id: 'technique-ge', time: 343, file: 'keyframes/technique-ge.webp' },
    { id: 'technique-xi', time: 369, file: 'keyframes/technique-xi.webp' },
    { id: 'action-01-start', time: 424, file: 'keyframes/action-01-start.webp' },
  ],
};
