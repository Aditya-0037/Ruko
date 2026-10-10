import { Accessibility, PhoneCall, ShieldAlert, Siren, UserPlus } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { useTrustedPerson } from '../../state/hooks'
import { ButtonAnchor, ButtonLink } from './Button'
import { Dialog } from './Dialog'
import { Callout } from './Callout'

/** The same help, in the same place, on every screen (WCAG 3.2.6 Consistent Help). */
export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const person = useTrustedPerson()
  const tel = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, '')}`

  return (
    <Dialog open={open} onClose={onClose} title={t('help.title')}>
      <Callout tone="info" icon={<ShieldAlert />}>
        {t('help.reassure')}
      </Callout>
      {person ? (
        <ButtonAnchor href={tel(person.phone)} variant="primary" size="lg" fullWidth icon={<PhoneCall />}>
          {t('help.callPerson', { name: person.name })}
        </ButtonAnchor>
      ) : (
        <ButtonLink to="/setup/person" variant="primary" size="lg" fullWidth icon={<UserPlus />} onClick={onClose}>
          {t('help.callPersonNone')}
        </ButtonLink>
      )}
      <ButtonAnchor href="tel:1930" variant="danger" fullWidth icon={<PhoneCall />}>
        {t('help.call1930')}
      </ButtonAnchor>
      <ButtonAnchor href="tel:112" variant="secondary" fullWidth icon={<Siren />}>
        {t('help.call112')}
      </ButtonAnchor>
      <ButtonLink to="/adapt" variant="quiet" fullWidth icon={<Accessibility />} onClick={onClose}>
        {t('help.adapt')}
      </ButtonLink>
    </Dialog>
  )
}
