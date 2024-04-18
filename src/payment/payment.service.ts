import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events'; // Importa EventEmitter de 'events' de Node.js
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { LinkPortalDto } from './dto/link-portal.dto';

const stripe = new Stripe('sk_test_51P17b5006fS5TbMz1s8mIPUyxSoaupvjgOk9sCx5PlPlvDZ59By2gcB4MWBjj8YetLWzn9Ss2COvzw46O0McKhfR00RlQXDgpU', { apiVersion: '2023-10-16' });
const YOUR_DOMAIN = 'http://localhost:5000';// RUTA DE LA APLICACION

@Injectable()
export class PaymentService {
    paymentCompleted = new EventEmitter(); // Utiliza EventEmitter desde el módulo 'events' de Node.js

    constructor(private readonly stripe: Stripe) {} 

    async create(createPaymentDto: CreatePaymentDto) {
        const session = await stripe.checkout.sessions.create({
            customer_email: createPaymentDto.email,
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: createPaymentDto.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${YOUR_DOMAIN}/payment/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/payment/canceled?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
        });

        const intentPayment = {
            user: createPaymentDto.email,
            price: createPaymentDto.priceId,
            session: session.id,
            status: session.status,
        };

        return session.url;
    }

    async successPayment(sessionId: string) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('PaymentService - successPayment - session', session);
        this.paymentCompleted.emit(sessionId);
        return session;
    }

    async canceledPayment(sessionId: string) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('PaymentService - canceledPayment - session', session);
        return session;
    }

    async generateLinkPortal(linkPortalDto: LinkPortalDto) {
        const session = await stripe.checkout.sessions.retrieve(linkPortalDto.sessionId);
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: session.customer.toString(),
            return_url: 'ruta',
        });

        return portalSession.url;
    }
}

