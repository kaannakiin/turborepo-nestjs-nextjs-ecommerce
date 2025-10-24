import { Body, Controller, Post } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import type { CampaignZodType } from '@repo/types';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('create-or-update-offer')
  async createOrUpdateOffer(@Body() body: CampaignZodType) {
    return this.campaignsService.createOrUpdateOffer(body);
  }
}
