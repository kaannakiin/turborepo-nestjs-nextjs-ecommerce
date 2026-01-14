import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { type User } from '@repo/database';
import {
  RegisterSchema,
  type RegisterSchemaType,
  TokenPayload,
} from '@repo/types';
import { type Request, type Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { LoginWithEmailDTO, LoginWithPhoneDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Kayıt Ol' })
  @HttpCode(HttpStatus.CREATED)
  @SkipThrottle({ default: true })
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerData: RegisterSchemaType) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Giriş Yap' })
  @ApiExtraModels(LoginWithEmailDTO, LoginWithPhoneDTO)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LoginWithEmailDTO) },
        { $ref: getSchemaPath(LoginWithPhoneDTO) },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          email: getSchemaPath(LoginWithEmailDTO),
          phone: getSchemaPath(LoginWithPhoneDTO),
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ default: true })
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @RealIP() ip: string,
  ) {
    return await this.authService.login(user, response, false, req, ip);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access Token Yenile' })
  @ApiCookieAuth('token')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ default: true })
  @Throttle({ refresh: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @RealIP() ip: string,
  ) {
    return await this.authService.login(user, response, false, req, ip);
  }

  @Get('me')
  @ApiOperation({ summary: 'Kullanıcı Bilgileri' })
  @ApiCookieAuth('token')
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
      ...(user.imageUrl && { image: user.imageUrl }),
    } as TokenPayload;
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Çıkış Yap' })
  @HttpCode(HttpStatus.OK)
  logOut(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    return this.authService.logOut(res, req);
  }

  @Get('google')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() response: Response,
    @RealIP() ip: string,
  ) {
    await this.authService.login(user, response, true, req, ip);
  }

  @Get('facebook')
  @ApiExcludeEndpoint()
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {}

  @Get('facebook/callback')
  @ApiExcludeEndpoint()
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() response: Response,
    @RealIP() ip: string,
  ) {
    await this.authService.login(user, response, true, req, ip);
  }

  @Get('csrf')
  @ApiExcludeEndpoint()
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

  @Get('sessions')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSessions(@CurrentUser() user: User) {
    return this.authService.getActiveSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: User,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId);
  }
}
