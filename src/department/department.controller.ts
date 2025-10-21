import {
  Controller,
  Post,
  UseGuards,
  Body,
  Delete,
  Patch,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Department')
@Controller('department')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  @ApiOperation({
    summary: 'Create Department',
    description: 'Create a new department',
  })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Departments',
    description: 'Get all departments',
  })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Department',
    description: 'Get a department by ID',
  })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDepartmentDto>) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
