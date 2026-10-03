export type Difficulty = 'Foundational' | 'Intermediate' | 'Advanced';

export interface Question {
  number: number;
  question: string;
  answer: string;
  code: string | null;
  keyPoints: string[];
  practiceCue: string;
  difficulty: Difficulty;
  tags: string[];
  fromGuide: boolean;
}

export interface CategorySummary {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  questionCount: number;
}

export interface Category extends Omit<CategorySummary, 'questionCount'> {
  questions: Question[];
}

export interface SearchResult {
  categorySlug: string;
  categoryTitle: string;
  question: Question;
}

export class NotFoundError extends Error {
  constructor(url: string) {
    super(`Nothing was found at ${url}.`);
    this.name = 'NotFoundError';
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (response.status === 404) throw new NotFoundError(url);
  if (!response.ok) throw new Error(`The library is closed right now (HTTP ${response.status}).`);
  return (await response.json()) as T;
}

// Promises are cached so React's use() sees the same (already settled) promise on re-render,
// which also makes page turns within a chapter instant. Failed requests are evicted so retry works.
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = load().catch((error: unknown) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, promise);
  }
  return promise;
}

export const fetchCategories = () =>
  cached('categories', () => getJson<CategorySummary[]>('/api/categories'));

export const fetchCategory = (slug: string) =>
  cached(`category:${slug.toLowerCase()}`, () =>
    getJson<Category>(`/api/categories/${encodeURIComponent(slug)}`),
  );

export const searchQuestions = (term: string) =>
  cached(`search:${term.trim().toLowerCase()}`, () =>
    getJson<SearchResult[]>(`/api/search?q=${encodeURIComponent(term.trim())}`),
  );

export function clearApiCache() {
  cache.clear();
}
