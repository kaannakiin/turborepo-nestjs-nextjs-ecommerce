import { Module } from '@nestjs/common';
import { Themev2Service } from './themev2.service';
import { Themev2Controller } from './themev2.controller';

@Module({
  controllers: [Themev2Controller],
  providers: [Themev2Service],
})
export class Themev2Module {}
