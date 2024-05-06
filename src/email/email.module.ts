/* eslint-disable prettier/prettier */
//app.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from 'src/user/regularU.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser])],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService], 
})
export class EmailModule {}
