import { useId, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Building2,
  Copy,
  Download,
  Globe,
  Landmark,
  PencilLine,
  PhoneCall,
  Printer,
  Share2,
} from 'lucide-react'
import {
  Button,
  ButtonLink,
  DesignNote,
  RukoMark,
  Screen,
  SegmentedControl,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useNow } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { Lang } from '../../state/types'
import { paths, SECTION_STEP } from './model'
import { buildPack, packFileName, packToText, type ComplaintPack, type PackSection } from './pack'
import { Mixed, rich } from './rich'
import { canShare, copyText, downloadText, shareText } from './share'
import { fitClass, SectionKicker, Site } from './ui'
import styles from './PackPage.module.css'

/**
 * /golden-hour/pack — the complaint pack, built from her evidence and what Ruko saw on this
 * phone. The same document is shown, copied, shared, printed and downloaded. When printing,
 * only the document prints (see the print rules in PackPage.module.css).
 */
export function PackPage() {
  const { t, lang } = useT()
  const toast = useToast()
  const [packLang, setPackLang] = useState<Lang>(lang)
  const now = useNow(60_000)
  const elderName = useStore((s) => s.setup.elderName)
  const people = useStore((s) => s.people)
  const incident = useStore((s) => s.incident)
  const goldenHour = useStore((s) => s.goldenHour)
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const whereId = useId()
  const moreId = useId()

  const pack = useMemo(
    () => buildPack({ elderName, person: people[0] ?? null, people, incident, goldenHour }, packLang, now),
    [elderName, people, incident, goldenHour, packLang, now],
  )
  const text = useMemo(() => packToText(pack), [pack])
  const shareable = canShare()

  const markMade = () => toggleChecklist('pack', true)

  const onCopy = async () => {
    const ok = await copyText(text)
    if (ok) markMade()
    toast({ message: ok ? t('goldenHour.pack.copied') : t('goldenHour.pack.copyFailed') })
  }

  const onShare = async () => {
    const result = await shareText(pack.title, text)
    if (result === 'shared') markMade()
    if (result === 'failed') toast({ message: t('goldenHour.pack.shareFailed') })
  }

  const onPrint = () => {
    markMade()
    window.print()
  }

  const onDownload = () => {
    downloadText(packFileName(now), text)
    markMade()
    toast({ message: t('goldenHour.pack.downloaded') })
  }

  const copyButton = (primary: boolean) => (
    <Button
      variant={primary ? 'primary' : 'secondary'}
      size={primary ? 'lg' : 'md'}
      fullWidth
      icon={<Copy />}
      onClick={onCopy}
    >
      {t('goldenHour.pack.copy')}
    </Button>
  )

  // The main action lives in the sticky footer: Share where the phone supports it, otherwise Copy.
  const footer = (
    <div className={fitClass}>
      {shareable ? (
        <Button variant="primary" size="lg" fullWidth icon={<Share2 />} onClick={onShare}>
          {t('goldenHour.pack.share')}
        </Button>
      ) : (
        copyButton(true)
      )}
    </div>
  )

  return (
    <Screen title={t('goldenHour.pack.title')} back={paths.main} footer={footer}>
      <SectionKicker step={SECTION_STEP.pack} />
      <p className="lead">{t('goldenHour.pack.lead')}</p>

      <section className={styles.where} aria-labelledby={whereId}>
        <h2 id={whereId} className={styles.smallTitle}>
          {t('goldenHour.pack.where.title')}
        </h2>
        <ul className={styles.whereList}>
          <WhereItem icon={<PhoneCall />}>{t('goldenHour.pack.where.call')}</WhereItem>
          <WhereItem icon={<Globe />}>
            {rich(t('goldenHour.pack.where.portal'), { site: <Site>cybercrime.gov.in</Site> })}
          </WhereItem>
          <WhereItem icon={<Landmark />}>{t('goldenHour.pack.where.police')}</WhereItem>
          <WhereItem icon={<Building2 />}>{t('goldenHour.pack.where.bank')}</WhereItem>
        </ul>
      </section>

      <SegmentedControl<Lang>
        legend={t('goldenHour.pack.lang')}
        options={[
          { value: 'en', label: 'English', lang: 'en' },
          { value: 'hi', label: 'हिंदी', lang: 'hi' },
        ]}
        value={packLang}
        onChange={setPackLang}
      />

      <PackDocument pack={pack} />

      <ButtonLink to={paths.evidence} viewTransition variant="quiet" icon={<PencilLine />} className={styles.edit}>
        {t('goldenHour.pack.edit')}
      </ButtonLink>

      <section className={`${styles.more} ${fitClass}`} aria-labelledby={moreId}>
        <h2 id={moreId} className={styles.smallTitle}>
          {t('goldenHour.pack.more.title')}
        </h2>
        {shareable && copyButton(false)}
        <Button variant="secondary" fullWidth icon={<Printer />} onClick={onPrint}>
          {t('goldenHour.pack.print')}
        </Button>
        <Button variant="secondary" fullWidth icon={<Download />} onClick={onDownload}>
          {t('goldenHour.pack.download')}
        </Button>
      </section>

      <DesignNote title={t('goldenHour.pack.note.reuse.title')}>{t('goldenHour.pack.note.reuse.body')}</DesignNote>

      <div className={fitClass}>
        <ButtonLink to={paths.status} viewTransition variant="secondary" fullWidth iconEnd={<ArrowRight />}>
          {t('goldenHour.pack.next')}
        </ButtonLink>
      </div>
    </Screen>
  )
}

function WhereItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className={styles.whereItem}>
      <span className={styles.whereIcon} aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  )
}

/* ---------------- the document ---------------- */

/** A printable paper-like card. Its own `lang`, so an English pack on a Hindi screen reads right. */
function PackDocument({ pack }: { pack: ComplaintPack }) {
  const titleId = useId()
  return (
    <article className={styles.doc} lang={pack.lang} aria-labelledby={titleId}>
      <header className={styles.docHeader}>
        <RukoMark className={styles.docMark} />
        <div className={styles.docHeading}>
          <h2 id={titleId} className={styles.docTitle}>
            {pack.title}
          </h2>
          <p className={styles.docPrepared}>{pack.prepared}</p>
        </div>
      </header>

      <Rows section={pack.person} pack={pack} />

      <div className={styles.docSection}>
        <h3 className={styles.docSectionTitle}>{pack.summaryHeading}</h3>
        <p className={styles.summary}>
          <Mixed text={pack.summary} lang={pack.lang} />
        </p>
      </div>

      <Rows section={pack.payment} pack={pack} />
      <Rows section={pack.caller} pack={pack} />

      <div className={styles.docSection}>
        <h3 className={styles.docSectionTitle}>{pack.timelineHeading}</h3>
        {pack.timeline.length > 0 ? (
          <ol className={styles.timeline}>
            {pack.timeline.map((e, i) => (
              <li key={`${e.at}-${i}`} className={styles.event}>
                <time dateTime={new Date(e.at).toISOString()} className={styles.eventTime}>
                  {e.time}
                </time>
                <span className={styles.eventText}>
                  <Mixed text={e.text} lang={pack.lang} />
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.unknown}>{pack.timelineEmpty}</p>
        )}
      </div>

      <footer className={styles.docFooter}>
        <p>{pack.footer}</p>
      </footer>
    </article>
  )
}

function Rows({ section, pack }: { section: PackSection; pack: ComplaintPack }) {
  return (
    <div className={styles.docSection}>
      <h3 className={styles.docSectionTitle}>{section.heading}</h3>
      <dl className={styles.rows}>
        {section.rows.map((row) => (
          <div key={row.id} className={styles.row}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={[styles.value, row.numeric && styles.numeric, row.value === null && styles.unknown].filter(Boolean).join(' ')}>
              {row.value === null ? pack.notKnown : <Mixed text={row.value} lang={pack.lang} />}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
