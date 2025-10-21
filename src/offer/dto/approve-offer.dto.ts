import { IsOptional, IsString } from 'class-validator';

export class ApproveOfferDto {
  @IsOptional()
  @IsString()
  comments?: string;
}
