import { Global, Module } from '@nestjs/common';
import { LocaleService } from './locale.service';
import { ProductMapService } from './product-map.service';

@Global()
@Module({
  providers: [LocaleService, ProductMapService],
  exports: [LocaleService, ProductMapService],
})
export class SharedModule {}
