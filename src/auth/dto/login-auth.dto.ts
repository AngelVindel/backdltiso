/* eslint-disable prettier/prettier */
import { IsEmail, MaxLength, MinLength } from "class-validator";


export class LoginAuthDto{

    
@IsEmail()
email: string;

userType: string;

@MinLength(6)
@MaxLength(12)
password:string;


}