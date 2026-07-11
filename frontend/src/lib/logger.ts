type LogLevel = 'info' | 'warn' | 'error'

function log(level: LogLevel, message: string, meta?: unknown) {
  const infoEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true'

  if (level === 'info' && !infoEnabled) return

  queueMicrotask(() => {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        console.error(prefix, message, meta ?? '')
        break
      case 'warn':
        console.warn(prefix, message, meta ?? '')
        break
      default:
        console.log(prefix, message, meta ?? '')
    }
  })
}

export const logger = {
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
}
