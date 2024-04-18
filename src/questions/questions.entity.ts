import { Answer } from "../answers/answers.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    description: string;

    @OneToMany(() => Answer, (answer) => answer.question,
    {
        cascade:['remove']
    })
    answers: Answer[];

}
