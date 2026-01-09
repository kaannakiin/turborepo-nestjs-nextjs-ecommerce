import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@repo/database';
import type { CampaignZodType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { CampaignsService } from './campaigns.service';
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // @Post('create-or-update-campaign')
  // async createOrUpdateOffer(@Body() body: CampaignZodType) {
  //   return this.campaignsService.createOrUpdateOffer(body);
  // }

  // @Get('get-campaign/:id')
  // async getCampaign(@Param('id') id: string) {
  //   return this.campaignsService.getCampaignByIdToFormValues(id);
  // }

  // @Get('campaigns')
  // async getCampaigns(
  //   @Query('page', new ParseIntPipe()) page: number,
  //   @Query('search') search?: string,
  //   @Query('type', new ParseEnumPipe($Enums.CampaignStatus, { optional: true }))
  //   type?: $Enums.CampaignStatus,
  // ) {
  //   return this.campaignsService.getCampaigns(page, search, type);
  // }
}
