import { Global, Module } from '@nestjs/common';
import { PrismaLoggerService } from 'src/common/services/prisma-logger.service';
import { CurrencyLocaleService } from './currency-locale.service';
import { ProductMapService } from './product-map.service';
import { ProductViewService } from './product-view.service';
import { ProductBulkActionService } from './product-bulk-action.service';
import { HelperService } from './helper.service';
import { StoreContextService } from './store-context.service';

@Global()
@Module({
  providers: [
    CurrencyLocaleService,
    ProductMapService,
    ProductViewService,
    PrismaLoggerService,
    ProductBulkActionService,
    HelperService,
    StoreContextService,
  ],
  exports: [
    CurrencyLocaleService,
    ProductMapService,
    ProductViewService,
    PrismaLoggerService,
    ProductBulkActionService,
    HelperService,
    StoreContextService,
  ],
})
export class SharedModule {}
