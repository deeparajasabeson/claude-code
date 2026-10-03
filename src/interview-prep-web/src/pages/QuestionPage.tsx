import { use, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { fetchCategories, fetchCategory, NotFoundError } from '../api';
import { questionPages, toRoman, type TurnDirection } from '../book';
import { Book, Page } from '../components/Book';
import { DifficultyBadge, PracticeTimer } from '../components/Bits';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, EyeIcon, QuillIcon, ReviewIcon } from '../components/Icons';
import { markKey, setMark, useProgress, useStudyMode, type Mark } from '../store';

export default function QuestionPage() {
  const { slug = '', number = '' } = useParams();
  return (
    <Book loads>
      <QuestionSpread slug={slug} number={Number(number)} />
    </Book>
  );
}

interface Target {
  to: string;
  label: string;
}

function QuestionSpread({ slug, number }: { slug: string; number: number }) {
  // Start both requests before suspending on either, so they load in parallel.
  const categoryPromise = fetchCategory(slug);
  const categoriesPromise = fetchCategories();
  const category = use(categoryPromise);
  const categories = use(categoriesPromise);

  const navigate = useNavigate();
  const progress = useProgress();
  const studyMode = useStudyMode();
  const [revealed, setRevealed] = useState(false);
  const showAnswer = revealed || studyMode;
  const mark = progress[markKey(category.slug, number)];

  const total = category.questions.length;
  const pages = questionPages(category.order, number, total);
  const nextChapter = categories.find((c) => c.order === category.order + 1);

  const previous: Target =
    number > 1
      ? { to: `/chapter/${category.slug}/${number - 1}`, label: `Question ${number - 1}` }
      : { to: `/chapter/${category.slug}`, label: 'Chapter opening' };
  const next: Target =
    number < total
      ? { to: `/chapter/${category.slug}/${number + 1}`, label: `Question ${number + 1}` }
      : nextChapter
        ? { to: `/chapter/${nextChapter.slug}`, label: `Chapter ${toRoman(nextChapter.order)}: ${nextChapter.title}` }
        : { to: '/contents', label: 'Back to contents' };

  useEffect(() => {
    const turn = (to: string, direction: TurnDirection) => navigate(to, { state: { turn: direction } });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key === 'ArrowRight') turn(next.to, 'forward');
      else if (event.key === 'ArrowLeft') turn(previous.to, 'back');
      else if (event.key === 'r' || event.key === 'R') setRevealed((value) => !value);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, next.to, previous.to]);

  const question = category.questions.find((q) => q.number === number);
  if (!question) throw new NotFoundError(`/chapter/${slug}/${number}`);

  const rate = (value: Mark) => setMark(category.slug, number, mark === value ? null : value);

  return (
    <>
      <Page
        side="left"
        runningHead={
          <Link to={`/chapter/${category.slug}`}>
            Chapter {toRoman(category.order)} · {category.title}
          </Link>
        }
        pageNumber={pages.left}
        label="Question"
        footer={
          <Link to={previous.to} state={{ turn: 'back' }} className="turn turn--back" aria-label={`Previous: ${previous.label}`}>
            <ArrowLeftIcon />
            <span>{previous.label}</span>
          </Link>
        }
      >
        <div className="question-meta">
          <span className="eyebrow">
            Question {number} <span className="muted">of {total}</span>
          </span>
          <DifficultyBadge level={question.difficulty} />
          {question.fromGuide && (
            <span className="badge badge--guide" title="This model answer comes from the practice guide">
              <QuillIcon width={13} height={13} /> From the guide
            </span>
          )}
        </div>
        <h1 className="question-title">{question.question}</h1>
        <ul className="tags" aria-label="Tags">
          {question.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <aside className="margin-note">
          <p className="margin-note__title">Practice cue</p>
          <p>{question.practiceCue}</p>
        </aside>
        {!studyMode && <PracticeTimer />}
        <p className="keyboard-hint">
          <kbd>←</kbd> <kbd>→</kbd> turn pages · <kbd>R</kbd> reveal
        </p>
      </Page>

      <Page
        side="right"
        runningHead={`Model answer · Question ${number}`}
        pageNumber={pages.right}
        label="Model answer"
        footer={
          <Link to={next.to} state={{ turn: 'forward' }} className="turn turn--forward" aria-label={`Next: ${next.label}`}>
            <span>{next.label}</span>
            <ArrowRightIcon />
          </Link>
        }
      >
        <div aria-live="polite">
          {showAnswer ? (
            <article className="answer">
              <p className="answer__text">{question.answer}</p>
              {question.code && (
                <pre className="code">
                  <code>{question.code}</code>
                </pre>
              )}
              <h2 className="answer__heading">Key points</h2>
              <ul className="key-points">
                {question.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {!studyMode && (
                <button type="button" className="link-button" onClick={() => setRevealed(false)}>
                  Hide answer
                </button>
              )}
            </article>
          ) : (
            <div className="sealed">
              <div className="sealed__seal" aria-hidden="true">
                <EyeIcon width={26} height={26} />
              </div>
              <p className="sealed__title">The answer is on this page.</p>
              <p className="sealed__text">Give your own answer first, out loud, then compare it with the model answer.</p>
              <button type="button" className="btn btn--primary" onClick={() => setRevealed(true)}>
                Reveal answer
              </button>
            </div>
          )}
        </div>

        <div className="rating" role="group" aria-label="How did you do?">
          <span className="rating__label">How did you do?</span>
          <button type="button" className="rate rate--known" aria-pressed={mark === 'known'} onClick={() => rate('known')}>
            <CheckIcon width={16} height={16} /> I knew it
          </button>
          <button type="button" className="rate rate--review" aria-pressed={mark === 'review'} onClick={() => rate('review')}>
            <ReviewIcon width={16} height={16} /> Review again
          </button>
        </div>
      </Page>
    </>
  );
}
