/* eslint-disable prettier/prettier */
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from './regularU.entity';
import { Answer } from 'src/answers/answers.entity';
import { DocumentModule } from 'src/pdfDocument/document.module';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser,Answer]),
  DocumentModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
