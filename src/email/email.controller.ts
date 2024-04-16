/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { SendEmailDto } from './dto/send-email.dto';
import { ResendService } from './email.service';

@Controller('resend')
export class ResendController {
  constructor(private readonly resendService: ResendService) {}

  @Post()
  async create(
    @Res() response: Response,
    @Body() createResendDto: SendEmailDto,
  ) {
    try {
      const req = await this.resendService.create(createResendDto);

      return response.status(200).json({
        message: req,
      });
    } catch (error) {
      console.log(error);
    }
  }
}