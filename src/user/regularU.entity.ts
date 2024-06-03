/* eslint-disable prettier/prettier */
import { Column, Entity,NumericType, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.interface';
import { PDFDoc } from 'src/pdfDocument/document.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { Question } from 'src/questions/questions.entity';
import { WordDoc } from 'src/wordDocument/wordDocu.entity';


@Entity()
export class RegularUser implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  fullname?: string;

  @Column() 
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  userPhoto?: string;

  @Column()
  company: string;

  @Column({type: 'boolean', default: false})
  activated: boolean;

  @Column({type: 'numeric',default: Math.floor(100000 + Math.random() * 900000), nullable: true})
  activation_token: NumericType;
  
  @OneToMany(() => PDFDoc, (document) => document.userId, {cascade: ['insert','update']})
  documents: PDFDoc[];

  @OneToMany(() => WordDoc, (document) => document.userId, {cascade: ['insert','update']})
  wordDocuments: WordDoc[];
  
  @OneToMany(() => Ticket, (ticket) => ticket.userId)
  tickets: Ticket[];

  
  @OneToMany(()=>Question, (question)=>question.email, {cascade: ['remove','insert']})
  questions: Question[];


  @Column({type: 'boolean', default: false})
  premium: boolean;


}
/*@ManyToMany(()=> Answer)
  @JoinTable()
  chosenAnswers: Answer[];
*/