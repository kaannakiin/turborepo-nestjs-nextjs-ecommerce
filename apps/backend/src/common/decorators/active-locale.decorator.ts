import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Locale } from '@repo/database';

export const ActiveLocale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Locale => {
    const request = ctx.switchToHttp().getRequest();
    return request.locale;
  },
);
