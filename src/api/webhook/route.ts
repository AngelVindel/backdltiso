import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';

const stripe = new Stripe("sk_test_51P17b5006fS5TbMz1s8mIPUyxSoaupvjgOk9sCx5PlPlvDZ59By2gcB4MWBjj8YetLWzn9Ss2COvzw46O0McKhfR00RlQXDgpU", {
    apiVersion: '2023-10-16'
});

const endpointSecret = "whsec_sa0TAsQy20B1YjAISAd0JfCiafXDKzvH";

/*
    FUNCIONAMIENTO DEL SIGUENTE BLOQUE DE CODOÍGO
Con el webhook cada vez que un usuario complete una compra podemos guardar 
distintos datos (cual fue el objeto comprado, la contidad, dotos los datos relacionas al usuario , etc) en formato json
que después se podrá utilizar para almacenarlos.  
**/

/*
Se define la función manejadora de la API que toma dos parámetros: req (solicitud) y res (respuesta).
*/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //Se verifica si el método HTTP de la solicitud es POST. 
    //Si no lo es, se devuelve una respuesta con un código de estado 405 (Método no permitido).
    if (req.method !== 'POST') {
        return res.status(405).end(); // Método no permitido
    }
/**
 * Se extrae la firma de Stripe de las cabeceras de la solicitud y 
 * se utiliza para validar la autenticidad de la solicitud de webhook de Stripe. 
 * Si la firma no es válida, se devuelve una respuesta con un código de estado 400 (Solicitud incorrecta) y un mensaje de error.
 */
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    switch(event.type){
        case "checkout.session.completed":
            const checkoutSessionCompleted = event.data.object.json()
            console.log({checkoutSessionCompleted});
            break;
    }

    // Si todo va bien, devuelve una respuesta satisfactoria
    return res.status(200).json({ received: true });
}

