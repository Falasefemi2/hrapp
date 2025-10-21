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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Levels')
@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LevelController {
  constructor(private levelService: LevelService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Create Level', description: 'Create a new level' })
  create(@Body() dto: CreateLevelDto) {
    return this.levelService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Levels', description: 'Get all levels' })
  findAll() {
    return this.levelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Level', description: 'Get a level by ID' })
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateLevelDto>) {
    return this.levelService.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.levelService.remove(id);
  }
}
