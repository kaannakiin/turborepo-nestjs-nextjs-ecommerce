import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { SliderModule } from './slider/slider.module';
import { MarqueeModule } from './marquee/marquee.module';

@Module({
  controllers: [ThemeController],
  providers: [ThemeService],
  imports: [SliderModule, MarqueeModule],
})
export class ThemeModule {}
