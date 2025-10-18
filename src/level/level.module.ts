import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [LevelService, PrismaService],
  controllers: [LevelController],
})
export class LevelModule {}
