import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Позволяет запросу пройти даже без JWT.
  // Если JWT валиден — req.user будет заполнен.
  // Если JWT нет/невалиден — req.user будет undefined.
  handleRequest(err: any, user: any) {
    return user;
  }
}
