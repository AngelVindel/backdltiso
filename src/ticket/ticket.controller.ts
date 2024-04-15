import { Controller, Get, Post, Body, Param, Patch, UseGuards, Delete} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto, DeleteTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    const userId = createTicketDto.userId;
    return this.ticketService.create(createTicketDto, userId);
  }

  @Patch(':id/status')
  async updateTicketStatus(
    @Param('id') id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    const adminUserId = updateTicketDto.adminUserId;

    const { status } = updateTicketDto;
    return this.ticketService.updateStatus(id, status, adminUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAllTickets() {
    return this.ticketService.getAllTickets();
  }

  @Delete(':id')
  async deleteTicket(
    @Param('id') id: number,
    @Body() deleteTicketDto: DeleteTicketDto,
  ) {
    const adminUserId = deleteTicketDto.adminUserId;
    return this.ticketService.deleteTicket(id, adminUserId);
  }
}
