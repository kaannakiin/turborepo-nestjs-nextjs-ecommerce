import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { type Request } from 'express';
import { Locale } from '@repo/database';

@Injectable({ scope: Scope.REQUEST })
export class LocaleService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getLocale(): Locale {
    return this.request.localization || Locale.TR;
  }
}
