import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../services/jwt.strategy';
import { UsersService } from 'src/users/services/users.service';

process.env.JWT_SECRET = '5159e7ab-0bad-4e7a-8fe5-65875891bdc8';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersService = {
      findByEmail: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: 'NestWinston', useValue: mockLogger },
      ],
    }).compile();
  });

  it('deve estar definido', () => {
    expect(module).toBeDefined();
  });

  it('deve ter AuthController, AuthService e JwtStrategy definidos', () => {
    const controller = module.get(AuthController);
    const service = module.get(AuthService);
    const strategy = module.get(JwtStrategy);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(strategy).toBeDefined();
  });
});
