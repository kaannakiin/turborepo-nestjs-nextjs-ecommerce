// src/common/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@repo/database';
import { Observable } from 'rxjs';
import { Roles } from 'src/reflectors/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

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
