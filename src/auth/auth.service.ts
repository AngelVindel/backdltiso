/* eslint-disable prettier/prettier */
import { Injectable, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from '../user/adminU.entity';
import {  LoginAuthDto } from './dto/login-auth.dto';
import {  RegisterAuthDto } from './dto/register-auth.dto';
import { User } from '../user/user.interface';
import { RegularUser } from 'src/user/regularU.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AdminUser)
        private adminUserRepository: Repository<AdminUser>,
        @InjectRepository(RegularUser)
        private regularUserRepository: Repository<RegularUser>,
        private jwtService: JwtService
    ) {}

    private getUserRepository(userType: string): Repository<User> {
        if (userType === 'Admin') {
            return this.adminUserRepository;
        } else {
            return this.regularUserRepository;
        }
    }

    async register(userDto: RegisterAuthDto) {
        const { email, password, userType } = userDto;
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

        const payload = { id: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return { user, token };
    }
}
