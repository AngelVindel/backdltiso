import { IsNotEmpty } from "class-validator";
import { Question } from "src/questions/questions.entity";


export class AnswerDto{
    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    question: Question;

}