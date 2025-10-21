import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptOfferDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
