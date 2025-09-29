import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import {
  PaymentSchema,
  type ThreeDCallback,
  type PaymentType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentService } from './payment.service';
import { type Response } from 'express';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent/:cartId')
  async createPaymentIntent(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentSchema)) data: PaymentType,
  ) {
    return this.paymentService.createPaymentIntent(cartId, data);
  }

  @Post('/iyzico/three-d-callback')
  async threeDCallback(
    @Body() body: ThreeDCallback,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.paymentService.threeDCallback(body, res);
  }
}
