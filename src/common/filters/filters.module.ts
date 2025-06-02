import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

@Module({
  providers: [
    {
      provide: AllExceptionsFilter,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AllExceptionsFilter],
})
export class FiltersModule {}
