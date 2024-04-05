// ticket.service.ts
import { Injectable } from '@nestjs/common';
import { Ticket } from './ticket.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../user/user.interface';

@Injectable()
export class TicketService {
  private readonly tickets: Ticket[] = []; 
  private readonly users: User[] = []; 

  async create(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const ticket: Ticket = {
      id: this.tickets.length + 1,
      userId: user.id,
      title: createTicketDto.title,
      description: createTicketDto.description,
      status: 'open',
      createdAt: new Date() 
    };
    this.tickets.push(ticket);
    return ticket;
  }

  async getResolvedTickets(userId: number): Promise<Ticket[]> {
    const userTickets = this.tickets.filter(ticket => ticket.userId === userId && ticket.status === 'closed');
    return userTickets;
  }
}
