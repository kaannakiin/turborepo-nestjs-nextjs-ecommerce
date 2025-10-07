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
import { type User } from '@repo/database';
import {
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
    // return this.paymentService.createPaymentIntent(cartId, data, user, req);
  }

  @Post('bin-check')
  async binCheck(@Body('binNumber') binNumber: string) {
    return this.paymentService.iyzicoBinCheck(binNumber);
  }

  @Post('/iyzico/three-d-callback')
  async threeDCallback(
    @Query('cartId') cartId: string,
    @Body() body: ThreeDCallback,
    @Res({ passthrough: true }) res: Response,
  ) {
    // return this.paymentService.threeDCallback(body, res, cartId);
  }
}
