import { createZodDto } from 'nestjs-zod';
import { BrandSchema } from '@repo/types';

const CreateOrUpdateBrandSchema = BrandSchema.omit({
  image: true,
});

export class CreateOrUpdateBrandDto extends createZodDto(
  CreateOrUpdateBrandSchema,
) {}
