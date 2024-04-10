import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

    
  
  }
  export class UpdateUserDto{

    username?: string;

  }
  