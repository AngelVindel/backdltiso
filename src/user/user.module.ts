/* eslint-disable prettier/prettier */
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from './regularU.entity';
import { DocumentModule } from 'src/pdfDocument/document.module';
import { AdminUser } from './adminU.entity';
import { Question } from 'src/questions/questions.entity';
import { QuestionsModule } from 'src/questions/questions.module';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser,AdminUser, Question]),
  DocumentModule,QuestionsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
