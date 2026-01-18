import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClientContext } from '../guards/client-context.guard';

export const ActiveContext = createParamDecorator(
  (data: keyof ClientContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const context = request.clientContext;

    if (data && context) {
      return context[data];
    }

    return context;
  },
);
