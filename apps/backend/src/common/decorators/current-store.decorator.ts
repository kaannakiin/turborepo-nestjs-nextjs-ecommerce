// apps/backend/src/common/decorators/current-store.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentStore = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.storeId;
  },
);
