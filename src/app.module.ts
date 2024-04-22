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
import { Question } from './questions/questions.entity';
import { Answer } from './answers/answers.entity';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:  'localhost',
      port:  3306,
      username: 'root',
      password: '',
      database: 'prueba2',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // No usar en producción
    }),
    TypeOrmModule.forFeature([RegularUser, AdminUser, PDFDoc, Ticket,Question,Answer]),
    AuthModule,
    UserModule,
    DocumentModule,
    TicketModule,
    QuestionsModule,
    AnswersModule,
    TicketModule,
    EmailModule,
    PaymentModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}