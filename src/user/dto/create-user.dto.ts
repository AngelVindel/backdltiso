/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// create-user.dto.ts
export class CreateUserDto {

    @IsEmail()  
    @IsString()
    @IsNotEmpty()
     email: string;

    @IsString()
    @IsNotEmpty()
     username: string;


    @IsString()
    @IsNotEmpty()
     password: string;



     activation_token: number;

  
  }
  export class UpdateUserDto{

    username?: string;


  }
  