import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [UserService, PrismaService, EmailService, ConfigService],
  controllers: [UserController],
})
export class UserModule {}
