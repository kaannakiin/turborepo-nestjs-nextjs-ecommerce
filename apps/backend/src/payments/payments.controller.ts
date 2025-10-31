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
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { PaymentsService } from './payments.service';

@Controller('payments-v2')
export class PaymentsController {
  constructor(private readonly paymentsV2Service: PaymentsService) {}
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

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsV2Service.handleWebhook({ req, res });
  }
}
