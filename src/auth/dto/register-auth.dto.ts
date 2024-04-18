/* eslint-disable prettier/prettier */
import { LoginAuthDto } from "./login-auth.dto";
export class RegisterAuthDto extends LoginAuthDto{


    username: string;
    activation_token: number;
   
    userType: string;

    //company: string;

}