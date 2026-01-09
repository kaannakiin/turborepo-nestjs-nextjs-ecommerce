import { createZodDto } from 'nestjs-zod';
import { CategorySchema } from '@repo/types';

const CreateOrUpdateCategorySchema = CategorySchema.omit({
  image: true,
});

export class CreateOrUpdateCategoryDto extends createZodDto(
  CreateOrUpdateCategorySchema,
) {}
