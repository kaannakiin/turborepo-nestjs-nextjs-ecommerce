import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Currency } from '@repo/database';

export const ActiveCurrency = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Currency => {
    const request = ctx.switchToHttp().getRequest();
    return request.currency;
  },
);
