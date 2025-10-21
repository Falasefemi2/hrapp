import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './department/department.module';
import { DesignationModule } from './designation/designation.module';
import { LevelModule } from './level/level.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CandidateModule } from './candidate/candidate.module';
import { OfferModule } from './offer/offer.module';

@Module({
  imports: [DepartmentModule, DesignationModule, LevelModule, UserModule, EmailModule, AuthModule, RolesModule, CandidateModule, OfferModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
