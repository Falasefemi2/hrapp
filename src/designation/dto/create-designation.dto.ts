import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({ example: 'Manager', description: 'Designation name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'MGR', description: 'Designation code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'departmentId',
    description: 'Department ID',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;
}
