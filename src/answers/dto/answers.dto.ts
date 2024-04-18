import { IsNotEmpty } from "class-validator";


export class AnswerDto{
    @IsNotEmpty()
    text: string;

   
}