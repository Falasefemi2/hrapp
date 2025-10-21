import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOfferDto {
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
