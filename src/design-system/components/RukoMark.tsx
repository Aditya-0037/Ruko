/** The Ruko mark: a calm hand-raised "stop" inside a rounded shield. Decorative. */
export function RukoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 3 6 10v12c0 11.5 7.7 20.5 18 23 10.3-2.5 18-11.5 18-23V10L24 3Z" fill="var(--teal-700)" />
      <path
        d="M19.5 33.5c-2.6-1.4-4.3-4-4.3-7.2v-6.1a1.7 1.7 0 0 1 3.4 0v3.6V14.6a1.7 1.7 0 0 1 3.4 0v7.6-9.4a1.7 1.7 0 0 1 3.4 0v9.4-7.6a1.7 1.7 0 0 1 3.4 0v9.2-5.4a1.7 1.7 0 0 1 3.4 0v8.9c0 5.2-3.9 8.7-8.6 8.7-1.6 0-3-.2-4.1-.6Z"
        fill="var(--marigold-300)"
      />
    </svg>
  )
}
