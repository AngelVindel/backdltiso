/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegularUser } from './user/regularU.entity';
import { AdminUser } from './user/adminU.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PDFDoc } from './pdfDocument/document.entity';
import { UserModule } from './user/user.module';
import { DocumentModule } from './pdfDocument/document.module';
import { TicketModule } from './ticket/ticket.module';
import { Ticket } from './ticket/ticket.entity';
import { ConfigModule } from '@nestjs/config';

import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // No usar en producción
    }),
    TypeOrmModule.forFeature([RegularUser, AdminUser, PDFDoc,Ticket, Ticket]),
    AuthModule,
    UserModule,
    DocumentModule,TicketModule,QuestionsModule,AnswersModule,
    TicketModule,
    EmailModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}