import {
  AddCartItemSchema,
  ClearCartSchema,
  DecreaseCartItemQuantitySchema,
  IncreaseCartItemQuantitySchema,
  RemoveCartItemSchema,
  UpdateLocaleCart,
} from '@repo/types';
import { createZodDto } from 'nestjs-zod';

export class AddCartItemDto extends createZodDto(AddCartItemSchema) {}

export class RemoveCartItemDto extends createZodDto(RemoveCartItemSchema) {}

export class ClearCartDto extends createZodDto(ClearCartSchema) {}

export class DecreaseCartItemQuantityDto extends createZodDto(
  DecreaseCartItemQuantitySchema,
) {}

export class IncreaseCartItemQuantityDto extends createZodDto(
  IncreaseCartItemQuantitySchema,
) {}

export class UpdateCartContextDto extends createZodDto(UpdateLocaleCart) {}
