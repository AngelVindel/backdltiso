// create-ticket.dto.ts
import { IsNotEmpty, IsIn } from 'class-validator';


export class CreateTicketDto {
  userId: number;
  fecha: Date;
  estado: 'open' | 'in progress' | 'closed';
  title: string;
  description: string; 
}
export class UpdateTicketDto {
  @IsNotEmpty()
  @IsIn(['open', 'in progress', 'closed'])
  status: 'open' | 'in progress' | 'closed';

  adminUserId: number;
}

export class DeleteTicketDto {
  adminUserId: number;
}
