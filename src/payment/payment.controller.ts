import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { LinkPortalDto } from './dto/link-portal.dto';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    async create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }

    @Get('success')
    async paymentSuccess(@Query() query: any) {
        await this.paymentService.successPayment(query.session_id);
        return { url: 'https://tnovato.com' };
    }

    @Get('canceled')
    async paymentCanceled(@Query() query: any) {
        return this.paymentService.canceledPayment(query.session_id);
    }

    @Post('portal')
    async generateLinkPortal(@Body() linkPortalDto: LinkPortalDto) {
        return this.paymentService.generateLinkPortal(linkPortalDto);
    }
}
