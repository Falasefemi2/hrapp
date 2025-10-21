import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [OfferService, PrismaService, EmailService, ConfigService],
  controllers: [OfferController],
})
export class OfferModule {}
