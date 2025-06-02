import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { Logger } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 'uuid123',
    name: 'João da Silva',
    email: 'joao@email.com',
    birthday: new Date('1990-01-01'),
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    hashedRefreshToken: null,
  };

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockUser, name: 'Nome Atualizado' }),
    remove: jest
      .fn()
      .mockResolvedValue({ message: 'Usuário removido com sucesso.' }),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar todos os usuários', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toMatchObject([
      {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        birthday: mockUser.birthday,
      },
    ]);
  });

  it('deve retornar um usuário por id', async () => {
    const result = await controller.findOne('uuid123');
    expect(service.findOne).toHaveBeenCalledWith('uuid123');
    expect(result).toMatchObject({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it('deve criar um novo usuário', async () => {
    const dto: CreateUserDto = {
      name: 'João da Silva',
      email: 'joao@email.com',
      birthday: '1990-01-01',
      password: 'senha123',
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
    });
  });

  it('deve atualizar um usuário', async () => {
    const dto: UpdateUserDto = { name: 'Nome Atualizado' };
    const result = await controller.update('uuid123', dto);
    expect(service.update).toHaveBeenCalledWith('uuid123', dto);
    expect(result.name).toBe('Nome Atualizado');
  });

  it('deve remover um usuário', async () => {
    const result = await controller.remove('uuid123');
    expect(service.remove).toHaveBeenCalledWith('uuid123');
    expect(result).toEqual({ message: 'Usuário removido com sucesso.' });
  });
});
