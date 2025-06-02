import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controller/users.controller';
import { User } from './entities/user.entity';
import { RedisModule } from 'src/redis/redis.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'src/common/logger/winston-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [UsersController],
  providers: [UsersService, Logger],
  exports: [UsersService],
})
export class UsersModule {}
