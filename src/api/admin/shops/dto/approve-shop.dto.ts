import { IsOptional, IsString } from 'class-validator';

export class ApproveShopDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
