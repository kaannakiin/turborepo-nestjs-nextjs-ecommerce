import { createZodDto } from 'nestjs-zod';
import {
  InventoryLocationZodSchema,
  UpsertServiceZoneSchema,
  BulkUpdateServiceZonesSchema,
  FullfillmentStrategyZodSchema,
  GetFulfillmentStrategiesQuerySchema,
} from '@repo/types';

export class UpsertInventoryLocationDto extends createZodDto(
  InventoryLocationZodSchema,
) {}

export class UpsertServiceZoneDto extends createZodDto(
  UpsertServiceZoneSchema,
) {}
export class BulkUpdateServiceZonesDto extends createZodDto(
  BulkUpdateServiceZonesSchema,
) {}

export class FullfillmentStrategyDto extends createZodDto(
  FullfillmentStrategyZodSchema,
) {}

export class GetFulfillmentStrategiesQueryDto extends createZodDto(
  GetFulfillmentStrategiesQuerySchema,
) {}
