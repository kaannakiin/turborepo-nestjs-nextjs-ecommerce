import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type User } from '@repo/database';
import {
  type IyzicoWebhookPayload,
  PaymentZodSchema,
  type PaymentZodType,
  type ThreeDCallback,
} from '@repo/types';
import { type Request, type Response } from 'express';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentService } from './payment.service';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment/:cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async createPaymentIntent(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentZodSchema)) data: PaymentZodType,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ) {
    return this.paymentService.createPaymentIntent({ data, cartId, user, req });
  }

  @Post('bin-check')
  async binCheck(@Body('binNumber') binNumber: string) {
    return this.paymentService.iyzicoBinCheck(binNumber);
  }

  @Post('/iyzico/three-d-callback')
  async threeDCallback(
    @Query('uu') paymentReqId: string,
    @Body() body: ThreeDCallback,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.paymentService.iyzicoThreeDCallback({
      paymentReqId,
      body: body,
      res: res,
    });
  }

  @Post('iyzico/webhook')
  async iyzicoWebhook(
    @Body() body: IyzicoWebhookPayload,
    @Res() res: Response,
    @Headers() headers: Headers,
  ) {
    console.log('Iyzico Webhook received:', body, headers);
  }
}
