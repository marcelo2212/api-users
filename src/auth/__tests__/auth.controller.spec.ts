import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { User } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Response } from 'express';
import { AuthController } from '../controller/auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = Object.assign(new User(), {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    birthday: new Date('1990-01-01'),
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    hashedRefreshToken: 'hashed-refresh-token',
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  });

  const mockTokens = {
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(mockTokens),
    logout: jest
      .fn()
      .mockResolvedValue({ message: 'Logout efetuado com sucesso' }),
    refresh: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('deve realizar login com sucesso', async () => {
    const res = {
      cookie: jest.fn(),
    } as unknown as Response;

    const result = await controller.login(
      { email: mockUser.email, password: '123456' },
      res,
    );

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(mockUser.email);
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      mockTokens.refreshToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('deve chamar logout corretamente', async () => {
    const req = { user: { userId: mockUser.id } };
    const result = await controller.logout(req);
    expect(result).toEqual({ message: 'Logout efetuado com sucesso' });
    expect(mockAuthService.logout).toHaveBeenCalledWith(mockUser.id);
  });

  it('deve renovar accessToken com sucesso', async () => {
    const dto: RefreshTokenDto = { refreshToken: 'refresh-token' };
    const req = {};
    const result = await controller.refresh(req, dto);
    expect(result).toEqual({ accessToken: 'new-access-token' });
    expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token');
  });
});
