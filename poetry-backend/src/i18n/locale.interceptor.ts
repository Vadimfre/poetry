import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { localeStorage } from './locale.storage';
import { parseLocaleFromRequest } from './parse-locale';

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const locale = parseLocaleFromRequest(req);
    return localeStorage.run(locale, () => next.handle());
  }
}
