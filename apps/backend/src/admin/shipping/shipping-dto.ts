import { CargoZoneConfigSchema } from '@repo/types';
import { createZodDto } from 'nestjs-zod';

export class CreateOrUpdateCargoZoneDto extends createZodDto(
  CargoZoneConfigSchema,
) {}
