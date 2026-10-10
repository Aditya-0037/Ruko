import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Check, CloudCheck, PencilLine } from 'lucide-react'
import { Button, Screen, StepProgress } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { editReturnPath, nextStep, OPTIONAL_STEPS, prevStep, SETUP_STEPS, stepIndex, stepPath, type SetupStep } from './steps'
import styles from './Setup.module.css'

interface SetupLayoutProps {
  step: SetupStep
  title: string
  /** Return false to stay on the step (the step shows its own errors). Never disable Continue instead. */
  validate?: () => boolean
  /** Replace the default Continue footer; `false` for none (the last step keeps its links in the page). */
  footer?: ReactNode | false
  /** Decorative element shown above the heading (the done badge). */
  hero?: ReactNode
  children: ReactNode
}

/**
 * One question per page: progress above the question, the answer below, Continue in the thumb zone.
 * Answers autosave as they change, so Back and Continue never lose anything.
 */
export function SetupLayout({ step, title, validate, footer, hero, children }: SetupLayoutProps) {
  const { t } = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = editReturnPath(params.get('from'))
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [attempt, setAttempt] = useState(0)

  const prev = prevStep(step)
  const next = nextStep(step)
  const back = returnTo ?? (prev ? stepPath(prev) : '/')
  const go = (to: string) => navigate(to, { viewTransition: true })

  // After a failed Continue, move focus to the first field that needs fixing (WCAG 3.3.1).
  useEffect(() => {
    if (attempt === 0) return
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [attempt])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate && !validate()) {
      setAttempt((a) => a + 1)
      return
    }
    go(returnTo ?? (next ? stepPath(next) : '/'))
  }

  const optional = OPTIONAL_STEPS.includes(step)

  const defaultFooter = (
    <>
      <Button
        type="submit"
        form={formId}
        variant="primary"
        size="lg"
        fullWidth
        iconEnd={returnTo ? <Check /> : <ArrowRight />}
      >
        {returnTo ? t('setup.saveAndBack') : t('common.continue')}
      </Button>
      {optional && !returnTo && next && (
        <Button variant="quiet" fullWidth onClick={() => go(stepPath(next))}>
          {t('common.skip')}
        </Button>
      )}
    </>
  )

  return (
    <Screen title={title} back={back} tone="calm" footer={footer === undefined ? defaultFooter : footer || undefined}>
      {hero && <div className={styles.hero}>{hero}</div>}
      <div className={styles.top}>
        <div className={styles.progressSlot}>
          {returnTo ? (
            <p className={styles.editing}>
              <PencilLine aria-hidden="true" />
              <span>{t('setup.editing')}</span>
            </p>
          ) : (
            <StepProgress current={stepIndex(step) + 1} total={SETUP_STEPS.length} />
          )}
        </div>
        <p className={styles.autosave}>
          <CloudCheck aria-hidden="true" />
          <span>{t('setup.autosave')}</span>
        </p>
      </div>
      <form id={formId} ref={formRef} noValidate onSubmit={onSubmit} className={styles.form}>
        {children}
      </form>
    </Screen>
  )
}
