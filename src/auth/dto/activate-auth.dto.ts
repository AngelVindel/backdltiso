/* eslint-disable prettier/prettier */
import { IsEmail, IsNumber } from "class-validator";


export class ActivateAuthDto{

    
@IsEmail()
email: string;

@IsNumber()
activation_token: number;

}