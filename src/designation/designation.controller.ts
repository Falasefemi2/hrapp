import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { DesignationService } from './designation.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('designation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesignationController {
  constructor(private designationService: DesignationService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  create(@Body() dto: CreateDesignationDto) {
    return this.designationService.create(dto);
  }

  @Get()
  findAll(@Query('departmentId') departmentId?: string) {
    return this.designationService.findAll(departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDesignationDto>) {
    return this.designationService.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.designationService.remove(id);
  }
}
