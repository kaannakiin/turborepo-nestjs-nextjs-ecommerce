import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import type { User } from '@repo/database';
import { PaymentZodSchema, type PaymentZodType } from '@repo/types';
import type { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentsV2Service } from './payments-v2.service';

@Controller('payments-v2')
export class PaymentsV2Controller {
  constructor(private readonly paymentsV2Service: PaymentsV2Service) {}
  @Post('payment')
  async createPayment(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentZodSchema)) data: PaymentZodType,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ) {}
}
