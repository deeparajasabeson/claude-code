import { useEffect, useState } from 'react';
import type { Difficulty } from '../api';
import type { ChapterStats, Mark } from '../store';
import { CheckIcon, ReviewIcon, TimerIcon } from './Icons';

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <span className={`badge badge--${level.toLowerCase()}`}>{level}</span>;
}

export function StatusMark({ mark }: { mark: Mark | undefined }) {
  if (mark === 'known') {
    return (
      <span className="status status--known" title="Known">
        <CheckIcon width={14} height={14} />
        <span className="sr-only">Known</span>
      </span>
    );
  }
  if (mark === 'review') {
    return (
      <span className="status status--review" title="Review again">
        <ReviewIcon width={14} height={14} />
        <span className="sr-only">Marked for review</span>
      </span>
    );
  }
  return <span className="status status--unseen" aria-hidden="true" />;
}

export function ChapterProgress({ stats, compact = false }: { stats: ChapterStats; compact?: boolean }) {
  const pct = (n: number) => `${(n / stats.total) * 100}%`;
  return (
    <div className={compact ? 'progress progress--compact' : 'progress'}>
      <div
        className="progress__bar"
        role="img"
        aria-label={`${stats.known} known, ${stats.review} to review, ${stats.unseen} not started`}
      >
        <span className="progress__known" style={{ width: pct(stats.known) }} />
        <span className="progress__review" style={{ width: pct(stats.review) }} />
      </div>
      {!compact && (
        <dl className="progress__legend">
          <div>
            <dt>
              <span className="dot dot--known" /> Known
            </dt>
            <dd>{stats.known}</dd>
          </div>
          <div>
            <dt>
              <span className="dot dot--review" /> To review
            </dt>
            <dd>{stats.review}</dd>
          </div>
          <div>
            <dt>
              <span className="dot dot--unseen" /> Not started
            </dt>
            <dd>{stats.unseen}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

const TARGET_MIN = 45;
const TARGET_MAX = 75;
const SCALE = 90;

/** Rehearsal timer for the guide's "answer in 45–75 seconds" practice cue. */
export function PracticeTimer() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const id = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 250);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const running = startedAt !== null;
  const seconds = Math.floor(elapsed);
  const phase = seconds < TARGET_MIN ? 'warming' : seconds <= TARGET_MAX ? 'sweet' : 'over';
  const message = !running && seconds === 0
    ? 'Answer out loud, aiming for 45–75 seconds.'
    : phase === 'warming'
      ? 'Keep going: build up to an example.'
      : phase === 'sweet'
        ? 'Good length. Land your example and stop.'
        : 'Time to wrap up. Interviewers want it concise.';

  const toggle = () => {
    if (running) {
      setStartedAt(null);
    } else {
      setElapsed(0);
      setStartedAt(Date.now());
    }
  };

  return (
    <div className={`timer timer--${running || seconds > 0 ? phase : 'idle'}`}>
      <button type="button" className="btn btn--ghost btn--small" onClick={toggle}>
        <TimerIcon width={16} height={16} />
        {running ? 'Stop' : seconds > 0 ? 'Restart timer' : 'Start practice timer'}
      </button>
      <div className="timer__readout">
        <span className="timer__time" aria-live="off">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </span>
        <span className="timer__message" aria-live="polite">
          {message}
        </span>
      </div>
      <div className="timer__track" aria-hidden="true">
        <span
          className="timer__zone"
          style={{ left: `${(TARGET_MIN / SCALE) * 100}%`, width: `${((TARGET_MAX - TARGET_MIN) / SCALE) * 100}%` }}
        />
        <span className="timer__fill" style={{ width: `${Math.min(elapsed / SCALE, 1) * 100}%` }} />
      </div>
    </div>
  );
}

export function Ornament() {
  return (
    <svg className="ornament" viewBox="0 0 160 16" aria-hidden="true">
      <path d="M0 8h64M96 8h64" stroke="currentColor" strokeWidth="1" />
      <path d="M80 2l6 6-6 6-6-6z" fill="currentColor" />
      <circle cx="68" cy="8" r="1.6" fill="currentColor" />
      <circle cx="92" cy="8" r="1.6" fill="currentColor" />
    </svg>
  );
}
