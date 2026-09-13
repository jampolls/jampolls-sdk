// Numeric constants that JS logic needs directly (branching, setTimeout) and
// therefore can't live purely as CSS custom properties. Mirrors src/styles/quiz.css
// one-for-one — change a value in both places together, never just one.

// Countdown badge swaps to the urgent red state at <=10s remaining. Matches
// the app's own countdown badge exactly (absolute seconds, not a percentage
// of the question's total duration).
export const QUIZ_TIMER_URGENT_THRESHOLD_S = 10;

export const QUIZ_MOTION_ENTER_MS = 350;
export const QUIZ_MOTION_BAR_FILL_MS = 600;
