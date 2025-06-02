import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { safeLog } from 'src/common/util/safe-log.util';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (logger: Logger) => {
    const redisUrl = process.env.REDIS_URL;
    const loggerContext = 'RedisProvider';

    if (!redisUrl) {
      safeLog(logger, 'error', 'REDIS_URL não definida no .env', {
        context: loggerContext,
      });
      throw new Error('REDIS_URL não definida no .env');
    }

    const client = new Redis(redisUrl, {
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
    });

    client.on('connect', () => {
      safeLog(logger, 'info', 'Redis conectado com sucesso', {
        context: loggerContext,
      });
    });

    client.on('error', (err) => {
      safeLog(logger, 'error', `Erro na conexão com Redis: ${err.message}`, {
        context: loggerContext,
        stack: err.stack,
      });
    });

    return client;
  },
  inject: [WINSTON_MODULE_NEST_PROVIDER],
};
