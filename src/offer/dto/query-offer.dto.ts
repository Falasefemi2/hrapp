import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OfferStatus } from 'prisma/prisma/generated/prisma';

export class QueryOfferDto {
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
