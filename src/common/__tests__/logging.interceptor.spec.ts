import { LoggingInterceptor } from '../interceptos/logging.interceptor';
import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  const mockLogger = {
    log: jest.fn(),
  };

  beforeEach(() => {
    interceptor = new LoggingInterceptor(mockLogger as unknown as Logger);
    jest.clearAllMocks();
  });

  it('deve logar método, rota e tempo de execução', async () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/users',
        }),
      }),
    } as Partial<ExecutionContext> as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('resultado'),
    } as Partial<CallHandler> as CallHandler;

    const result = await interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toBe('resultado');
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringMatching(/\[GET\] \/users - \d+ms/),
    );
  });
});
