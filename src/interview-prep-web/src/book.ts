// Book-like presentation helpers shared by the pages.

const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export const toRoman = (n: number) => numerals[n - 1] ?? String(n);

// Each chapter has an opener page, a contents page and two pages (question + answer) per question.
const PAGES_PER_QUESTION = 2;
const FRONT_MATTER = 2;
const chapterLength = (questionCount: number) => 2 + questionCount * PAGES_PER_QUESTION;

export function chapterStartPage(order: number, questionCount = 20) {
  return FRONT_MATTER + (order - 1) * chapterLength(questionCount) + 1;
}

export function questionPages(order: number, number: number, questionCount = 20) {
  const left = chapterStartPage(order, questionCount) + 2 + (number - 1) * PAGES_PER_QUESTION;
  return { left, right: left + 1 };
}

export type TurnDirection = 'forward' | 'back';

export interface TurnState {
  turn?: TurnDirection;
}
