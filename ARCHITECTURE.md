# Ruko — Architecture

Ruko ("stop" in Hindi) is a mobile-first, installable web app (PWA) that helps people aged 60+
**pause, check and get family help** during a "digital arrest" scam call, and act fast in the
**golden hour** if money has already gone. It is built for the Hyperbloom October 2026 UI/UX
hackathon, so every architectural choice serves one of the six judging areas: UX flows, visual UI,
accessibility and inclusive design, interaction and information architecture, problem-solving and
originality, and polish.

Everything runs on the device with mock data. There is no backend, no account and no tracking.

---

## 1. Product model

### Two people, one loop

| Persona | Device | What they need |
|---|---|---|
| **Kamla Devi, 68** (the elder) — Hindi-first, uses UPI for small payments, lives alone in Pune | Her Android phone | A calm, big, one-thumb way to pause and get help *without hanging up* on someone who sounds like the police |
| **Rahul, 34** (her son, the trusted person) — works in Bengaluru | His phone | One clear alert when it matters, and one-tap ways to call, approve or block — not surveillance |

### Information architecture: organised by *time*, not features

```
                     ┌──────────── Home ────────────┐
                     │  [  RUKO  ]  ← giant button  │
                     │  Before · During · After     │
                     └──────────────────────────────┘
   BEFORE (calm)                DURING (scared)                 AFTER (money gone)
   /setup/:step                 /call  (simulated call)         /golden-hour
    language                    /pause (panic card)              call 1930 now
    your name                   /tell  (silent ping to family)   /golden-hour/evidence
    trusted person              /check/:q → /check/result        /golden-hour/pack
    calm-moment rules           /transfer → /transfer/paused     /golden-hour/status
    family code word            /family  (Rahul's phone)
    sharing (dignity-first)
   /drill (rehearsal)
                     Always reachable: /adapt (Adapt to me) · Help button (same place on every screen)
                     For judges: /about (design notes + tour) · /accessibility (label) · /demo (two phones)
```

### The hero flow (what the demo video shows)

1. A simulated "CBI officer" video call rings (`/call`). The call keeps running.
2. Kamla taps the big **Ruko** button. The call shrinks to a picture-in-picture tile; the
   **panic card** (`/pause`) reads aloud: *"Real police never arrest anyone on a video call. You do
   not have to pay."* Two buttons: **Tell my person** and **Check this call**.
3. **Tell my person** (`/tell`) sends a silent alert to Rahul — no need to speak to the caller.
4. **Check this call** (`/check/1..3`) asks three yes / no / not-sure questions, one per page, and
   explains in plain words which scam signs matched. Rules, not an AI verdict.
5. The caller pushes her to transfer money. Ruko's **transfer pause** (`/transfer/paused`) says
   literally: *"You are sending ₹2,00,000 to a new person."* It shows the rule she chose while calm
   (new person + over ₹10,000 → wait 1 hour and ask Rahul). **Cancel transfer** is the main button.
6. Rahul's phone (`/family`) shows one alert with **Call Maa / Block / Approve**.
7. If money already went: **Golden hour** (`/golden-hour`) — "Call 1930 now", an evidence checklist,
   an auto-built complaint pack, and a plain-words status timeline.

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| UI | React 19 + TypeScript (strict) | Typed, familiar to judges, fast to build |
| Build | Vite | Instant dev server, small static output deployable anywhere (Deployxa) |
| Routing | React Router 7 (`createBrowserRouter`) | One file per route, lazy-loadable |
| State | Zustand + `persist` (localStorage, guarded) | Tiny, no boilerplate; persisted state also syncs the family view across tabs/iframes |
| Styling | Plain CSS with design tokens (CSS custom properties) + CSS Modules per component | Shows the design system directly; no UI kit hiding craft |
| Icons | lucide-react (always `aria-hidden`, always paired with text) | Clean, consistent strokes |
| Fonts | Noto Sans + Noto Sans Devanagari (self-hosted via Fontsource) | Same family across English and Hindi; works offline |
| Speech | Web Speech API `speechSynthesis` (hi-IN / en-IN) | Read-aloud with a visible transcript; no network |
| Offline | `vite-plugin-pwa` (Workbox precache) | Panic card and 1930 work in airplane mode |
| Tests | Vitest + Testing Library + axe-core; Playwright + @axe-core/playwright | Unit, component a11y, and end-to-end hero-flow checks |
| Lint | ESLint 9 + typescript-eslint + jsx-a11y + react-hooks | Catches a11y mistakes at write time |

No backend. No analytics. No third-party requests at runtime.

---

## 3. Folder structure and ownership

