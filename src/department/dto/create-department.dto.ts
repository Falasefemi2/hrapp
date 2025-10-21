import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering', description: 'Department name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ENG', description: 'Department code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'userId',
    description: 'Head of Department user ID',
  })
  @IsOptional()
  @IsString()
  hodId?: string;
}
