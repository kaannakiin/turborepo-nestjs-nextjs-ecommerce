import { Global, Module } from '@nestjs/common';
import { PrismaLoggerService } from 'src/common/services/prisma-logger.service';
import { CurrencyLocaleService } from './currency-locale.service';
import { ProductMapService } from './product-map.service';
import { ProductViewService } from './product-view.service';
import { ProductBulkActionService } from './produıct-bulk-action.service';

@Global()
@Module({
  providers: [
    CurrencyLocaleService,
    ProductMapService,
    ProductViewService,
    PrismaLoggerService,
    ProductBulkActionService,
  ],
  exports: [
    CurrencyLocaleService,
    ProductMapService,
    ProductViewService,
    PrismaLoggerService,
    ProductBulkActionService,
  ],
})
export class SharedModule {}
