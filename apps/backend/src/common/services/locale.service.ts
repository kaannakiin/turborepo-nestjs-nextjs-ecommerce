import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { $Enums } from '@repo/database/client';

@Injectable({ scope: Scope.REQUEST })
export class LocaleService {
  private locale: $Enums.Locale;

  constructor(@Inject(REQUEST) private request: Request) {
    this.locale = (this.request.cookies?.['locale'] as $Enums.Locale) || 'TR';
  }

  getLocale(): $Enums.Locale {
    return this.locale;
  }

  setLocale(locale: $Enums.Locale): void {
    this.locale = locale;
  }
}
