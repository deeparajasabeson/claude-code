import { Suspense, use, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { fetchCategories } from '../api';
import { chapterStats, setStudyMode, useProgress, useStudyMode } from '../store';
import ErrorBoundary from './ErrorBoundary';
import { BookIcon, SearchIcon } from './Icons';

export default function TopBar() {
  const navigate = useNavigate();
  const studyMode = useStudyMode();
  const [term, setTerm] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    if (q.length >= 2) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="The Interview Companion — back to the cover">
        <span className="brand__mark">
          <BookIcon />
        </span>
        <span className="brand__text">
          The Interview Companion
          <small>Agentic AI · .NET Core · React</small>
        </span>
      </Link>

      <nav className="topbar__nav" aria-label="Main">
        <NavLink to="/contents">Contents</NavLink>
      </nav>

      <form className="search" role="search" onSubmit={onSearch}>
        <SearchIcon className="search__icon" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search the index…"
          aria-label="Search questions and answers"
          minLength={2}
        />
      </form>

      <div className="topbar__tools">
        <ErrorBoundary fallback={() => null}>
          <Suspense fallback={null}>
            <OverallProgress />
          </Suspense>
        </ErrorBoundary>
        <button
          type="button"
          role="switch"
          aria-checked={studyMode}
          className="switch"
          onClick={() => setStudyMode(!studyMode)}
          title="Study mode shows every answer immediately. Turn it off to practise answering first."
        >
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          Study mode
        </button>
      </div>
    </header>
  );
}

function OverallProgress() {
  const categories = use(fetchCategories());
  const progress = useProgress();
  const total = categories.reduce((sum, c) => sum + c.questionCount, 0);
  const known = categories.reduce((sum, c) => sum + chapterStats(progress, c.slug, c.questionCount).known, 0);

  return (
    <div className="overall" title={`${known} of ${total} questions marked as known`}>
      <span className="overall__label">
        <strong>{known}</strong>/{total} known
      </span>
      <span className="meter" aria-hidden="true">
        <span style={{ width: `${(known / total) * 100}%` }} />
      </span>
    </div>
  );
}
