/* eslint-disable prettier/prettier */
import { Injectable, HttpException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from '../user/adminU.entity';
import {  LoginAuthDto } from './dto/login-auth.dto';
import {  RegisterAuthDto } from './dto/register-auth.dto';
import { User } from '../user/user.interface';
import { RegularUser } from 'src/user/regularU.entity';
import { ActivateAuthDto } from './dto/activate-auth.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AdminUser)
        private adminUserRepository: Repository<AdminUser>,
        @InjectRepository(RegularUser)
        private regularUserRepository: Repository<RegularUser>,
        private jwtService: JwtService,
        @Inject(EmailService) 
        private readonly emailService: EmailService
    ) {}

    private getUserRepository(userType: string): Repository<User> {
        if (userType === 'Admin') {
            return this.adminUserRepository;
        } else {
            return this.regularUserRepository;
        }
    }

    async register(userDto: RegisterAuthDto) {
        
        const { email, password, userType} = userDto;
        const hashedPassword = await hash(password, 10);
        const userRepository = this.getUserRepository(userType);
        const user = await userRepository.findOne({ where: { email } });

        if (user) {
            throw new HttpException('Account already created', 401);
        }
        
        const newUser = userRepository.create({
            ...userDto,
            password: hashedPassword,
            
        });
        await userRepository.save(newUser);
        await this.emailService.sendEmail(email, newUser);
        return newUser;
    }

    async login(userDto: LoginAuthDto): Promise<{ user: User; token: string }> {
        const { email, password, userType } = userDto;
        const userRepository = this.getUserRepository(userType);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new HttpException('Invalid credentials', 401);
        }

        const payload = { id: user.id, email: user.email, userType: user instanceof AdminUser ? 'Admin': 'User'};
        const token = this.jwtService.sign(payload);

        return { user, token };
    }

    async activateAccount(userDto:ActivateAuthDto): Promise<boolean> {
        const { activation_token, email } = userDto;
        const user = await this.regularUserRepository.findOne({ where: { email } });
        console.log(user.activation_token, activation_token);
        
        try {
            if(activation_token == user.activation_token){
                await this.regularUserRepository.update(user.id, {activated: true,activation_token:null});
                return true
            }else{
                return false
            }
            
        } catch (error) {
            throw new HttpException('Ha ocurrido un error'+error.message, 500);
        }
       
    }
}
