import { Module } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { DesignationController } from './designation.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [DesignationService, PrismaService],
  controllers: [DesignationController],
})
export class DesignationModule {}
