import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Create Role', description: 'Create a new role' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Roles', description: 'Get all roles' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Role', description: 'Get a role by ID' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
