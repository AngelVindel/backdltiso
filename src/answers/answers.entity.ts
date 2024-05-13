import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from '../questions/questions.entity';
import { RegularUser } from "src/user/regularU.entity";

@Entity()
export class Answer {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

   /* @ManyToOne(() => Question, (question) => question.answers)
    question: Question;

    @ManyToMany(() => RegularUser, user => user.chosenAnswers)
    users: RegularUser[];
*/
}
