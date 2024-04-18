import { NextResponse } from "next/server";
import Stripe from 'stripe';


//esta clave esta ligada a una cuenta espefica 
const stripe = new Stripe("sk_test_51P17b5006fS5TbMz1s8mIPUyxSoaupvjgOk9sCx5PlPlvDZ59By2gcB4MWBjj8YetLWzn9Ss2COvzw46O0McKhfR00RlQXDgpU");
/**
 * Con el contexto de que un usuario pulse el boton de compra 
 * se desplegara el formulario necesario para llevar acabo la compra 
 * 
 * 
 */
export async function POST(request: Request) {
    const body = await request.json();
    console.log(body);
    try {
        const session = await stripe.checkout.sessions.create({
            success_url: "http://localhost:3000/success",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: body.name
                        },
                        unit_amount: body.price_data // Solucionar error al obtener el precio de la suscripcion
                    },
                    quantity: 1
                },
            ],
            mode: "payment",
        });

        console.log(session);

        return NextResponse.json(session);
    } catch (error) {
        console.error('Error creating checkout session: ', error);
        return NextResponse.error();
    }
}
