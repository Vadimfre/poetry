import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LocaleInterceptor } from './locale.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LocaleInterceptor,
    },
  ],
})
export class I18nModule {}
