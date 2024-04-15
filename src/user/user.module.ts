/* eslint-disable prettier/prettier */
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from './regularU.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegularUser])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
