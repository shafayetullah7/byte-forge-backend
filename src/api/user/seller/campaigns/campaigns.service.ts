import { Injectable } from '@nestjs/common';
import { ListCampaignsService } from './services/campaign-queries.service';
import { GetCampaignService } from './services/campaign-queries.service';
import {
  ArchiveCampaignService,
  CreateCampaignService,
  DeleteCampaignService,
  SubmitCampaignService,
  UpdateCampaignService,
} from './services/campaign-mutations.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly listCampaignsService: ListCampaignsService,
    private readonly getCampaignService: GetCampaignService,
    private readonly createCampaignService: CreateCampaignService,
    private readonly updateCampaignService: UpdateCampaignService,
    private readonly submitCampaignService: SubmitCampaignService,
    private readonly archiveCampaignService: ArchiveCampaignService,
    private readonly deleteCampaignService: DeleteCampaignService,
  ) {}

  list(shopId: string, query: ListCampaignsQueryDto) {
    return this.listCampaignsService.execute(shopId, query);
  }

  get(shopId: string, campaignId: string) {
    return this.getCampaignService.execute(shopId, campaignId);
  }

  create(shopId: string, dto: CreateCampaignDto) {
    return this.createCampaignService.execute(shopId, dto);
  }

  update(shopId: string, campaignId: string, dto: UpdateCampaignDto) {
    return this.updateCampaignService.execute(shopId, campaignId, dto);
  }

  submit(shopId: string, campaignId: string, shopStatus: string) {
    return this.submitCampaignService.execute(shopId, campaignId, shopStatus);
  }

  archive(shopId: string, campaignId: string) {
    return this.archiveCampaignService.execute(shopId, campaignId);
  }

  delete(shopId: string, campaignId: string) {
    return this.deleteCampaignService.execute(shopId, campaignId);
  }
}
