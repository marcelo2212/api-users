import * as winston from 'winston';

export const winstonConfig: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD/MM/YYYY, HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        }),
      ),
    }),
  ],
};
