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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CandidateService } from './candidate.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@ApiTags('Candidates')
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  @ApiOperation({
    summary: 'Create Candidate',
    description: 'Create a new candidate',
  })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidateService.create(dto);
  }

  @Get()
  @Roles('HR', 'ADMIN', 'EXCO')
  @ApiOperation({
    summary: 'Get Candidates',
    description: 'Get all candidates',
  })
  findAll(@Query() query: QueryCandidateDto) {
    return this.candidateService.findAll(query);
  }

  @Get('statistics')
  @Roles('HR', 'ADMIN', 'EXCO')
  @ApiOperation({
    summary: 'Get Candidate Statistics',
    description: 'Get candidate statistics',
  })
  getStatistics() {
    return this.candidateService.getStatistics();
  }

  @Get(':id')
  @Roles('HR', 'ADMIN', 'EXCO')
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidateService.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.candidateService.remove(id);
  }
}
