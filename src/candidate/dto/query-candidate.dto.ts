import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateStatus } from 'prisma/prisma/generated/prisma';

export class QueryCandidateDto {
  @ApiPropertyOptional({
    enum: CandidateStatus,
    description: 'Candidate status filter',
  })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @ApiPropertyOptional({
    example: 'Engineering',
    description: 'Department filter',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: 'Software Engineer',
    description: 'Position filter',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'John', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}
