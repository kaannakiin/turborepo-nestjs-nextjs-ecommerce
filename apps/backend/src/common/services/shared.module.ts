import { Global, Module } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { CurrencyLocaleService } from './currency-locale.service';
import { ProductMapService } from './product-map.service';
import { ProductViewService } from './product-view.service';

@Global()
@Module({
  providers: [CurrencyLocaleService, ProductMapService, ProductViewService],
  exports: [CurrencyLocaleService, ProductMapService, ProductViewService],
})
export class SharedModule {}
