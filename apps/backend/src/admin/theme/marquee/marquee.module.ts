import { Module } from '@nestjs/common';
import { MarqueeService } from './marquee.service';
import { MarqueeController } from './marquee.controller';

@Module({
  controllers: [MarqueeController],
  providers: [MarqueeService],
})
export class MarqueeModule {}
