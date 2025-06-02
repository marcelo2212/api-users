import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

describe('UsersModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: 'REDIS_CLIENT', useValue: mockRedisClient },
        { provide: 'NestWinston', useValue: mockLogger },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();
  });

  it('deve estar definido', () => {
    expect(module).toBeDefined();
  });

  it('deve instanciar UsersService e UsersController', () => {
    const controller = module.get<UsersController>(UsersController);
    const service = module.get<UsersService>(UsersService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
