import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { PaymentMethodType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { PaymentsService } from './payments.service';
import { $Enums } from '@repo/database';

@Controller('/admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['OWNER', 'ADMIN'])
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-method')
  async createPaymentMethod(@Body() body: PaymentMethodType) {
    return this.paymentsService.createPaymentMethod(body);
  }

  @Get('payment-method/:methodType')
  async getPaymentMethod(
    @Param('methodType', new ParseEnumPipe($Enums.PaymentProvider))
    methodType: $Enums.PaymentProvider,
  ) {
    return this.paymentsService.getPaymentMethod(methodType);
  }

  @Get('payment-methods')
  async getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }
}
