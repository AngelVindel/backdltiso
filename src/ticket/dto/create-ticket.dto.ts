// create-ticket.dto.ts
export class CreateTicketDto {
  userId: number;
  fecha: Date;
  estado: 'open' | 'in progress' | 'closed';
  title: string;
  description: string; 
}
export class UpdateTicketDto {
  status: 'open' | 'in progress' | 'closed';
  adminUserId: number;
}

export class DeleteTicketDto {
  adminUserId: number;
}
