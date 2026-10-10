# Ruko accessibility audit

Target: **WCAG 2.2 Level AA**, tested on a 360 px wide phone viewport.

## Automated (runs in CI / `npm run check` and `npm run test:e2e`)

| Check | Tool | Where |
|---|---|---|
| Rule violations on every page (labels, roles, names, landmarks, headings) | axe-core | `src/**/*.test.tsx` via `expectNoAxeViolations()` |
| Rule violations incl. colour contrast in a real browser | @axe-core/playwright | `e2e/*.spec.ts` |
| Token colour pairs meet 4.5:1 (text) and 3:1 (UI boundaries, focus) | Vitest | `src/design-system/tokens.test.ts` |
| Every English string has a Hindi translation with the same placeholders | Vitest | `src/i18n/translate.test.ts` |
| JSX accessibility lint (alt text, labels, interactive roles) | eslint-plugin-jsx-a11y (strict) | `npm run lint` |

## Manual checklist (run before submission, record results here)

| # | Check | How | Result |
|---|---|---|---|
| 1 | Keyboard only: complete the hero flow (home → pause → tell → check → transfer pause → cancel) | Tab / Shift+Tab / Enter / Space / arrows | ☐ |
| 2 | Focus always visible and never hidden under the sticky bar or footer | Tab through long pages | ☐ |
| 3 | TalkBack (Android) reads every control with a sensible name and role, in Hindi and English | TalkBack on, swipe through each screen | ☐ |
| 4 | VoiceOver (iOS Safari) same as above | VoiceOver rotor: headings, links, form controls | ☐ |
| 5 | Text at 200% (Adapt to me) — nothing clipped, no horizontal scroll at 360 px | Adapt → 200% on every screen | ☐ |
| 6 | Browser zoom 400% / reflow at 320 CSS px | Desktop Chrome zoom | ☐ |
| 7 | High contrast mode on every screen | Adapt → High contrast | ☐ |
| 8 | Reduced motion: no animation when the OS or Adapt setting asks | OS setting + Adapt → Reduce | ☐ |
| 9 | Offline: calm card and 1930 work in airplane mode after first load | DevTools offline / airplane mode | ☐ |
| 10 | Read aloud speaks exactly the on-screen text in Hindi and English | Listen buttons on /pause and /check/result | ☐ |
| 11 | Easy Read shortens long explanations without losing meaning | Adapt → Easy Read | ☐ |
| 12 | No time limit acts on the user; the transfer wait is protective and can be ended by family or after the wait | Transfer pause screen | ☐ |
| 13 | Error messages say what went wrong and how to fix it | Setup → person with an invalid phone | ☐ |
| 14 | Usability with 5 people (3 aged 60+, 2 adult children): task success, time, ease 1–7, top issues | Moderated test with consent | ☐ |

## WCAG 2.2 new criteria — how Ruko meets them

| Criterion | Ruko |
|---|---|
| 2.4.11 Focus Not Obscured (AA) | `scroll-padding` reserves space for the sticky top bar and footer |
| 2.5.7 Dragging Movements (AA) | No drag anywhere; text size uses buttons, not only a slider |
| 2.5.8 Target Size (AA, 24 px) | All targets ≥ 48 px |
| 3.2.6 Consistent Help (A) | Help button in the same top-right spot on every screen |
| 3.3.7 Redundant Entry (A) | Setup and evidence autosave; the complaint pack reuses what was entered |
| 3.3.8 Accessible Authentication (AA) | No login, no passwords, no puzzles |
