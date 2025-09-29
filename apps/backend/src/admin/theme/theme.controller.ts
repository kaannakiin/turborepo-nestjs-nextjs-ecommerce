import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MainPageComponentsSchema, MainPageComponentsType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Public } from 'src/reflectors/public.decorator';
import { Roles } from 'src/reflectors/roles.decorator';
import { ThemeService } from './theme.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['OWNER', 'ADMIN'])
@Controller('/admin/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Delete('delete-sliders')
  async deleteMultipleSliders(@Body() body: { uniqueIds: string[] }) {
    return this.themeService.deleteMultipleSliders(body.uniqueIds);
  }

  @Post('create-slider')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopAsset', maxCount: 1 },
      { name: 'mobileAsset', maxCount: 1 },
    ]),
  )
  async createSlider(
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024, // 10MB
        types: ['VIDEO', 'IMAGE'],
      }),
    )
    files: {
      desktopAsset?: Express.Multer.File[];
      mobileAsset?: Express.Multer.File[];
    },
    @Body()
    data: {
      order: string; // FormData'dan string olarak gelir
      customLink: string;
      uniqueId: string;
    },
  ) {
    // Manuel validation ve transformation
    const validatedData = {
      uniqueId: data.uniqueId,
      order: parseInt(data.order, 10),
      customLink: data.customLink || null,
      desktopAsset: files.desktopAsset?.[0] || null,
      mobileAsset: files.mobileAsset?.[0] || null,
    };

    return this.themeService.createSlider(validatedData);
  }

  @Delete('delete-slider/:uniqueId')
  async deleteSlider(
    @Param('uniqueId') uniqueId: string,
    @Query('type') type: 'MOBILE' | 'DESKTOP',
  ) {
    return this.themeService.deleteSlider(uniqueId, type);
  }

  @Get('get-layout-sliders')
  async getLayoutSliders() {
    return this.themeService.getSliders();
  }

  @Post('update-layout')
  @UsePipes(
    new ZodValidationPipe(
      MainPageComponentsSchema.pick({
        components: true,
        footer: true,
      }),
    ),
  )
  async updateLayout(
    @Body()
    body: {
      components: MainPageComponentsType['components'];
      footer?: MainPageComponentsType['footer'];
    },
  ) {
    return this.themeService.updateLayout(body.components, body.footer);
  }

  @Public()
  @Get('get-layout')
  async getLayout(@Query('footer', ParseBoolPipe) footer: boolean) {
    return this.themeService.getLayout(footer);
  }
  @Public()
  @Get('get-footer')
  async getFooter() {
    return this.themeService.getFooter();
  }
}
