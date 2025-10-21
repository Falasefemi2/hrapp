// src/offer/offer.controller.ts
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
  Request,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { ApproveOfferDto } from './dto/approve-offer.dto';
import { RejectOfferDto } from './dto/reject-offer.dto';
import { AcceptOfferDto } from './dto/accept-offer.dto';
import { CandidateRejectOfferDto } from './dto/candidate-reject-offer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Offers')
@Controller('offers')
export class OfferController {
  constructor(private offerService: OfferService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Create Offer', description: 'Create a new offer' })
  create(@Body() dto: CreateOfferDto, @Request() req) {
    return this.offerService.create(dto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN', 'EXCO')
  @ApiOperation({ summary: 'Get Offers', description: 'Get all offers' })
  findAll(@Query() query: QueryOfferDto) {
    return this.offerService.findAll(query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN', 'EXCO')
  getStatistics() {
    return this.offerService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN', 'EXCO')
  findOne(@Param('id') id: string) {
    return this.offerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offerService.update(id, dto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EXCO', 'ADMIN')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveOfferDto,
    @Request() req,
  ) {
    return this.offerService.approve(id, req.user.userId);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EXCO', 'ADMIN')
  reject(@Param('id') id: string, @Body() dto: RejectOfferDto, @Request() req) {
    return this.offerService.reject(id, dto, req.user.userId);
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  withdraw(@Param('id') id: string) {
    return this.offerService.withdraw(id);
  }

  // Public endpoints for candidates
  @Public()
  @Post('accept')
  acceptOffer(@Body() dto: AcceptOfferDto) {
    return this.offerService.acceptOffer(dto.token);
  }

  @Public()
  @Post('reject')
  candidateRejectOffer(@Body() dto: CandidateRejectOfferDto) {
    return this.offerService.candidateRejectOffer(dto);
  }
}
