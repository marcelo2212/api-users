import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  Inject,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    console.log('Login attempt:', body.email);
    const { user, accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { user, accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }

  @Post('refresh')
  refresh(@Req() req, @Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
