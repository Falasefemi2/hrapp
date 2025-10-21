import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CandidateRejectOfferDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
