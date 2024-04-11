import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RegularUser } from 'src/user/regularU.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RegularUser, (user) => user.tickets) 
  userId: number;

  @Column({default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  status: string;

  @Column()
  title: string;

  @Column()
  description: string;
}

