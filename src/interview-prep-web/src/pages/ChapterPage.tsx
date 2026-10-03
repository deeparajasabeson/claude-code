import { use, useState } from 'react';
import { Link, useParams } from 'react-router';
import { fetchCategory } from '../api';
import { chapterStartPage, toRoman } from '../book';
import { Book, Page } from '../components/Book';
import { ChapterProgress, DifficultyBadge, Ornament, StatusMark } from '../components/Bits';
import { chapterStats, markKey, useProgress } from '../store';

type Filter = 'all' | 'review' | 'unseen' | 'known';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unseen', label: 'Not started' },
  { id: 'review', label: 'To review' },
  { id: 'known', label: 'Known' },
];

export default function ChapterPage() {
  const { slug = '' } = useParams();
  return (
    <Book loads>
      <ChapterSpread slug={slug} />
    </Book>
  );
}

function ChapterSpread({ slug }: { slug: string }) {
  const category = use(fetchCategory(slug));
  const progress = useProgress();
  const [filter, setFilter] = useState<Filter>('all');

  const total = category.questions.length;
  const stats = chapterStats(progress, category.slug, total);
  const firstPage = chapterStartPage(category.order, total);
  const firstUnseen = category.questions.find((q) => !progress[markKey(category.slug, q.number)]);
  const firstReview = category.questions.find((q) => progress[markKey(category.slug, q.number)] === 'review');

  const visible = category.questions.filter((q) => {
    const mark = progress[markKey(category.slug, q.number)];
    if (filter === 'all') return true;
    if (filter === 'unseen') return !mark;
    return mark === filter;
  });

  return (
    <>
      <Page side="left" className="page--opener" pageNumber={firstPage} label={`Chapter ${category.order}`}>
        <p className="chapter-numeral" aria-hidden="true">
          {toRoman(category.order)}
        </p>
        <p className="eyebrow eyebrow--center">Chapter {toRoman(category.order)}</p>
        <h1 className="display display--chapter">{category.title}</h1>
        <p className="chapter-subtitle">{category.subtitle}</p>
        <Ornament />
        <p className="chapter-description">{category.description}</p>
        <ChapterProgress stats={stats} />
        <div className="button-row button-row--center">
          <Link
            to={`/chapter/${category.slug}/${firstUnseen?.number ?? 1}`}
            state={{ turn: 'forward' }}
            className="btn btn--primary"
          >
            {stats.unseen === total ? 'Begin the chapter' : firstUnseen ? 'Continue reading' : 'Read it again'}
          </Link>
          {firstReview && (
            <Link
              to={`/chapter/${category.slug}/${firstReview.number}`}
              state={{ turn: 'forward' }}
              className="btn btn--ghost"
            >
              Review marked ({stats.review})
            </Link>
          )}
        </div>
      </Page>

      <Page
        side="right"
        runningHead={`Chapter ${toRoman(category.order)} · In this chapter`}
        pageNumber={firstPage + 1}
        label="Questions in this chapter"
      >
        <div className="chips" role="group" aria-label="Filter questions">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="empty">No questions match this filter yet.</p>
        ) : (
          <ol className="question-list">
            {visible.map((q) => (
              <li key={q.number}>
                <Link to={`/chapter/${category.slug}/${q.number}`} state={{ turn: 'forward' }}>
                  <span className="question-list__number">{q.number}</span>
                  <span className="question-list__text">{q.question}</span>
                  <span className="question-list__meta">
                    <DifficultyBadge level={q.difficulty} />
                    <StatusMark mark={progress[markKey(category.slug, q.number)]} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Page>
    </>
  );
}
