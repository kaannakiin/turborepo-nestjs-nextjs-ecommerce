import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';

@Module({
  controllers: [ThemeController],
  providers: [ThemeService],
  imports: [],
})
export class ThemeModule {}
