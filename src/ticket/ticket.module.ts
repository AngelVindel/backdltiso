import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { RegularUser } from 'src/user/regularU.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, RegularUser])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
