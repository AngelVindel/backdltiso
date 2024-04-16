/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RegularUser } from 'src/user/regularU.entity';
import { AdminUser } from 'src/user/adminU.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RegularUser, (user) => user.tickets)
  userId: number;

  @ManyToOne(() => AdminUser, (admin) => admin.tickets)
  admin: AdminUser;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  status: string;

  @Column()
  title: string;

  @Column()
  description: string;
  adminUserId: number;
  adminId: number;
}
