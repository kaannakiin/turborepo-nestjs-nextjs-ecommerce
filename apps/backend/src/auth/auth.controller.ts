import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
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
import { CsrfService } from './csrf.service';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SkipThrottle({ default: true })
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerData: RegisterSchemaType) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ default: true })
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    return await this.authService.login(user, response, false, false, req);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ default: true })
  @Throttle({ refresh: { limit: 10, ttl: 60000 } })
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
    const isMobile = userAgent?.includes('Mobile') ?? false;
    await this.authService.login(user, response, true, isMobile, req);
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
    const isMobile = userAgent?.includes('Mobile') ?? false;
    await this.authService.login(user, response, true, isMobile, req);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  me(@CurrentUser() user: User & { jti: string }) {
    return {
      id: user.id,
      name: `${user.name || ''} ${user.surname || ''}`.trim() || 'Unknown',
      role: user.role,
      jti: user.jti,
      ...(user.email && { email: user.email }),
      ...(user.phone && { phone: user.phone }),
      ...(user.imageUrl && { image: user.imageUrl }), // imageUrl -> image
    } as TokenPayload;
  }

  @Get('csrf')
  @HttpCode(200)
  @SkipThrottle()
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = this.csrfService.generateCsrfToken(req, res);
    return {
      success: true,
      csrfToken: token,
      message: 'CSRF token başarıyla oluşturuldu.',
    };
  }
  // FORGOT PASSWORD - 'auth-strict' throttler (3 istek/5dk)
  // @Post('forgot-password')
  // @HttpCode(HttpStatus.OK)
  // @SkipThrottle({ default: true })
  // @Throttle({ 'auth-strict': { limit: 3, ttl: 300000 } })
  // async forgotPassword(@Body() dto: any) {
  //   return this.authService.forgotPassword(dto);
  // }

  // RESEND VERIFICATION - 'auth-strict' throttler
  // @Post('resend-verification')
  // @HttpCode(HttpStatus.OK)
  // @SkipThrottle({ default: true })
  // @Throttle({ 'auth-strict': { limit: 3, ttl: 300000 } })
  // async resendVerification(@Body() dto: any) {
  //   return this.authService.resendVerification(dto);
  // }
}
