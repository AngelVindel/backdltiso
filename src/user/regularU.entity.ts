/* eslint-disable prettier/prettier */
import { Column, Entity,NumericType, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.interface';
import { PDFDoc } from 'src/pdfDocument/document.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { Answer } from 'src/answers/answers.entity';


@Entity()
export class RegularUser implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column() 
  password: string;

  @Column()
  email: string;

  @Column()
  company: string;

  @Column({type: 'boolean', default: false})
  activated: boolean;

  @Column({type: 'numeric',default: Math.floor(100000 + Math.random() * 900000), nullable: true})
  activation_token: NumericType;
  
  @OneToMany(() => PDFDoc, (document) => document.userId, {cascade: ['insert','update']})
  documents: PDFDoc[];

  @OneToMany(() => Ticket, (ticket) => ticket.userId)
  tickets: Ticket[];

  @ManyToMany(()=> Answer)
  @JoinTable()
  chosenAnswers: Answer[];

  @Column()
  premium: boolean;


}
