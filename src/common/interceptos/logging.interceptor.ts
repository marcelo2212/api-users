import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger = new Logger('Request')) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const time = `${Date.now() - now}ms`;
        const timestamp = new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        });
        this.logger.log(`[${method}] ${url} - ${time} - ${timestamp}`);
      }),
    );
  }
}
