import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, CircleAlert, Info } from 'lucide-react'
import { Button, ChoiceGroup, DesignNote, Screen, StepProgress, type Choice } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import type { CheckAnswer } from '../../state/types'
import { backPath, nextPath, signalAt, TOTAL_QUESTIONS } from './questions'
import styles from './QuestionPage.module.css'

/**
 * One script-check question. The question is the page title (h1); the radio group is named by
 * the same words. Tapping an answer saves it at once. Continue is never disabled: with no answer
 * it shows a short message and moves focus to it.
 */
export function QuestionPage({ step }: { step: number }) {
  const { t } = useT()
  const navigate = useNavigate()
  const id = signalAt(step)
  const answer = useStore((s) => s.incident.answers[id])
  const answerCheck = useStore((s) => s.answerCheck)
  // Counts Continue presses without an answer; every press re-focuses the message.
  const [attempts, setAttempts] = useState(0)
  const errorRef = useRef<HTMLParagraphElement>(null)

  const question = t(`check.q.${id}`)
  const isLast = step === TOTAL_QUESTIONS
  const showError = attempts > 0 && !answer

  useEffect(() => {
    if (attempts > 0) errorRef.current?.focus()
  }, [attempts])

  const options: Choice<CheckAnswer>[] = [
    { value: 'yes', label: t('common.yes') },
    { value: 'no', label: t('common.no') },
    { value: 'unsure', label: t('common.notSure'), description: t('check.notSureHint') },
  ]

  const onContinue = () => {
    if (!answer) {
      setAttempts((n) => n + 1)
      return
    }
    navigate(nextPath(step), { viewTransition: true })
  }

  return (
    <Screen
      title={question}
      back={backPath(step)}
      tone="calm"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          iconEnd={<ArrowRight />}
          onClick={onContinue}
          className={styles.continue}
        >
          {isLast ? t('check.seeResult') : t('common.continue')}
        </Button>
      }
    >
      {/* Shown above the question (CSS order); read after it, so the question is heard first. */}
      <div className={styles.progress}>
        <StepProgress current={step} total={TOTAL_QUESTIONS} />
      </div>

      <div className={styles.why}>
        <Info aria-hidden="true" className={styles.whyIcon} />
        <p className={styles.whyLabel}>{t('check.why')}</p>
        <p className={styles.whyBody}>{t(`check.q.${id}.help`)}</p>
      </div>

      <div className={[styles.choices, showError && styles.invalid].filter(Boolean).join(' ')}>
        {showError && (
          <p ref={errorRef} tabIndex={-1} className={styles.error}>
            <CircleAlert aria-hidden="true" />
            <span>{t('check.error')}</span>
          </p>
        )}
        <ChoiceGroup
          legend={question}
          hideLegend
          name={`check-${id}`}
          options={options}
          value={answer}
          onChange={(value) => answerCheck(id, value)}
        />
      </div>

      <DesignNote title={t('check.note.onePage.title')}>{t('check.note.onePage.body')}</DesignNote>
      <DesignNote title={t('check.note.continue.title')}>{t('check.note.continue.body')}</DesignNote>
    </Screen>
  )
}
