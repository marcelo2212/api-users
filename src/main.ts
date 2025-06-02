import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as v8 from 'v8';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(app.get(AllExceptionsFilter));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(express.json({ limit: '1mb' }));
  app.use(bodyParser.json({ limit: '1mb' }));

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  try {
    const port = Number(process.env?.PORT) || 8080;
    await app.listen(port);
    console.log(`\n\n🎉 Server started on port: ${port}\n`);
    setTimeout(() => {
      const mem = process.memoryUsage();
      for (const key in mem) {
        console.log(
          `Memory: ${key} ${
            Math.round((mem[key] / 1024 / 1024) * 100) / 100
          } MB`,
        );
      }

      console.log('node options:', process.execArgv);
      console.log(
        'V8 heap limit: %d MB',
        v8.getHeapStatistics().heap_size_limit / (1024 * 1024),
      );
    }, 1);
  } catch (err) {
    console.error(`\n\n❌ [Server error] Failed to start server:\n`, err, `\n`);
  }
}
bootstrap();
