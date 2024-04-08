// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service'; 
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dto/create-user.dto';
@Injectable()
export class AuthService {
 constructor(
    private usersService: UserService,
    private jwtService: JwtService,
 ) {}

 async signIn(email: string, password: string) { 
    const user = await this.usersService.findOneByEmail(email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email }; 
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
 }
}

