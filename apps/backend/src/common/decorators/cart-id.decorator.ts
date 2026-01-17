import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CART_COOKIE_NAME } from '@repo/types';
import { Request } from 'express';

export const CartId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return (
      request[CART_COOKIE_NAME] ||
      request.cookies?.[CART_COOKIE_NAME] ||
      request.signedCookies?.[CART_COOKIE_NAME]
    );
  },
);
