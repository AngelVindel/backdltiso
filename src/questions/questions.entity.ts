import { RegularUser } from "src/user/regularU.entity";
import { Column, Entity, ManyToOne,  PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Question {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;


    @ManyToOne(()=>RegularUser,user=>user.questions)
    userId: number

   /* @OneToOne(() => Answer, (answer) => answer.question,
    {
        cascade:['remove']
    })
    answer: Answer;

    */
}
