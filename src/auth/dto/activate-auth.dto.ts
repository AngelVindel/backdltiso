/* eslint-disable prettier/prettier */
import { IsEmail, IsNumber } from "class-validator";


export class ActivateAuthDto{

    
@IsEmail()
email: string;


activation_token: string;

}