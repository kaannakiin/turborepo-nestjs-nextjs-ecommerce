import { Module } from '@nestjs/common';
import { ProductMapService } from 'src/common/services/product-map.service';
import { Themev2Controller } from './themev2.controller';
import { Themev2Service } from './themev2.service';

@Module({
  controllers: [Themev2Controller],
  providers: [Themev2Service, ProductMapService],
})
export class Themev2Module {}
