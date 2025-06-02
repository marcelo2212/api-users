import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import Redis from 'ioredis';
import { Logger } from 'winston';
import { safeLog } from 'src/common/util/safe-log.util';

@Injectable()
export class UsersService {
  private readonly loggerContext = 'UsersService';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<User[]> {
    const cache = await this.redisClient.get('users');
    if (cache) return JSON.parse(cache);

    const users = await this.userRepository.find();
    await this.redisClient.set('users', JSON.stringify(users), 'EX', 60);
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      safeLog(this.logger, 'warn', 'Usuário não encontrado', {
        context: this.loggerContext,
        userId: id,
      });
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(dto);
    const saved = await this.userRepository.save(newUser);
    await this.redisClient.del('users');

    safeLog(this.logger, 'info', 'Usuário criado com sucesso', {
      context: this.loggerContext,
      userId: saved.id,
    });

    return saved;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    const updated = await this.userRepository.save(user);
    await this.redisClient.del('users');

    safeLog(this.logger, 'info', 'Usuário atualizado', {
      context: this.loggerContext,
      userId: updated.id,
    });

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      safeLog(this.logger, 'warn', 'Remoção de usuário inexistente', {
        context: this.loggerContext,
        userId: id,
      });
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.delete(id);
    await this.redisClient.del('users');

    safeLog(this.logger, 'info', 'Usuário removido com sucesso', {
      context: this.loggerContext,
      userId: id,
    });

    return { message: 'Usuário removido com sucesso.' };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userRepository.update(userId, {
      hashedRefreshToken: refreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    await this.userRepository.update(userId, { hashedRefreshToken: null });
  }

  async getUserWithRefreshToken(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
