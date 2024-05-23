/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { LinkPortalDto } from './dto/link-portal.dto';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create a payment using Stripe' })
  @ApiResponse({ status: 200, description: 'Payment created successfully' })
  @ApiBadRequestResponse({ description: 'Incorrect payment data' })
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @ApiOperation({ summary: 'Handle a successful payment' })
  @ApiResponse({ status: 200, description: 'Payment completed successfully' })
  @Get('success')
  async paymentSuccess(@Query() query: any) {
    await this.paymentService.successPayment(query.session_id);
    return { url: 'http://localhost:5000' };
  }

  @ApiOperation({ summary: 'Handle a canceled payment' })
  @ApiResponse({ status: 200, description: 'Payment canceled successfully' })
  @Get('canceled')
  async paymentCanceled(@Query() query: any) {
    return this.paymentService.canceledPayment(query.session_id);
  }

  @ApiOperation({ summary: 'Generate a Stripe portal link' })
  @ApiResponse({
    status: 200,
    description: 'Portal link generated successfully',
  })
  @Post('portal')
  async generateLinkPortal(@Body() linkPortalDto: LinkPortalDto) {
    return this.paymentService.generateLinkPortal(linkPortalDto);
  }
}
