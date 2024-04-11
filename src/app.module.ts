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
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';

@Module({
   imports: [  TypeOrmModule.forRoot({
    "type" :"mysql",
    "host" : "localhost",
    "port":3306,
    "username": "root",
    "password": "123Rambo",
    "database": "prueba2",
    "entities": [__dirname + '/**/*.entity{.ts,.js}'],
    "synchronize": true, // No usar en producción
  }),
  TypeOrmModule.forFeature([RegularUser,AdminUser,PDFDoc]), 
    AuthModule,UserModule,DocumentModule, QuestionsModule, AnswersModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
