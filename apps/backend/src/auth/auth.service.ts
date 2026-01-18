/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@repo/database';
import { createId } from '@repo/shared';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  CART_COOKIE_NAME,
  getCountryCodes,
  REFRESH_TOKEN_COOKIE_NAME,
  RegisterSchemaType,
  TokenPayload,
} from '@repo/types';
import { hash, verify } from 'argon2';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  private capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async validateUser(username: string, password: string) {
    const users: User[] = await this.prismaService.$queryRaw<User[]>`
      SELECT * FROM "User" 
      WHERE "email" = ${username} OR "phone" = ${username}
      LIMIT 1
    `;

    const user = users[0];

    if (!user || !user.password) {
      return null;
    }
    const isValid = await verify(user.password, password);
    if (!isValid) {
      return null;
    }
    const { password: dbPass, ...result } = user;
    return result;
  }

  async register(data: RegisterSchemaType) {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [
          data.email ? { email: data.email } : {},
          data.phone ? { phone: data.phone } : {},
        ],
      },
    });

    if (existingUser) {
      if (existingUser.accountStatus === 'ACTIVE') {
        return {
          success: false,
          message: 'Bu kullanıcı zaten mevcut. Lütfen giriş yapınız.',
        };
      }

      if (existingUser.accountStatus === 'PASSIVE') {
        return {
          success: false,
          message:
            'Hesabınız pasif durumdadır. Tekrar aktif hale getirmek için lütfen destek ekibiyle iletişime geçiniz.',
        };
      }

      if (existingUser.accountStatus === 'BANNED') {
        return {
          success: false,
          message:
            'Hesabınız erişime kapatılmıştır. Lütfen destek ekibiyle iletişime geçiniz.',
        };
      }

      if (existingUser.accountStatus === 'PENDING_APPROVAL') {
        return {
          success: false,
          message: 'Hesabınız şu an onay sürecindedir. Lütfen bekleyiniz.',
        };
      }
    }

    try {
      const hashedPassword = await hash(data.password);

      await this.prismaService.user.create({
        data: {
          name: this.capitalize(data.name.trim()),
          surname: this.capitalize(data.surname.trim()),
          ...(data.email ? { email: data.email.trim() } : {}),
          ...(data.phone &&
          !getCountryCodes().find((code) => data.phone === code)
            ? { phone: data.phone.trim() }
            : {}),
          password: hashedPassword,
          role: 'USER',
          accountStatus: 'ACTIVE',
          registrationSource: 'WEB_REGISTER',
        },
      });

      return {
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.',
      };
    }
  }

  async login(
    user: User,
    response: Response,
    redirect: boolean = false,
    req: Request,
    ip: string,
  ) {
    const accessTokenExpirationMs = parseInt(
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
    );

    const refreshTokenExpirationMs = parseInt(
      this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
    );

    const jti = createId();

    const tokenPayload: TokenPayload = {
      id: user.id,
      jti: jti,
      name: `${this.capitalize(user.name)} ${this.capitalize(user.surname)}`,
      role: user.role,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
      ...(user.imageUrl ? { imageUrl: user.imageUrl } : {}),
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: Math.floor(accessTokenExpirationMs / 1000),
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: Math.floor(refreshTokenExpirationMs / 1000),
    });

    const hashedRefreshToken = await hash(refreshToken);

    const ua = req.useragent;

    let deviceType = 'DESKTOP';
    if (ua?.isMobile) deviceType = 'MOBILE';
    else if (ua?.isTablet) deviceType = 'TABLET';
    else if (ua?.isSmartTV) deviceType = 'SMART_TV';

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() + refreshTokenExpirationMs,
    );
    await this.prismaService.refreshTokens.create({
      data: {
        id: jti,
        hashedRefreshToken: hashedRefreshToken,
        userId: user.id,
        expiresAt: expiresRefreshToken,

        ipAddress: ip,
        userAgent: ua?.source || req.headers['user-agent'] || 'Unknown',
        os: ua?.os || 'Unknown',
        browser: ua?.browser || 'Unknown',
        deviceType: deviceType,
      },
    });
    const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (currentRefreshToken) {
      try {
        const oldPayload = this.jwtService.verify(currentRefreshToken, {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        }) as TokenPayload;

        await this.prismaService.refreshTokens.updateMany({
          where: {
            id: oldPayload.jti,
            userId: user.id,
          },
          data: {
            revokedAt: new Date(),
            replacedByTokenId: jti,
          },
        });
      } catch (error) {
        console.warn('Could not revoke old token during login:', error.message);
      }
    }
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpirationMs,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        domain: this.configService.get('DOMAIN') as string,
      }),
    });

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenExpirationMs,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        domain: this.configService.get('DOMAIN') as string,
      }),
    });

    if (redirect) {
      if (ua?.isMobile) {
        response.redirect(this.configService.getOrThrow('MOBILE_UI_REDIRECT'));
      } else {
        response.redirect(this.configService.getOrThrow('WEB_UI_REDIRECT'));
      }
    }
  }

  async verifyRefreshToken(request: Request, payload: TokenPayload) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const tokenRecord = await this.prismaService.refreshTokens.findUnique({
      where: {
        id: payload.jti,
      },
      include: {
        user: true,
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.userId !== payload.id ||
      tokenRecord.revokedAt !== null ||
      tokenRecord.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isTokenValid = await verify(
      tokenRecord.hashedRefreshToken,
      refreshToken,
    );

    if (!isTokenValid) {
      throw new BadRequestException('Invalid token');
    }

    return tokenRecord.user;
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prismaService.refreshTokens.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException('Oturum bulunamadı.');
    }

    if (session.userId !== userId) {
      throw new BadRequestException('Bu işlem için yetkiniz yok.');
    }

    await this.prismaService.refreshTokens.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
      },
    });

    return { success: true, message: 'Oturum başarıyla sonlandırıldı.' };
  }

  async getActiveSessions(userId: string) {
    return await this.prismaService.refreshTokens.findMany({
      where: {
        userId: userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async logOut(res: Response, req?: Request) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const domain = this.configService.get('DOMAIN');

    const refreshToken = req?.cookies?.refresh_token;
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        }) as TokenPayload;

        await this.prismaService.refreshTokens.updateMany({
          where: { id: payload.jti },
          data: { revokedAt: new Date() },
        });
      } catch {}
    }

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      path: '/',
      ...(isProduction && domain ? { domain } : {}),
    };
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, cookieOptions);
    res.clearCookie(CART_COOKIE_NAME, cookieOptions);

    const csrfCookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      secure: isProduction,
      path: '/',
      ...(isProduction && domain ? { domain } : {}),
    };

    const csrfCookieName = isProduction ? '__Secure-csrf-token' : 'csrf-token';
    res.clearCookie(csrfCookieName, csrfCookieOptions);

    return { success: true, message: 'Logged out successfully' };
  }
}
