/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.interface";

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

  @Column({type: 'uuid',unique:true})
  activation_token: string
  

}
