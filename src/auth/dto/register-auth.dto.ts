/* eslint-disable prettier/prettier */
import { IsNotEmpty } from "class-validator";
import { LoginAuthDto } from "./login-auth.dto";
export class RegisterAuthDto extends LoginAuthDto{


    username: string;

   
userType: string;

   // company: string;

}