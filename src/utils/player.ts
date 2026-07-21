export type LoopMode = 'off' | 'segment' | 'ab';

export interface PlayerSegment {
  id: string;
  title: string;
  start: number;
  end: number;
}

export function parseInitialTime(search: string, duration: number) {
  const raw = new URLSearchParams(search).get('t');
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.min(parsed, duration);
}

export function activeSegmentIndex(segments: PlayerSegment[], currentTime: number) {
  return segments.findIndex((segment) => currentTime >= segment.start && currentTime < segment.end);
}

export function loopSeekTarget(input: {
  mode: LoopMode;
  currentTime: number;
  segment?: PlayerSegment;
  loopStart: number | null;
  loopEnd: number | null;
}) {
  const { mode, currentTime, segment, loopStart, loopEnd } = input;
  if (mode === 'segment' && segment && currentTime >= segment.end - 0.03) return segment.start;
  if (mode === 'ab' && loopStart !== null && loopEnd !== null && currentTime >= loopEnd - 0.03) return loopStart;
  return null;
}

export function formatPlayerTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '00:00';
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  const base = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return hours ? `${hours}:${base}` : base;
}
