import { use } from 'react';
import { Link } from 'react-router';
import { fetchCategories, type CategorySummary } from '../api';
import { chapterStartPage, toRoman } from '../book';
import { Book, Page } from '../components/Book';
import { ChapterProgress, Ornament } from '../components/Bits';
import { chapterStats, markKey, resetProgress, useProgress, type ProgressMap } from '../store';

const answerFramework = [
  'Context',
  'Architecture',
  'Your contribution',
  'Technical decision',
  'Problem',
  'Resolution',
  'Validation',
  'Production consideration',
];

export default function ContentsPage() {
  return (
    <Book loads>
      <ContentsSpread />
    </Book>
  );
}

function ContentsSpread() {
  const categories = use(fetchCategories());
  const progress = useProgress();
  const next = findNextQuestion(categories, progress);
  const hasProgress = Object.keys(progress).length > 0;

  const onReset = () => {
    if (window.confirm('Clear all your “known” and “review” marks?')) resetProgress();
  };

  return (
    <>
      <Page side="left" runningHead="Preface" pageNumber="i" label="Preface">
        <p className="eyebrow">Before you begin</p>
        <h1 className="display">How to use this book</h1>
        <ol className="steps">
          <li>
            <strong>Read the question</strong> on the left-hand page and answer it <em>out loud</em>. Use the timer:
            the sweet spot is 45–75 seconds.
          </li>
          <li>
            <strong>Reveal the model answer</strong> on the right-hand page and compare it with yours, especially the
            key points.
          </li>
          <li>
            <strong>Mark it</strong> as <em>known</em> or <em>review again</em>. Your marks stay in this browser.
          </li>
          <li>
            Switch on <strong>Study mode</strong> when you want to read straight through with every answer showing.
          </li>
        </ol>
        <aside className="margin-note">
          <p className="margin-note__title">For experience questions, answer in this order</p>
          <ol className="framework">
            {answerFramework.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="margin-note__small">
            Be precise about your experience. Don’t claim years you can’t substantiate, and don’t present
            Claude-generated code as unreviewed work of your own.
          </p>
        </aside>
      </Page>

      <Page side="right" runningHead="Contents" pageNumber="ii" label="Table of contents">
        <Ornament />
        <h2 className="display display--center">Contents</h2>
        <ol className="toc">
          {categories.map((category) => {
            const stats = chapterStats(progress, category.slug, category.questionCount);
            return (
              <li key={category.slug} className="toc__chapter">
                <Link to={`/chapter/${category.slug}`} className="toc__link" state={{ turn: 'forward' }}>
                  <span className="toc__numeral">{toRoman(category.order)}</span>
                  <span className="toc__title">
                    {category.title}
                    <small>{category.subtitle}</small>
                  </span>
                  <span className="toc__leader" aria-hidden="true" />
                  <span className="toc__page">{chapterStartPage(category.order, category.questionCount)}</span>
                </Link>
                <ChapterProgress stats={stats} compact />
              </li>
            );
          })}
        </ol>
        <div className="button-row button-row--center">
          {next && (
            <Link
              to={`/chapter/${next.slug}/${next.number}`}
              className="btn btn--primary"
              state={{ turn: 'forward' }}
            >
              {hasProgress ? 'Continue where you left off' : 'Start with question 1'}
            </Link>
          )}
          {hasProgress && (
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Reset progress
            </button>
          )}
        </div>
      </Page>
    </>
  );
}

function findNextQuestion(categories: CategorySummary[], progress: ProgressMap) {
  for (const category of categories) {
    for (let number = 1; number <= category.questionCount; number++) {
      if (!progress[markKey(category.slug, number)]) return { slug: category.slug, number };
    }
  }
  return categories.length ? { slug: categories[0].slug, number: 1 } : null;
}
