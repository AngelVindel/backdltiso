import { Answer } from "src/answers/answers.entity";
import { Entity, OneToMany } from "typeorm";


@Entity()
export class Question{

    
    id:number;

    text:string;

    description:string;

    @OneToMany(()=>Answer, answer=> answer.questionId)
    answers: Answer[];
    
    
}