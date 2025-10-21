import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateStatus } from 'prisma/prisma/generated/prisma';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Position applied for',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiPropertyOptional({ example: 'Engineering', description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: 'https://resume.url',
    description: 'Resume URL',
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @ApiPropertyOptional({
    enum: CandidateStatus,
    description: 'Candidate status',
  })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;
}
