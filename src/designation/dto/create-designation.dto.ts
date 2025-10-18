import { IsString, IsOptional } from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}
