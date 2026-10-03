import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { clearApiCache } from '../api';
import { setMark, setStudyMode } from '../store';
import { stubApi } from '../test/fixtures';
import QuestionPage from './QuestionPage';
import ChapterPage from './ChapterPage';

// Suspense-based pages need an awaited act() so React retries once the stubbed data resolves.
async function renderAt(path: string) {
  return act(async () =>
    render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/chapter/:slug" element={<ChapterPage />} />
        <Route path="/chapter/:slug/:number" element={<QuestionPage />} />
        <Route path="/contents" element={<p>Contents page</p>} />
      </Routes>
    </MemoryRouter>,
    ),
  );
}

describe('QuestionPage', () => {
  beforeEach(() => {
    clearApiCache();
    setMark('react', 1, null);
    setStudyMode(false);
    stubApi();
  });

  it('keeps the answer sealed until the reader reveals it', async () => {
    const user = userEvent.setup();
    await renderAt('/chapter/react/1');

    expect(await screen.findByRole('heading', { level: 1, name: 'What is a hook?' })).toBeInTheDocument();
    expect(screen.queryByText('Key points')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reveal answer' }));

    expect(screen.getByText('Key points')).toBeInTheDocument();
    expect(screen.getByText('First point')).toBeInTheDocument();
  });

  it('shows answers immediately in study mode', async () => {
    setStudyMode(true);
    await renderAt('/chapter/react/1');

    expect(await screen.findByText('Key points')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reveal answer' })).not.toBeInTheDocument();
  });

  it('records a self-rating and toggles it off again', async () => {
    const user = userEvent.setup();
    await renderAt('/chapter/react/1');

    const knewIt = await screen.findByRole('button', { name: /I knew it/ });
    await user.click(knewIt);
    expect(knewIt).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('interview-companion:progress:v1')).toContain('"react:1":"known"');

    await user.click(knewIt);
    expect(knewIt).toHaveAttribute('aria-pressed', 'false');
  });

  it('turns the page with the arrow keys', async () => {
    const user = userEvent.setup();
    await renderAt('/chapter/react/1');
    await screen.findByRole('heading', { level: 1, name: 'What is a hook?' });

    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('heading', { level: 1, name: 'Sample question 2?' })).toBeInTheDocument();
  });

  it('links the last question of the last chapter back to the contents', async () => {
    await renderAt('/chapter/react/3');

    expect(await screen.findByRole('link', { name: 'Next: Back to contents' })).toHaveAttribute('href', '/contents');
  });

  it('shows a missing-page message for unknown questions', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await renderAt('/chapter/react/99');

    expect(await screen.findByText('This page isn’t in the book.')).toBeInTheDocument();
  });
});

describe('ChapterPage', () => {
  beforeEach(() => {
    clearApiCache();
    stubApi();
  });

  it('filters the chapter’s questions by progress', async () => {
    const user = userEvent.setup();
    setMark('react', 2, 'review');
    await renderAt('/chapter/react');

    expect(await screen.findAllByRole('link', { name: /Sample question|What is a hook/ })).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'To review' }));

    const links = screen.getAllByRole('link', { name: /Sample question|What is a hook/ });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Sample question 2?');
    setMark('react', 2, null);
  });
});