```
src/
  main.tsx                 entry: fonts, global CSS, store hydration, router
  app/
    App.tsx                shell: SkipLink, PrefsEffect, OfflineBanner, ToastRegion, CallPip, <Outlet/>
    router.tsx             createBrowserRouter — concatenates every feature's routes
    PrefsEffect.tsx        applies prefs to <html> (lang, data-contrast, data-easy-read, --text-scale, motion)
  design-system/           SHARED — tokens + primitives (see §5)
    tokens.css             global → alias token layers, high-contrast theme, motion
    global.css             reset, base typography, focus ring, utilities (.visually-hidden, .stack)
    components/            Button, BigButton, Screen, TopBar, HelpSheet, Card, Callout, ChoiceGroup,
                           StepProgress, Toast/ToastRegion, ListenButton, Field, Switch, SegmentedControl,
                           DesignNote, Illustration
  i18n/                    SHARED — I18nProvider, useT(), dictionary merge, interpolation, Easy Read lookup
  lib/                     SHARED — pure helpers: format (INR, durations), rules engine, scam signals,
                           speech, safeStorage, ids, time
  state/                   SHARED — Zustand store (all slices + actions), demo presets, selectors
  features/                one folder per feature; each exports `routes` and `strings`
    home/  setup/  call/  pause/  check/  transfer/  family/  demo/
    golden-hour/  adapt/  accessibility/  about/  drill/
e2e/                       Playwright specs (one per feature) + axe sweep
scripts/                   build helpers (SPA fallback, icon generation)
public/                    icons, robots.txt
```

**Ownership rule (parallel build):** a feature folder may only change files inside itself and its own
`e2e/<feature>.spec.ts`. Shared folders (`design-system`, `i18n`, `lib`, `state`, `app`) are changed
only by the integrator. If a feature needs something shared, it builds it locally first and the
integrator promotes it later.

Each feature folder contains:

```
features/<name>/
  routes.tsx       export const routes: RouteObject[]
  strings.ts       export const strings = { en: {...}, hi: {...} } — flat keys prefixed "<name>."
  *Page.tsx        one component per route
  *.module.css     styles that use tokens only (no raw colours, no raw px font sizes)
  *.test.tsx       component tests incl. axe check
```

---

## 4. State

One Zustand store (`src/state/store.ts`), persisted under the key `ruko:v1` through a storage
wrapper that never throws (private mode, blocked storage).

| Slice | Holds | Key actions |
|---|---|---|
| `prefs` | `lang`, `textScale` (1–2), `contrast` (`standard`/`high`), `easyRead`, `readAloud`, `motion` (`system`/`reduce`/`full`), `designNotes` | `setPrefs(partial)` |
| `setup` | `elderName`, `completed`, `codeWord`, `drillCompletedAt` | `setElderName`, `setCodeWord`, `completeSetup`, `markDrillDone` |
| `people` | trusted people `{id, name, relation, phone}` | `addPerson`, `updatePerson`, `removePerson`, `restorePerson` |
| `rules` | calm-moment rules `{id, enabled, payee: 'new'/'any', minAmount, waitMinutes, askPersonId}` | `addRule`, `updateRule`, `removeRule`, `restoreRule` |
| `sharing` | what family may see: `alertsDuringCall`, `transferPauses` (elder-controlled) | `setSharing(partial)` |
| `incident` | the live scam event: call state, check answers, alert, transfer, family decision | `startCall`, `endCall`, `openPause`, `answerCheck`, `sendAlert`, `requestTransfer`, `cancelTransfer`, `familyDecide`, `clearIncident` |
| `goldenHour` | `startedAt`, `called1930`, evidence fields, checklist, acknowledgement number, status step | `startGoldenHour`, `mark1930Called`, `updateEvidence`, `toggleChecklist`, `setAckNumber`, `setStatusStep`, `resetGoldenHour` |
| — | — | `loadDemoProfile()` (Kamla + Rahul + default rule), `resetAll()` |

**Family sync without a backend:** both phones are the same origin. When one tab/iframe writes the
store, the browser fires a `storage` event in the others, and `src/state/sync.ts` calls
`useStore.persist.rehydrate()`. So `/demo` can show Kamla's phone and Rahul's phone side by side,
updating live, with zero servers.

**Rules engine (`src/lib/rules.ts`)** — pure function `evaluateTransfer(transfer, rules, people)`
returns `{ action: 'allow' | 'pause', rule, waitMinutes, askPerson }`. Fully unit-tested.

**Scam signals (`src/lib/scamSignals.ts`)** — the three script-check questions, each with a
plain-words reason, and `assessAnswers(answers)` → `{ level: 'scam' | 'unsure' | 'clear', matched[] }`.
Explainable by construction: the result screen lists exactly which answers triggered it.

---

## 5. Design system

### Tokens (two layers, like Fluent 2)

