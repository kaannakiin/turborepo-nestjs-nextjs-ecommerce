import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (body) {
      if (body.type === 'email' && body.email) {
        request.body.username = body.email;
      } else if (body.type === 'phone' && body.phone) {
        request.body.username = body.phone;
      }
    }

    return super.canActivate(context);
  }
}
