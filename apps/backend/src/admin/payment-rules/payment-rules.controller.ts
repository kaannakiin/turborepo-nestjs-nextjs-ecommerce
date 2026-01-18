import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PaymentRuleDto } from './payment-rules-dto';
import { PaymentRulesService } from './payment-rules.service';
import { Roles } from 'src/user/reflectors/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('admin/payment-rules')
export class PaymentRulesController {
  constructor(private readonly paymentRulesService: PaymentRulesService) {}

  @Post()
  async create(@Body() dto: PaymentRuleDto) {
    return this.paymentRulesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: PaymentRuleDto) {
    return this.paymentRulesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentRulesService.delete(id);
  }

  @Get()
  async getAll(
    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
      }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
      }),
    )
    limit: number = 10,
  ) {
    return this.paymentRulesService.getAll(page, limit);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.paymentRulesService.getById(id);
  }
}
