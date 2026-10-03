import type { Category, CategorySummary, Question } from '../api';

const question = (number: number, overrides: Partial<Question> = {}): Question => ({
  number,
  question: `Sample question ${number}?`,
  answer: `Model answer ${number}. `.repeat(10).trim(),
  code: null,
  keyPoints: ['First point', 'Second point', 'Third point'],
  practiceCue: 'Answer in 45–75 seconds.',
  difficulty: 'Foundational',
  tags: ['sample'],
  fromGuide: number === 1,
  ...overrides,
});

export const reactCategory: Category = {
  slug: 'react',
  title: 'React',
  subtitle: 'Components, hooks & modern UI',
  description: 'React fundamentals.',
  order: 1,
  questions: [question(1, { question: 'What is a hook?' }), question(2), question(3, { difficulty: 'Advanced' })],
};

export const summaries: CategorySummary[] = [
  {
    slug: reactCategory.slug,
    title: reactCategory.title,
    subtitle: reactCategory.subtitle,
    description: reactCategory.description,
    order: reactCategory.order,
    questionCount: reactCategory.questions.length,
  },
];

/** Stubs window.fetch with a tiny in-memory version of the API. */
export function stubApi() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

    if (url === '/api/categories') return json(summaries);
    if (url === '/api/categories/react') return json(reactCategory);
    return json({ title: 'Not Found' }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
