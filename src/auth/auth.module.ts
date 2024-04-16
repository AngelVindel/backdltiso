/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt.constants';
import { AuthService } from './auth.service';
import { JwStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from 'src/user/adminU.entity';
import { RegularUser } from 'src/user/regularU.entity';
@Module({
imports:[
    TypeOrmModule.forFeature([AdminUser, RegularUser]),
    JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: {expiresIn: '60s'}
    }),
    

],
    controllers: [AuthController],
    providers: [AuthService,JwStrategy],

})
export class AuthModule {}