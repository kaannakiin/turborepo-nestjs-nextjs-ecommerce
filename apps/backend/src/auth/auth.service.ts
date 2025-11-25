/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@repo/database/client';
import { createId } from '@repo/shared';
import { getCountryCodes, RegisterSchemaType, TokenPayload } from '@repo/types';
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
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        ...(data.email
          ? { email: data.email }
          : data.phone
            ? { phone: data.phone }
            : { email: '' }),
      },
    });

    if (isUserExists) {
      return {
        success: false,
        message:
          'Bu kullanıcı zaten mevcut. Lütfen giriş yaparak tekrar devem ediniz.',
      };
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
        },
      });
      return {
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
      };
    } catch (error) {
      return {
        success: false,
        message: ' Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.',
      };
    }
  }

  async login(
    user: User,
    response: Response,
    redirect: boolean = false,
    isMobile: boolean = false,
    req: Request,
  ) {
    const accessTokenExpirationMs = parseInt(
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
    );

    const refreshTokenExpirationMs = parseInt(
      this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
    );

    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() + accessTokenExpirationMs,
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() + refreshTokenExpirationMs,
    );
    const currentRefreshToken = req.cookies?.refresh_token;
    if (currentRefreshToken) {
      try {
        const oldPayload = this.jwtService.verify(currentRefreshToken, {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        }) as TokenPayload;

        await this.prismaService.refreshTokens.update({
          where: {
            id: oldPayload.jti,
            userId: user.id,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (error) {
        console.warn('Could not revoke old token:', error.message);
      }
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      jti: createId(),
      name: `${this.capitalize(user.name)} ${this.capitalize(user.surname)}`,
      role: user.role,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
      ...(user.imageUrl ? { imageUrl: user.imageUrl } : {}),
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: Math.floor(accessTokenExpirationMs / 1000), // Saniyeye çevir
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: Math.floor(refreshTokenExpirationMs / 1000), // Saniyeye çevir
    });
    const hashedRefreshToken = await hash(refreshToken);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          create: {
            id: tokenPayload.jti,
            expiresAt: expiresRefreshToken,
            hashedRefreshToken: hashedRefreshToken,
            browser: req.useragent.browser || 'Unknown',
            browserVersion: req.useragent.version || 'Unknown',
            os: req.useragent.os || 'Unknown',
            deviceName: req.useragent.platform || 'Unknown',
            deviceType: req.useragent.isMobile
              ? 'MOBILE'
              : req.useragent.isTablet
                ? 'TABLET'
                : 'DESKTOP',
            ipAddress: req.socket.remoteAddress || req.ip || 'Unknown',
            osVersion: req.useragent.os || 'Unknown',
            userAgent: req.useragent.source || 'Unknown',
          },
        },
      },
    });
    response.cookie('token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpirationMs,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        domain: this.configService.get('DOMAIN') as string,
      }),
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenExpirationMs,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        domain: this.configService.get('DOMAIN') as string,
      }),
    });

    if (redirect) {
      if (isMobile) {
        response.redirect(this.configService.getOrThrow('MOBILE_UI_REDIRECT'));
      } else {
        response.redirect(this.configService.getOrThrow('WEB_UI_REDIRECT'));
      }
    }
  }

  async verifyRefreshToken(request: Request, payload: TokenPayload) {
    const refreshToken = request.cookies?.refresh_token;

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
}
