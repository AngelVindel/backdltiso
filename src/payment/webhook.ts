import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express'; // Importa los tipos Request y Response de express

const stripe = new Stripe("sk_test_51P17b5006fS5TbMz1s8mIPUyxSoaupvjgOk9sCx5PlPlvDZ59By2gcB4MWBjj8YetLWzn9Ss2COvzw46O0McKhfR00RlQXDgpU", { apiVersion: '2023-10-16' });
const endpointSecret = "whsec_sa0TAsQy20B1YjAISAd0JfCiafXDKzvH";

@Injectable()
export class StripeWebhookService {
    constructor(private readonly paymentService: PaymentService) {}

    async handleStripeWebhook(req: Request, res: Response, payload: any) { // Añade req y res como parámetros
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        switch(event.type){
            case "checkout.session.completed":
                const checkoutSessionCompleted = event.data.object;
                console.log('StripeWebhookService - handleStripeWebhook - checkoutSessionCompleted', checkoutSessionCompleted);
                this.paymentService.paymentCompleted.emit(checkoutSessionCompleted.id);
                break;
            // Agrega más casos para otros tipos de eventos de Stripe según sea necesario
        }

        // Si todo va bien, devuelve una respuesta satisfactoria
        return res.status(200).json({ received: true });
    }
}
