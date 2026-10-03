import { Suspense, use } from 'react';
import { Link } from 'react-router';
import { fetchCategories } from '../api';
import { toRoman } from '../book';
import ErrorBoundary from '../components/ErrorBoundary';
import { Ornament } from '../components/Bits';

export default function CoverPage() {
  return (
    <div className="cover-scene">
      <article className="cover" aria-labelledby="cover-title">
        <span className="cover__pages" aria-hidden="true" />
        <span className="cover__ribbon" aria-hidden="true" />
        <div className="cover__inner">
          <p className="cover__eyebrow">Technical Interview Practice</p>
          <h1 id="cover-title" className="cover__title">
            The Interview
            <br />
            Companion
          </h1>
          <Ornament />
          <ErrorBoundary fallback={() => null}>
            <Suspense fallback={<p className="cover__chapters">&nbsp;</p>}>
              <CoverChapters />
            </Suspense>
          </ErrorBoundary>
          <p className="cover__blurb">Questions, model answers and practice cues for your next technical interview.</p>
          <Link to="/contents" className="btn btn--cover">
            Open the book
          </Link>
        </div>
      </article>
      <p className="cover-scene__caption">Practise out loud · reveal the model answer · mark what you know</p>
    </div>
  );
}

function CoverChapters() {
  const categories = use(fetchCategories());
  const total = categories.reduce((sum, c) => sum + c.questionCount, 0);
  return (
    <>
      <ul className="cover__chapters">
        {categories.map((c) => (
          <li key={c.slug}>
            <span>{toRoman(c.order)}</span> {c.title}
          </li>
        ))}
      </ul>
      <p className="cover__count">{total} questions &amp; answers</p>
    </>
  );
}
