import { Logger } from 'winston';

type LogLevel = 'info' | 'warn' | 'error';

export function safeLog(
  logger: Logger,
  level: LogLevel,
  message: string,
  meta: Record<string, any> = {},
): void {
  try {
    if (logger && typeof logger[level] === 'function') {
      logger[level](message, meta);
    } else {
      console.error(`[safeLog] Logger.${level} is not a function`, {
        message,
        meta,
      });
    }
  } catch (err) {
    console.error(`[LoggerFallback] Logging failed: ${err.message}`, {
      message,
      meta,
    });
  }
}
