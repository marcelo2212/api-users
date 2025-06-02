import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let redisClient: any;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'joao@email.com',
    birthday: new Date(),
    password: 'hashed123',
    createdAt: new Date(),
    updatedAt: new Date(),
    hashedRefreshToken: 'hashed-refresh-token',
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  };

  beforeEach(async () => {
    userRepository = {
      find: jest.fn().mockResolvedValue([mockUser]),
      findOneBy: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    redisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClient,
        },
        {
          provide: 'NestWinston',
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários do banco', async () => {
      const result = await service.findAll();
      expect(userRepository.find).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(result).toMatchObject([mockUser]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo ID', async () => {
      const result = await service.findOne('uuid123');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid123' });
      expect(result).toMatchObject(mockUser);
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.findOne('naoexiste')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const dto: CreateUserDto = {
        name: 'Maria',
        email: 'maria@email.com',
        birthday: '1985-02-01',
        password: 'Senha123',
      };

      userRepository.create = jest.fn().mockReturnValue(dto);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ ...dto, id: 'uuid456' });

      const result = await service.create(dto);
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith('users');
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário existente', async () => {
      const dto: UpdateUserDto = { name: 'João Atualizado' };
      const updatedUser = { ...mockUser, ...dto };

      userRepository.findOneBy = jest.fn().mockResolvedValue(mockUser);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.update('uuid123', dto);
      expect(result.name).toBe('João Atualizado');
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      const result = await service.remove('uuid123');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid123' });
      expect(userRepository.delete).toHaveBeenCalledWith('uuid123');
      expect(redisClient.del).toHaveBeenCalledWith('users');
      expect(result).toMatchObject({
        message: 'Usuário removido com sucesso.',
      });
    });

    it('deve lançar erro se o usuário não existir', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.remove('naoexiste')).rejects.toThrowError(
        'Usuário não encontrado',
      );
    });
  });

  describe('findByEmail', () => {
    it('deve retornar um usuário válido pelo email', async () => {
      const email = 'joao@email.com';
      const user = await service.findByEmail(email);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(
        service.findByEmail('inexistente@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
