import { useSyncExternalStore } from 'react';

export type Mark = 'known' | 'review';
export type ProgressMap = Record<string, Mark>;

interface LocalStore<T> {
  get: () => T;
  set: (value: T) => void;
  use: () => T;
}

// A tiny localStorage-backed store. Storage can be unavailable (private mode, blocked cookies),
// so every access is guarded and the app keeps working in memory.
function createLocalStore<T>(key: string, fallback: T): LocalStore<T> {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  };

  let value = read();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        value = read();
        listener();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  return {
    get: () => value,
    set: (next) => {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Keep the in-memory value when storage is unavailable.
      }
      notify();
    },
    use: () => useSyncExternalStore(subscribe, () => value, () => fallback),
  };
}

const progressStore = createLocalStore<ProgressMap>('interview-companion:progress:v1', {});
const studyModeStore = createLocalStore<boolean>('interview-companion:study-mode:v1', false);

export const markKey = (slug: string, number: number) => `${slug}:${number}`;

export const useProgress = progressStore.use;

export function setMark(slug: string, number: number, mark: Mark | null) {
  const next = { ...progressStore.get() };
  const key = markKey(slug, number);
  if (mark) next[key] = mark;
  else delete next[key];
  progressStore.set(next);
}

export function resetProgress() {
  progressStore.set({});
}

export interface ChapterStats {
  known: number;
  review: number;
  unseen: number;
  total: number;
}

export function chapterStats(progress: ProgressMap, slug: string, total: number): ChapterStats {
  let known = 0;
  let review = 0;
  for (let n = 1; n <= total; n++) {
    const mark = progress[markKey(slug, n)];
    if (mark === 'known') known++;
    else if (mark === 'review') review++;
  }
  return { known, review, unseen: total - known - review, total };
}

export const useStudyMode = studyModeStore.use;
export const setStudyMode = studyModeStore.set;
