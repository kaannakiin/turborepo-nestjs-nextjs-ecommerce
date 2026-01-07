import { createZodDto } from 'nestjs-zod';
import {
  PercentageDiscountSchema,
  PercentageGrowQuantityDiscountSchema,
  PercentageGrowPriceDiscountSchema,
  FixedAmountDiscountSchema,
  FixedAmountGrowQuantityDiscountSchema,
  FixedAmountGrowPriceDiscountSchema,
  FreeShippingDiscountSchema,
} from '@repo/types';

export class CreatePercentageDiscountDto extends createZodDto(
  PercentageDiscountSchema,
) {}
export class CreatePercentageGrowQuantityDto extends createZodDto(
  PercentageGrowQuantityDiscountSchema,
) {}
export class CreatePercentageGrowPriceDto extends createZodDto(
  PercentageGrowPriceDiscountSchema,
) {}

export class CreateFixedAmountDiscountDto extends createZodDto(
  FixedAmountDiscountSchema,
) {}
export class CreateFixedAmountGrowQuantityDto extends createZodDto(
  FixedAmountGrowQuantityDiscountSchema,
) {}
export class CreateFixedAmountGrowPriceDto extends createZodDto(
  FixedAmountGrowPriceDiscountSchema,
) {}

export class CreateFreeShippingDiscountDto extends createZodDto(
  FreeShippingDiscountSchema,
) {}

export type CreateDiscountDto =
  | CreatePercentageDiscountDto
  | CreatePercentageGrowQuantityDto
  | CreatePercentageGrowPriceDto
  | CreateFixedAmountDiscountDto
  | CreateFixedAmountGrowQuantityDto
  | CreateFixedAmountGrowPriceDto
  | CreateFreeShippingDiscountDto;
