import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/services/users.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { maskEmail } from 'src/common/util/mask-email.util';
import { safeLog } from 'src/common/util/safe-log.util';

@Injectable()
export class AuthService {
  private readonly loggerContext = 'AuthService';

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      safeLog(this.logger, 'warn', 'Login falhou: credenciais inválidas', {
        context: this.loggerContext,
        email: maskEmail(email),
      });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id, user.email);
    const hashed = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateRefreshToken(user.id, hashed);

    safeLog(this.logger, 'info', 'Login bem-sucedido', {
      context: this.loggerContext,
      userId: user.id,
      email: maskEmail(user.email),
    });

    return { user, accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);

    safeLog(this.logger, 'info', 'Logout realizado com sucesso', {
      context: this.loggerContext,
      userId,
    });

    return { message: 'Logout efetuado com sucesso' };
  }

  async refresh(refreshToken: string) {
    let decoded: any;

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      safeLog(this.logger, 'error', 'Falha ao verificar JWT do refresh token', {
        context: this.loggerContext,
        message: error.message,
      });
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const userId = decoded.sub;
    const user = await this.usersService.findOne(userId);

    if (!user?.hashedRefreshToken) {
      safeLog(this.logger, 'warn', 'Refresh token ausente no banco', {
        context: this.loggerContext,
        userId,
      });
      throw new ForbiddenException('Sem refresh token armazenado');
    }

    const isValid = await bcrypt.compare(
      refreshToken.trim(),
      user.hashedRefreshToken,
    );

    if (!isValid) {
      safeLog(this.logger, 'warn', 'Refresh token inválido', {
        context: this.loggerContext,
        userId,
      });
      throw new ForbiddenException('Refresh token inválido');
    }

    const accessToken = this.generateAccessToken(user.id, user.email);

    safeLog(this.logger, 'info', 'Access token renovado via refresh token', {
      context: this.loggerContext,
      userId,
    });

    return { accessToken };
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
  }

  private generateRefreshToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      },
    );
  }
}
