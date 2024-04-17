import { Question } from "src/questions/questions.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Answer{

    @PrimaryGeneratedColumn()
    id:number;

    
    @Column()
    text: string;

    @Column()
    @ManyToOne(()=>Question, (question)=> question.answers)
    question: Question;

   
    
}