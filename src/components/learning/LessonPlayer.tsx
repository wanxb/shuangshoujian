import {
  ChevronLeft,
  ChevronRight,
  Expand,
  FlipHorizontal2,
  Pause,
  Play,
  Repeat2,
  RotateCcw,
  StepBack,
  StepForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  activeSegmentIndex,
  formatPlayerTime,
  loopSeekTarget,
  parseInitialTime,
  type LoopMode,
  type PlayerSegment,
} from '../../utils/player';
import './LessonPlayer.css';

interface Props {
  title: string;
  sources: { standard?: string; lowBandwidth: string };
  poster: string;
  segments: PlayerSegment[];
  initialSegmentId?: string;
  frameRate?: number;
  showSegmentList?: boolean;
  segmentListLabel?: string;
}

const PLAYBACK_RATES = [0.5, 0.75, 1] as const;

export default function LessonPlayer({
  title,
  sources,
  poster,
  segments,
  initialSegmentId,
  frameRate = 20,
  showSegmentList = false,
  segmentListLabel = '章节目录',
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const initializedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState<(typeof PLAYBACK_RATES)[number]>(1);
  const [mirrored, setMirrored] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [loopMode, setLoopMode] = useState<LoopMode>('off');
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(initialSegmentId ?? null);

  const segmentIndex = useMemo(
    () => activeSegmentIndex(segments, currentTime),
    [segments, currentTime],
  );
  const activeSegment = segmentIndex >= 0 ? segments[segmentIndex] : undefined;
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || duration || Number.MAX_SAFE_INTEGER));
    setCurrentTime(video.currentTime);
  }, [duration]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setMessage('浏览器未能开始播放，请再次点击播放。');
      }
    } else {
      video.pause();
    }
  }, []);

  const goToSegment = useCallback((index: number) => {
    const segment = segments[index];
    if (!segment) return;
    seek(segment.start);
    setMessage(`已定位到：${segment.title}`);
  }, [seek, segments]);

  const stepFrame = useCallback((direction: -1 | 1) => {
    videoRef.current?.pause();
    seek(currentTime + direction / frameRate);
  }, [currentTime, frameRate, seek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
  }, [rate]);

  const initializeVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || initializedRef.current || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    initializedRef.current = true;
    setDuration(video.duration);
    const urlTime = parseInitialTime(window.location.search, video.duration);
    const initialSegment = segments.find((segment) => segment.id === initialSegmentId);
    seek(urlTime ?? initialSegment?.start ?? 0);
  }, [initialSegmentId, seek, segments]);

  useEffect(() => {
    initializeVideo();
  }, [initializeVideo]);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const index = activeSegmentIndex(segments, video.currentTime);
    const target = loopSeekTarget({
      mode: loopMode,
      currentTime: video.currentTime,
      segment: loopMode === 'segment' ? (selectedSegment ?? activeSegment) : (index >= 0 ? segments[index] : activeSegment),
      loopStart,
      loopEnd,
    });
    if (target !== null) {
      video.currentTime = target;
      return;
    }
    setCurrentTime(video.currentTime);
    if (index >= 0 && loopMode !== 'segment') setSelectedSegmentId(segments[index].id);
  };

  const setPointA = () => {
    setLoopStart(currentTime);
    if (loopEnd !== null && loopEnd <= currentTime) setLoopEnd(null);
    setLoopMode('off');
    setMessage(`A 点已设在 ${formatPlayerTime(currentTime)}`);
  };

  const setPointB = () => {
    if (loopStart === null) {
      setMessage('请先设置 A 点。');
      return;
    }
    if (currentTime <= loopStart) {
      setMessage('B 点需要位于 A 点之后。');
      return;
    }
    setLoopEnd(currentTime);
    setLoopMode('ab');
    setMessage(`A/B 循环：${formatPlayerTime(loopStart)}–${formatPlayerTime(currentTime)}`);
  };

  const clearLoop = () => {
    setLoopMode('off');
    setLoopStart(null);
    setLoopEnd(null);
    setMessage('循环区间已清除。');
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    if (key === 'k') togglePlay();
    else if (key === 'j') seek(currentTime - 5);
    else if (key === 'l') seek(currentTime + 5);
    else if (key === ',') stepFrame(-1);
    else if (key === '.') stepFrame(1);
    else if (key === 'm') setMirrored((value) => !value);
    else return;
    event.preventDefault();
  };

  return (
    <div
      className="lesson-player"
      ref={shellRef}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label={`${title}学习播放器`}
    >
      {mirrored && <div className="lesson-player__mirror-notice">镜像视角，左右已反转</div>}
      <div className={`lesson-player__stage${mirrored ? ' is-mirrored' : ''}`}>
        {!failed ? (
          <video
            ref={videoRef}
            poster={poster}
            preload="metadata"
            playsInline
            muted={muted}
          onLoadedMetadata={initializeVideo}
            onTimeUpdate={onTimeUpdate}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)}
          >
            {sources.standard && <source src={sources.standard} type="video/mp4" />}
            <source src={sources.lowBandwidth} type="video/mp4" />
          </video>
        ) : (
          <div className="lesson-player__error" role="alert">
            <strong>视频暂时无法加载</strong>
            <p>本页的章节、文字稿和动作说明仍可继续阅读。</p>
            <a href={sources.lowBandwidth}>打开低带宽视频文件</a>
          </div>
        )}
      </div>

      <div className="lesson-player__primary-controls">
        <button type="button" className="icon-button icon-button--primary" onClick={togglePlay} aria-label={playing ? '暂停' : '播放'} title={playing ? '暂停' : '播放'}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button type="button" className="icon-button" onClick={() => goToSegment(segmentIndex - 1)} disabled={segmentIndex <= 0} aria-label="上一个动作" title="上一个动作">
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={() => goToSegment(segmentIndex + 1)} disabled={segmentIndex < 0 || segmentIndex >= segments.length - 1} aria-label="下一个动作" title="下一个动作">
          <ChevronRight aria-hidden="true" />
        </button>
        <label className="lesson-player__timeline">
          <span className="visually-hidden">视频进度</span>
          <input type="range" min="0" max={duration || 0} step="0.05" value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.target.value))} />
        </label>
        <output className="lesson-player__time" aria-label="当前播放时间">
          {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
        </output>
        <button type="button" className="icon-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? '取消静音' : '静音'} title={muted ? '取消静音' : '静音'}>
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
        <label className="lesson-player__volume">
          <span className="visually-hidden">音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(event) => {
              const value = Number(event.target.value);
              setVolume(value);
              setMuted(value === 0);
              if (videoRef.current) videoRef.current.volume = value;
            }}
          />
        </label>
        <button type="button" className="icon-button" onClick={() => shellRef.current?.requestFullscreen()} aria-label="全屏" title="全屏">
          <Expand aria-hidden="true" />
        </button>
      </div>

      <div className="lesson-player__learning-controls">
        <fieldset className="segmented-control">
          <legend>速度</legend>
          {PLAYBACK_RATES.map((value) => (
            <button key={value} type="button" aria-pressed={rate === value} onClick={() => setRate(value)}>{value}×</button>
          ))}
        </fieldset>
        <div className="lesson-player__tool-group" aria-label="逐帧控制">
          <button type="button" className="tool-button" onClick={() => stepFrame(-1)} title="后退一帧"><StepBack aria-hidden="true" /><span>一帧</span></button>
          <button type="button" className="tool-button" onClick={() => stepFrame(1)} title="前进一帧"><StepForward aria-hidden="true" /><span>一帧</span></button>
        </div>
        <button type="button" className="tool-button" aria-pressed={mirrored} onClick={() => setMirrored((value) => !value)}>
          <FlipHorizontal2 aria-hidden="true" /><span>镜像</span>
        </button>
        <button
          type="button"
          className="tool-button"
          aria-pressed={loopMode === 'segment'}
          onClick={() => setLoopMode((mode) => mode === 'segment' ? 'off' : 'segment')}
          disabled={!activeSegment}
        >
          <Repeat2 aria-hidden="true" /><span>本式循环</span>
        </button>
        <div className="lesson-player__ab-controls" aria-label="A/B 循环">
          <button type="button" onClick={setPointA}>设 A</button>
          <button type="button" onClick={setPointB}>设 B</button>
          <button type="button" className="icon-button" onClick={clearLoop} disabled={loopStart === null && loopEnd === null} aria-label="清除 A/B 循环" title="清除 A/B 循环">
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="lesson-player__status">
        <span>{activeSegment ? `当前：${activeSegment.title}` : '当前未进入动作区间'}</span>
        <span aria-live="polite">{message}</span>
      </div>
      {showSegmentList && (
        <div className="lesson-player__segment-list" aria-label={segmentListLabel}>
          <ol>
            {segments.map((segment) => {
              const isActive = currentTime >= segment.start && currentTime < segment.end;
              return (
                <li key={segment.id} className={isActive ? 'is-active' : undefined}>
                  <button
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                      setSelectedSegmentId(segment.id);
                      seek(segment.start);
                      setMessage(`已定位到：${segment.title}`);
                    }}
                  >
                    <span>{formatPlayerTime(segment.start)}</span>
                    <strong>{segment.title}</strong>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
