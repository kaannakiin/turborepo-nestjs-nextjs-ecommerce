import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  PaymentSchema,
  type PaymentType,
  type ThreeDCallback,
} from '@repo/types';
import { type Request, type Response } from 'express';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentService } from './payment.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@repo/database';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment/:cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async createPaymentIntent(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(PaymentSchema)) data: PaymentType,
    @CurrentUser() user: User | null,
    @Req() req: Request,
  ) {
    return this.paymentService.createPaymentIntent(cartId, data, user, req);
  }

  @Post('bin-check')
  async binCheck(@Body('binNumber') binNumber: string) {
    return this.paymentService.binCheck(binNumber);
  }

  @Post('/iyzico/three-d-callback')
  async threeDCallback(
    @Query('cartId') cartId: string,
    @Body() body: ThreeDCallback,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.paymentService.threeDCallback(body, res, cartId);
  }
}
