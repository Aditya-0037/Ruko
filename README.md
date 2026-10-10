# Ruko — pause, check, get help

**Ruko** ("stop" in Hindi) is a calm, mobile-first safety layer for older Indians and their families.
When someone on a video call claims to be the CBI and says you are under "digital arrest", Ruko helps
you **pause**, **check** the call, and **get family help** — without hanging up. If money has already
gone, it walks you through the **golden hour**: call 1930, collect evidence, and build a complaint pack.

> Indians lost **₹1,935 crore** to digital-arrest scams in 2024, across **1.23 lakh** complaints.
> There is no "digital arrest" in Indian law. Real police never arrest anyone on a video call.

Built for the **Hyperbloom October 2026 — UI/UX and Web Design** hackathon.

---

## The idea in one flow

| Moment | Screen | What Ruko does |
|---|---|---|
| Before (calm) | `/setup` | The elder picks a language, a trusted person, a **calm-moment rule** ("new person + over ₹10,000 → wait 1 hour and ask Rahul"), a family code word, and what family may see |
| During (scared) | `/call` → `/pause` | A simulated "CBI officer" call. One tap on **RUKO** shows the calm card — read aloud — while the call keeps running |
| | `/tell` | A silent alert to the trusted person. No need to speak to the caller |
| | `/check/1…3` | Three yes / no / not-sure questions. Explainable rules, not an AI verdict |
| | `/transfer/paused` | "You are sending ₹2,00,000 to a new person." The elder's own rule pauses it; **Cancel transfer** is the main button |
| | `/family` | Rahul's phone: one alert, with **Call / Block / Approve** |
| After (money gone) | `/golden-hour` | "Call 1930 now", a timer, an evidence form, a printable complaint pack, and a plain-words status timeline |
| Always | `/adapt` | **Adapt to me**: Hindi, text up to 200%, high contrast, Easy Read, read aloud, reduce motion |

For judges: `/about` (design rationale and a 60-second tour), `/accessibility` (accessibility label with
measured contrast), `/demo` (Kamla's and Rahul's phones side by side, syncing live).

---

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run build` | Typecheck, production build with service worker, SPA fallback (`dist/404.html`) |
| `npm run preview` | Serve the production build |
| `npm run check` | Typecheck + lint (incl. jsx-a11y) + unit/component tests |
| `npm test` | Vitest: rules engine, scam signals, store, i18n completeness, token contrast, component axe checks |
| `npm run test:e2e` | Playwright on a 360×780 phone: hero flow, family sync, axe sweep |

Requires Node 20+.

## Deploy (Deployxa or any static host)

`npm run build` produces a static site in `dist/`. Point the host at `dist/` with build command
`npm run build`. Deep links work without rewrite rules thanks to `dist/404.html`; if the host supports
SPA rewrites, rewrite all paths to `/index.html`.

---

## How it is built

* **React 19 + TypeScript + Vite**, React Router 7, Zustand (persisted locally).
* **No backend, no tracking.** Everything stays on the device. The two-phone demo syncs through the
  browser's `storage` event between same-origin tabs/iframes.
* **Design system** in plain CSS custom properties: global tokens → alias tokens, a high-contrast theme,
  a 200% type scale, 48px targets, spring motion that switches off under reduced motion. Contrast pairs
  are verified by a unit test (`src/design-system/tokens.test.ts`).
* **English + हिंदी** with an **Easy Read** variant for long strings; a test fails if any string lacks a
  Hindi translation.
* **Offline-first PWA**: the calm card and 1930 work in airplane mode.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design: information architecture, state, tokens,
accessibility plan, and testing strategy.

## Accessibility

Ruko targets **WCAG 2.2 AA** and goes beyond it with Easy Read, Hindi, read-aloud and an offline calm
card. Automated: axe-core in component tests and an axe sweep in Playwright, plus the token contrast test.
Manual checklist and results: [docs/accessibility-audit.md](./docs/accessibility-audit.md).

## Honesty notes

* The scam call, bank app and family alerts are **simulations** for the demo. In a real deployment,
  the pause pattern would live inside a bank or UPI app, and alerts would go through the bank.
* Facts used in the product: no "digital arrest" exists in Indian law (MHA / I4C advisories); 1930 is the
  National Cyber Crime Helpline; cybercrime.gov.in is the reporting portal; 112 is the emergency number.
* AI tools were used to help write code and copy; all content was reviewed by the team.
