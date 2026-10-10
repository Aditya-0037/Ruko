import { useId, useRef, useState } from 'react'
import { BadgeCheck, Contrast, Minus, Plus, RotateCcw, Snail } from 'lucide-react'
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  DesignNote,
  Screen,
  SegmentedControl,
  Switch,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { isSpeechSupported } from '../../lib/speech'
import { defaultPrefs, useStore } from '../../state/store'
import type { Lang, Prefs } from '../../state/types'
import { AdaptPreview } from './AdaptPreview'
import { TEXT_SCALES, nearestScaleIndex, parseScale, samePrefs, scalePercent } from './textScale'
import { backTarget, useMediaQuery } from './useMediaQuery'
import styles from './AdaptPage.module.css'

type Motion = Prefs['motion']

/**
 * /adapt — "Adapt to me". Every control writes setPrefs and the shell (PrefsEffect) applies it
 * to the whole app instantly, so the preview at the top is simply Ruko itself.
 */
export function AdaptPage() {
  const { t, lang } = useT()
  const prefs = useStore((s) => s.prefs)
  const setPrefs = useStore((s) => s.setPrefs)
  const toast = useToast()
  const [back] = useState(backTarget)

  // Phone (OS) settings, for gentle suggestions. Defaults already follow the phone where they can.
  const osMoreContrast = useMediaQuery('(prefers-contrast: more)')
  const osReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [dismissed, setDismissed] = useState<{ contrast?: boolean; motion?: boolean }>({})

  const contrastRowRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  const sizeHintId = useId()

  const sizeIndex = nearestScaleIndex(prefs.textScale)
  const atMin = sizeIndex === 0
  const atMax = sizeIndex === TEXT_SCALES.length - 1
  const percent = (scale: number) => t('adapt.size.percent', { value: scalePercent(scale) })

  const stepSize = (dir: -1 | 1) => {
    const next = TEXT_SCALES[sizeIndex + dir]
    if (next !== undefined) setPrefs({ textScale: next })
  }

  const focusContrastSwitch = () => contrastRowRef.current?.querySelector<HTMLElement>('[role="switch"]')?.focus()
  const focusMotionChoice = (value?: Motion) =>
    motionRef.current?.querySelector<HTMLElement>(value ? `input[value="${value}"]` : 'input:checked')?.focus()

  const acceptContrast = () => {
    setPrefs({ contrast: 'high' })
    focusContrastSwitch()
    toast({
      message: t('adapt.toast.contrastOn'),
      actionLabel: t('common.undo'),
      onAction: () => setPrefs({ contrast: 'standard' }),
    })
  }

  const acceptMotion = () => {
    setPrefs({ motion: 'reduce' })
    focusMotionChoice('reduce')
    toast({
      message: t('adapt.toast.motionReduce'),
      actionLabel: t('common.undo'),
      onAction: () => setPrefs({ motion: 'system' }),
    })
  }

  const reset = () => {
    const before = useStore.getState().prefs
    // Language is the person's own choice, not a display tweak: switching it under them would be disorienting.
    const target: Prefs = { ...defaultPrefs, lang: before.lang }
    if (samePrefs(before, target)) {
      toast({ message: t('adapt.reset.nothing') })
      return
    }
    setPrefs(target)
    toast({ message: t('adapt.reset.done'), actionLabel: t('common.undo'), onAction: () => setPrefs(before) })
  }

  const showContrastTip = osMoreContrast && prefs.contrast === 'standard' && !dismissed.contrast
  const showMotionTip = osReduceMotion && prefs.motion === 'system' && !dismissed.motion

  const motionHint =
    prefs.motion === 'reduce'
      ? t('adapt.motion.hint.reduce')
      : prefs.motion === 'full'
        ? t('adapt.motion.hint.full')
        : osReduceMotion
          ? t('adapt.motion.hint.systemReduce')
          : t('adapt.motion.hint.systemFull')

  const otherLang: Lang = lang === 'en' ? 'hi' : 'en'

  return (
    <Screen title={t('adapt.title')} back={back}>
      <p className="lead">{t('adapt.lead')}</p>

      {showContrastTip && (
        <Callout tone="info" icon={<Contrast />} title={t('adapt.suggest.contrast.title')}>
          <p>{t('adapt.suggest.contrast.body')}</p>
          <div className={styles.tipActions}>
            <Button variant="primary" onClick={acceptContrast}>
              {t('adapt.suggest.contrast.action')}
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                setDismissed((d) => ({ ...d, contrast: true }))
                focusContrastSwitch()
              }}
            >
              {t('adapt.suggest.dismiss')}
            </Button>
          </div>
        </Callout>
      )}

      {showMotionTip && (
        <Callout tone="info" icon={<Snail />} title={t('adapt.suggest.motion.title')}>
          <p>{t('adapt.suggest.motion.body')}</p>
          <div className={styles.tipActions}>
            <Button variant="primary" onClick={acceptMotion}>
              {t('adapt.suggest.motion.action')}
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                setDismissed((d) => ({ ...d, motion: true }))
                focusMotionChoice()
              }}
            >
              {t('adapt.suggest.dismiss')}
            </Button>
          </div>
        </Callout>
      )}

      <AdaptPreview />

      <DesignNote title={t('adapt.note.control.title')}>{t('adapt.note.control.body')}</DesignNote>

      {/* Language */}
      <Card as="section" aria-labelledby="adapt-lang">
        <h2 id="adapt-lang" className={styles.sectionTitle}>
          <span>{t('adapt.lang.heading')}</span>
          <span className={styles.otherLang} lang={otherLang}>
            {t('adapt.lang.headingOther')}
          </span>
        </h2>
        <SegmentedControl<Lang>
          legend={t('adapt.lang.legend')}
          hideLegend
          value={prefs.lang}
          onChange={(value) => setPrefs({ lang: value })}
          options={[
            { value: 'en', label: t('adapt.lang.en'), lang: 'en' },
            { value: 'hi', label: t('adapt.lang.hi'), lang: 'hi' },
          ]}
        />
      </Card>

      {/* Text size */}
      <Card as="section" aria-labelledby="adapt-size">
        <h2 id="adapt-size" className={styles.sectionTitle}>
          {t('adapt.size.heading')}
        </h2>
        <p id={sizeHintId} className={styles.hint}>
          {t('adapt.size.hint')}
        </p>
        <div className={styles.stepper}>
          {/*
            A status message (WCAG 4.1.3): focus stays on Smaller/Bigger, so the new size is
            announced politely. It changes only when the person presses a button.
          */}
          <output className={styles.sizeNow} aria-live="polite">
            <span className={styles.sizeNowLabel}>{t('adapt.size.currentLabel')}</span>{' '}
            <span className={styles.sizeNowValue}>{percent(TEXT_SCALES[sizeIndex])}</span>
          </output>
          <div className={styles.stepButtons}>
            <Button
              variant="secondary"
              icon={<Minus />}
              aria-disabled={atMin || undefined}
              aria-describedby={sizeHintId}
              onClick={() => stepSize(-1)}
            >
              {t('adapt.size.smaller')}
            </Button>
            <Button
              variant="secondary"
              icon={<Plus />}
              aria-disabled={atMax || undefined}
              aria-describedby={sizeHintId}
              onClick={() => stepSize(1)}
            >
              {t('adapt.size.bigger')}
            </Button>
          </div>
        </div>
        <SegmentedControl<string>
          legend={t('adapt.size.legend')}
          value={String(TEXT_SCALES[sizeIndex])}
          onChange={(value) => {
            const scale = parseScale(value)
            if (scale !== undefined) setPrefs({ textScale: scale })
          }}
          options={TEXT_SCALES.map((s) => ({ value: String(s), label: percent(s) }))}
        />
        <DesignNote title={t('adapt.note.size.title')}>{t('adapt.note.size.body')}</DesignNote>
      </Card>

      {/* Seeing and reading */}
      <Card as="section" aria-labelledby="adapt-see">
        <h2 id="adapt-see" className={styles.sectionTitle}>
          {t('adapt.see.heading')}
        </h2>
        <div className={styles.switches}>
          <div ref={contrastRowRef}>
            <Switch
              label={t('adapt.contrast.label')}
              description={t('adapt.contrast.desc')}
              checked={prefs.contrast === 'high'}
              onChange={(on) => setPrefs({ contrast: on ? 'high' : 'standard' })}
            />
          </div>
          <Switch
            label={t('adapt.easyRead.label')}
            description={t('adapt.easyRead.desc')}
            checked={prefs.easyRead}
            onChange={(on) => setPrefs({ easyRead: on })}
          />
        </div>
      </Card>

      {/* Sound and movement */}
      <Card as="section" aria-labelledby="adapt-sound">
        <h2 id="adapt-sound" className={styles.sectionTitle}>
          {t('adapt.sound.heading')}
        </h2>
        <div className={styles.switches}>
          <div>
            <Switch
              label={t('adapt.readAloud.label')}
              description={t('adapt.readAloud.desc')}
              checked={prefs.readAloud}
              onChange={(on) => setPrefs({ readAloud: on })}
            />
            {!isSpeechSupported() && <p className={styles.hint}>{t('adapt.readAloud.unsupported')}</p>}
          </div>
          <div ref={motionRef} className={styles.motion}>
            <SegmentedControl<Motion>
              legend={t('adapt.motion.legend')}
              value={prefs.motion}
              onChange={(value) => setPrefs({ motion: value })}
              options={[
                { value: 'system', label: t('adapt.motion.system') },
                { value: 'reduce', label: t('adapt.motion.reduce') },
                { value: 'full', label: t('adapt.motion.full') },
              ]}
            />
            <p className={styles.hint}>{motionHint}</p>
          </div>
        </div>
      </Card>

      {/* For judges */}
      <Card as="section" aria-labelledby="adapt-judges" tone="sunken">
        <h2 id="adapt-judges" className={styles.sectionTitle}>
          {t('adapt.judges.heading')}
        </h2>
        <Switch
          label={t('adapt.notes.label')}
          description={t('adapt.notes.desc')}
          checked={prefs.designNotes}
          onChange={(on) => setPrefs({ designNotes: on })}
        />
      </Card>

      <div className={styles.resetBlock}>
        <Button variant="quiet" icon={<RotateCcw />} onClick={reset} aria-describedby="adapt-reset-hint">
          {t('adapt.reset')}
        </Button>
        <p id="adapt-reset-hint" className={styles.hint}>
          {t('adapt.reset.hint')}
        </p>
      </div>

      <ButtonLink to="/accessibility" viewTransition variant="secondary" fullWidth icon={<BadgeCheck />}>
        {t('adapt.more')}
      </ButtonLink>
    </Screen>
  )
}
