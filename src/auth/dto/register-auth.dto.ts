import { IsNotEmpty } from "class-validator";
import { LoginAuthDto } from "./login-auth.dto";
export class RegisterAuthDto extends LoginAuthDto{


    username: string;

   
    serType: string;

    //company: string;

}