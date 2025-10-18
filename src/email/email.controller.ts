import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get('test-email-setup')
  async testEmailSetup() {
    return await this.emailService.testConnection();
  }
}
