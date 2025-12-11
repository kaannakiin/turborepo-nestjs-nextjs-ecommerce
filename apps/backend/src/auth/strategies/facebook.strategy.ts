import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UserService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { name, emails } = profile;
    if (!emails) {
      throw new Error('No email found');
    }
    const user = await this.usersService.findUnique({
      where: {
        email: emails[0].value,
      },
    });
    if (!user) {
      const createdUser = await this.usersService.createUser({
        data: {
          name: name?.givenName || '',
          surname: name?.familyName || '',
          email: emails[0].value,
        },
      });
      return createdUser;
    }
    const { password, ...result } = user;
    return result;
  }
}
