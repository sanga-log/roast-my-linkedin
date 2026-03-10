import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames || []
    const isExtension = frames.some(
      (f) => f.filename?.includes('inpage.js') || f.filename?.includes('extensions/')
    )
    if (isExtension) return null
    return event
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
