/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.interface';
import { PDFDoc } from 'src/pdfDocument/document.entity';
import { Ticket } from 'src/ticket/ticket.entity';

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

  @Column({type: 'numeric',default: Math.floor(100000 + Math.random() * 900000)})
  activation_token: number;
  
  @OneToMany(() => PDFDoc, (document) => document.userId)
  documents: PDFDoc[];

  @OneToMany(() => Ticket, (ticket) => ticket.userId)
  tickets: Ticket[];
}
