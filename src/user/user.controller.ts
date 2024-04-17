/* eslint-disable prettier/prettier */
// user.controller.ts
import { Controller, Post, Body, Get, UseGuards, Delete, Param, Patch } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.signup(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(){
      return this.userService.getAllUsers();
  }
  @Get(":email")
  async getEmailUsers(@Param("email") email: string){
      try {
          const users =await this.userService.getEmailUsers(email);
          return users;
      } catch (error) {
          console.error("Error al obtener usuarios por correo electrónico:", error);
      }
  }
  
  @Post()
  createUser(@Body() newUser: CreateUserDto){
  return this.userService.createUser(newUser.username,newUser.email,newUser.password);
  }

  @Delete(":id")
  deleteUser(@Param("id") id:number){
      this.userService.deleteUser(id);
  }

  @Patch(":id")
  updateUser(@Param("id")id: number, @Body() updatedFields: UpdateUserDto){
      this.userService.updateUser(id,updatedFields);
  }



}

