import type { Lang } from '../state/types'
import type { FeatureStrings, Strings } from './types'
import { strings as common } from './common'
import { strings as home } from '../features/home/strings'
import { strings as setup } from '../features/setup/strings'
import { strings as call } from '../features/call/strings'
import { strings as pause } from '../features/pause/strings'
import { strings as check } from '../features/check/strings'
import { strings as transfer } from '../features/transfer/strings'
import { strings as family } from '../features/family/strings'
import { strings as demo } from '../features/demo/strings'
import { strings as goldenHour } from '../features/golden-hour/strings'
import { strings as adapt } from '../features/adapt/strings'
import { strings as accessibility } from '../features/accessibility/strings'
import { strings as about } from '../features/about/strings'
import { strings as drill } from '../features/drill/strings'

export const featureStrings: Record<string, FeatureStrings> = {
  common,
  home,
  setup,
  call,
  pause,
  check,
  transfer,
  family,
  demo,
  goldenHour,
  adapt,
  accessibility,
  about,
  drill,
}

function merge(lang: Lang): Strings {
  return Object.values(featureStrings).reduce<Strings>((acc, fs) => Object.assign(acc, fs[lang]), {})
}

export const dictionaries: Record<Lang, Strings> = { en: merge('en'), hi: merge('hi') }
