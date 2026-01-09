import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type User } from '@repo/database';
import {
  BaseProductSchemaCore,
  type BaseProductZodType,
  BulkActionSchema,
  type BulkActionZodType,
  Cuid2ZodType,
  VariantProductSchema,
  type VariantProductZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.productsService.getProducts({ page, limit, search });
  }

  @Get('get-product/:id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Delete('delete-product-asset')
  async deleteProductAsset(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    return this.productsService.deleteProductAsset(url);
  }

  @Post('basic-product')
  async createOrUpdateBasicProduct(
    @Body(
      new ZodValidationPipe(
        BaseProductSchemaCore.omit({
          images: true,
        }),
      ),
    )
    data: Omit<BaseProductZodType, 'images'>,
  ) {
    return this.productsService.createOrUpdateBasicProduct(data);
  }

  @Post('variant-product')
  async createOrUpdateVariantProduct(
    @Body(
      new ZodValidationPipe(
        VariantProductSchema.omit({
          images: true,
        }),
      ),
    )
    data: Omit<VariantProductZodType, 'images'>,
  ) {
    return this.productsService.createOrUpdateVariantProduct(data);
  }

  @Post('create-product-image')
  @UseInterceptors(FileInterceptor('file'))
  async createProductImage(
    @UploadedFile(
      new FilesValidationPipe({
        maxSize: 5 * 1024 * 1024,
        types: ['IMAGE', 'VIDEO'],
      }),
    )
    file: Express.Multer.File,
    @Body()
    body: { productId?: Cuid2ZodType; variantId?: Cuid2ZodType },
  ) {
    return this.productsService.createProductImage(
      file,
      body.productId,
      body.variantId,
    );
  }

  @Post('bulk-action')
  async bulkAction(
    @Body(new ZodValidationPipe(BulkActionSchema))
    body: BulkActionZodType,
    @CurrentUser() user: User,
  ) {
    return this.productsService.bulkAction(body, user);
  }
}
