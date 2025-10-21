import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsUUID()
  candidateId: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  designationId?: string;

  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salary: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  offerLetter?: string;
}
