import type { TimedSegment } from '../types/content';
import { SITE } from './site';

const mediaUrl = (filename: string) => `${SITE.mediaBaseUrl.replace(/\/+$/, '')}/${filename}`;

export const MAIN_VIDEO = {
  id: 'yu-chenghui-main',
  sourceId: 'video-main',
  duration: 1219.2667,
  width: 848,
  height: 464,
  frameRate: 19.9997,
  sourcePath: 'docs/IMG_4455.MP4',
  publicSources: {
    standard: mediaUrl('yu-chenghui-shuangshoujian.mp4'),
    lowBandwidth: mediaUrl('yu-chenghui-shuangshoujian-low.mp4'),
    poster: '/media/posters/full-routine.webp',
  },
} as const;

export const MAIN_VIDEO_CHAPTERS: TimedSegment[] = [
  { id: 'history', title: '历史与创传背景', start: 0, end: 110 },
  { id: 'first-full-routine', title: '第一遍整套演练', start: 120, end: 290 },
  { id: 'core-techniques', title: '击、刺、格、洗', start: 290, end: 380 },
  { id: 'grouped-teaching', title: '四段分组教学', start: 380, end: 950 },
  { id: 'full-routine', title: '整套演示', start: 950, end: 1040 },
  { id: 'xingong-koujue', title: '单练行功歌诀', start: 1040, end: 1130 },
  { id: 'jianlun', title: '特点与演练要诀歌（剑论）', start: 1130, end: 1195 },
  { id: 'credits', title: '制作与素材来源', start: 1195, end: 1219.2667 },
];
