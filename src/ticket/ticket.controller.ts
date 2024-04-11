import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';
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
    return this.ticketService.updateStatus(id, updateTicketDto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAllTickets() {
    return this.ticketService.getAllTickets();
  }
}
