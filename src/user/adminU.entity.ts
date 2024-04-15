/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.interface';
import { Ticket } from 'src/ticket/ticket.entity';

@Entity()
export class AdminUser implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Ticket, (ticket) => ticket.adminUser)
  tickets: Ticket[];

  @Column()
  username: string;

  
  @Column()
  password: string;

  @Column()
  email: string;
}
