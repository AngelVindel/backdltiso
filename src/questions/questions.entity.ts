import { Entity } from "typeorm";


@Entity()
export class Question{

    id:number;

    text:string;

    description:string;
    
}