import { PaymentRuleZodSchema } from '@repo/types';
import { createZodDto } from 'nestjs-zod';

export class PaymentRuleDto extends createZodDto(PaymentRuleZodSchema) {}
