import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { type MainDiscount, MainDiscountSchema } from '@repo/types';

@Controller('/admin/discounts')
@UseGuards(JwtAuthGuard)
@Roles(['ADMIN', 'OWNER'])
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('/upgrade-or-create')
  async upgradeOrCreateDiscount(
    @Body(new ZodValidationPipe(MainDiscountSchema)) body: MainDiscount,
  ) {
    return this.discountsService.upgradeOrCreateDiscount(body);
  }
}
