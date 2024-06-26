/* eslint-disable prettier/prettier */
import { RegularUser } from "src/user/regularU.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PDFDoc {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(()=>RegularUser, user=> user.documents)
  userId: number;

  @Column({ type: 'mediumblob' })
  content: Buffer;

  @Column()
  creationDate: Date;

  @Column()
  modifyDate: Date;

  

}
