import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegularUser } from './user/regularU.entity';
import { AdminUser } from './user/adminU.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
   imports: [  TypeOrmModule.forRoot({
    "type" :"mysql",
    "host" : "localhost",
    "port":3306,
    "username": "root",
    "password": " ",
    "database": "prueba2",
    "entities": [__dirname + '/**/*.entity{.ts,.js}'],
    "synchronize": true, // No usar en producción
  }),
  TypeOrmModule.forFeature([RegularUser,AdminUser]), 
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
