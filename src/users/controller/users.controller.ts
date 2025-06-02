import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { LoggingInterceptor } from 'src/common/interceptos/logging.interceptor';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return plainToInstance(User, users);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(User, user);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(User, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(User, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
