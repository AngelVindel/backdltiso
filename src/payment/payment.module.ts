import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import Stripe from 'stripe'; // Importa Stripe directamente

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: Stripe,
      useValue: new Stripe(
        'sk_test_51P17b5006fS5TbMz1s8mIPUyxSoaupvjgOk9sCx5PlPlvDZ59By2gcB4MWBjj8YetLWzn9Ss2COvzw46O0McKhfR00RlQXDgpU',
        { apiVersion: '2023-10-16' },
      ),
    },
  ],
})
export class PaymentModule {}
