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
import { SliderService } from './slider.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['OWNER', 'ADMIN'])
@Controller('/admin/theme/slider')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Post('create-or-update-slider-item')
  async createOrUpdateSliderItem(
    @Body() sliderItem: Omit<SliderItem, 'desktopAsset' | 'mobileAsset'>,
  ) {
    return this.sliderService.createOrUpdateSliderItem(sliderItem);
  }

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
    return this.sliderService.createOrUpdateDesktopAsset(file, body.id);
  }

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
    return this.sliderService.createOrUpdateMobileAsset(file, body.id);
  }

  @Get('get-slider-item/:id')
  async getSliderItem(@Param('id') id: Cuid2ZodType) {
    return this.sliderService.getSliderItem(id);
  }

  @Get('get-slider-items')
  async getSliderItems() {
    return this.sliderService.getSliderItems();
  }

  @Patch('update-sliders-order')
  @UsePipes(new ZodValidationPipe(OrderUpdateSchema))
  async orderUpdateSliderItems(@Body() body: OrderUpdate) {
    return this.sliderService.orderUpdateSliderItems(body);
  }

  @Patch('update-slider-settings')
  @UsePipes(
    new ZodValidationPipe(
      SliderSchema.omit({
        sliders: true,
      }),
    ),
  )
  async updateSliderSettings(@Body() body: Omit<Slider, 'sliders'>) {
    return this.sliderService.updateSliderSettings(body);
  }
}
