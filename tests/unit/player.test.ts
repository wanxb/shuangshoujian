import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { activeSegmentIndex, formatPlayerTime, loopSeekTarget, parseInitialTime } from '../../src/utils/player';

const segments = [
  { id: 'one', title: '第一式', start: 10, end: 15 },
  { id: 'two', title: '第二式', start: 20, end: 25 },
];

describe('player state utilities', () => {
  it('parses and clamps URL time without persisting it', () => {
    expect(parseInitialTime('?t=12.5', 20)).toBe(12.5);
    expect(parseInitialTime('?t=30', 20)).toBe(20);
    expect(parseInitialTime('?t=-1', 20)).toBeNull();
  });

  it('finds the active segment and computes loop boundaries', () => {
    expect(activeSegmentIndex(segments, 12)).toBe(0);
    expect(activeSegmentIndex(segments, 18)).toBe(-1);
    expect(loopSeekTarget({ mode: 'segment', currentTime: 14.98, segment: segments[0], loopStart: null, loopEnd: null })).toBe(10);
    expect(loopSeekTarget({ mode: 'ab', currentTime: 13, loopStart: 11, loopEnd: 13 })).toBe(11);
  });

  it('formats stable player times', () => {
    expect(formatPlayerTime(65.9)).toBe('01:05');
    expect(formatPlayerTime(3661)).toBe('1:01:01');
  });

  it('contains no persistence or write APIs', async () => {
    const source = await readFile(path.join(process.cwd(), 'src', 'components', 'learning', 'LessonPlayer.tsx'), 'utf8');
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\s*\(/);
  });
});
