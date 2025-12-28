import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VariantGroupSchema, type VariantGroupZodType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { VariantsService } from './variants.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  async getAllVariants() {
    return this.variantsService.getAllVariants();
  }

  @Post('variant-groups')
  async createOrUpdateVariantGroup(
    @Body(new ZodValidationPipe(VariantGroupSchema))
    data: VariantGroupZodType,
  ) {
    return this.variantsService.createOrUpdateVariantGroup(data);
  }

  @Post('upload-variant-option-file/:optionId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVariantOptionFile(
    @Param('optionId') optionId: string,
    @UploadedFile(
      new FilesValidationPipe({
        types: 'IMAGE',
        maxSize: 10 * 1024 * 1024,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.variantsService.uploadVariantOptionFile(optionId, file);
  }
}
