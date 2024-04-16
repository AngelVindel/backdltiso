/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { ResendController } from './email.controller';
import { ResendService } from './email.service';

@Module({
  controllers: [ResendController],
  providers: [ResendService],
})
export class ResendModule {}