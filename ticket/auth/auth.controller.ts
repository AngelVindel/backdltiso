// auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
 constructor(private authService: AuthService) {} 

 @Post('login') 
 @HttpCode(HttpStatus.OK)
 @ApiOperation({ summary: 'User Login' }) 
 @ApiResponse({
    status: HttpStatus.OK,
    description: 'User login successful',
 })
 async signIn(@Body() signInDto: CreateUserDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
 }
}
