import { StoreZodSchema } from '@repo/types';
import { createZodDto } from 'nestjs-zod';

export class StoreDto extends createZodDto(StoreZodSchema) {}
