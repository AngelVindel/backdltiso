/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() body: { email: string, activationToken: number }) {
    const { email,activationToken } = body;
    await this.emailService.sendEmail(email, activationToken);
    return true;
  } 
}
