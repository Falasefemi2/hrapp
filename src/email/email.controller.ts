import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get('test-email-setup')
  @ApiOperation({
    summary: 'Test Email Setup',
    description: 'Test email server connection',
  })
  async testEmailSetup() {
    return await this.emailService.testConnection();
  }
}
