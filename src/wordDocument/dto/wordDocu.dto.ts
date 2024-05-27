
export class DocuDto{


    userId:number;
    nombreEmpresa: string;
    realizadoPor: string;
    revisadoPor: string;
    aprobadoPor:string;
    textIA?: string;
    estado: string;
    fecha?:Date;
   

}

export interface UpdateDocuDto {
    nombreEmpresa?: string;
    realizadoPor?: string;
    revisadoPor?: string;
    aprobadoPor?: string;
    estado?: string;
  }
  