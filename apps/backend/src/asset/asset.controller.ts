import { Controller, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { AssetService } from './asset.service';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'USER'])
  deleteAsset(@Query('url') url: string) {
    return this.assetService.deleteAsset(url);
  }
}
