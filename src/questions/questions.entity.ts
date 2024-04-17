/* eslint-disable prettier/prettier */
import { Answer } from "src/answers/answers.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Question{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    text:string;

    @Column()
    description:string;
    
    @Column()
    @OneToMany(()=>Answer, (answer)=> answer.question)
    answers: Answer[];
    
    
}