import { Suspense, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { NotFoundError } from '../api';
import type { TurnState } from '../book';
import Bookmarks from './Bookmarks';
import ErrorBoundary from './ErrorBoundary';

interface BookProps {
  children: ReactNode;
  /** Wrap the spread in Suspense + an error boundary (for spreads that load data). */
  loads?: boolean;
}

export function Book({ children, loads = false }: BookProps) {
  const location = useLocation();
  const turn = (location.state as TurnState | null)?.turn;

  const spread = loads ? (
    <ErrorBoundary fallback={(error, retry) => <ErrorSpread error={error} retry={retry} />}>
      <Suspense fallback={<LoadingSpread />}>{children}</Suspense>
    </ErrorBoundary>
  ) : (
    children
  );

  return (
    <div className="book">
      <Bookmarks />
      <div className="book__cover">
        <span className="book__ribbon" aria-hidden="true" />
        {/* Re-keying on navigation replays the page-turn animation and resets per-page state. */}
        <div key={location.key} className={`spread${turn ? ` spread--turn-${turn}` : ''}`}>
          {spread}
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  side: 'left' | 'right';
  runningHead?: ReactNode;
  pageNumber?: number | string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  label?: string;
}

export function Page({ side, runningHead, pageNumber, footer, children, className, label }: PageProps) {
  return (
    <section className={`page page--${side}${className ? ` ${className}` : ''}`} aria-label={label}>
      {runningHead && <header className="page__head">{runningHead}</header>}
      <div className="page__body">{children}</div>
      <footer className="page__foot">
        {footer}
        {pageNumber !== undefined && <span className="page__number">{pageNumber}</span>}
      </footer>
    </section>
  );
}

function LoadingSpread() {
  return (
    <>
      <Page side="left">
        <div className="page__placeholder" role="status">
          <span className="loader" aria-hidden="true" />
          Turning pages…
        </div>
      </Page>
      <Page side="right">
        <div className="skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </Page>
    </>
  );
}

function ErrorSpread({ error, retry }: { error: Error; retry: () => void }) {
  const missing = error instanceof NotFoundError;
  return (
    <>
      <Page side="left">
        <div className="page__placeholder">
          <p className="eyebrow">{missing ? 'Missing page' : 'Something went wrong'}</p>
          <h1 className="display">{missing ? 'This page isn’t in the book.' : 'The pages are stuck together.'}</h1>
        </div>
      </Page>
      <Page side="right">
        <div className="page__placeholder">
          <p>{missing ? 'The chapter or question you asked for doesn’t exist.' : error.message}</p>
          <div className="button-row">
            {!missing && (
              <button type="button" className="btn btn--primary" onClick={retry}>
                Try again
              </button>
            )}
            <Link className="btn btn--ghost" to="/contents">
              Back to contents
            </Link>
          </div>
        </div>
      </Page>
    </>
  );
}
