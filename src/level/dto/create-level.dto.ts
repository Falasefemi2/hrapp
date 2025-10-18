import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  annualLeaveDays: number;

  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  domesticAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  utilityAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lunchSubsidy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  entertainmentAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  telephoneAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenanceAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  housingAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dressingAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  furnitureAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  educationAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicalAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passageAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  thirteenthMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leaveExpirationInterval?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumLeaveDays?: number;
}
