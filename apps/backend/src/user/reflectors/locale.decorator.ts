import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { $Enums } from '@repo/database/client';

export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): $Enums.Locale => {
    const request = ctx.switchToHttp().getRequest();
    return (request.cookies['locale'] as $Enums.Locale) || 'TR';
  },
);
