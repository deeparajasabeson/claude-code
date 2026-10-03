import { Route, Routes, useLocation } from 'react-router';
import TopBar from './components/TopBar';
import CoverPage from './pages/CoverPage';
import ContentsPage from './pages/ContentsPage';
import ChapterPage from './pages/ChapterPage';
import QuestionPage from './pages/QuestionPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { pathname } = useLocation();
  const onCover = pathname === '/';

  return (
    <div className={onCover ? 'app app--cover' : 'app'}>
      {!onCover && <TopBar />}
      <main className="desk" id="main">
        <Routes>
          <Route path="/" element={<CoverPage />} />
          <Route path="/contents" element={<ContentsPage />} />
          <Route path="/chapter/:slug" element={<ChapterPage />} />
          <Route path="/chapter/:slug/:number" element={<QuestionPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
