import { Module } from '@nestjs/common';
import { Themev2Controller } from './themev2.controller';
import { Themev2Service } from './themev2.service';

@Module({
  controllers: [Themev2Controller],
  providers: [Themev2Service],
})
export class Themev2Module {}
