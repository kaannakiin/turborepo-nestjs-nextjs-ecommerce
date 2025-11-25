// src/common/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { $Enums } from '@repo/database/client';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/user/reflectors/public.decorator';
import { Roles } from 'src/user/reflectors/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Public endpoint kontrolü - en başta yapıyoruz
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Public endpoint ise direkt geç
    }

    const requiredRoles = this.reflector.getAllAndOverride<$Enums.UserRole[]>(
      Roles,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // TEK ROLE KONTROLÜ (user.role)
    if (!user.role) {
      throw new UnauthorizedException('User has no role assigned');
    }

    // Tek role'ü required roles array'inde ara
    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return hasPermission;
  }
}
