import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { type User } from '@repo/database';
import {
  RegisterSchema,
  type RegisterSchemaType,
  TokenPayload,
} from '@repo/types';
import { type Request, type Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerData: RegisterSchemaType) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    return await this.authService.login(user, response, false, false, req);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    return await this.authService.login(user, response, false, false, req);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const isMobile = userAgent && userAgent.includes('Mobile');
    await this.authService.login(user, response, true, isMobile || false, req);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const isMobile = userAgent && userAgent.includes('Mobile');
    await this.authService.login(user, response, true, isMobile || false, req);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User & { jti: string }) {
    return {
      id: user.id,
      name: `${user.name} ${user.surname}`,
      role: user.role,
      ...(user.email && { email: user.email }),
      ...(user.phone && { phone: user.phone }),
      jti: user.jti,
      ...(user.imageUrl && { imageUrl: user.imageUrl }),
    } as TokenPayload;
  }
}
