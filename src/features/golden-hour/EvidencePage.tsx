import { useId, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, LockKeyhole, ReceiptIndianRupee } from 'lucide-react'
import { Button, Callout, Card, DesignNote, Field, Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatINR, formatTime, parseAmount } from '../../lib/format'
import { useStore } from '../../state/store'
import type { Evidence } from '../../state/types'
import { amountInWords, KEEP_KEYS, moneyLeft, paths, SECTION_STEP, toLocalInputValue } from './model'
import { Mixed, rich } from './rich'
import { CheckRow, fitClass, SaveStatus, SectionKicker, useSavedAt } from './ui'
import styles from './EvidencePage.module.css'

const AMOUNT_ID = 'gh-evidence-amount'

/**
 * /golden-hour/evidence — one calm form. Every box is optional and saves as she types,
 * so nothing is lost if she stops, and a family member can finish it later.
 */
export function EvidencePage() {
  const { t, lang } = useT()
  const evidence = useStore((s) => s.goldenHour.evidence)
  const updateEvidence = useStore((s) => s.updateEvidence)
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const [savedAt, markSaved] = useSavedAt()
  const navigate = useNavigate()
  const paymentId = useId()
  const callerId = useId()

  const field = (key: keyof Evidence) => ({
    value: evidence[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateEvidence({ [key]: e.target.value })
      markSaved()
    },
  })

  const amount = parseAmount(evidence.amount)

  // "Done" is an action (tick step 3) followed by the next screen, so it is a button.
  const done = () => {
    toggleChecklist('evidence', true)
    navigate(paths.pack, { viewTransition: true })
  }

  const footer = (
    <div className={`${styles.footer} ${fitClass}`}>
      <SaveStatus savedAt={savedAt} idle={t('goldenHour.evidence.autosave')} />
      <Button variant="primary" size="lg" fullWidth iconEnd={<ArrowRight />} onClick={done}>
        {t('goldenHour.evidence.next')}
      </Button>
    </div>
  )

  return (
    <Screen title={t('goldenHour.evidence.title')} back={paths.main} footer={footer}>
      <SectionKicker step={SECTION_STEP.evidence} />
      <p className="lead">{t('goldenHour.evidence.lead')}</p>

      <Callout tone="caution" icon={<LockKeyhole />} title={t('goldenHour.evidence.never.title')}>
        <p>{t('goldenHour.evidence.never.body')}</p>
      </Callout>

      <PaymentSuggestion onFilled={markSaved} />

      <Card as="section" aria-labelledby={paymentId} className={styles.group}>
        <h2 id={paymentId} className={styles.groupTitle}>
          {t('goldenHour.evidence.payment.title')}
        </h2>
        <div>
          <Field
            id={AMOUNT_ID}
            label={t('goldenHour.evidence.amount.label')}
            hint={t('goldenHour.evidence.amount.hint')}
            inputMode="numeric"
            autoComplete="off"
            {...field('amount')}
          />
          {amount > 0 && (
            <p className={styles.preview}>
              {t('goldenHour.evidence.amount.preview', { amount: formatINR(amount, lang), words: amountInWords(t, amount) })}
            </p>
          )}
        </div>
        <Field
          label={t('goldenHour.evidence.txn.label')}
          hint={t('goldenHour.evidence.txn.hint')}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          className={styles.mono}
          {...field('transactionId')}
        />
        <Field
          type="datetime-local"
          label={t('goldenHour.evidence.paidAt.label')}
          hint={t('goldenHour.evidence.paidAt.hint')}
          {...field('paidAt')}
        />
        <Field
          label={t('goldenHour.evidence.paidTo.label')}
          hint={t('goldenHour.evidence.paidTo.hint')}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          {...field('paidTo')}
        />
        <Field
          label={t('goldenHour.evidence.bank.label')}
          hint={t('goldenHour.evidence.bank.hint')}
          autoComplete="off"
          {...field('bankName')}
        />
      </Card>

      <Card as="section" aria-labelledby={callerId} className={styles.group}>
        <h2 id={callerId} className={styles.groupTitle}>
          {t('goldenHour.evidence.caller.title')}
        </h2>
        <Field
          type="tel"
          label={t('goldenHour.evidence.number.label')}
          hint={t('goldenHour.evidence.number.hint')}
          autoComplete="off"
          className={styles.mono}
          {...field('scammerNumber')}
        />
        <Field
          multiline
          rows={4}
          label={t('goldenHour.evidence.notes.label')}
          hint={t('goldenHour.evidence.notes.hint')}
          {...field('notes')}
        />
      </Card>

      <DesignNote title={t('goldenHour.evidence.note.optional.title')}>{t('goldenHour.evidence.note.optional.body')}</DesignNote>

      <KeepList />

      <DesignNote title={t('goldenHour.evidence.note.otp.title')}>{t('goldenHour.evidence.note.otp.body')}</DesignNote>
    </Screen>
  )
}

/* ---------------- things to keep ---------------- */

const KEEP_HINTS: Partial<Record<(typeof KEEP_KEYS)[number], string>> = {
  'keep.screenshots': 'goldenHour.evidence.keep.screenshots.hint',
}

function KeepList() {
  const { t } = useT()
  const checklist = useStore((s) => s.goldenHour.checklist)
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const titleId = useId()

  return (
    <section className={styles.keep} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.groupTitle}>
        {t('goldenHour.evidence.keep.title')}
      </h2>
      <p>{t('goldenHour.evidence.keep.lead')}</p>
      <ul className={styles.keepList}>
        {KEEP_KEYS.map((key) => {
          const hint = KEEP_HINTS[key]
          return (
            <li key={key}>
              <CheckRow
                checked={!!checklist[key]}
                onChange={(on) => toggleChecklist(key, on)}
                label={t(`goldenHour.evidence.${key}`)}
                hint={hint ? t(hint) : undefined}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------------- reuse what Ruko already saw ---------------- */

/**
 * If a transfer left this phone during the incident, offer to copy its amount, payee and time
 * into the form (WCAG 3.3.7 Redundant Entry). Only fills boxes that are still empty.
 */
function PaymentSuggestion({ onFilled }: { onFilled: () => void }) {
  const { t, lang } = useT()
  const transfer = useStore((s) => s.incident.transfer)
  const evidence = useStore((s) => s.goldenHour.evidence)
  const updateEvidence = useStore((s) => s.updateEvidence)

  if (!moneyLeft(transfer)) return null
  if (evidence.amount && evidence.paidTo && evidence.paidAt) return null

  const fill = () => {
    updateEvidence({
      amount: evidence.amount || String(transfer.amount),
      paidTo: evidence.paidTo || transfer.payeeName,
      paidAt: evidence.paidAt || toLocalInputValue(transfer.requestedAt),
    })
    onFilled()
    // The suggestion disappears once used; put focus on the first filled box so it is not lost.
    document.getElementById(AMOUNT_ID)?.focus()
  }

  return (
    <Callout tone="info" icon={<ReceiptIndianRupee />} title={t('goldenHour.evidence.suggest.title')}>
      <div className={`${styles.suggest} ${fitClass}`}>
        <p>
          {rich(
            t('goldenHour.evidence.suggest.body', {
              amount: formatINR(transfer.amount, lang),
              time: formatTime(transfer.requestedAt, lang),
            }),
            { payee: <Mixed text={transfer.payeeName} lang={lang} /> },
          )}
        </p>
        <Button variant="secondary" onClick={fill}>
          {t('goldenHour.evidence.suggest.use')}
        </Button>
      </div>
    </Callout>
  )
}
