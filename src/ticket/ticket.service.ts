import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
    const { title, description } = createTicketDto;

    if (!userId) {
      throw new UnauthorizedException('Only regular users can create tickets.');
    }

    const ticket = await this.ticketRepository.create({
      userId,
      title,
      description,
      status: 'open',
      createdAt: new Date(),
    });
    return await this.ticketRepository.save(ticket);
  }

  async updateStatus(
    idTicket: number,
    status: 'open' | 'in progress' | 'closed',
    adminUserId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOneBy({ id: idTicket });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${idTicket} not found`);
    }

    // Comprobamos si el usuario es un administrador
    if (!adminUserId) {
      throw new UnauthorizedException('Only admins can update ticket status.');
    }

    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }
  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async deleteTicket(
    idTicket: number,
    adminUserId: number,
  ): Promise<{ message: string }> {
    const ticket = await this.ticketRepository.findOneBy({ id: idTicket });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${idTicket} not found`);
    }

    // Comprobamos si el usuario es un administrador
    if (!adminUserId) {
      throw new UnauthorizedException('Only admins can delete tickets.');
    }

    await this.ticketRepository.delete({ id: idTicket });
    return { message: 'Ticket has been successfully deleted.' };
  }
}
