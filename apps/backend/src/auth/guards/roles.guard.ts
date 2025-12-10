import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { $Enums } from '@repo/database';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/user/reflectors/public.decorator';
import { Roles } from 'src/user/reflectors/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<$Enums.UserRole[]>(
      Roles,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let user;

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;
      user = request.user;
    }
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.role) {
      throw new UnauthorizedException('User has no role assigned');
    }

    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return hasPermission;
  }
}
