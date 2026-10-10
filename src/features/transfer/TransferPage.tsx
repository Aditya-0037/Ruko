import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowRight,
  CircleCheck,
  Clapperboard,
  Hand,
  House,
  Info,
  Landmark,
  RotateCcw,
  Send,
  Settings2,
  Smartphone,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import {
  Button,
  ButtonLink,
  Callout,
  DesignNote,
  Field,
  Screen,
  SegmentedControl,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatINR, formatNumberIN } from '../../lib/format'
import { useStore } from '../../state/store'
import type { TransferRequest } from '../../state/types'
import { Mixed, useRichT } from './rich'
import {
  amountInWords,
  MAX_AMOUNT_DIGITS,
  primaryRule,
  SAVED_PAYEE,
  SCAM_AMOUNT,
  SCAM_PAYEE,
  SMALL_AMOUNT,
} from './transferModel'
import styles from './TransferPage.module.css'

type PayeeKind = 'new' | 'saved'

/**
 * /transfer — a clearly labelled, simulated third-party bank app, prefilled with the scam a
 * "digital arrest" caller pushes for. Ruko is a layer beside it: big payments to new people are
 * paused by the elder's own rule; everyday payments go straight through.
 */
export function TransferPage() {
  const { t, lang } = useT()
  const rt = useRichT()
  const navigate = useNavigate()
  const requestTransfer = useStore((s) => s.requestTransfer)
  const rules = useStore((s) => s.rules)
  const callActive = useStore((s) => s.incident.callActive)
  const pausedAmount = useStore((s) => (s.incident.transfer?.status === 'paused' ? s.incident.transfer.amount : null))

  const [kind, setKind] = useState<PayeeKind>('new')
  const [digits, setDigits] = useState(String(SCAM_AMOUNT))
  const [showError, setShowError] = useState(false)
  const [receipt, setReceipt] = useState<TransferRequest | null>(null)
  const receiptRef = useRef<HTMLHeadingElement>(null)
  const sendAgainRef = useRef(false)
  const amountId = useId()
  const frameTitleId = useId()
  const tryTitleId = useId()

  const amount = digits ? Number(digits) : 0
  const payee = kind === 'new' ? SCAM_PAYEE : SAVED_PAYEE
  const rule = primaryRule(rules)

  useEffect(() => {
    // The form is replaced by the receipt: move focus there so it is not lost.
    if (receipt) receiptRef.current?.focus()
    else if (sendAgainRef.current) {
      sendAgainRef.current = false
      document.getElementById(amountId)?.focus()
    }
  }, [receipt, amountId])

  const onAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_AMOUNT_DIGITS)
    setDigits(next)
    if (next) setShowError(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) {
      setShowError(true)
      document.getElementById(amountId)?.focus()
      return
    }
    const result = requestTransfer({ amount, payeeName: payee.name, payeeIsNew: kind === 'new' })
    if (result.status === 'paused') navigate('/transfer/paused', { viewTransition: true })
    else setReceipt(result)
  }

  const tryAgain = () => {
    sendAgainRef.current = true
    setReceipt(null)
  }

  const ruleLine = rule
    ? t(rule.payee === 'any' ? 'transfer.try.rule.any' : 'transfer.try.rule.new', {
        amount: formatINR(rule.minAmount, lang),
      })
    : null

  return (
    <Screen title={t('transfer.title')} back={callActive ? '/pause' : '/'}>
      <p className="lead">{t('transfer.lead')}</p>

      {pausedAmount !== null && !receipt && (
        <Callout tone="caution" icon={<Hand />} title={t('transfer.alreadyPaused', { amount: formatINR(pausedAmount, lang) })}>
          <ButtonLink to="/transfer/paused" viewTransition variant="secondary" iconEnd={<ArrowRight />} className={styles.calloutAction}>
            {t('transfer.alreadyPausedLink')}
          </ButtonLink>
        </Callout>
      )}

      <section className={styles.frame} aria-labelledby={frameTitleId}>
        <div className={styles.frameBar}>
          <h2 id={frameTitleId} className={styles.frameTitle}>
            <Smartphone aria-hidden="true" />
            <span>{t('transfer.frameLabel')}</span>
          </h2>
          <span className={styles.badge}>
            <Clapperboard aria-hidden="true" />
            <span>{t('transfer.frameBadge')}</span>
          </span>
        </div>

        <div className={styles.app}>
          <div className={styles.appHeader}>
            <span className={styles.appLogo} aria-hidden="true">
              <Landmark />
            </span>
            <div className={styles.appHeaderText}>
              <p className={styles.appName}>{t('transfer.app.name')}</p>
              <p className={styles.appSub}>{t('transfer.app.subtitle')}</p>
            </div>
          </div>

          {receipt ? (
            <div className={styles.receipt}>
              <span className={styles.receiptIcon} aria-hidden="true">
                <CircleCheck />
              </span>
              <h3 ref={receiptRef} tabIndex={-1} className={styles.receiptTitle}>
                {t('transfer.receipt.title', { amount: formatINR(receipt.amount, lang) })}
              </h3>
              <p className={styles.receiptTo}>{rt('transfer.receipt.to', { payee: receipt.payeeName })}</p>
              <p className={styles.fineprint}>{t('transfer.receipt.practice')}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={submit} noValidate>
              <div className={styles.payee}>
                <p className={styles.payLabel}>{t('transfer.app.payingTo')}</p>
                <div className={styles.payeeRow}>
                  <span className={styles.avatar} aria-hidden="true">
                    {payee.initials}
                  </span>
                  <div className={styles.payeeText}>
                    <p className={styles.payeeName}>
                      <Mixed text={payee.name} uiLang={lang} />
                    </p>
                    <p className={styles.account}>{t('transfer.app.account', { digits: payee.digits })}</p>
                  </div>
                </div>
                <p className={[styles.tag, kind === 'new' ? styles.tagNew : styles.tagSaved].join(' ')}>
                  {kind === 'new' ? <UserPlus aria-hidden="true" /> : <UserCheck aria-hidden="true" />}
                  <span>
                    <strong>{t(kind === 'new' ? 'transfer.app.newPayee' : 'transfer.app.savedPayee')}</strong>
                    {' · '}
                    {t(kind === 'new' ? 'transfer.app.newPayeeHint' : 'transfer.app.savedPayeeHint')}
                  </span>
                </p>
              </div>

              <div className={styles.amount}>
                <Field
                  id={amountId}
                  label={t('transfer.app.amountLabel')}
                  inputMode="numeric"
                  autoComplete="off"
                  value={digits ? formatNumberIN(Number(digits), lang) : ''}
                  onChange={onAmount}
                  error={showError ? t('transfer.app.amountError') : undefined}
                  className={styles.amountInput}
                />
                {amount > 0 && (
                  <p className={styles.words}>{t('transfer.app.amountWords', { words: amountInWords(t, amount) })}</p>
                )}
              </div>

              <Button type="submit" size="lg" fullWidth icon={<Send />} className={styles.sendButton}>
                {t('transfer.app.send')}
              </Button>
              <p className={styles.fineprint}>{t('transfer.app.fineprint')}</p>
            </form>
          )}
        </div>
      </section>

      <p className={styles.alongside}>
        <Info aria-hidden="true" />
        <span>
          <strong>{t('transfer.alongside')}</strong> {t('transfer.alongsideBody')}
        </span>
      </p>

      {receipt ? (
        <>
          <Callout tone="info" icon={<Hand />} title={t('transfer.receipt.noRuleTitle')}>
            {rule ? (
              <>
                <p>{t('transfer.receipt.noRuleBody')}</p>
                <p>{ruleLine}</p>
              </>
            ) : (
              <p>{t('transfer.receipt.noRulesSet')}</p>
            )}
          </Callout>
          <div className={styles.actions}>
            {!rule && (
              <ButtonLink to="/setup/rules" viewTransition variant="primary" fullWidth icon={<Settings2 />}>
                {t('transfer.receipt.setRule')}
              </ButtonLink>
            )}
            <Button variant={rule ? 'primary' : 'secondary'} fullWidth icon={<RotateCcw />} onClick={tryAgain}>
              {t('transfer.receipt.again')}
            </Button>
            <ButtonLink to="/" viewTransition variant="quiet" fullWidth icon={<House />}>
              {t('transfer.home')}
            </ButtonLink>
          </div>
        </>
      ) : (
        <section className={styles.try} aria-labelledby={tryTitleId}>
          <h2 id={tryTitleId} className={styles.sectionTitle}>
            {t('transfer.try.title')}
          </h2>
          <p>{ruleLine ? `${ruleLine} ${t('transfer.try.hint')}` : t('transfer.try.noRule')}</p>
          <SegmentedControl<PayeeKind>
            legend={t('transfer.try.payeeLegend')}
            value={kind}
            onChange={setKind}
            options={[
              { value: 'new', label: t('transfer.try.payeeNew') },
              { value: 'saved', label: t('transfer.try.payeeSaved') },
            ]}
          />
          <div className={styles.quick} role="group" aria-label={t('transfer.try.amountsLabel')}>
            {[SMALL_AMOUNT, SCAM_AMOUNT].map((value) => (
              <Button
                key={value}
                variant="secondary"
                onClick={() => {
                  setDigits(String(value))
                  setShowError(false)
                }}
              >
                {t('transfer.try.amount', { amount: formatINR(value, lang) })}
              </Button>
            ))}
          </div>
        </section>
      )}

      <DesignNote title={t('transfer.note.alongside.title')}>{t('transfer.note.alongside.body')}</DesignNote>
      <DesignNote title={t('transfer.note.words.title')}>{t('transfer.note.words.body')}</DesignNote>
    </Screen>
  )
}
