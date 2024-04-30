import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { RegularUser } from 'src/user/regularU.entity';
import { AdminUser } from 'src/user/adminU.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, RegularUser, AdminUser])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
