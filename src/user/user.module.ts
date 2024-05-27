/* eslint-disable prettier/prettier */
// user.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from './regularU.entity';
import { DocumentModule } from 'src/pdfDocument/document.module';
import { AdminUser } from './adminU.entity';
import { Question } from 'src/questions/questions.entity';
import { QuestionsModule } from 'src/questions/questions.module';
import { UserInitService } from './userInit.service';
import { WordModule } from 'src/wordDocument/wordDocu.module';
import { WordDoc } from 'src/wordDocument/wordDocu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser,AdminUser, Question,WordDoc]),
  DocumentModule,QuestionsModule,WordModule],


  controllers: [UserController],
  providers: [UserService,UserInitService],
  exports: [UserService]
})

export class UserModule  implements OnModuleInit {
  constructor(private readonly userInitService: UserInitService) {}

  async onModuleInit() {
    await this.userInitService.createAdminUser();
  }}