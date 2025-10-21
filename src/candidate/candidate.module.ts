import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CandidateService, PrismaService, EmailService, ConfigService],
  controllers: [CandidateController],
})
export class CandidateModule {}
