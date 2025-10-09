import { Module } from '@nestjs/common';
import { UserPageV2Service } from './user-page-v2.service';
import { UserPageV2Controller } from './user-page-v2.controller';

@Module({
  controllers: [UserPageV2Controller],
  providers: [UserPageV2Service],
})
export class UserPageV2Module {}
