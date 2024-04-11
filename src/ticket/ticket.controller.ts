// ticket.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('tickets')
export class TicketController {
 constructor(private readonly ticketService: TicketService) {}

 @Post()
 @UseGuards(AuthGuard('jwt'))
 async create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    const userId = req.user.id; 
    return this.ticketService.create(createTicketDto, userId);
 }

 @Get('resolved')
 @UseGuards(AuthGuard('jwt')) 
 async getResolvedTickets(@Req() req) { 
    const userId = req.user.id; 
    return this.ticketService.getResolvedTickets(userId);
 }
}