* **Global tokens** — raw palette and scales: `--teal-700`, `--marigold-400`, `--red-700`, `--ink-900`…
* **Alias tokens** — meaning: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`,
  `--color-primary`, `--color-on-primary`, `--color-danger`, `--color-caution-bg`, `--color-success`,
  `--color-border-strong`, `--color-focus`. Components use **alias tokens only**.
* **Three inputs, like Linear:** base (warm paper), accent (trust teal), contrast (`standard` / `high`).
  `[data-contrast="high"]` swaps alias tokens to black-on-white with 2px borders and underlined links.

### Rules

* **Colour meaning:** teal = safe/primary action, red = danger only (never decoration), marigold =
  highlight, amber background = caution. Status is never shown by colour alone (icon + words).
* **Contrast:** text ≥ 4.5:1, large text and UI boundaries ≥ 3:1 (WCAG 1.4.3, 1.4.11). Pairs are
  documented in `tokens.css` with their measured ratios.
* **Type:** root size `calc(112.5% × --text-scale)` (18px at 100%), everything in `rem`, so the
  Adapt slider scales the whole UI to 200% without breaking layout (WCAG 1.4.4, 1.4.10).
* **Targets:** every interactive element ≥ 48×48 px (WCAG 2.5.8 needs 24; Apple's default is 44).
* **One big primary action per screen** (Material 3 Expressive finding: distinct key actions are
  found faster). Secondary actions are visually quieter.
* **Focus:** a 3px blue outline with offset on every focusable element; sticky bars reserve
  `scroll-padding` so focus is never hidden (WCAG 2.4.11).
* **Motion:** spring easing for delight, View Transitions where supported; all of it switches off
  under `prefers-reduced-motion` or the Adapt setting.
* **Consistent help:** the Help button sits in the same top-right spot on every screen (WCAG 3.2.6).
* **No drag-only interactions** (2.5.7), **no memory tests** (3.3.8), **no timeouts that act on the
  user without warning** — the transfer lock is a protective delay the elder chose, and family can end it.

### Primitives (`src/design-system/components`)

`Screen` (TopBar + main landmark + consistent Help), `Button` (primary / secondary / danger / quiet,
loading copy instead of spinners), `BigButton` (the Ruko panic button), `Card`, `Callout`
(info / caution / danger / success with icon + text), `ChoiceGroup` (Yes / No / Not sure as big
radio cards), `StepProgress` ("Step 2 of 6"), `Field`, `Switch`, `SegmentedControl`, `ListenButton`
(read-aloud), `ToastRegion` + `useToast()` (undo instead of confirm), `DesignNote` (judge-facing
rationale, visible only when "Design notes" is on), `HelpSheet`.

---

## 6. Content and language

* Languages: **English** and **हिंदी** (Hindi). Strings live with their feature in `strings.ts`,
  flat keys, merged by `src/i18n/dictionaries.ts`.
* **Easy Read:** if Easy Read is on and a key `foo.easy` exists, `t('foo')` returns it — shorter
  sentences, one idea each. A unit test fails if any English key lacks a Hindi translation.
* Voice of the product: calm, warm, literal. Say exactly what will happen ("You are sending
  ₹2,00,000 to a new person"), never blame, never use jargon (no "UPI ID", "beneficiary", "lien" without
  a plain explanation).
* Indian number formatting via `Intl.NumberFormat('en-IN')` → ₹2,00,000.
* `<html lang>` follows the chosen language; mixed-language fragments get their own `lang`.

---

## 7. Accessibility plan (WCAG 2.2 AA, measured)

| Area | How Ruko meets it |
|---|---|
| Perceivable | Alias tokens with measured contrast; text to 200%; reflow at 320px; read-aloud with transcript; icons never alone |
| Operable | 48px targets; full keyboard path; visible focus never obscured; no drag; no time limits on the user |
| Understandable | One question per page; "Not sure" always offered; literal labels; consistent Help; errors say how to fix |
| Robust | Native elements first, ARIA only where needed; landmarks and heading order; axe in unit and e2e tests |
| Beyond WCAG | Easy Read mode, Hindi, high contrast, reduce motion, offline panic card, calm notifications |

Automated checks: `axe-core` in component tests, `@axe-core/playwright` sweep over every route in
both contrast modes and both languages. Manual checks recorded in `docs/accessibility-audit.md`.

---

## 8. Offline and performance

* Workbox precaches the app shell, fonts and all routes; `/pause` and the 1930 `tel:` link work in
  airplane mode. An offline banner says "You're offline. Ruko still works."
* Route-level code splitting; no images heavier than SVG; target INP ≤ 200 ms, LCP ≤ 2.5 s, CLS ≤ 0.1.
* Static output with an SPA fallback (`404.html`) so deep links work on any static host.

---

## 9. Privacy and ethics

* Everything stays on the device. Nothing is sent anywhere.
* The elder decides what family can see, and can turn sharing off in one tap (DPDP-style: withdrawing
  consent is as easy as giving it).
* No dark patterns: equal-weight choices, no false urgency, no confirmshaming. The only friction in the
  product is friction the elder chose for herself, explained in plain words.
* The simulated scam call is clearly labelled as a demo/drill.

---

## 10. Testing strategy

| Layer | Tool | What |
|---|---|---|
| Pure logic | Vitest | rules engine, scam signals, formatting, store actions, i18n completeness |
| Components | Vitest + Testing Library + axe-core | each page renders, key interactions work, zero axe violations |
| End-to-end | Playwright (Chromium) | hero flow on a 360×780 phone viewport; family sync across two pages; offline panic card; axe sweep |

`npm run check` = typecheck + lint + unit tests. `npm run test:e2e` runs Playwright against `vite preview`.
