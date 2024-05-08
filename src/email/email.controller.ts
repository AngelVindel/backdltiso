/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  
  @Post()
  async sendEmail(@Body() body: { email: string, activationToken: number }) {
    const { email,activationToken } = body;
    await this.emailService.sendEmail(email, activationToken);
    return true;
  }
  @Post('password')
  async sendPasswordKey(@Body() body: { email: string, passwordKey: string }) {
    const { email, passwordKey } = body;
    await this.emailService.sendPasswordKey(email, passwordKey);
    return true;
  } 
}
