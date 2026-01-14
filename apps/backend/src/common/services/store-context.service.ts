import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { type Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class StoreContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getStoreId(): string {
    return this.request.storeId;
  }
}
