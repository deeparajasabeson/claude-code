import { Suspense, use } from 'react';
import { NavLink } from 'react-router';
import { fetchCategories } from '../api';
import ErrorBoundary from './ErrorBoundary';

export default function Bookmarks() {
  return (
    <nav className="bookmarks" aria-label="Chapters">
      <NavLink to="/contents" className="bookmark bookmark--contents">
        Contents
      </NavLink>
      <ErrorBoundary fallback={() => null}>
        <Suspense fallback={null}>
          <ChapterBookmarks />
        </Suspense>
      </ErrorBoundary>
    </nav>
  );
}

function ChapterBookmarks() {
  const categories = use(fetchCategories());
  return categories.map((category) => (
    <NavLink
      key={category.slug}
      to={`/chapter/${category.slug}`}
      end={false}
      className={`bookmark bookmark--${category.order}`}
    >
      {category.title}
    </NavLink>
  ));
}
