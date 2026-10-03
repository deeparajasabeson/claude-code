import { Suspense, use, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { searchQuestions } from '../api';
import { Book, Page } from '../components/Book';
import { DifficultyBadge, Ornament } from '../components/Bits';
import ErrorBoundary from '../components/ErrorBoundary';

const suggestions = ['RAG', 'MCP', 'Entra ID', 'hooks', 'idempotency', 'streaming', 'security', 'testing'];

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const navigate = useNavigate();
  const [term, setTerm] = useState(query);

  const search = (value: string) => {
    const q = value.trim();
    if (q.length >= 2) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    search(term);
  };

  return (
    <Book>
      <Page side="left" runningHead="Index" pageNumber="iii" label="Search">
        <p className="eyebrow">Index</p>
        <h1 className="display">Look something up</h1>
        <p>Search every question, model answer, key point and tag in the book.</p>
        <form className="search search--page" role="search" onSubmit={onSubmit}>
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. prompt injection"
            aria-label="Search term"
          />
          <button type="submit" className="btn btn--primary">
            Search
          </button>
        </form>
        <p className="eyebrow">Popular entries</p>
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={query.toLowerCase() === s.toLowerCase()} onClick={() => { setTerm(s); search(s); }}>
              {s}
            </button>
          ))}
        </div>
      </Page>
      <Page side="right" runningHead={query ? `Entries for “${query}”` : 'Entries'} pageNumber="iv" label="Search results">
        {query.length < 2 ? (
          <div className="page__placeholder">
            <Ornament />
            <p>Type at least two characters to search the index.</p>
          </div>
        ) : (
          <ErrorBoundary fallback={(error) => <p className="empty">{error.message}</p>}>
            <Suspense fallback={<p className="empty" role="status">Searching the index…</p>}>
              <Results query={query} />
            </Suspense>
          </ErrorBoundary>
        )}
      </Page>
    </Book>
  );
}

function Results({ query }: { query: string }) {
  const results = use(searchQuestions(query));
  if (results.length === 0) {
    return <p className="empty">No entries for “{query}”. Try a broader term.</p>;
  }
  return (
    <ol className="results">
      {results.map((r) => (
        <li key={`${r.categorySlug}-${r.question.number}`}>
          <Link to={`/chapter/${r.categorySlug}/${r.question.number}`} state={{ turn: 'forward' }}>
            <span className="results__where">
              {r.categoryTitle} · Q{r.question.number}
            </span>
            <span className="results__question">{r.question.question}</span>
            <DifficultyBadge level={r.question.difficulty} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
