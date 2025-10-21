import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Password',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'roleId', description: 'Role ID' })
  @IsString()
  roleId: string;

  @ApiPropertyOptional({
    example: 'departmentId',
    description: 'Department ID',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'designationId',
    description: 'Designation ID',
  })
  @IsOptional()
  @IsString()
  designationId?: string;

  @ApiPropertyOptional({ example: 'levelId', description: 'Level ID' })
  @IsOptional()
  @IsString()
  levelId?: string;
}
