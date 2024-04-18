import { Answer } from "src/answers/answers.entity";

export class  QuestionDTO{

    id: number

    text: string;

    description: string;

    answers?: Answer[];


}