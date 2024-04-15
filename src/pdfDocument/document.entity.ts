import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PDFDoc {
  
  @PrimaryGeneratedColumn()
  id: number;
  
  userId: number;

  contnt: string;

  creationDate: Date;

  modifyDate: Date;

  permissions: String;

  filePath: string;

}
