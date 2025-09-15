import { Module } from '@nestjs/common';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';

@Module({
  controllers: [SliderController],
  providers: [SliderService],
})
export class SliderModule {}
