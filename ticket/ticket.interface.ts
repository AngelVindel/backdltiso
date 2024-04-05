// ticket.interface.ts
export interface Ticket {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date; 
}