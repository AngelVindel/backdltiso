import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.create({
      userId: userId,
      title: createTicketDto.title,
      description: createTicketDto.description,
      status: 'open',
      createdAt: new Date(),
    });
    return await this.ticketRepository.save(ticket);
  }

  async updateStatus(
    ticketId: number,
    status: 'open' | 'in progress' | 'closed',
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOneBy({ id: ticketId });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }
}
