import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  BodyCuid2Schema,
  type BodyCuid2ZodType,
  type Cuid2ZodType,
  type OrderUpdate,
  OrderUpdateSchema,
  type Slider,
  SliderItem,
  SliderSchema,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/reflectors/roles.decorator';
import { ThemeService } from './theme.service';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Post('create-or-update-slider-item')
  async createOrUpdateSliderItem(
    @Body() sliderItem: Omit<SliderItem, 'desktopAsset' | 'mobileAsset'>,
  ) {
    return this.themeService.createOrUpdateSliderItem(sliderItem);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Post('create-or-update-desktop-asset')
  @UseInterceptors(FileInterceptor('file'))
  async createOrUpdateDesktopAsset(
    @UploadedFile(
      'file',
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        types: ['IMAGE', 'VIDEO'],
      }),
    )
    file: Express.Multer.File,
    @Body(new ZodValidationPipe(BodyCuid2Schema)) body: BodyCuid2ZodType,
  ) {
    return this.themeService.createOrUpdateDesktopAsset(file, body.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Post('create-or-update-mobile-asset')
  @UseInterceptors(FileInterceptor('file'))
  async createOrUpdateMobileAsset(
    @UploadedFile(
      'file',
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        types: ['IMAGE', 'VIDEO'],
      }),
    )
    file: Express.Multer.File,
    @Body(new ZodValidationPipe(BodyCuid2Schema)) body: BodyCuid2ZodType,
  ) {
    return this.themeService.createOrUpdateMobileAsset(file, body.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Get('get-slider-item/:id')
  async getSliderItem(@Param('id') id: Cuid2ZodType) {
    return this.themeService.getSliderItem(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Get('get-slider-items')
  async getSliderItems() {
    return this.themeService.getSliderItems();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Patch('update-sliders-order')
  @UsePipes(new ZodValidationPipe(OrderUpdateSchema))
  async orderUpdateSliderItems(@Body() body: OrderUpdate) {
    return this.themeService.orderUpdateSliderItems(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['OWNER', 'ADMIN'])
  @Patch('update-slider-settings')
  @UsePipes(
    new ZodValidationPipe(
      SliderSchema.omit({
        sliders: true,
      }),
    ),
  )
  async updateSliderSettings(@Body() body: Omit<Slider, 'sliders'>) {
    return this.themeService.updateSliderSettings(body);
  }
}
