import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { safeLog } from 'src/common/util/safe-log.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly loggerContext = 'HttpExceptionFilter';

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = 'Erro interno do servidor';
    let stack: string | undefined = undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any)?.message || JSON.stringify(res);
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    } else {
      message = JSON.stringify(exception, null, 2);
    }

    safeLog(this.logger, 'error', `Erro HTTP ${status}`, {
      context: this.loggerContext,
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      stack,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
