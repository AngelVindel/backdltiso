import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { AdminUser } from '../user/adminU.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(AdminUser)
    private adminRepository: Repository<AdminUser>,
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

    if (!['open', 'in progress', 'closed'].includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const ticket = await this.ticketRepository.findOneBy({ id: idTicket });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${idTicket} not found`);
    }
    const adminUser = await this.adminRepository.findOneBy({ id:adminUserId});
    if (!adminUser) {
      throw new UnauthorizedException(`Admin with ID ${adminUserId} not found`);
    }

    if (!adminUserId) {
      throw new UnauthorizedException('Only admins can update ticket status.');
    }

    ticket.status = status;
    ticket.admin = adminUserId;
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

    // Comprueba si el usuario es un administrador
    if (!adminUserId) {
      throw new UnauthorizedException('Only admins can delete tickets.');
    }

    await this.ticketRepository.remove(ticket);
    return { message: 'Ticket has been successfully deleted.' };
  }
}
