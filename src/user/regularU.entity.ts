import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.interface";
import { PDFDoc } from "src/pdfDocument/document.entity";

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

   @OneToMany(()=>PDFDoc, document=> document.userId)
  documents: PDFDoc[]

}
