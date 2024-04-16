import { Question } from "src/questions/questions.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Answer{

    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    @ManyToOne(()=>Question, question=> question.answers)
    questionId: number;

    @Column()
    text: string;


  
    
}