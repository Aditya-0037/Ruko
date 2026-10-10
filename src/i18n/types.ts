export type Strings = Record<string, string>

/** Every feature exports one of these from its strings.ts. Keys are flat and prefixed "<feature>.". */
export interface FeatureStrings {
  en: Strings
  hi: Strings
}
