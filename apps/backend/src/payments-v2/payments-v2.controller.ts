import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@repo/database';
import { PaymentZodSchema, type PaymentZodType } from '@repo/types';
import type { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentsV2Service } from './payments-v2.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('payments-v2')
export class PaymentsV2Controller {
  constructor(private readonly paymentsV2Service: PaymentsV2Service) {}
  @Post('payment/:cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async createPayment(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentZodSchema)) data: PaymentZodType,
    @CurrentUser() user: User | null,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.paymentsV2Service.createPayment({
      cartId,
      data,
      user,
      req,
      res,
    });
  }
}
