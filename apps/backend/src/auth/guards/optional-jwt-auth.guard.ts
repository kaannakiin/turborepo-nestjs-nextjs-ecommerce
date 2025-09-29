import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Guard'ı her zaman çalıştır, ama hata fırlatma
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
