import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/reflectors/roles.decorator';
import { MarqueeService } from './marquee.service';
import { MarqueeItemSchema, type MarqueeItem } from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['OWNER', 'ADMIN'])
@Controller('marquee')
export class MarqueeController {
  constructor(private readonly marqueeService: MarqueeService) {}

  @Post('create-or-update-marquee-item')
  @UsePipes(new ZodValidationPipe(MarqueeItemSchema))
  async createOrUpdateMarqueeItem(@Body() data: MarqueeItem) {
    return this.marqueeService.createOrUpdateMarqueeItem(data);
  }
}
