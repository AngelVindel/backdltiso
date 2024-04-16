/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

import { SendEmailDto } from './dto/send-email.dto';

const resend = new Resend('re_BL6nfFeC_J1PpKdtuDsZ4STaSEjcEBsbF'); 

@Injectable()
export class ResendService {
  async create(sendEmailDto: SendEmailDto): Promise<any> {
    return await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: sendEmailDto.to, 
      subject: `${sendEmailDto.name} ${sendEmailDto.subject}`,
      html: sendEmailDto.html,
    });
  }
}