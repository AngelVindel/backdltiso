/* eslint-disable prettier/prettier */
// user.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from './regularU.entity';
import { Answer } from 'src/answers/answers.entity';
import { DocumentModule } from 'src/pdfDocument/document.module';
import { AdminUser } from './adminU.entity';
import { UserInitService } from './userInit.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser,AdminUser,Answer]),
  DocumentModule],
  controllers: [UserController],
  providers: [UserService,UserInitService],
  exports: [UserService]
})

export class UserModule  implements OnModuleInit {
  constructor(private readonly userInitService: UserInitService) {}

  async onModuleInit() {
    await this.userInitService.createAdminUser();
  }}