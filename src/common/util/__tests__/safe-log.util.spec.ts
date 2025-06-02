import { safeLog } from '../safe-log.util';
import { Logger } from 'winston';

describe('safeLog', () => {
  let mockLogger: Partial<Record<'info' | 'warn' | 'error', jest.Mock>>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar logger.info corretamente', () => {
    safeLog(mockLogger as unknown as Logger, 'info', 'mensagem info', {
      user: 'marcelo',
    });
    expect(mockLogger.info).toHaveBeenCalledWith('mensagem info', {
      user: 'marcelo',
    });
  });

  it('deve chamar logger.warn corretamente', () => {
    safeLog(mockLogger as unknown as Logger, 'warn', 'mensagem warn', {
      id: 1,
    });
    expect(mockLogger.warn).toHaveBeenCalledWith('mensagem warn', { id: 1 });
  });

  it('deve chamar logger.error corretamente', () => {
    safeLog(mockLogger as unknown as Logger, 'error', 'erro fatal', {
      stack: 'trace',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('erro fatal', {
      stack: 'trace',
    });
  });

  it('deve usar console.error se logger[level] não for função', () => {
    const brokenLogger = {};
    safeLog(brokenLogger as Logger, 'info', 'mensagem', { foo: 'bar' });
    expect(console.error).toHaveBeenCalledWith(
      '[safeLog] Logger.info is not a function',
      {
        message: 'mensagem',
        meta: { foo: 'bar' },
      },
    );
  });

  it('deve capturar exceções e usar fallback', () => {
    const faultyLogger = {
      error: () => {
        throw new Error('Falha no logger');
      },
    };
    safeLog(faultyLogger as unknown as Logger, 'error', 'falha crítica', {
      key: 'value',
    });

    expect(console.error).toHaveBeenCalledWith(
      '[LoggerFallback] Logging failed: Falha no logger',
      {
        message: 'falha crítica',
        meta: { key: 'value' },
      },
    );
  });
});
