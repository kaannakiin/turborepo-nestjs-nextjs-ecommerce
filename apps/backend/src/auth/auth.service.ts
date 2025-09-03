/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@repo/database';
import { getCountryCodes, RegisterSchemaType, TokenPayload } from '@repo/types';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findFirst({
      where: {
        OR: [{ email: username }, { phone: username }],
      },
    });
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
    const isUserExists = await this.userService.findUnique({
      where: {
        ...(data.email
          ? { email: data.email }
          : data.phone
            ? { phone: data.phone }
            : { email: '' }),
      },
    });

    if (isUserExists) {
      throw new BadRequestException('Kullanıcı zaten mevcut');
    }

    try {
      const hashedPassword = await hash(data.password);

      return await this.userService.createUser({
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Kullanıcı oluşturulamadı');
    }
  }

  async login(
    user: User,
    response: Response,
    redirect: boolean = false,
    isMobile: boolean = false,
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

    const tokenPayload: TokenPayload = {
      id: user.id,
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

    await this.userService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken, // Hash'lemeyi kaldırdık
      },
    });

    response.cookie('token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: accessTokenExpirationMs,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenExpirationMs,
    });

    if (redirect) {
      if (isMobile) {
        response.redirect(this.configService.getOrThrow('MOBILE_UI_REDIRECT'));
      } else {
        response.redirect(this.configService.getOrThrow('WEB_UI_REDIRECT'));
      }
    }
  }

  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.userService.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (refreshToken !== user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { password: dbPass, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
