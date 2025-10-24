import { Injectable } from '@nestjs/common';
import { CampaignZodType } from '@repo/types';

@Injectable()
export class CampaignsService {
  async createOrUpdateOffer(campaignData: CampaignZodType) {}
}
