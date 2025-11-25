import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@repo/database/client';
import {
  PaymentZodSchema,
  type ThreeDCallback,
  type PaymentZodType,
} from '@repo/types';
import type { Request, Response } from 'express';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentsService } from './payments.service';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentsV2Service: PaymentsService) {}
  @Post('/:cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async createPayment(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentZodSchema)) data: PaymentZodType,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ) {
    return this.paymentsV2Service.createPayment({
      cartId,
      data,
      user,
      req,
    });
  }

  @Post('payment-callback/:orderId')
  async handlePaymentCallback(
    @Param('orderId') orderId: string,
    @Body() data: ThreeDCallback,
    @Res() res: Response,
  ) {
    return this.paymentsV2Service.handlePaymentCallback({
      orderId,
      data,
      res,
    });
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsV2Service.handleWebhook({ req, res });
  }
}
