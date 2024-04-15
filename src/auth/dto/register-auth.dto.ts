/* eslint-disable prettier/prettier */
import { LoginAuthDto } from "./login-auth.dto";
export class RegisterAuthDto extends LoginAuthDto{


    username: string;
    activation_token: string;
   
    userType: string;

    //company: string;

}