import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  let mockUser: any;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const hashedRefreshToken = await bcrypt.hash('mock-refresh', 10);
    mockUser = {
      id: 'uuid-user',
      email: 'test@email.com',
      password: hashedPassword,
      hashedRefreshToken,
      name: 'Test User',
      birthday: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            updateRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
            verify: jest.fn(() => ({ sub: mockUser.id })),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('deve autenticar com sucesso', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      const result = await service.login(mockUser.email, '123456');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      await expect(service.login(mockUser.email, 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deve chamar removeRefreshToken', async () => {
      const removeSpy = jest
        .spyOn(usersService, 'removeRefreshToken')
        .mockResolvedValue(null);
      await service.logout(mockUser.id);
      expect(removeSpy).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('refresh', () => {
    it('deve renovar accessToken com sucesso', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      const result = await service.refresh('mock-refresh');
      expect(result).toHaveProperty('accessToken');
    });

    it('deve lançar ForbiddenException se não tiver refresh token', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue({ ...mockUser, hashedRefreshToken: null });
      await expect(service.refresh('mock-refresh')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException se refresh token for inválido', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      await expect(service.refresh('mock-refresh')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar UnauthorizedException se token estiver inválido', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.refresh('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
