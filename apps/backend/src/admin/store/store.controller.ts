import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { StoreDto } from './store-dto';
import { StoreService } from './store.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('/admin/store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Roles(['OWNER'])
  async upsertStores(@Body() body: StoreDto) {
    const result = await this.storeService.upsertBothStores(body);

    return {
      success: true,
      message: 'Mağaza ayarları başarıyla güncellendi',
      data: result,
    };
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getStores() {
    return await this.storeService.getStores();
  }
}
