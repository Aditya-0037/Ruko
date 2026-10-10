import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = [
  '/',
  '/setup/language',
  '/setup/name',
  '/setup/person',
  '/setup/rules',
  '/setup/code-word',
  '/setup/sharing',
  '/setup/done',
  '/call',
  '/pause',
  '/tell',
  '/check/1',
  '/check/2',
  '/check/3',
  '/check/result',
  '/transfer',
  '/transfer/paused',
  '/family',
  '/golden-hour',
  '/golden-hour/evidence',
  '/golden-hour/pack',
  '/golden-hour/status',
  '/adapt',
  '/accessibility',
  '/about',
  '/drill',
]

const MODES = [
  { name: 'English, standard contrast', prefs: { lang: 'en', contrast: 'standard' } },
  { name: 'Hindi, high contrast, 200% text', prefs: { lang: 'hi', contrast: 'high', textScale: 2 } },
] as const

/** Seed the persisted store with the demo profile and a paused transfer so every screen has content. */
async function seed(page: Page, prefs: Record<string, unknown>) {
  await page.addInitScript((p) => {
    const now = Date.now()
    const state = {
      prefs: { lang: 'en', textScale: 1, contrast: 'standard', easyRead: false, readAloud: false, motion: 'reduce', designNotes: true, ...p },
      setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
      people: [{ id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
      rules: [{ id: 'rule_default', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'person_rahul' }],
      sharing: { alertsDuringCall: true, transferPauses: true },
      incident: {
        id: 'incident_e2e', startedAt: now, callActive: false, callStartedAt: now, callerLabel: 'CBI Mumbai',
        pauseOpenedAt: now, answers: { secrecy: 'yes', moneyMove: 'unsure', videoHold: 'yes' },
        alertSentAt: now, alertPersonId: 'person_rahul', familySeenAt: null, familyDecision: null, familyDecidedAt: null,
        transfer: { amount: 200000, payeeName: 'RBI Safe Account – Verification', payeeIsNew: true, requestedAt: now,
          status: 'paused', ruleId: 'rule_default', unlockAt: now + 3600000, askPersonId: 'person_rahul' },
      },
      goldenHour: { startedAt: now, called1930: false, called1930At: null,
        evidence: { amount: '200000', transactionId: '', paidAt: '', scammerNumber: '', paidTo: '', bankName: '', notes: '' },
        checklist: {}, ackNumber: '', statusStep: 'reported' },
    }
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('ruko:v1', JSON.stringify({ state, version: 1 }))
      sessionStorage.setItem('seeded', '1')
    }
  }, prefs)
}

for (const mode of MODES) {
  test.describe(`axe sweep — ${mode.name}`, () => {
    for (const route of ROUTES) {
      test(route, async ({ page }) => {
        await seed(page, mode.prefs)
        await page.goto(route)
        await expect(page.locator('h1')).toHaveCount(1)
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze()
        const summary = results.violations.map(
          (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`,
        )
        expect(summary).toEqual([])
        // No horizontal scrolling at 360px, even at 200% text.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow).toBeLessThanOrEqual(1)
      })
    }
  })
}
