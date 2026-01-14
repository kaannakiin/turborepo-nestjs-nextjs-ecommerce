// apps/backend/src/common/decorators/current-locale.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveLocale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.locale;
  },
);
