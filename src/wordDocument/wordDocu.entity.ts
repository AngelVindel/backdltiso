import { RegularUser } from "src/user/regularU.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class WordDoc {
  
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
fileName: string;

@Column()
modifyDate: Date;

@Column()
type: number;

@Column()
nombreEmpresa: string;

@Column()
realizadoPor: string;

@Column()
revisadoPor: string;

@Column()
aprobadoPor: string;

@Column()
estado: string;


}