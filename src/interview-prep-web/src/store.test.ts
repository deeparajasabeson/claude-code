import { chapterStats, markKey, setMark } from './store';

describe('progress store', () => {
  it('counts known, review and unseen questions per chapter', () => {
    const progress = { [markKey('react', 1)]: 'known', [markKey('react', 2)]: 'review', [markKey('dotnet', 1)]: 'known' } as const;

    expect(chapterStats(progress, 'react', 20)).toEqual({ known: 1, review: 1, unseen: 18, total: 20 });
  });

  it('persists marks to localStorage and clears them', () => {
    setMark('react', 4, 'known');
    expect(JSON.parse(localStorage.getItem('interview-companion:progress:v1')!)).toEqual({ 'react:4': 'known' });

    setMark('react', 4, null);
    expect(JSON.parse(localStorage.getItem('interview-companion:progress:v1')!)).toEqual({});
  });
});
